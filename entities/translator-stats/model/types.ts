// entities/translator-stats/model/types.ts

export interface TranslatorStatsEntry {
  id: string;
  statsId: string;
  orderId: string | null;
  order?: {
    id: string;
    orderNumber: number;
    clientName: string;
  } | null;
  wordsCount: number;
  price: number;
  createdAt: string;
  updatedAt: string;
}

export function entryValue(entry: Pick<TranslatorStatsEntry, 'wordsCount' | 'price'>) {
  return (entry.wordsCount / 1800) * entry.price;
}

export interface TranslatorStatsRow {
  translatorId: string;
  translatorName: string;
  [key: `day${number}`]: number;
  [key: `statId${number}`]: string | null;
  [key: `entries${number}`]: TranslatorStatsEntry[];
}
