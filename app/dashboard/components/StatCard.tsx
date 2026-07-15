'use client';
import {
  Box,
  Flex,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Icon,
  useColorModeValue,
} from '@chakra-ui/react';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
  change?: number;
}

export function StatCard({ label, value, icon, color, change }: StatCardProps) {
  const bg = useColorModeValue('white', '#1a1a1a');
  const borderColor = useColorModeValue('gray.100', '#2e2e2e');
  const labelColor = useColorModeValue('gray.400', '#666666');
  const valueColor = useColorModeValue('gray.900', '#f0f0f0');
  const helpColor = useColorModeValue('gray.500', '#888888');

  return (
    <Box
      bg={bg}
      borderRadius='8px'
      p={{ base: 3, md: 6 }}
      border='1px solid'
      borderColor={borderColor}
    >
      <Flex
        justify='space-between'
        align='flex-start'
      >
        <Stat>
          <StatLabel
            fontSize='12px'
            fontFamily='Syne'
            letterSpacing='0.06em'
            textTransform='uppercase'
            color={labelColor}
            mb={2}
          >
            {label}
          </StatLabel>
          <StatNumber
            fontSize={{ base: '16px', md: '28px' }}
            fontFamily='Syne'
            fontWeight='700'
            letterSpacing='-0.02em'
            color={valueColor}
          >
            {value}
          </StatNumber>
          {change !== undefined && (
            <StatHelpText
              fontSize='12px'
              color={helpColor}
              mt={1}
            >
              <StatArrow type={change >= 0 ? 'increase' : 'decrease'} />
              {Math.abs(change)}% from last month
            </StatHelpText>
          )}
        </Stat>
        <Flex
          alignItems='center'
          justifyContent='center'
          p={3}
          bg={`${color}22`}
          borderRadius='8px'
        >
          <Icon
            as={icon}
            boxSize={5}
            color={color}
          />
        </Flex>
      </Flex>
    </Box>
  );
}
