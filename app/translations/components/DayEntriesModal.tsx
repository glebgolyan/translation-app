'use client';
// app/translations/components/DayEntriesModal.tsx
//
// Replaces the old "click the day cell, type a number" inline edit: a day
// cell's total is now a sum of per-order entries, so editing it needs a
// list, not a single input. Nothing hits the network until Save — add/
// remove/edit are all local until then, then diffed and applied as a batch.
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Button,
  HStack,
  VStack,
  Box,
  Text,
  Select,
  NumberInput,
  NumberInputField,
  IconButton,
  Icon,
  useToast,
} from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { RiAddLine, RiDeleteBinLine } from 'react-icons/ri';
import { ordersApi } from '@/features/orders/api/ordersApi';
import { translatorStatsApi } from '@/features/translator-stats/api/translatorStatsApi';
import { TranslatorStatsEntry, entryValue } from '@/entities/translator-stats/model/types';

interface RowState {
  key: string;
  id?: string;
  orderId: string | null;
  orderLabel: string | null;
  wordsCount: number;
  price: number;
  original?: { wordsCount: number; price: number };
  deleted?: boolean;
}

function toRow(entry: TranslatorStatsEntry): RowState {
  return {
    key: entry.id,
    id: entry.id,
    orderId: entry.orderId,
    orderLabel: entry.order ? `#${entry.order.orderNumber} · ${entry.order.clientName}` : null,
    wordsCount: entry.wordsCount,
    price: entry.price,
    original: { wordsCount: entry.wordsCount, price: entry.price },
  };
}

export function DayEntriesModal({
  isOpen,
  onClose,
  translatorId,
  translatorName,
  month,
  day,
  entries,
}: {
  isOpen: boolean;
  onClose: () => void;
  translatorId: string;
  translatorName: string;
  month: string;
  day: number;
  entries: TranslatorStatsEntry[];
}) {
  const toast = useToast();
  const queryClient = useQueryClient();
  const [rows, setRows] = useState<RowState[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen) setRows(entries.map(toRow));
  }, [isOpen, entries]);

  const { data: translatorOrders } = useQuery({
    queryKey: ['orders', 'by-translator', translatorId],
    queryFn: () => ordersApi.getAll({ translatorId, limit: 100 }),
    enabled: isOpen,
  });

  const addRow = () => {
    setRows((prev) => [
      ...prev,
      { key: `new-${Date.now()}-${prev.length}`, orderId: null, orderLabel: null, wordsCount: 0, price: 0 },
    ]);
  };

  const removeRow = (key: string) => {
    setRows((prev) =>
      prev.reduce<RowState[]>((acc, r) => {
        if (r.key !== key) {
          acc.push(r);
        } else if (r.id) {
          // Saved row: keep it (marked deleted) so Save issues a real DELETE.
          acc.push({ ...r, deleted: true });
        }
        // Unsaved row: drop it, nothing to delete server-side.
        return acc;
      }, [])
    );
  };

  const updateRow = (key: string, patch: Partial<RowState>) => {
    setRows((prev) => prev.map((r) => (r.key === key ? { ...r, ...patch } : r)));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      for (const row of rows) {
        if (row.deleted && row.id) {
          await translatorStatsApi.deleteEntry(row.id);
          continue;
        }
        if (row.id) {
          if (row.original && row.original.wordsCount === row.wordsCount && row.original.price === row.price)
            continue;
          await translatorStatsApi.updateEntry(row.id, { wordsCount: row.wordsCount, price: row.price });
          continue;
        }
        if (row.wordsCount === 0 && row.price === 0) continue;
        await translatorStatsApi.createEntry({
          translatorId,
          month,
          day,
          orderId: row.orderId ?? undefined,
          wordsCount: row.wordsCount,
          price: row.price,
        });
      }
      queryClient.invalidateQueries({ queryKey: ['translator-stats', month] });
      toast({ title: 'Updated', status: 'success', duration: 1500 });
      onClose();
    } catch (err: any) {
      toast({
        title: 'Failed to save',
        description: err?.response?.data?.message || err?.message,
        status: 'error',
        duration: 3000,
      });
    } finally {
      setSaving(false);
    }
  };

  const visibleRows = rows.filter((r) => !r.deleted);
  const total = visibleRows.reduce((sum, r) => sum + entryValue(r), 0);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size='xl'
      isCentered
    >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader fontSize='16px'>
          {translatorName} — {month}-{String(day).padStart(2, '0')}
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack
            align='stretch'
            spacing={3}
          >
            {visibleRows.length === 0 && (
              <Text
                fontSize='13px'
                color='gray.400'
              >
                No entries yet.
              </Text>
            )}
            {visibleRows.map((row) => (
              <HStack
                key={row.key}
                align='flex-end'
                spacing={3}
              >
                <Box flex={2}>
                  <Text
                    fontSize='11px'
                    color='gray.500'
                    mb={1}
                  >
                    Order
                  </Text>
                  {row.id ? (
                    <Text
                      fontSize='13px'
                      py={1}
                    >
                      {row.orderLabel ?? 'No order (manual)'}
                    </Text>
                  ) : (
                    <Select
                      size='sm'
                      value={row.orderId ?? ''}
                      onChange={(e) => updateRow(row.key, { orderId: e.target.value || null })}
                    >
                      <option value=''>No order (manual)</option>
                      {translatorOrders?.data.map((o) => (
                        <option
                          key={o.id}
                          value={o.id}
                        >
                          #{o.orderNumber} · {o.clientName}
                        </option>
                      ))}
                    </Select>
                  )}
                </Box>
                <Box flex={1}>
                  <Text
                    fontSize='11px'
                    color='gray.500'
                    mb={1}
                  >
                    Words count
                  </Text>
                  <NumberInput
                    size='sm'
                    min={0}
                    value={row.wordsCount}
                    onChange={(_, v) => updateRow(row.key, { wordsCount: isNaN(v) ? 0 : v })}
                  >
                    <NumberInputField />
                  </NumberInput>
                </Box>
                <Box flex={1}>
                  <Text
                    fontSize='11px'
                    color='gray.500'
                    mb={1}
                  >
                    Price by 1800
                  </Text>
                  <NumberInput
                    size='sm'
                    min={0}
                    value={row.price}
                    onChange={(_, v) => updateRow(row.key, { price: isNaN(v) ? 0 : v })}
                  >
                    <NumberInputField />
                  </NumberInput>
                </Box>
                <IconButton
                  aria-label='Remove'
                  icon={<Icon as={RiDeleteBinLine} />}
                  size='xs'
                  variant='ghost'
                  colorScheme='red'
                  onClick={() => removeRow(row.key)}
                />
              </HStack>
            ))}

            <Button
              size='xs'
              variant='ghost'
              alignSelf='flex-start'
              leftIcon={<Icon as={RiAddLine} />}
              onClick={addRow}
            >
              Add entry
            </Button>

            <Text
              fontSize='13px'
              fontWeight='700'
              textAlign='right'
              pt={2}
              borderTop='1px solid'
              borderColor='gray.100'
            >
              Total: {total.toLocaleString()}
            </Text>
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button
            variant='ghost'
            size='sm'
            mr={2}
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            size='sm'
            isLoading={saving}
            onClick={handleSave}
          >
            Save
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
