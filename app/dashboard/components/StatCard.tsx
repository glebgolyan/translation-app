'use client';
import { APP_LOCALE } from '@/shared/lib/format';
import { Box, Flex, Text, useColorModeValue } from '@chakra-ui/react';
import { useDashboardCardStyle, DASHBOARD_FONT_STACK } from './dashboardStyles';

interface StatCardProps {
  label: string;
  value: string | number;
  secondaryLabel?: string;
  // translatorStatsApi's response isn't typed (comes back as `any` from
  // axios), so the value already arrives pre-formatted as a string in one
  // of the two current callers — accept either rather than reformatting
  // (or mangling) whichever one shows up.
  secondaryValue?: number | string;
  icon: React.ElementType;
  color: string;
  change?: number;
}

export function StatCard({
  label,
  value,
  icon,
  color,
  change,
  secondaryLabel,
  secondaryValue,
}: StatCardProps) {
  const card = useDashboardCardStyle();
  const labelColor = useColorModeValue('gray.500', '#9a9a9e');
  const valueColor = useColorModeValue('#1d1d1f', '#f5f5f7');
  const helpColor = useColorModeValue('gray.400', '#6e6e73');
  const changeBg = useColorModeValue(
    change !== undefined && change >= 0 ? 'green.50' : 'red.50',
    change !== undefined && change >= 0 ? 'rgba(48,209,88,0.15)' : 'rgba(255,69,58,0.15)'
  );
  const changeColor = useColorModeValue(
    change !== undefined && change >= 0 ? 'green.600' : 'red.500',
    change !== undefined && change >= 0 ? 'green.300' : 'red.300'
  );

  return (
    <Box
      {...card}
      p={{ base: 4, md: 6 }}
      transition='transform 0.15s ease, box-shadow 0.15s ease'
      _hover={{ transform: 'translateY(-1px)' }}
    >
      <Flex
        justify='space-between'
        align='flex-start'
        mb={5}
      >
        <Flex
          alignItems='center'
          justifyContent='center'
          boxSize='40px'
          bg={`${color}1f`}
          borderRadius='full'
        >
          <Box
            as={icon}
            boxSize='19px'
            color={color}
          />
        </Flex>

        {change !== undefined && (
          <Flex
            align='center'
            bg={changeBg}
            color={changeColor}
            borderRadius='full'
            px={2.5}
            py={1}
            fontSize='12px'
            fontWeight='600'
          >
            {change >= 0 ? '+' : ''}
            {change}%
          </Flex>
        )}
      </Flex>

      <Text
        fontSize='13px'
        fontWeight='500'
        color={labelColor}
        mb={1}
        fontFamily={DASHBOARD_FONT_STACK}
      >
        {label}
      </Text>
      <Text
        fontSize={{ base: '22px', md: '30px' }}
        fontWeight='700'
        letterSpacing='-0.02em'
        color={valueColor}
        fontFamily={DASHBOARD_FONT_STACK}
        sx={{ fontFeatureSettings: '"tnum"' }}
      >
        {value}
      </Text>

      {secondaryValue !== undefined && (
        <Text
          fontSize='13px'
          color={helpColor}
          mt={2}
          fontFamily={DASHBOARD_FONT_STACK}
        >
          {secondaryLabel}: ₴
          {typeof secondaryValue === 'number' ? secondaryValue.toLocaleString(APP_LOCALE) : secondaryValue}
        </Text>
      )}
    </Box>
  );
}
