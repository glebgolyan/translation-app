'use client';
import {
    Box, Text, Flex, Badge, SimpleGrid, Icon, useDisclosure,
} from '@chakra-ui/react';
import { useRef, useState } from 'react';
import { RiUploadCloud2Line } from 'react-icons/ri';
import { FileCard, LocalFileCard, PreviewModal } from './FileCard';
import { useT } from '@/shared/hooks/useT';

interface FileSectionProps {
    label: string;
    existingFiles: string[];
    localFiles: File[];
    onAddFiles: (files: File[]) => void;
    onRemoveLocal: (index: number) => void;
    onRemoveExisting?: (filePath: string,index: number) => void;
    canUpload: boolean;
}

export function FileSection({
                                label, existingFiles, localFiles, onAddFiles,
                                onRemoveLocal, onRemoveExisting, canUpload,
                            }: FileSectionProps) {
    const { t } = useT();
    const inputRef = useRef<HTMLInputElement>(null);
    const [previewUrl, setPreviewUrl] = useState('');
    const [dragging, setDragging] = useState(false);
    const { isOpen, onOpen, onClose } = useDisclosure();

    const totalCount = existingFiles.length + localFiles.length;

    const handlePreview = (url: string) => {
        setPreviewUrl(url);
        onOpen();
    };

    return (
        <Box>
            <Flex align="center" justify="space-between" mb={3}>
                <Text fontSize="12px" fontFamily="Syne" fontWeight="700" letterSpacing="0.06em"
                      textTransform="uppercase" color="gray.400">
                    {label}
                </Text>
                {totalCount > 0 && (
                    <Badge colorScheme="gray" fontSize="10px">
                        {totalCount} file{totalCount !== 1 ? 's' : ''}
                    </Badge>
                )}
            </Flex>

            {canUpload && (
                <Box
                    border="2px dashed"
                    borderColor={dragging ? 'brand.400' : 'gray.200'}
                    borderRadius="8px" p={4} textAlign="center"
                    bg={dragging ? 'brand.50' : 'gray.50'}
                    cursor="pointer" transition="all 0.15s"
                    onDragOver={e => { e.preventDefault(); setDragging(true); }}
                    onDragLeave={() => setDragging(false)}
                    onDrop={e => { e.preventDefault(); setDragging(false); onAddFiles(Array.from(e.dataTransfer.files)); }}
                    onClick={() => inputRef.current?.click()}
                    mb={3}
                >
                    <input
                        ref={inputRef} type="file" multiple
                        accept=".pdf,.jpg,.jpeg,.png,.webp,.gif,.doc,.docx"
                        style={{ display: 'none' }}
                        onChange={e => e.target.files && onAddFiles(Array.from(e.target.files))}
                    />
                    <Icon as={RiUploadCloud2Line} boxSize={6} color="gray.300" mb={1} />
                    <Text fontSize="12px" color="gray.400">
                        {t('orders.dropFiles')}{' '}
                        <Text as="span" color="brand.500" fontWeight="500">{t('orders.browse')}</Text>
                    </Text>
                    <Text fontSize="10px" color="gray.300" mt={0.5}>{t('orders.fileHint')}</Text>
                </Box>
            )}

            {totalCount > 0 && (
                <SimpleGrid columns={4} spacing={2}>
                    {existingFiles.map((url, i) => (
                        <FileCard
                            key={`e-${i}`} url={url}
                            onRemove={onRemoveExisting ? () => onRemoveExisting(url, i) : undefined}
                            onPreview={() => handlePreview(url)}
                        />
                    ))}
                    {localFiles.map((file, i) => (
                        <LocalFileCard key={`l-${i}`} file={file} onRemove={() => onRemoveLocal(i)} />
                    ))}
                </SimpleGrid>
            )}

            {totalCount === 0 && !canUpload && (
                <Text fontSize="13px" color="gray.300" textAlign="center" py={4}>
                    {t('orders.noFiles')}
                </Text>
            )}

            <PreviewModal url={previewUrl} isOpen={isOpen} onClose={onClose} />
        </Box>
    );
}
