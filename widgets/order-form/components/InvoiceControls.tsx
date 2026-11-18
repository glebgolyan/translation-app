'use client';
import {
  Badge,
  Box,
  Button,
  Flex,
  Icon,
  IconButton,
  Input,
  InputGroup,
  InputRightElement,
  Text,
  Tooltip,
  useToast,
} from '@chakra-ui/react';
import { useEffect, useRef } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { UseFormSetValue, useWatch } from 'react-hook-form';
import { RiBankCardLine, RiExternalLinkLine, RiFileCopyLine, RiRefreshLine } from 'react-icons/ri';
import { invoicesApi } from '@/features/invoices/api/invoicesApi';
import { ordersApi } from '@/features/orders/api/ordersApi';
import { InvoiceStatus } from '@/entities/invoice/model/types';
import { useT } from '@/shared/hooks/useT';

const PENDING: InvoiceStatus[] = ['created', 'processing', 'hold'];

const STATUS_COLOR: Record<InvoiceStatus, string> = {
  created: 'blue',
  processing: 'orange',
  hold: 'purple',
  success: 'green',
  failure: 'red',
  reversed: 'red',
  expired: 'gray',
};

interface InvoiceControlsProps {
  orderId?: string;
  control: any;
  setValue: UseFormSetValue<any>;
}

// Issues a monobank invoice for the current Card Amount and shows the latest
// one for the order. The backend adds a paid invoice to the order's deposit;
// this only mirrors that into the open form so a later Save doesn't write
// the stale deposit back over it.
export function InvoiceControls({ orderId, control, setValue }: InvoiceControlsProps) {
  const { t } = useT();
  const toast = useToast();
  const queryClient = useQueryClient();
  const cardAmount = Number(useWatch({ control, name: 'cardAmount' })) || 0;

  const { data: invoices = [] } = useQuery({
    queryKey: ['invoices', orderId],
    queryFn: () => invoicesApi.list(orderId!),
    enabled: !!orderId,
    // Poll only while the latest invoice can still change, so a payment
    // shows up in an open modal without a reload.
    refetchInterval: (query) => {
      const latest = query.state.data?.[0];
      return latest && PENDING.includes(latest.status) ? 10_000 : false;
    },
  });
  const latest = invoices[0];

  const lastSeen = useRef<{ id: string; status: InvoiceStatus } | null>(null);
  useEffect(() => {
    const prev = lastSeen.current;
    lastSeen.current = latest ? { id: latest.id, status: latest.status } : null;
    if (!orderId || !latest || !prev || prev.id !== latest.id || prev.status === latest.status)
      return;
    if (latest.status !== 'success' && prev.status !== 'success') return;

    ordersApi
      .getById(orderId)
      .then((fresh) => setValue('deposit', fresh.deposit, { shouldDirty: true }))
      .catch(() => {});
    queryClient.invalidateQueries({ queryKey: ['orders'] });
    if (latest.status === 'success') {
      toast({ title: t('orders.invoicePaid'), status: 'success', duration: 4000 });
    }
  }, [latest, orderId, queryClient, setValue, t, toast]);

  const onError = (err: any) =>
    toast({
      title: t('common.error'),
      description: err?.response?.data?.message || err?.message,
      status: 'error',
      duration: 4000,
    });

  const create = useMutation({
    mutationFn: () => invoicesApi.create(orderId!, cardAmount),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices', orderId] });
      toast({ title: t('orders.invoiceCreated'), status: 'success', duration: 2000 });
    },
    onError,
  });

  const refresh = useMutation({
    mutationFn: () => invoicesApi.refresh(orderId!, latest!.id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['invoices', orderId] }),
    onError,
  });

  const copyLink = async () => {
    if (!latest) return;
    await navigator.clipboard.writeText(latest.pageUrl);
    toast({ title: t('orders.linkCopied'), status: 'success', duration: 1500 });
  };

  return (
    <Box
      gridColumn='1 / -1'
      borderWidth='1px'
      borderRadius='8px'
      p={3}
    >
      <Flex
        align='center'
        gap={3}
        wrap='wrap'
      >
        <Button
          type='button'
          size='sm'
          leftIcon={<Icon as={RiBankCardLine} />}
          onClick={() => create.mutate()}
          isLoading={create.isPending}
          isDisabled={!orderId || cardAmount <= 0}
        >
          {t('orders.issueInvoice')}
          {cardAmount > 0 ? ` · ₴${cardAmount.toLocaleString()}` : ''}
        </Button>

        {!orderId && (
          <Text
            fontSize='12px'
            color='gray.400'
          >
            {t('orders.saveOrderFirst')}
          </Text>
        )}

        {latest && (
          <Flex
            align='center'
            gap={2}
          >
            <Badge
              colorScheme={STATUS_COLOR[latest.status]}
              variant='subtle'
              px={2}
            >
              {t(`orders.invoiceStatuses.${latest.status}`)}
            </Badge>
            <Text
              fontSize='12px'
              fontFamily='mono'
              color='gray.400'
            >
              ₴{(latest.amount / 100).toLocaleString()}
            </Text>
          </Flex>
        )}
      </Flex>

      {latest && (
        <InputGroup
          size='sm'
          mt={3}
        >
          <Input
            value={latest.pageUrl}
            isReadOnly
            pr='96px'
            fontFamily='mono'
            fontSize='12px'
            onFocus={(e) => e.target.select()}
          />
          <InputRightElement
            width='auto'
            pr={1}
            gap={0.5}
          >
            <Tooltip label={t('orders.copyLink')}>
              <IconButton
                type='button'
                aria-label={t('orders.copyLink')}
                icon={<Icon as={RiFileCopyLine} />}
                size='xs'
                variant='ghost'
                onClick={copyLink}
              />
            </Tooltip>
            <Tooltip label={t('orders.openLink')}>
              <IconButton
                as='a'
                href={latest.pageUrl}
                target='_blank'
                rel='noopener noreferrer'
                aria-label={t('orders.openLink')}
                icon={<Icon as={RiExternalLinkLine} />}
                size='xs'
                variant='ghost'
              />
            </Tooltip>
            <Tooltip label={t('orders.refreshStatus')}>
              <IconButton
                type='button'
                aria-label={t('orders.refreshStatus')}
                icon={<Icon as={RiRefreshLine} />}
                size='xs'
                variant='ghost'
                onClick={() => refresh.mutate()}
                isLoading={refresh.isPending}
              />
            </Tooltip>
          </InputRightElement>
        </InputGroup>
      )}
    </Box>
  );
}
