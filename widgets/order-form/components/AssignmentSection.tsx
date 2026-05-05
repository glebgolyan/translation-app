'use client';
import { Box, Grid, FormControl, FormLabel, Select, Text } from '@chakra-ui/react';
import { UseFormRegister } from 'react-hook-form';
import { User } from '@/entities/user/model/types';
import { useT } from '@/shared/hooks/useT';

interface AssignmentSectionProps {
    register: UseFormRegister<any>;
    translators: User[];
}

export function AssignmentSection({ register, translators }: AssignmentSectionProps) {
    const { t } = useT();

    return (
        <Box>
            <Text fontFamily="Syne" fontWeight="700" fontSize="13px" letterSpacing="0.06em" textTransform="uppercase" color="gray.400" mb={4}>
                {t('orders.assignmentStatus')}
            </Text>
            <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                <FormControl>
                    <FormLabel fontSize="13px">{t('orders.assignTranslator')}</FormLabel>
                    <Select {...register('translatorId')} size="sm">
                        <option value="">{t('orders.unassigned')}</option>
                        {translators.map(t => (
                            <option key={t.id} value={t.id}>{t.name}</option>
                        ))}
                    </Select>
                </FormControl>

                <FormControl>
                    <FormLabel fontSize="13px">{t('orders.status')}</FormLabel>
                    <Select {...register('status')} size="sm">
                        <option value="NEW">{t('status.NEW')}</option>
                        <option value="IN_PROGRESS">{t('status.IN_PROGRESS')}</option>
                        <option value="DONE">{t('status.DONE')}</option>
                        <option value="PAID">{t('status.PAID')}</option>
                    </Select>
                </FormControl>
            </Grid>
        </Box>
    );
}