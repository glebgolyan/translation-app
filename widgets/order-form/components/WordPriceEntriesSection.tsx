'use client';
// widgets/order-form/components/WordPriceEntriesSection.tsx
//
// Repeatable Words Count / Price rows for an order, persisted as
// TranslatorStatsEntry records on the backend (one row = one entry) so the
// same numbers the translations-page day-cell modal edits are what shows up
// here. Each row is saved independently (on blur), the same "act
// immediately, not on the form's Save button" convention this form already
// uses for existing-file removal (see handleDeleteExisting in OrderForm).
import { Box, Text, HStack, IconButton, NumberInput, NumberInputField, Button } from '@chakra-ui/react';
import { Icon } from '@chakra-ui/react';
import { RiDeleteBinLine, RiAddLine } from 'react-icons/ri';
import { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@chakra-ui/react';
import { Order } from '@/entities/order/model/types';
import { TranslatorStatsEntry, entryValue } from '@/entities/translator-stats/model/types';
import { translatorStatsApi } from '@/features/translator-stats/api/translatorStatsApi';
import { useT } from '@/shared/hooks/useT';

type Row = TranslatorStatsEntry | { id?: undefined; wordsCount: number; price: number };

function todayMonthDay() {
  const now = new Date();
  return {
    month: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`,
    day: now.getDate(),
  };
}

export function WordPriceEntriesSection({ order }: { order: Order }) {
  const { t } = useT();
  const toast = useToast();
  const queryClient = useQueryClient();

  const entriesQueryKey = ['translator-stats-entries', order.id];
  const { data: savedEntries = [] } = useQuery({
    queryKey: entriesQueryKey,
    queryFn: () => translatorStatsApi.getEntriesByOrder(order.id),
  });

  const [pendingRows, setPendingRows] = useState<Row[]>([]);

  const rows: Row[] = [...savedEntries, ...pendingRows];
  const canAdd = !!order.translatorId;

  // Update the entries-list cache directly instead of invalidating it, so a
  // just-created row doesn't briefly vanish (pendingRows loses it) before a
  // refetch brings it back. The broader month-grid query still just gets
  // invalidated — it's not open at the same time as this form.
  const patchCache = (updater: (entries: TranslatorStatsEntry[]) => TranslatorStatsEntry[]) => {
    queryClient.setQueryData<TranslatorStatsEntry[]>(entriesQueryKey, (old) => updater(old ?? []));
    queryClient.invalidateQueries({ queryKey: ['translator-stats'] });
  };

  const handleAdd = () => {
    setPendingRows((prev) => [...prev, { wordsCount: 0, price: 0 }]);
  };

  const handleRemove = async (row: Row, pendingIndex: number | null) => {
    if (pendingIndex !== null) {
      setPendingRows((prev) => prev.filter((_, i) => i !== pendingIndex));
      return;
    }
    if (!row.id) return;
    try {
      await translatorStatsApi.deleteEntry(row.id);
      patchCache((entries) => entries.filter((e) => e.id !== row.id));
    } catch (err: any) {
      toast({ title: t('common.error'), description: err?.message, status: 'error', duration: 3000 });
    }
  };

  const handleBlurCommit = async (
    row: Row,
    pendingIndex: number | null,
    wordsCount: number,
    price: number
  ) => {
    if (row.id) {
      if (row.wordsCount === wordsCount && row.price === price) return;
      try {
        const updated = await translatorStatsApi.updateEntry(row.id, { wordsCount, price });
        patchCache((entries) => entries.map((e) => (e.id === updated.id ? updated : e)));
      } catch (err: any) {
        toast({ title: t('common.error'), description: err?.message, status: 'error', duration: 3000 });
      }
      return;
    }

    // Unsaved row: only create once it has a non-zero value, otherwise
    // leave it blank locally rather than writing empty entries.
    if (wordsCount === 0 && price === 0) return;
    if (!order.translatorId || pendingIndex === null) return;

    try {
      const { month, day } = todayMonthDay();
      const created = await translatorStatsApi.createEntry({
        translatorId: order.translatorId,
        orderId: order.id,
        month,
        day,
        wordsCount,
        price,
      });
      setPendingRows((prev) => prev.filter((_, i) => i !== pendingIndex));
      patchCache((entries) => [...entries, created]);
    } catch (err: any) {
      toast({ title: t('common.error'), description: err?.message, status: 'error', duration: 3000 });
    }
  };

  return (
    <Box
      mt={2}
      pt={2}
    >
      {rows.map((row, idx) => {
        const pendingIndex = row.id ? null : idx - savedEntries.length;
        return (
          <WordPriceRow
            key={row.id ?? `pending-${pendingIndex}`}
            row={row}
            onRemove={() => handleRemove(row, pendingIndex)}
            onCommit={(wordsCount, price) => handleBlurCommit(row, pendingIndex, wordsCount, price)}
          />
        );
      })}

      <Button
        size='xs'
        variant='ghost'
        leftIcon={<Icon as={RiAddLine} />}
        onClick={handleAdd}
        isDisabled={!canAdd}
        mt={rows.length > 0 ? 2 : 0}
      >
        {t('orders.addWordPriceEntry')}
      </Button>
      {!canAdd && (
        <Text
          fontSize='11px'
          color='gray.400'
          mt={1}
        >
          {t('orders.wordPriceNoTranslator')}
        </Text>
      )}
    </Box>
  );
}

function WordPriceRow({
  row,
  onRemove,
  onCommit,
}: {
  row: Row;
  onRemove: () => void;
  onCommit: (wordsCount: number, price: number) => void;
}) {
  const { t } = useT();
  const [wordsCount, setWordsCount] = useState(row.wordsCount);
  const [price, setPrice] = useState(row.price);

  useEffect(() => {
    setWordsCount(row.wordsCount);
    setPrice(row.price);
  }, [row.wordsCount, row.price]);

  return (
    <HStack
      spacing={3}
      align='flex-end'
      mb={2}
    >
      <Box flex={1}>
        <Text
          fontSize='11px'
          color='gray.500'
          mb={1}
        >
          {t('orders.wordsCount')}
        </Text>
        <NumberInput
          size='sm'
          min={0}
          value={wordsCount}
          onChange={(_, v) => setWordsCount(isNaN(v) ? 0 : v)}
          onBlur={() => onCommit(wordsCount, price)}
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
          {t('orders.priceFor')}
        </Text>
        <NumberInput
          size='sm'
          min={0}
          value={price}
          onChange={(_, v) => setPrice(isNaN(v) ? 0 : v)}
          onBlur={() => onCommit(wordsCount, price)}
        >
          <NumberInputField />
        </NumberInput>
      </Box>
      <Text
        fontSize='11px'
        color='gray.400'
        whiteSpace='nowrap'
        pb={2}
      >
        = ₴{entryValue({ wordsCount, price }).toFixed(0)}
      </Text>
      <IconButton
        aria-label='Remove'
        icon={<Icon as={RiDeleteBinLine} />}
        size='xs'
        variant='ghost'
        colorScheme='red'
        onClick={onRemove}
      />
    </HStack>
  );
}
