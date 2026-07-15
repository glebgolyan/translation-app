'use client';
import {
  Box,
  Text,
  Icon,
  Image,
  HStack,
  IconButton,
  Tooltip,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalCloseButton,
  ModalBody,
  Flex,
  Button,
  useDisclosure,
} from '@chakra-ui/react';
import { useState } from 'react';
import {
  RiEyeLine,
  RiDownloadLine,
  RiDeleteBinLine,
  RiFilePdfLine,
  RiFileWordLine,
  RiImageLine,
  RiFile3Line,
} from 'react-icons/ri';
import { useT } from '@/shared/hooks/useT';

export function getFileIcon(filename: string) {
  const ext = filename.split('.').pop()?.toLowerCase();
  if (['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(ext || '')) return RiImageLine;
  if (ext === 'pdf') return RiFilePdfLine;
  if (['doc', 'docx'].includes(ext || '')) return RiFileWordLine;
  return RiFile3Line;
}

export function getFileColor(filename: string) {
  const ext = filename.split('.').pop()?.toLowerCase();
  if (['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(ext || '')) return 'blue.400';
  if (ext === 'pdf') return 'red.400';
  if (['doc', 'docx'].includes(ext || '')) return 'blue.600';
  return 'gray.400';
}

export function isImage(filename: string) {
  return ['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(
    filename.split('.').pop()?.toLowerCase() || ''
  );
}

export function getFilename(url: string) {
  return decodeURIComponent(url.split('/').pop() || url).split('?')[0];
}

// ─── Preview Modal ────────────────────────────────────────────────────────────

export function PreviewModal({
  url,
  isOpen,
  onClose,
}: {
  url: string;
  isOpen: boolean;
  onClose: () => void;
}) {
  const { t } = useT();
  const filename = getFilename(url);
  const image = isImage(filename);
  const isPdf = filename.endsWith('.pdf');
  const isDoc = filename.endsWith('.doc') || filename.endsWith('.docx');

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size='4xl'
      isCentered
    >
      <ModalOverlay />
      <ModalContent maxH='90vh'>
        <ModalCloseButton zIndex={10} />
        <ModalBody
          p={0}
          overflow='hidden'
          borderRadius='md'
        >
          {image ? (
            <Image
              src={url}
              alt={filename}
              w='100%'
              maxH='85vh'
              objectFit='contain'
              crossOrigin='anonymous'
            />
          ) : isPdf ? (
            <Box
              as='iframe'
              src={url}
              w='100%'
              h='80vh'
              border='none'
            />
          ) : isDoc ? (
            <Box
              as='iframe'
              src={`https://docs.google.com/gview?url=${encodeURIComponent(url)}&embedded=true`}
              w='100%'
              h='80vh'
              border='none'
            />
          ) : (
            <Flex
              direction='column'
              align='center'
              py={12}
              gap={4}
            >
              <Icon
                as={getFileIcon(filename)}
                boxSize={16}
                color={getFileColor(filename)}
              />
              <Text fontFamily='mono'>{filename}</Text>
              <Text
                fontSize='13px'
                color='gray.400'
              >
                Preview not available
              </Text>
              <Button
                size='sm'
                leftIcon={<Icon as={RiDownloadLine} />}
                onClick={() => window.open(url, '_blank')}
              >
                {t('common.download')}
              </Button>
            </Flex>
          )}
          {image ? (
            <Image
              src={url}
              alt={filename}
              w='100%'
              maxH='85vh'
              objectFit='contain'
              crossOrigin='anonymous'
            />
          ) : isPdf ? (
            <Box
              as='iframe'
              src={url}
              w='100%'
              h='80vh'
              border='none'
            />
          ) : (
            <Flex
              direction='column'
              align='center'
              py={12}
              gap={4}
            >
              <Icon
                as={getFileIcon(filename)}
                boxSize={16}
                color={getFileColor(filename)}
              />
              <Text fontFamily='mono'>{filename}</Text>
              <Text
                fontSize='13px'
                color='gray.400'
              >
                Preview not available
              </Text>
              <Button
                size='sm'
                leftIcon={<Icon as={RiDownloadLine} />}
                onClick={() => window.open(url, '_blank')}
              >
                {t('common.download')}
              </Button>
            </Flex>
          )}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}

// ─── Uploaded File Card ───────────────────────────────────────────────────────

export function FileCard({
  url,
  onRemove,
  onPreview,
}: {
  url: string;
  onRemove?: () => void;
  onPreview: () => void;
}) {
  const { t } = useT();
  const filename = getFilename(url);
  const FileIconComp = getFileIcon(filename);
  const color = getFileColor(filename);
  const image = isImage(filename);

  const handleDownload = async () => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = objectUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(objectUrl);
    } catch {
      window.open(url, '_blank');
    }
  };

  return (
    <Box
      borderRadius='8px'
      border='1px solid'
      borderColor='gray.100'
      overflow='hidden'
      bg='white'
      position='relative'
      _hover={{ borderColor: 'brand.200', shadow: 'sm' }}
      transition='all 0.15s'
    >
      <Box
        h='90px'
        bg='gray.50'
        display='flex'
        alignItems='center'
        justifyContent='center'
        cursor='pointer'
        onClick={onPreview}
        overflow='hidden'
      >
        {image ? (
          <Image
            src={url}
            alt={filename}
            objectFit='cover'
            w='100%'
            h='100%'
            crossOrigin='anonymous'
          />
        ) : (
          <Icon
            as={FileIconComp}
            boxSize={9}
            color={color}
          />
        )}
      </Box>
      <Box
        px={2}
        py={1.5}
      >
        <Text
          fontSize='11px'
          fontFamily='mono'
          noOfLines={1}
          color='gray.600'
          title={filename}
        >
          {filename}
        </Text>
      </Box>
      <HStack
        position='absolute'
        top={1}
        right={1}
        spacing={1}
      >
        <Tooltip label={t('common.preview')}>
          <IconButton
            aria-label='Preview'
            icon={<Icon as={RiEyeLine} />}
            size='xs'
            bg='blackAlpha.600'
            color='white'
            _hover={{ bg: 'blackAlpha.800' }}
            onClick={onPreview}
          />
        </Tooltip>
        <Tooltip label={t('common.download')}>
          <IconButton
            aria-label='Download'
            icon={<Icon as={RiDownloadLine} />}
            size='xs'
            bg='blackAlpha.600'
            color='white'
            _hover={{ bg: 'blackAlpha.800' }}
            onClick={handleDownload}
          />
        </Tooltip>
        {onRemove && (
          <Tooltip label={t('common.remove')}>
            <IconButton
              aria-label='Remove'
              icon={<Icon as={RiDeleteBinLine} />}
              size='xs'
              bg='red.500'
              color='white'
              _hover={{ bg: 'red.600' }}
              onClick={onRemove}
            />
          </Tooltip>
        )}
      </HStack>
    </Box>
  );
}

// ─── Local File Card (before upload) ─────────────────────────────────────────

export function LocalFileCard({ file, onRemove }: { file: File; onRemove: () => void }) {
  const { t } = useT();
  const [preview, setPreview] = useState<string | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const FileIconComp = getFileIcon(file.name);
  const color = getFileColor(file.name);
  const image = isImage(file.name);

  const handlePreview = () => {
    if (image && !preview) setPreview(URL.createObjectURL(file));
    onOpen();
  };

  return (
    <>
      <Box
        borderRadius='8px'
        border='1px dashed'
        borderColor='brand.200'
        overflow='hidden'
        bg='brand.50'
        position='relative'
        _hover={{ borderColor: 'brand.400' }}
        transition='all 0.15s'
      >
        <Box
          h='90px'
          display='flex'
          alignItems='center'
          justifyContent='center'
          cursor='pointer'
          onClick={handlePreview}
          overflow='hidden'
        >
          {image && preview ? (
            <Image
              src={preview}
              alt={file.name}
              objectFit='cover'
              w='100%'
              h='100%'
            />
          ) : (
            <Icon
              as={FileIconComp}
              boxSize={9}
              color={color}
            />
          )}
        </Box>
        <Box
          px={2}
          py={1.5}
        >
          <Text
            fontSize='11px'
            fontFamily='mono'
            noOfLines={1}
            color='gray.600'
          >
            {file.name}
          </Text>
          <Text
            fontSize='10px'
            color='gray.400'
          >
            {(file.size / 1024).toFixed(0)} KB · {t('orders.pendingUpload')}
          </Text>
        </Box>
        <HStack
          position='absolute'
          top={1}
          right={1}
          spacing={1}
        >
          {image && (
            <IconButton
              aria-label='Preview'
              icon={<Icon as={RiEyeLine} />}
              size='xs'
              bg='blackAlpha.600'
              color='white'
              _hover={{ bg: 'blackAlpha.800' }}
              onClick={handlePreview}
            />
          )}
          <IconButton
            aria-label='Remove'
            icon={<Icon as={RiDeleteBinLine} />}
            size='xs'
            bg='red.500'
            color='white'
            _hover={{ bg: 'red.600' }}
            onClick={onRemove}
          />
        </HStack>
      </Box>

      <Modal
        isOpen={isOpen}
        onClose={onClose}
        size='xl'
        isCentered
      >
        <ModalOverlay />
        <ModalContent>
          <ModalCloseButton />
          <ModalBody p={4}>
            {image && preview ? (
              <Image
                src={preview}
                alt={file.name}
                w='100%'
                borderRadius='8px'
              />
            ) : (
              <Flex
                direction='column'
                align='center'
                py={8}
                gap={3}
              >
                <Icon
                  as={FileIconComp}
                  boxSize={16}
                  color={color}
                />
                <Text
                  fontFamily='mono'
                  fontSize='14px'
                >
                  {file.name}
                </Text>
                <Text
                  fontSize='12px'
                  color='gray.400'
                >
                  Preview not available
                </Text>
              </Flex>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
}
