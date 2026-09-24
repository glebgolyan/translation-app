'use client';
import {
  Box,
  Text,
  Flex,
  VStack,
  HStack,
  Icon,
  Button,
  useDisclosure,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  Divider,
  Badge,
  SimpleGrid,
  useToast,
  useColorModeValue,
} from '@chakra-ui/react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useRef, useCallback } from 'react';
import {
  RiTranslate2,
  RiCalendarLine,
  RiFileList3Line,
  RiUploadCloud2Line,
  RiCheckLine,
  RiLoader4Line,
} from 'react-icons/ri';
import { ordersApi } from '@/features/orders/api/ordersApi';
import { StatusBadge } from '@/entities/order/ui/StatusBadge';
import { Order, OrderStatus } from '@/entities/order/model/types';
import { User } from '@/entities/user/model/types';
import { UnreadBadge } from '@/widgets/order-table/components/UnreadBadge';
import { Messenger } from '@/widgets/order-table/components/Messenger';
import { FileCard, LocalFileCard, PreviewModal } from '@/features/files/ui/FileCard';

const ACCEPTED = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

// ─── Status options for translator ───────────────────────────────────────────

const TRANSLATOR_STATUSES: { value: OrderStatus; label: string }[] = [
  { value: 'NEW', label: 'New' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'DONE', label: 'On Review' },
];

// ─── Main page ────────────────────────────────────────────────────────────────

export function AssignmentsContent({ user }: { user: User }) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [previewOpen, setPreviewOpen] = useState(false);
  const [translatedFiles, setTranslatedFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus>('NEW');
  const inputRef = useRef<HTMLInputElement>(null);
  const toast = useToast();
  const queryClient = useQueryClient();
  const [dragging, setDragging] = useState(false);

  const { data } = useQuery({
    queryKey: ['orders', 'assigned'],
    queryFn: () => ordersApi.getAll({ limit: 50 }),
  });

  const statusMutation = useMutation({
    mutationFn: ({
      id,
      status,
      orderNumber,
    }: {
      id: string;
      status: OrderStatus;
      orderNumber: number;
    }) => ordersApi.update(id, { status, orderNumber }),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      setSelectedOrder(updated);
      toast({ title: 'Status updated', status: 'success', duration: 2000 });
    },
  });

  const handleOpen = (order: Order) => {
    setSelectedOrder(order);
    setSelectedStatus(order.status);
    setTranslatedFiles([]);
    onOpen();
  };

  const handlePreview = (url: string) => {
    setPreviewUrl(url);
    setPreviewOpen(true);
  };

  const addFiles = useCallback(
    (files: File[]) => {
      const valid = files.filter((f) => {
        if (!ACCEPTED.includes(f.type)) {
          toast({ title: `${f.name}: unsupported format`, status: 'error', duration: 2000 });
          return false;
        }
        if (f.size > 100 * 1024 * 1024) {
          toast({ title: `${f.name}: exceeds 100MB`, status: 'error', duration: 2000 });
          return false;
        }
        return true;
      });
      setTranslatedFiles((prev) => [...prev, ...valid]);
    },
    [toast]
  );

  const handleUpload = async () => {
    if (!selectedOrder || translatedFiles.length === 0) return;
    setUploading(true);
    try {
      const updated = await ordersApi.uploadFiles(selectedOrder.id, translatedFiles, 'translated');
      setSelectedOrder(updated);
      setTranslatedFiles([]);
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast({
        title: `${translatedFiles.length} file(s) uploaded`,
        status: 'success',
        duration: 2000,
      });
    } catch {
      toast({ title: 'Upload failed', status: 'error', duration: 3000 });
    } finally {
      setUploading(false);
    }
  };

  const handleStatusChange = (status: OrderStatus) => {
    if (!selectedOrder) return;
    setSelectedStatus(status);
    statusMutation.mutate({ id: selectedOrder.id, status, orderNumber: selectedOrder.orderNumber });
  };

  const orders = data?.data || [];

  const bg = useColorModeValue('white', '#1a1a1a');
  const borderColor = useColorModeValue('gray.100', '#2e2e2e');

  return (
    <Box p={8}>
      <Box mb={6}>
        <Text
          fontFamily='Syne'
          fontWeight='800'
          fontSize='24px'
          letterSpacing='-0.02em'
        >
          My Assignments
        </Text>
        <Text
          color='gray.400'
          fontSize='14px'
        >
          {orders.length} orders assigned to you
        </Text>
      </Box>

      <VStack
        spacing={3}
        align='stretch'
      >
        {orders.length === 0 ? (
          <Box
            textAlign='center'
            py={16}
          >
            <Icon
              as={RiTranslate2}
              boxSize={10}
              color='gray.200'
              mb={3}
            />
            <Text
              color='gray.400'
              fontSize='14px'
            >
              No assignments yet
            </Text>
          </Box>
        ) : (
          orders.map((order) => (
            <Box
              key={order.id}
              bg={bg}
              borderRadius='8px'
              border='1px solid'
              borderColor={borderColor}
              p={5}
              cursor='pointer'
              onClick={() => handleOpen(order)}
              _hover={{ borderColor: 'brand.200', shadow: 'sm' }}
              transition='all 0.15s'
            >
              <Flex
                justify='space-between'
                align='flex-start'
              >
                <Box>
                  <HStack
                    spacing={2}
                    mb={2}
                  >
                    <Text
                      fontFamily='mono'
                      fontWeight='600'
                      fontSize='14px'
                    >
                      {order.sourceLanguage} → {order.targetLanguage}
                    </Text>
                    <StatusBadge status={order.status} />
                  </HStack>
                  <HStack
                    spacing={4}
                    color='gray.400'
                    fontSize='13px'
                  >
                    {order.dueDate && (
                      <Flex
                        align='center'
                        gap={1}
                      >
                        <Icon
                          as={RiCalendarLine}
                          boxSize={3.5}
                        />
                        <Text>Due {new Date(order.dueDate).toLocaleDateString('uk-UA')}</Text>
                      </Flex>
                    )}
                    <Flex
                      align='center'
                      gap={1}
                    >
                      <Icon
                        as={RiFileList3Line}
                        boxSize={3.5}
                      />
                      <Text>
                        {order.originalFiles.length} original · {order.translatedFiles.length}{' '}
                        translated
                      </Text>
                    </Flex>
                  </HStack>
                </Box>
                <Button
                  size='xs'
                  variant='outline'
                  colorScheme='brand'
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOpen(order);
                  }}
                >
                  Open
                </Button>
              </Flex>
            </Box>
          ))
        )}
      </VStack>

      {/* Detail Drawer */}
      <Drawer
        isOpen={isOpen}
        placement='right'
        onClose={onClose}
        size='md'
      >
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader
            fontFamily='Syne'
            fontWeight='700'
            borderBottom='1px solid'
            borderColor='gray.100'
            pb={4}
          >
            Translation Task
          </DrawerHeader>
          <DrawerBody py={6}>
            {selectedOrder && (
              <VStack
                spacing={6}
                align='stretch'
              >
                {/* Info */}
                <Box
                  bg={bg}
                  borderColor={borderColor}
                  borderRadius='8px'
                  p={4}
                >
                  <Text
                    fontSize='12px'
                    color='gray.400'
                    fontFamily='Syne'
                    fontWeight='600'
                    letterSpacing='0.06em'
                    textTransform='uppercase'
                    mb={1}
                  >
                    Languages
                  </Text>
                  <Text
                    fontSize='20px'
                    fontFamily='Syne'
                    fontWeight='700'
                  >
                    {selectedOrder.sourceLanguage} → {selectedOrder.targetLanguage}
                  </Text>
                </Box>

                {selectedOrder.dueDate && (
                  <Flex
                    gap={3}
                    align='center'
                  >
                    <Icon
                      as={RiCalendarLine}
                      color='orange.400'
                      boxSize={5}
                    />
                    <Box>
                      <Text
                        fontSize='12px'
                        color='gray.400'
                      >
                        Deadline
                      </Text>
                      <Text fontWeight='500'>
                        {new Date(selectedOrder.dueDate).toLocaleDateString('uk-UA', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </Text>
                    </Box>
                  </Flex>
                )}

                <Divider />

                {/* Status */}
                <Box>
                  <Text
                    fontSize='12px'
                    color='gray.400'
                    fontFamily='Syne'
                    fontWeight='700'
                    letterSpacing='0.06em'
                    textTransform='uppercase'
                    mb={3}
                  >
                    Status
                  </Text>
                  <HStack spacing={2}>
                    {TRANSLATOR_STATUSES.map((s) => (
                      <Button
                        key={s.value}
                        size='sm'
                        variant={selectedStatus === s.value ? 'solid' : 'outline'}
                        colorScheme={selectedStatus === s.value ? 'brand' : 'gray'}
                        onClick={() => handleStatusChange(s.value)}
                        isLoading={statusMutation.isPending && selectedStatus === s.value}
                      >
                        {s.label}
                      </Button>
                    ))}
                  </HStack>
                </Box>

                <Divider />

                {/* Original files */}
                <Box>
                  <Flex
                    align='center'
                    justify='space-between'
                    mb={3}
                  >
                    <Text
                      fontSize='12px'
                      color='gray.400'
                      fontFamily='Syne'
                      fontWeight='700'
                      letterSpacing='0.06em'
                      textTransform='uppercase'
                    >
                      Original Files
                    </Text>
                    {selectedOrder.originalFiles.length > 0 && (
                      <Badge
                        colorScheme='gray'
                        fontSize='10px'
                      >
                        {selectedOrder.originalFiles.length}
                      </Badge>
                    )}
                  </Flex>

                  {selectedOrder.originalFiles.length === 0 ? (
                    <Text
                      fontSize='13px'
                      color='gray.300'
                      textAlign='center'
                      py={4}
                    >
                      No original files uploaded yet
                    </Text>
                  ) : (
                    <SimpleGrid
                      columns={3}
                      spacing={2}
                    >
                      {selectedOrder.originalFiles.map((url, i) => (
                        <FileCard
                          key={i}
                          url={url}
                          onPreview={() => handlePreview(url)}
                        />
                      ))}
                    </SimpleGrid>
                  )}
                </Box>

                <Divider />

                {/* Translated files upload */}
                <Box>
                  <Flex
                    align='center'
                    justify='space-between'
                    mb={3}
                  >
                    <Text
                      fontSize='12px'
                      color='gray.400'
                      fontFamily='Syne'
                      fontWeight='700'
                      letterSpacing='0.06em'
                      textTransform='uppercase'
                    >
                      Translated Files
                    </Text>
                    {selectedOrder.translatedFiles.length > 0 && (
                      <Badge
                        colorScheme='green'
                        fontSize='10px'
                      >
                        {selectedOrder.translatedFiles.length} uploaded
                      </Badge>
                    )}
                  </Flex>

                  {/* Already uploaded translated */}
                  {selectedOrder.translatedFiles.length > 0 && (
                    <SimpleGrid
                      columns={3}
                      spacing={2}
                      mb={3}
                    >
                      {selectedOrder.translatedFiles.map((url, i) => (
                        <FileCard
                          key={i}
                          url={url}
                          onPreview={() => handlePreview(url)}
                        />
                      ))}
                    </SimpleGrid>
                  )}

                  {/* Drop zone */}
                  <Box
                    border='2px dashed'
                    borderColor={dragging ? 'brand.400' : 'gray.200'}
                    borderRadius='8px'
                    p={5}
                    textAlign='center'
                    bg={dragging ? 'brand.50' : 'gray.50'}
                    cursor='pointer'
                    transition='all 0.15s'
                    onDragOver={(e) => {
                      e.preventDefault();
                      setDragging(true);
                    }}
                    onDragLeave={() => setDragging(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setDragging(false);
                      addFiles(Array.from(e.dataTransfer.files));
                    }}
                    onClick={() => inputRef.current?.click()}
                    mb={translatedFiles.length > 0 ? 3 : 0}
                  >
                    <input
                      ref={inputRef}
                      type='file'
                      multiple
                      accept='.pdf,.jpg,.jpeg,.png,.webp,.gif,.doc,.docx'
                      style={{ display: 'none' }}
                      onChange={(e) => e.target.files && addFiles(Array.from(e.target.files))}
                    />
                    <Icon
                      as={RiUploadCloud2Line}
                      boxSize={7}
                      color='gray.300'
                      mb={2}
                    />
                    <Text
                      fontSize='13px'
                      color='gray.400'
                    >
                      Drop files or{' '}
                      <Text
                        as='span'
                        color='brand.500'
                        fontWeight='500'
                      >
                        browse
                      </Text>
                    </Text>
                    <Text
                      fontSize='11px'
                      color='gray.300'
                      mt={0.5}
                    >
                      PDF, Images, Word (.doc, .docx) · max 100MB
                    </Text>
                  </Box>

                  {/* Queued local files */}
                  {translatedFiles.length > 0 && (
                    <>
                      <SimpleGrid
                        columns={3}
                        spacing={2}
                        mb={3}
                      >
                        {translatedFiles.map((f, i) => (
                          <LocalFileCard
                            key={i}
                            file={f}
                            onRemove={() =>
                              setTranslatedFiles((prev) => prev.filter((_, idx) => idx !== i))
                            }
                          />
                        ))}
                      </SimpleGrid>
                      <Button
                        w='full'
                        size='sm'
                        leftIcon={<Icon as={uploading ? RiLoader4Line : RiCheckLine} />}
                        isLoading={uploading}
                        loadingText='Uploading…'
                        onClick={handleUpload}
                        colorScheme='green'
                      >
                        Upload {translatedFiles.length} file
                        {translatedFiles.length !== 1 ? 's' : ''}
                      </Button>
                    </>
                  )}
                </Box>

                {selectedOrder && (
                  <Box
                    mt={6}
                    borderTop='1px solid'
                    borderColor='gray.100'
                    pt={6}
                  >
                    <HStack mb={4}>
                      <Text
                        fontFamily='Syne'
                        fontWeight='700'
                        fontSize='13px'
                      >
                        Live Chat
                      </Text>
                      <UnreadBadge orderId={selectedOrder.id} />
                    </HStack>
                    <Messenger
                      orderId={selectedOrder.id}
                      onNewMessage={(msg) => {
                        if (msg.senderId !== user?.id) {
                          toast({
                            title: 'New message',
                            description: msg.text || 'Sent a reaction',
                            status: 'info',
                            duration: 3000,
                          });
                        }
                      }}
                    />
                  </Box>
                )}
              </VStack>
            )}
          </DrawerBody>
        </DrawerContent>
      </Drawer>

      <PreviewModal
        url={previewUrl}
        isOpen={previewOpen}
        onClose={() => setPreviewOpen(false)}
      />
    </Box>
  );
}
