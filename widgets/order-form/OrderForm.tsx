'use client';
import {
  Box, VStack, HStack, Grid, FormControl, FormLabel,
  FormErrorMessage, Input, Select, NumberInput, NumberInputField,
  Button, Text, Divider, Flex, Icon, Image, SimpleGrid,
  Modal, ModalOverlay, ModalContent, ModalCloseButton, ModalBody,
  useDisclosure, Badge, Tooltip, IconButton,
} from '@chakra-ui/react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState, useRef, useCallback } from 'react';
import {
  RiSaveLine, RiUploadCloud2Line, RiFilePdfLine,
  RiFileWordLine, RiImageLine, RiDeleteBinLine,
  RiEyeLine, RiDownloadLine, RiFile3Line,
} from 'react-icons/ri';
import { Order, UpdateOrderDto, PaymentType } from '@/entities/order/model/types';
import { User } from '@/entities/user/model/types';
import { ordersApi } from '@/features/orders/api/ordersApi';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@chakra-ui/react';

const LANGUAGES = [
  'Ukrainian', 'English', 'German', 'French', 'Polish',
  'Spanish', 'Italian', 'Romanian', 'Hungarian', 'Czech',
  'Slovak', 'Russian', 'Arabic', 'Chinese', 'Japanese',
];

const ACCEPTED_TYPES = [
  'application/pdf',
  'image/jpeg', 'image/png', 'image/webp', 'image/gif',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

const orderSchema = z.object({
  sourceLanguage: z.string().min(1, 'Required'),
  targetLanguage: z.string().min(1, 'Required'),
  clientName: z.string().min(1, 'Required'),
  phone: z.string().min(5, 'Required'),
  documentType: z.string().optional(),
  documentCount: z.number().min(1),
  notarizationCount: z.number().min(0),
  totalPrice: z.number().min(0),
  deposit: z.number().min(0),
  remainingAmount: z.number().min(0),
  paymentType: z.enum(['cash', 'card', 'mixed']),
  cardAmount: z.number().optional(),
  translatorId: z.string().optional(),
  status: z.enum(['NEW', 'IN_PROGRESS', 'DONE', 'PAID']),
  dueDate: z.string().optional(),
});

type OrderFormValues = z.infer<typeof orderSchema>;

// ─── File type helpers ───────────────────────────────────────────────────────

function getFileIcon(filename: string) {
  const ext = filename.split('.').pop()?.toLowerCase();
  if (['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(ext || '')) return RiImageLine;
  if (ext === 'pdf') return RiFilePdfLine;
  if (['doc', 'docx'].includes(ext || '')) return RiFileWordLine;
  return RiFile3Line;
}

function getFileColor(filename: string) {
  const ext = filename.split('.').pop()?.toLowerCase();
  if (['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(ext || '')) return 'blue.400';
  if (ext === 'pdf') return 'red.400';
  if (['doc', 'docx'].includes(ext || '')) return 'blue.600';
  return 'gray.400';
}

function isImage(filename: string) {
  const ext = filename.split('.').pop()?.toLowerCase();
  return ['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(ext || '');
}

function getFilename(url: string) {
  return decodeURIComponent(url.split('/').pop() || url).split('?')[0];
}

// ─── Single file card ────────────────────────────────────────────────────────

function FileCard({
                    url, label, onRemove, onPreview,
                  }: {
  url: string; label?: string; onRemove?: () => void; onPreview: () => void;
}) {
  const filename = label || getFilename(url);
  const FileIcon = getFileIcon(filename);
  const color = getFileColor(filename);
  const image = isImage(filename);

  return (
      <Box
          borderRadius="8px"
          border="1px solid"
          borderColor="gray.100"
          overflow="hidden"
          bg="white"
          position="relative"
          _hover={{ borderColor: 'brand.200', shadow: 'sm' }}
          transition="all 0.15s"
      >
        {/* Preview area */}
        <Box
            h="90px"
            bg="gray.50"
            display="flex"
            alignItems="center"
            justifyContent="center"
            cursor="pointer"
            onClick={onPreview}
            overflow="hidden"
        >
          {image ? (
              <Image
                  src={url}
                  alt={filename}
                  objectFit="cover"
                  w="100%"
                  h="100%"
              />
          ) : (
              <Icon as={FileIcon} boxSize={9} color={color} />
          )}
        </Box>

        {/* File info */}
        <Box px={2} py={1.5}>
          <Text fontSize="11px" fontFamily="mono" noOfLines={1} color="gray.600" title={filename}>
            {filename}
          </Text>
        </Box>

        {/* Actions overlay */}
        <HStack
            position="absolute"
            top={1}
            right={1}
            spacing={1}
        >
          <Tooltip label="Preview">
            <IconButton
                aria-label="Preview"
                icon={<Icon as={RiEyeLine} />}
                size="xs"
                colorScheme="blackAlpha"
                bg="blackAlpha.600"
                color="white"
                _hover={{ bg: 'blackAlpha.800' }}
                onClick={onPreview}
            />
          </Tooltip>
          <Tooltip label="Download">
            <IconButton
                aria-label="Download"
                icon={<Icon as={RiDownloadLine} />}
                size="xs"
                colorScheme="blackAlpha"
                bg="blackAlpha.600"
                color="white"
                _hover={{ bg: 'blackAlpha.800' }}
                as="a"
                href={url}
                download
                target="_blank"
            />
          </Tooltip>
          {onRemove && (
              <Tooltip label="Remove">
                <IconButton
                    aria-label="Remove"
                    icon={<Icon as={RiDeleteBinLine} />}
                    size="xs"
                    colorScheme="red"
                    bg="red.500"
                    color="white"
                    _hover={{ bg: 'red.600' }}
                    onClick={onRemove}
                />
              </Tooltip>
          )}
        </HStack>
      </Box>
  );
}

// ─── Local file card (before upload) ────────────────────────────────────────

function LocalFileCard({
                         file, onRemove,
                       }: {
  file: File; onRemove: () => void;
}) {
  const [preview, setPreview] = useState<string | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const FileIcon = getFileIcon(file.name);
  const color = getFileColor(file.name);
  const image = isImage(file.name);

  const handlePreview = () => {
    if (image) {
      const url = URL.createObjectURL(file);
      setPreview(url);
    }
    onOpen();
  };

  return (
      <>
        <Box
            borderRadius="8px"
            border="1px dashed"
            borderColor="brand.200"
            overflow="hidden"
            bg="brand.50"
            position="relative"
            _hover={{ borderColor: 'brand.400' }}
            transition="all 0.15s"
        >
          <Box
              h="90px"
              display="flex"
              alignItems="center"
              justifyContent="center"
              cursor="pointer"
              onClick={handlePreview}
              overflow="hidden"
          >
            {image && preview ? (
                <Image src={preview} alt={file.name} objectFit="cover" w="100%" h="100%" />
            ) : (
                <Icon as={FileIcon} boxSize={9} color={color} />
            )}
          </Box>
          <Box px={2} py={1.5}>
            <Text fontSize="11px" fontFamily="mono" noOfLines={1} color="gray.600" title={file.name}>
              {file.name}
            </Text>
            <Text fontSize="10px" color="gray.400">
              {(file.size / 1024).toFixed(0)} KB · pending upload
            </Text>
          </Box>
          <HStack position="absolute" top={1} right={1} spacing={1}>
            {image && (
                <IconButton
                    aria-label="Preview"
                    icon={<Icon as={RiEyeLine} />}
                    size="xs"
                    bg="blackAlpha.600"
                    color="white"
                    _hover={{ bg: 'blackAlpha.800' }}
                    onClick={handlePreview}
                />
            )}
            <IconButton
                aria-label="Remove"
                icon={<Icon as={RiDeleteBinLine} />}
                size="xs"
                bg="red.500"
                color="white"
                _hover={{ bg: 'red.600' }}
                onClick={onRemove}
            />
          </HStack>
        </Box>

        {/* Local preview modal */}
        <Modal isOpen={isOpen} onClose={onClose} size="xl" isCentered>
          <ModalOverlay />
          <ModalContent>
            <ModalCloseButton />
            <ModalBody p={4}>
              {image && preview ? (
                  <Image src={preview} alt={file.name} w="100%" borderRadius="8px" />
              ) : (
                  <Flex direction="column" align="center" py={8} gap={3}>
                    <Icon as={FileIcon} boxSize={16} color={color} />
                    <Text fontFamily="mono" fontSize="14px">{file.name}</Text>
                    <Text fontSize="12px" color="gray.400">Preview not available for this file type</Text>
                  </Flex>
              )}
            </ModalBody>
          </ModalContent>
        </Modal>
      </>
  );
}

// ─── File preview modal (for uploaded files) ─────────────────────────────────

function PreviewModal({
                        url, isOpen, onClose,
                      }: {
  url: string; isOpen: boolean; onClose: () => void;
}) {
  const filename = getFilename(url);
  const image = isImage(filename);
  const isPdf = filename.endsWith('.pdf');

  return (
      <Modal isOpen={isOpen} onClose={onClose} size="4xl" isCentered>
        <ModalOverlay />
        <ModalContent maxH="90vh">
          <ModalCloseButton zIndex={10} />
          <ModalBody p={0} overflow="hidden" borderRadius="md">
            {image ? (
                <Image src={url} alt={filename} w="100%" maxH="85vh" objectFit="contain" />
            ) : isPdf ? (
                <Box as="iframe" src={url} w="100%" h="80vh" border="none" />
            ) : (
                <Flex direction="column" align="center" py={12} gap={4}>
                  <Icon as={getFileIcon(filename)} boxSize={16} color={getFileColor(filename)} />
                  <Text fontFamily="mono">{filename}</Text>
                  <Text fontSize="13px" color="gray.400">Preview not available</Text>
                  <Button as="a" href={url} download target="_blank" leftIcon={<Icon as={RiDownloadLine} />} size="sm">
                    Download file
                  </Button>
                </Flex>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
  );
}

// ─── File section with upload + grid ────────────────────────────────────────

function FileSection({
                       label, existingFiles, localFiles, onAddFiles, onRemoveLocal, onRemoveExisting, orderId, type, canUpload,
                     }: {
  label: string;
  existingFiles: string[];
  localFiles: File[];
  onAddFiles: (files: File[]) => void;
  onRemoveLocal: (index: number) => void;
  onRemoveExisting?: (index: number) => void;
  orderId?: string;
  type: 'original' | 'translated';
  canUpload: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [dragging, setDragging] = useState(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    onAddFiles(Array.from(e.dataTransfer.files));
  };

  const handlePreview = (url: string) => {
    setPreviewUrl(url);
    onOpen();
  };

  const totalCount = existingFiles.length + localFiles.length;

  return (
      <Box>
        <Flex align="center" justify="space-between" mb={3}>
          <Text fontSize="12px" fontFamily="Syne" fontWeight="700" letterSpacing="0.06em" textTransform="uppercase" color="gray.400">
            {label}
          </Text>
          {totalCount > 0 && (
              <Badge colorScheme="gray" fontSize="10px">{totalCount} file{totalCount !== 1 ? 's' : ''}</Badge>
          )}
        </Flex>

        {/* Drop zone */}
        {canUpload && (
            <Box
                border="2px dashed"
                borderColor={dragging ? 'brand.400' : 'gray.200'}
                borderRadius="8px"
                p={4}
                textAlign="center"
                bg={dragging ? 'brand.50' : 'gray.50'}
                cursor="pointer"
                transition="all 0.15s"
                onDragOver={e => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleDrop}
                onClick={() => inputRef.current?.click()}
                mb={3}
            >
              <input
                  ref={inputRef}
                  type="file"
                  multiple
                  accept=".pdf,.jpg,.jpeg,.png,.webp,.gif,.doc,.docx"
                  style={{ display: 'none' }}
                  onChange={e => e.target.files && onAddFiles(Array.from(e.target.files))}
              />
              <Icon as={RiUploadCloud2Line} boxSize={6} color="gray.300" mb={1} />
              <Text fontSize="12px" color="gray.400">
                Drop files or <Text as="span" color="brand.500" fontWeight="500">browse</Text>
              </Text>
              <Text fontSize="10px" color="gray.300" mt={0.5}>PDF, Images, Word documents</Text>
            </Box>
        )}

        {/* File grid */}
        {totalCount > 0 && (
            <SimpleGrid columns={4} spacing={2}>
              {existingFiles.map((url, i) => (
                  <FileCard
                      key={`existing-${i}`}
                      url={url}
                      onRemove={onRemoveExisting ? () => onRemoveExisting(i) : undefined}
                      onPreview={() => handlePreview(url)}
                  />
              ))}
              {localFiles.map((file, i) => (
                  <LocalFileCard
                      key={`local-${i}`}
                      file={file}
                      onRemove={() => onRemoveLocal(i)}
                  />
              ))}
            </SimpleGrid>
        )}

        {totalCount === 0 && !canUpload && (
            <Text fontSize="13px" color="gray.300" textAlign="center" py={4}>No files uploaded</Text>
        )}

        <PreviewModal url={previewUrl} isOpen={isOpen} onClose={onClose} />
      </Box>
  );
}

// ─── Main OrderForm ──────────────────────────────────────────────────────────

interface OrderFormProps {
  order?: Order;
  translators?: User[];
  onSubmit: (data: UpdateOrderDto, originalFiles: File[], translatedFiles: File[]) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  mode?: 'create' | 'edit';
  userRole: string;
}

export function OrderForm({
                            order, translators = [], onSubmit, onCancel,
                            isLoading, mode = 'edit', userRole,
                          }: OrderFormProps) {
  const [originalLocal, setOriginalLocal] = useState<File[]>([]);
  const [translatedLocal, setTranslatedLocal] = useState<File[]>([]);
  const [existingOriginal, setExistingOriginal] = useState<string[]>(order?.originalFiles || []);
  const [existingTranslated, setExistingTranslated] = useState<string[]>(order?.translatedFiles || []);
  const toast = useToast();

  const {
    register, handleSubmit, control, watch,
    formState: { errors },
  } = useForm<OrderFormValues>({
    resolver: zodResolver(orderSchema) as any,
    defaultValues: {
      sourceLanguage: order?.sourceLanguage || '',
      targetLanguage: order?.targetLanguage || '',
      clientName: order?.clientName || '',
      phone: order?.phone || '',
      documentType: order?.documentType || '',
      documentCount: order?.documentCount || 1,
      notarizationCount: order?.notarizationCount || 0,
      totalPrice: order?.totalPrice || 0,
      deposit: order?.deposit || 0,
      remainingAmount: order?.remainingAmount || 0,
      paymentType: order?.paymentType || 'cash',
      cardAmount: order?.cardAmount || 0,
      translatorId: order?.translatorId || '',
      status: order?.status || 'NEW',
      dueDate: order?.dueDate ? new Date(order.dueDate).toISOString().split('T')[0] : '',
    },
  });

  const paymentType = watch('paymentType');
  const isManagerOrAdmin = userRole === 'MANAGER' || userRole === 'ADMIN';

  const addOriginalFiles = useCallback((files: File[]) => {
    const valid = files.filter(f => {
      if (!ACCEPTED_TYPES.includes(f.type)) {
        toast({ title: `${f.name}: unsupported format`, status: 'error', duration: 2000 });
        return false;
      }
      if (f.size > 50 * 1024 * 1024) {
        toast({ title: `${f.name}: exceeds 50MB`, status: 'error', duration: 2000 });
        return false;
      }
      return true;
    });
    setOriginalLocal(prev => [...prev, ...valid]);
  }, [toast]);

  const addTranslatedFiles = useCallback((files: File[]) => {
    const valid = files.filter(f => ACCEPTED_TYPES.includes(f.type));
    setTranslatedLocal(prev => [...prev, ...valid]);
  }, []);

  const handleFormSubmit = async (values: OrderFormValues) => {
    await onSubmit(values as UpdateOrderDto, originalLocal, translatedLocal);
  };

  return (
      <Box as="form" onSubmit={handleSubmit(handleFormSubmit)}>
        <VStack spacing={6} align="stretch">

          {/* Client Info */}
          {isManagerOrAdmin && (
              <Box>
                <Text fontFamily="Syne" fontWeight="700" fontSize="13px" letterSpacing="0.06em" textTransform="uppercase" color="gray.400" mb={4}>
                  Client Information
                </Text>
                <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                  <FormControl isInvalid={!!errors.clientName}>
                    <FormLabel fontSize="13px">Client Name</FormLabel>
                    <Input {...register('clientName')} placeholder="John Doe" size="sm" />
                    <FormErrorMessage>{errors.clientName?.message}</FormErrorMessage>
                  </FormControl>
                  <FormControl isInvalid={!!errors.phone}>
                    <FormLabel fontSize="13px">Phone</FormLabel>
                    <Input {...register('phone')} placeholder="+380 XX XXX XXXX" size="sm" />
                    <FormErrorMessage>{errors.phone?.message}</FormErrorMessage>
                  </FormControl>
                </Grid>
              </Box>
          )}

          {/* Languages */}
          <Box>
            <Text fontFamily="Syne" fontWeight="700" fontSize="13px" letterSpacing="0.06em" textTransform="uppercase" color="gray.400" mb={4}>
              Translation Details
            </Text>
            <Grid templateColumns="repeat(2, 1fr)" gap={4}>
              <FormControl isInvalid={!!errors.sourceLanguage}>
                <FormLabel fontSize="13px">Source Language</FormLabel>
                <Select {...register('sourceLanguage')} size="sm">
                  <option value="">Select language</option>
                  {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
                </Select>
                <FormErrorMessage>{errors.sourceLanguage?.message}</FormErrorMessage>
              </FormControl>
              <FormControl isInvalid={!!errors.targetLanguage}>
                <FormLabel fontSize="13px">Target Language</FormLabel>
                <Select {...register('targetLanguage')} size="sm">
                  <option value="">Select language</option>
                  {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
                </Select>
                <FormErrorMessage>{errors.targetLanguage?.message}</FormErrorMessage>
              </FormControl>
              <FormControl>
                <FormLabel fontSize="13px">Document Type</FormLabel>
                <Input {...register('documentType')} placeholder="e.g. Passport, Contract" size="sm" />
              </FormControl>
              <FormControl>
                <FormLabel fontSize="13px">Deadline</FormLabel>
                <Input {...register('dueDate')} type="date" size="sm" />
              </FormControl>
              <FormControl>
                <FormLabel fontSize="13px">Document Count</FormLabel>
                <Controller
                    name="documentCount"
                    control={control}
                    render={({ field }) => (
                        <NumberInput size="sm" min={1} value={field.value} onChange={(_, v) => field.onChange(v)}>
                          <NumberInputField />
                        </NumberInput>
                    )}
                />
              </FormControl>
              <FormControl>
                <FormLabel fontSize="13px">Notarization Count</FormLabel>
                <Controller
                    name="notarizationCount"
                    control={control}
                    render={({ field }) => (
                        <NumberInput size="sm" min={0} value={field.value} onChange={(_, v) => field.onChange(v)}>
                          <NumberInputField />
                        </NumberInput>
                    )}
                />
              </FormControl>
            </Grid>
          </Box>

          {/* Payment */}
          {isManagerOrAdmin && (
              <Box>
                <Text fontFamily="Syne" fontWeight="700" fontSize="13px" letterSpacing="0.06em" textTransform="uppercase" color="gray.400" mb={4}>
                  Payment
                </Text>
                <Grid templateColumns="repeat(3, 1fr)" gap={4}>
                  <FormControl>
                    <FormLabel fontSize="13px">Total Price (₴)</FormLabel>
                    <Controller
                        name="totalPrice"
                        control={control}
                        render={({ field }) => (
                            <NumberInput size="sm" min={0} value={field.value} onChange={(_, v) => field.onChange(v)}>
                              <NumberInputField />
                            </NumberInput>
                        )}
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel fontSize="13px">Deposit (₴)</FormLabel>
                    <Controller
                        name="deposit"
                        control={control}
                        render={({ field }) => (
                            <NumberInput size="sm" min={0} value={field.value} onChange={(_, v) => field.onChange(v)}>
                              <NumberInputField />
                            </NumberInput>
                        )}
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel fontSize="13px">Remaining (₴)</FormLabel>
                    <Controller
                        name="remainingAmount"
                        control={control}
                        render={({ field }) => (
                            <NumberInput size="sm" min={0} value={field.value} onChange={(_, v) => field.onChange(v)}>
                              <NumberInputField />
                            </NumberInput>
                        )}
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel fontSize="13px">Payment Type</FormLabel>
                    <Select {...register('paymentType')} size="sm">
                      <option value="cash">Cash</option>
                      <option value="card">Card</option>
                      <option value="mixed">Mixed</option>
                    </Select>
                  </FormControl>
                  {(paymentType === 'card' || paymentType === 'mixed') && (
                      <FormControl>
                        <FormLabel fontSize="13px">Card Amount (₴)</FormLabel>
                        <Controller
                            name="cardAmount"
                            control={control}
                            render={({ field }) => (
                                <NumberInput size="sm" min={0} value={field.value || 0} onChange={(_, v) => field.onChange(v)}>
                                  <NumberInputField />
                                </NumberInput>
                            )}
                        />
                      </FormControl>
                  )}
                </Grid>
              </Box>
          )}

          {/* Assignment & Status */}
          {isManagerOrAdmin && (
              <Box>
                <Text fontFamily="Syne" fontWeight="700" fontSize="13px" letterSpacing="0.06em" textTransform="uppercase" color="gray.400" mb={4}>
                  Assignment & Status
                </Text>
                <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                  <FormControl>
                    <FormLabel fontSize="13px">Assign Translator</FormLabel>
                    <Select {...register('translatorId')} size="sm">
                      <option value="">Unassigned</option>
                      {translators.map(t => (
                          <option key={t.id} value={t.id}>{t.name}</option>
                      ))}
                    </Select>
                  </FormControl>
                  <FormControl>
                    <FormLabel fontSize="13px">Status</FormLabel>
                    <Select {...register('status')} size="sm">
                      <option value="NEW">New</option>
                      <option value="IN_PROGRESS">In Progress</option>
                      <option value="DONE">Done</option>
                      <option value="PAID">Paid</option>
                    </Select>
                  </FormControl>
                </Grid>
              </Box>
          )}

          {/* Files */}
          <Box>
            <Text fontFamily="Syne" fontWeight="700" fontSize="13px" letterSpacing="0.06em" textTransform="uppercase" color="gray.400" mb={4}>
              Files
            </Text>
            <VStack spacing={5} align="stretch">
              <FileSection
                  label="Original Documents"
                  existingFiles={existingOriginal}
                  localFiles={originalLocal}
                  onAddFiles={addOriginalFiles}
                  onRemoveLocal={i => setOriginalLocal(prev => prev.filter((_, idx) => idx !== i))}
                  onRemoveExisting={isManagerOrAdmin ? i => setExistingOriginal(prev => prev.filter((_, idx) => idx !== i)) : undefined}
                  type="original"
                  canUpload={userRole !== 'TRANSLATOR'}
              />
              {(isManagerOrAdmin || userRole === 'TRANSLATOR') && (
                  <>
                    <Divider />
                    <FileSection
                        label="Translated Documents"
                        existingFiles={existingTranslated}
                        localFiles={translatedLocal}
                        onAddFiles={addTranslatedFiles}
                        onRemoveLocal={i => setTranslatedLocal(prev => prev.filter((_, idx) => idx !== i))}
                        onRemoveExisting={isManagerOrAdmin ? i => setExistingTranslated(prev => prev.filter((_, idx) => idx !== i)) : undefined}
                        type="translated"
                        canUpload={true}
                    />
                  </>
              )}
            </VStack>
          </Box>

          {/* Actions */}
          <HStack justify="flex-end" pt={2}>
            <Button variant="ghost" size="sm" onClick={onCancel} colorScheme="gray">Cancel</Button>
            <Button type="submit" size="sm" isLoading={isLoading} leftIcon={<Icon as={RiSaveLine} />}>
              {mode === 'create' ? 'Create Order' : 'Save Changes'}
            </Button>
          </HStack>

        </VStack>
      </Box>
  );
}