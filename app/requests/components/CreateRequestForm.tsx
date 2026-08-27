'use client';
import {
  Box,
  VStack,
  HStack,
  Grid,
  Button,
  Text,
  Icon,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Input,
  Select,
  Flex,
  useColorModeValue,
  useToast,
} from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRef, useState } from 'react';
import { RiSaveLine, RiUploadCloud2Line, RiCloseLine, RiFileLine } from 'react-icons/ri';
import { CreateOrderRequestInput } from '@/entities/order-request/model/types';
import { useLanguageConfig } from '@/shared/hooks/useLanguageConfig';
import { useT } from '@/shared/hooks/useT';

const ACCEPTED_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];
const MAX_FILE_SIZE = 50 * 1024 * 1024;

const schema = z.object({
  sourceLanguage: z.string().min(1, 'Required'),
  targetLanguage: z.string().min(1, 'Required'),
  clientName: z.string().min(1, 'Required').max(150),
  phone: z
    .string()
    .min(5, 'Required')
    .max(30)
    .regex(/^[0-9+()\-\s]+$/, 'Invalid phone number'),
  email: z.union([z.literal(''), z.string().email('Invalid email')]),
  preferredContact: z.enum(['EMAIL', 'VIBER', 'WHATSAPP', 'TELEGRAM']),
});

type FormValues = z.infer<typeof schema>;

interface CreateRequestFormProps {
  onSubmit: (data: CreateOrderRequestInput, files: File[]) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export function CreateRequestForm({ onSubmit, onCancel, isLoading }: CreateRequestFormProps) {
  const { t } = useT();
  const toast = useToast();
  const { getLanguageList } = useLanguageConfig();
  const languages = getLanguageList();
  const inputRef = useRef<HTMLInputElement>(null);
  const borderColor = useColorModeValue('gray.200', '#2e2e2e');
  const labelColor = useColorModeValue('gray.400', '#666666');

  const [files, setFiles] = useState<File[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      sourceLanguage: '',
      targetLanguage: '',
      clientName: '',
      phone: '',
      email: '',
      preferredContact: 'VIBER',
    },
  });

  const addFiles = (incoming: File[]) => {
    const valid = incoming.filter((f) => {
      if (!ACCEPTED_TYPES.includes(f.type)) {
        toast({ title: `${f.name}: ${t('requests.unsupportedFormat')}`, status: 'error', duration: 3000 });
        return false;
      }
      if (f.size > MAX_FILE_SIZE) {
        toast({ title: `${f.name}: ${t('requests.exceedsMaxSize')}`, status: 'error', duration: 3000 });
        return false;
      }
      return true;
    });
    setFiles((prev) => [...prev, ...valid]);
  };

  const handleFormSubmit = async (values: FormValues) => {
    await onSubmit(
      { ...values, email: values.email || undefined },
      files
    );
  };

  return (
    <Box
      as='form'
      onSubmit={handleSubmit(handleFormSubmit)}
    >
      <VStack
        spacing={5}
        align='stretch'
      >
        <Grid
          templateColumns={{ base: '1fr', sm: 'repeat(2, 1fr)' }}
          gap={4}
        >
          <FormControl isInvalid={!!errors.sourceLanguage}>
            <FormLabel fontSize='13px'>{t('orders.sourceLanguage')}</FormLabel>
            <Select
              {...register('sourceLanguage')}
              size='sm'
            >
              <option value=''>{t('requests.selectLanguage')}</option>
              {languages.map((l) => (
                <option
                  key={l.value}
                  value={l.value}
                >
                  {l.label}
                </option>
              ))}
            </Select>
            <FormErrorMessage>{errors.sourceLanguage?.message}</FormErrorMessage>
          </FormControl>

          <FormControl isInvalid={!!errors.targetLanguage}>
            <FormLabel fontSize='13px'>{t('orders.targetLanguage')}</FormLabel>
            <Select
              {...register('targetLanguage')}
              size='sm'
            >
              <option value=''>{t('requests.selectLanguage')}</option>
              {languages.map((l) => (
                <option
                  key={l.value}
                  value={l.value}
                >
                  {l.label}
                </option>
              ))}
            </Select>
            <FormErrorMessage>{errors.targetLanguage?.message}</FormErrorMessage>
          </FormControl>
        </Grid>

        <Grid
          templateColumns={{ base: '1fr', sm: 'repeat(2, 1fr)' }}
          gap={4}
        >
          <FormControl isInvalid={!!errors.clientName}>
            <FormLabel fontSize='13px'>{t('orders.clientName')}</FormLabel>
            <Input
              {...register('clientName')}
              size='sm'
            />
            <FormErrorMessage>{errors.clientName?.message}</FormErrorMessage>
          </FormControl>

          <FormControl isInvalid={!!errors.phone}>
            <FormLabel fontSize='13px'>{t('orders.phone')}</FormLabel>
            <Input
              {...register('phone')}
              placeholder='+380 XX XXX XXXX'
              size='sm'
            />
            <FormErrorMessage>{errors.phone?.message}</FormErrorMessage>
          </FormControl>
        </Grid>

        <Grid
          templateColumns={{ base: '1fr', sm: 'repeat(2, 1fr)' }}
          gap={4}
        >
          <FormControl isInvalid={!!errors.email}>
            <FormLabel fontSize='13px'>Email</FormLabel>
            <Input
              {...register('email')}
              type='email'
              size='sm'
            />
            <FormErrorMessage>{errors.email?.message}</FormErrorMessage>
          </FormControl>

          <FormControl isInvalid={!!errors.preferredContact}>
            <FormLabel fontSize='13px'>{t('requests.preferredContact')}</FormLabel>
            <Select
              {...register('preferredContact')}
              size='sm'
            >
              <option value='VIBER'>{t('requests.contact.VIBER')}</option>
              <option value='WHATSAPP'>{t('requests.contact.WHATSAPP')}</option>
              <option value='TELEGRAM'>{t('requests.contact.TELEGRAM')}</option>
              <option value='EMAIL'>{t('requests.contact.EMAIL')}</option>
            </Select>
          </FormControl>
        </Grid>

        <Box>
          <FormLabel fontSize='13px'>{t('requests.attachedFiles')}</FormLabel>
          <Box
            border='2px dashed'
            borderColor={borderColor}
            borderRadius='8px'
            p={4}
            textAlign='center'
            cursor='pointer'
            onClick={() => inputRef.current?.click()}
          >
            <input
              ref={inputRef}
              type='file'
              multiple
              accept='.pdf,.jpg,.jpeg,.png,.doc,.docx'
              style={{ display: 'none' }}
              onChange={(e) => e.target.files && addFiles(Array.from(e.target.files))}
            />
            <Icon
              as={RiUploadCloud2Line}
              boxSize={6}
              color={labelColor}
              mb={1}
            />
            <Text
              fontSize='12px'
              color={labelColor}
            >
              {t('orders.dropFiles')}
            </Text>
            <Text
              fontSize='10px'
              color={labelColor}
              mt={0.5}
            >
              JPG, PNG, PDF, DOC, DOCX · {t('requests.maxSize')}
            </Text>
          </Box>

          {files.length > 0 && (
            <VStack
              spacing={2}
              align='stretch'
              mt={3}
            >
              {files.map((file, i) => (
                <Flex
                  key={`${file.name}-${i}`}
                  align='center'
                  gap={2}
                  px={3}
                  py={2}
                  borderRadius='6px'
                  border='1px solid'
                  borderColor={borderColor}
                >
                  <Icon
                    as={RiFileLine}
                    color={labelColor}
                  />
                  <Text
                    fontSize='12px'
                    fontFamily='mono'
                    flex={1}
                    noOfLines={1}
                  >
                    {file.name}
                  </Text>
                  <Icon
                    as={RiCloseLine}
                    cursor='pointer'
                    onClick={() => setFiles((prev) => prev.filter((_, idx) => idx !== i))}
                  />
                </Flex>
              ))}
            </VStack>
          )}
        </Box>

        <HStack
          justify='flex-end'
          pt={2}
        >
          <Button
            variant='ghost'
            size='sm'
            onClick={onCancel}
            colorScheme='gray'
          >
            {t('orders.cancel')}
          </Button>
          <Button
            type='submit'
            size='sm'
            isLoading={isLoading}
            leftIcon={<Icon as={RiSaveLine} />}
          >
            {t('requests.createRequest')}
          </Button>
        </HStack>
      </VStack>
    </Box>
  );
}
