'use client';
import {
    Box, Grid, FormControl, FormLabel, FormErrorMessage,
    Input, Select, NumberInput, NumberInputField, Text,
} from '@chakra-ui/react';
import { UseFormRegister, FieldErrors, Control, Controller } from 'react-hook-form';
import { useT } from '@/shared/hooks/useT';

const LANGUAGES = [
    'Ukrainian', 'English', 'German', 'French', 'Polish',
    'Spanish', 'Italian', 'Romanian', 'Hungarian', 'Czech',
    'Slovak', 'Russian', 'Arabic', 'Chinese', 'Japanese',
];

interface TranslationDetailsSectionProps {
    register: UseFormRegister<any>;
    errors: FieldErrors<any>;
    control: Control<any>;
}

export function TranslationDetailsSection({ register, errors, control }: TranslationDetailsSectionProps) {
    const { t } = useT();

    return (
        <Box>
            <Text fontFamily="Syne" fontWeight="700" fontSize="13px" letterSpacing="0.06em" textTransform="uppercase" color="gray.400" mb={4}>
                {t('orders.translationDetails')}
            </Text>
            <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                <FormControl isInvalid={!!errors.sourceLanguage}>
                    <FormLabel fontSize="13px">{t('orders.sourceLanguage')}</FormLabel>
                    <Select {...register('sourceLanguage')} size="sm">
                        <option value="">Select language</option>
                        {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
                    </Select>
                    <FormErrorMessage>{errors.sourceLanguage?.message as string}</FormErrorMessage>
                </FormControl>

                <FormControl isInvalid={!!errors.targetLanguage}>
                    <FormLabel fontSize="13px">{t('orders.targetLanguage')}</FormLabel>
                    <Select {...register('targetLanguage')} size="sm">
                        <option value="">Select language</option>
                        {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
                    </Select>
                    <FormErrorMessage>{errors.targetLanguage?.message as string}</FormErrorMessage>
                </FormControl>

                <FormControl>
                    <FormLabel fontSize="13px">{t('orders.documentType')}</FormLabel>
                    <Input {...register('documentType')} placeholder="e.g. Passport, Contract" size="sm" />
                </FormControl>

                <FormControl>
                    <FormLabel fontSize="13px">{t('orders.deadline')}</FormLabel>
                    <Input {...register('dueDate')} type="date" size="sm" />
                </FormControl>

                <FormControl>
                    <FormLabel fontSize="13px">{t('orders.documentCount')}</FormLabel>
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
                    <FormLabel fontSize="13px">{t('orders.notarizationCount')}</FormLabel>
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
    );
}