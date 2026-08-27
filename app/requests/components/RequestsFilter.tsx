'use client';
import {
  Flex,
  InputGroup,
  InputLeftElement,
  Input,
  Icon,
  ButtonGroup,
  Button,
  useColorModeValue,
} from '@chakra-ui/react';
import { RiSearchLine } from 'react-icons/ri';
import { useT } from '@/shared/hooks/useT';

interface RequestsFilterProps {
  search: string;
  converted: boolean | undefined;
  onSearchChange: (search: string) => void;
  onConvertedChange: (converted: boolean | undefined) => void;
}

export function RequestsFilter({
  search,
  converted,
  onSearchChange,
  onConvertedChange,
}: RequestsFilterProps) {
  const { t } = useT();
  const inputBg = useColorModeValue('white', '#252525');
  const borderColor = useColorModeValue('gray.200', '#2e2e2e');

  return (
    <Flex
      gap={3}
      mb={6}
      align='center'
      flexWrap='wrap'
    >
      <InputGroup
        maxW={{ base: 'full', sm: '260px' }}
        size='sm'
      >
        <InputLeftElement pointerEvents='none'>
          <Icon
            as={RiSearchLine}
            color='gray.400'
          />
        </InputLeftElement>
        <Input
          placeholder={t('requests.searchPlaceholder')}
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          bg={inputBg}
          borderColor={borderColor}
        />
      </InputGroup>

      <ButtonGroup
        size='sm'
        isAttached
        variant='outline'
      >
        <Button
          isActive={converted === undefined}
          onClick={() => onConvertedChange(undefined)}
        >
          {t('requests.all')}
        </Button>
        <Button
          isActive={converted === false}
          onClick={() => onConvertedChange(false)}
        >
          {t('requests.pending')}
        </Button>
        <Button
          isActive={converted === true}
          onClick={() => onConvertedChange(true)}
        >
          {t('requests.converted')}
        </Button>
      </ButtonGroup>
    </Flex>
  );
}
