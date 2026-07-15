'use client';
import {
  Box,
  Text,
  Grid,
  FormControl,
  FormLabel,
  Input,
  Button,
  Icon,
  useToast,
  VStack,
  HStack,
  Avatar,
  Badge,
  useColorModeValue,
} from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import { useState } from 'react';
import { RiSaveLine, RiUserLine } from 'react-icons/ri';
import { User, UserRole } from '@/entities/user/model/types';
import { profileApi } from '@/features/auth/api/profileApi';
import { useT } from '@/shared/hooks/useT';

const ROLE_COLORS: Record<UserRole, string> = {
  CLIENT: '#4d76ff',
  MANAGER: '#00b894',
  TRANSLATOR: '#fdcb6e',
  ADMIN: '#e17055',
};

interface ProfileSectionProps {
  user: User;
  onUpdate: (user: User) => void;
}

export function ProfileSection({ user, onUpdate }: ProfileSectionProps) {
  const { t } = useT();
  const toast = useToast();
  const [loading, setLoading] = useState(false);

  const bg = useColorModeValue('white', '#1a1a1a');
  const borderColor = useColorModeValue('gray.100', '#2e2e2e');
  const labelColor = useColorModeValue('gray.400', '#666666');
  const textColor = useColorModeValue('gray.900', '#f0f0f0');

  const {
    register,
    handleSubmit,
    formState: { isDirty },
  } = useForm({
    defaultValues: {
      name: user.name,
      email: user.email,
      phone: user.phone || '',
    },
  });

  const onSubmit = async (values: any) => {
    setLoading(true);
    try {
      const updated = await profileApi.update(values);
      onUpdate(updated);
      toast({ title: 'Profile updated', status: 'success', duration: 2000 });
    } catch (err: any) {
      toast({
        title: 'Failed to update',
        description: err?.response?.data?.message || err?.message,
        status: 'error',
        duration: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      bg={bg}
      borderRadius='12px'
      border='1px solid'
      borderColor={borderColor}
      overflow='hidden'
    >
      <Box
        px={6}
        py={5}
        borderBottom='1px solid'
        borderColor={borderColor}
      >
        <Text
          fontFamily='Syne'
          fontWeight='700'
          fontSize='15px'
          color={textColor}
        >
          Profile Information
        </Text>
        <Text
          fontSize='13px'
          color={labelColor}
          mt={0.5}
        >
          Update your personal details
        </Text>
      </Box>

      <Box p={6}>
        {/* Avatar + role */}
        <HStack
          spacing={4}
          mb={8}
        >
          <Avatar
            size='lg'
            name={user.name}
            bg='brand.100'
            color='brand.700'
          />
          <Box>
            <Text
              fontFamily='Syne'
              fontWeight='700'
              fontSize='18px'
              color={textColor}
            >
              {user.name}
            </Text>
            <HStack
              spacing={2}
              mt={1}
            >
              <Badge
                px={2}
                py={0.5}
                borderRadius='4px'
                bg={ROLE_COLORS[user.role]}
                color='white'
                fontSize='11px'
                fontFamily='Syne'
                fontWeight='700'
                letterSpacing='0.06em'
              >
                {user.role}
              </Badge>
              <Text
                fontSize='13px'
                color={labelColor}
              >
                {user.email}
              </Text>
            </HStack>
          </Box>
        </HStack>

        <Box
          as='form'
          onSubmit={handleSubmit(onSubmit)}
        >
          <Grid
            templateColumns='repeat(2, 1fr)'
            gap={4}
            mb={6}
          >
            <FormControl>
              <FormLabel
                fontSize='13px'
                color={labelColor}
              >
                {t('auth.name')}
              </FormLabel>
              <Input
                {...register('name')}
                size='sm'
              />
            </FormControl>

            <FormControl>
              <FormLabel
                fontSize='13px'
                color={labelColor}
              >
                {t('auth.email')}
              </FormLabel>
              <Input
                {...register('email')}
                type='email'
                size='sm'
              />
            </FormControl>

            <FormControl>
              <FormLabel
                fontSize='13px'
                color={labelColor}
              >
                {t('auth.phone')}
              </FormLabel>
              <Input
                {...register('phone')}
                placeholder='+380 XX XXX XXXX'
                size='sm'
              />
            </FormControl>
          </Grid>

          <HStack justify='flex-end'>
            <Button
              type='submit'
              size='sm'
              leftIcon={<Icon as={RiSaveLine} />}
              isLoading={loading}
              isDisabled={!isDirty}
            >
              Save Changes
            </Button>
          </HStack>
        </Box>
      </Box>
    </Box>
  );
}
