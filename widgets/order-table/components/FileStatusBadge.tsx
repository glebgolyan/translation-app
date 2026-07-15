'use client';
import { Icon, Tooltip, Text } from '@chakra-ui/react';
import { RiAlertLine, RiFile3Line } from 'react-icons/ri';
import { useT } from '@/shared/hooks/useT';

interface FileStatusBadgeProps {
  originalFiles: string[];
  translatedFiles: string[];
  filesDeletedAt?: Date | null;
}

export function FileStatusBadge({
  originalFiles,
  translatedFiles,
  filesDeletedAt,
}: FileStatusBadgeProps) {
  const { t } = useT();

  const totalFiles = originalFiles.length + translatedFiles.length;

  if (filesDeletedAt) {
    return (
      <Tooltip
        label={`${t('orders.filesDeleted') || 'Files deleted'}: ${new Date(filesDeletedAt).toLocaleDateString('uk-UA')}`}
        placement='top'
        hasArrow
        fontSize='12px'
      >
        <Text textAlign='center'>
          <Icon
            as={RiAlertLine}
            boxSize={4}
            color='orange.400'
            cursor='help'
          />
        </Text>
      </Tooltip>
    );
  }

  if (totalFiles === 0) {
    return (
      <Tooltip
        label={t('orders.noFiles') || 'No files'}
        placement='top'
        hasArrow
        fontSize='12px'
      >
        <Text textAlign='center'>
          <Icon
            as={RiFile3Line}
            boxSize={4}
            color='gray.300'
            cursor='help'
          />
        </Text>
      </Tooltip>
    );
  }

  return (
    <Tooltip
      label={`${totalFiles} ${totalFiles === 1 ? t('orders.file') : t('orders.files')}`}
      placement='top'
      hasArrow
      fontSize='12px'
    >
      <Text textAlign='center'>
        <Icon
          as={RiFile3Line}
          boxSize={4}
          color='blue.400'
          cursor='help'
        />
      </Text>
    </Tooltip>
  );
}
