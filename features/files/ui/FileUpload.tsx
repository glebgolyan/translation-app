'use client';
// features/files/ui/FileUpload.tsx
import {
  Box,
  Text,
  VStack,
  HStack,
  Icon,
  Progress,
  IconButton,
  useToast,
  Flex,
} from '@chakra-ui/react';
import { useCallback, useState, useRef } from 'react';
import {
  RiUploadCloud2Line,
  RiFilePdfLine,
  RiImageLine,
  RiDeleteBinLine,
  RiCheckLine,
} from 'react-icons/ri';
import { ordersApi } from '@/features/orders/api/ordersApi';
import { useQueryClient } from '@tanstack/react-query';

const ACCEPTED = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
const MAX_SIZE = 20 * 1024 * 1024; // 20MB

interface FileUploadProps {
  orderId: string;
  type: 'original' | 'translated';
  existingFiles?: string[];
  disabled?: boolean;
}

function FileIcon({ mime }: { mime: string }) {
  if (mime === 'application/pdf')
    return (
      <Icon
        as={RiFilePdfLine}
        color='red.400'
      />
    );
  return (
    <Icon
      as={RiImageLine}
      color='blue.400'
    />
  );
}

interface LocalFile {
  file: File;
  progress: number;
  done: boolean;
  error?: string;
}

export function FileUpload({ orderId, type, existingFiles = [], disabled }: FileUploadProps) {
  const [files, setFiles] = useState<LocalFile[]>([]);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const toast = useToast();
  const queryClient = useQueryClient();

  const uploadFiles = useCallback(
    async (newFiles: File[]) => {
      const valid = newFiles.filter((f) => {
        if (!ACCEPTED.includes(f.type)) {
          toast({ title: `${f.name}: unsupported format`, status: 'error', duration: 3000 });
          return false;
        }
        if (f.size > MAX_SIZE) {
          toast({ title: `${f.name}: exceeds 20MB`, status: 'error', duration: 3000 });
          return false;
        }
        return true;
      });

      if (!valid.length) return;

      const entries: LocalFile[] = valid.map((f) => ({ file: f, progress: 0, done: false }));
      setFiles((prev) => [...prev, ...entries]);

      // Simulate upload progress + real upload
      for (let i = 0; i < entries.length; i++) {
        const entry = entries[i];
        // Fake progress animation
        const interval = setInterval(() => {
          setFiles((prev) =>
            prev.map((lf) =>
              lf.file === entry.file && !lf.done
                ? { ...lf, progress: Math.min(lf.progress + 20, 80) }
                : lf
            )
          );
        }, 200);

        try {
          await ordersApi.uploadFiles(orderId, [entry.file], type);
          clearInterval(interval);
          setFiles((prev) =>
            prev.map((lf) => (lf.file === entry.file ? { ...lf, progress: 100, done: true } : lf))
          );
          queryClient.invalidateQueries({ queryKey: ['orders'] });
        } catch (err) {
          clearInterval(interval);
          setFiles((prev) =>
            prev.map((lf) =>
              lf.file === entry.file ? { ...lf, progress: 0, error: 'Upload failed' } : lf
            )
          );
        }
      }
    },
    [orderId, type, toast, queryClient]
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      uploadFiles(Array.from(e.dataTransfer.files));
    },
    [uploadFiles]
  );

  return (
    <Box>
      <Text
        fontSize='12px'
        fontFamily='Syne'
        fontWeight='600'
        letterSpacing='0.06em'
        textTransform='uppercase'
        color='gray.400'
        mb={3}
      >
        {type === 'original' ? 'Original Files' : 'Translated Files'}
      </Text>

      {/* Drop zone */}
      {!disabled && (
        <Box
          border='2px dashed'
          borderColor={dragging ? 'brand.400' : 'gray.200'}
          borderRadius='6px'
          p={6}
          textAlign='center'
          bg={dragging ? 'brand.50' : 'gray.50'}
          cursor='pointer'
          transition='all 0.15s'
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          onClick={() => inputRef.current?.click()}
          mb={3}
        >
          <input
            ref={inputRef}
            type='file'
            multiple
            accept='.pdf,.jpg,.jpeg,.png,.webp'
            style={{ display: 'none' }}
            onChange={(e) => e.target.files && uploadFiles(Array.from(e.target.files))}
          />
          <Icon
            as={RiUploadCloud2Line}
            boxSize={8}
            color='gray.300'
            mb={2}
          />
          <Text
            fontSize='13px'
            color='gray.500'
          >
            Drop PDF or images here, or click to browse
          </Text>
          <Text
            fontSize='11px'
            color='gray.400'
            mt={1}
          >
            Max 20MB per file
          </Text>
        </Box>
      )}

      {/* Upload queue */}
      {files.length > 0 && (
        <VStack
          spacing={2}
          align='stretch'
          mb={3}
        >
          {files.map((lf, i) => (
            <Flex
              key={i}
              align='center'
              gap={3}
              bg='white'
              p={2}
              borderRadius='6px'
              border='1px solid'
              borderColor='gray.100'
            >
              <FileIcon mime={lf.file.type} />
              <Box
                flex={1}
                minW={0}
              >
                <Text
                  fontSize='12px'
                  noOfLines={1}
                  fontFamily='mono'
                >
                  {lf.file.name}
                </Text>
                {!lf.done && (
                  <Progress
                    value={lf.progress}
                    size='xs'
                    colorScheme='brand'
                    mt={1}
                    borderRadius='full'
                  />
                )}
              </Box>
              {lf.done && (
                <Icon
                  as={RiCheckLine}
                  color='green.400'
                />
              )}
              {lf.error && (
                <Text
                  fontSize='11px'
                  color='red.400'
                >
                  {lf.error}
                </Text>
              )}
            </Flex>
          ))}
        </VStack>
      )}

      {/* Existing files */}
      {existingFiles.length > 0 && (
        <VStack
          spacing={1}
          align='stretch'
        >
          {existingFiles.map((url, i) => {
            const filename = url.split('/').pop() || `File ${i + 1}`;
            return (
              <Flex
                key={i}
                align='center'
                gap={3}
                px={3}
                py={2}
                borderRadius='6px'
                border='1px solid'
                borderColor='gray.100'
                bg='white'
              >
                <Icon
                  as={filename.endsWith('.pdf') ? RiFilePdfLine : RiImageLine}
                  color='gray.400'
                />
                <Text
                  fontSize='12px'
                  fontFamily='mono'
                  flex={1}
                  noOfLines={1}
                  as='a'
                  href={url}
                  target='_blank'
                  color='brand.600'
                  _hover={{ textDecoration: 'underline' }}
                >
                  {filename}
                </Text>
              </Flex>
            );
          })}
        </VStack>
      )}
    </Box>
  );
}
