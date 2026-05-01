'use client';
// app/dashboard/page.tsx
import {
  Box, Grid, GridItem, Text, Flex, Icon, Stat,
  StatLabel, StatNumber, StatHelpText, StatArrow,
  VStack, HStack, Badge,
} from '@chakra-ui/react';
import { useQuery } from '@tanstack/react-query';
import {
  RiFileList3Line, RiTimeLine, RiCheckboxCircleLine,
  RiMoneyDollarCircleLine,
} from 'react-icons/ri';
import { ordersApi } from '@/features/orders/api/ordersApi';
import { StatusBadge } from '@/shared/ui/StatusBadge';
import { useAuth } from '@/features/auth/model/useAuth';

function StatCard({
  label, value, icon, color, change,
}: {
  label: string; value: string | number; icon: React.ElementType;
  color: string; change?: number;
}) {
  return (
    <Box bg="white" borderRadius="8px" p={6} border="1px solid" borderColor="gray.100">
      <Flex justify="space-between" align="flex-start">
        <Stat>
          <StatLabel fontSize="12px" fontFamily="Syne" letterSpacing="0.06em" textTransform="uppercase" color="gray.400" mb={2}>
            {label}
          </StatLabel>
          <StatNumber fontSize="28px" fontFamily="Syne" fontWeight="700" letterSpacing="-0.02em">
            {value}
          </StatNumber>
          {change !== undefined && (
            <StatHelpText fontSize="12px" color="gray.500" mt={1}>
              <StatArrow type={change >= 0 ? 'increase' : 'decrease'} />
              {Math.abs(change)}% from last month
            </StatHelpText>
          )}
        </Stat>
        <Box p={3} bg={`${color}15`} borderRadius="8px">
          <Icon as={icon} boxSize={5} color={color} />
        </Box>
      </Flex>
    </Box>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const { data: ordersData } = useQuery({
    queryKey: ['orders', 'dashboard'],
    queryFn: () => ordersApi.getAll({ limit: 5 }),
  });

  const orders = ordersData?.data || [];
  const total = ordersData?.total || 0;
  const inProgress = orders.filter(o => o.status === 'IN_PROGRESS').length;
  const done = orders.filter(o => o.status === 'DONE').length;
  const revenue = orders.reduce((sum, o) => sum + o.totalPrice, 0);

  return (
    <Box p={8}>
      {/* Header */}
      <Box mb={8}>
        <Text fontFamily="Syne" fontWeight="800" fontSize="26px" letterSpacing="-0.02em" mb={1}>
          Good morning, {user?.name?.split(' ')[0]} 👋
        </Text>
        <Text color="gray.500" fontSize="14px">
          Here's what's happening with your translation orders today.
        </Text>
      </Box>

      {/* Stats */}
      <Grid templateColumns="repeat(4, 1fr)" gap={4} mb={8}>
        <StatCard label="Total Orders" value={total} icon={RiFileList3Line} color="#4d76ff" change={12} />
        <StatCard label="In Progress" value={inProgress} icon={RiTimeLine} color="#fdcb6e" />
        <StatCard label="Completed" value={done} icon={RiCheckboxCircleLine} color="#00b894" change={8} />
        <StatCard
          label="Revenue"
          value={`₴${revenue.toLocaleString()}`}
          icon={RiMoneyDollarCircleLine}
          color="#a29bfe"
          change={5}
        />
      </Grid>

      {/* Recent Orders */}
      <Box bg="white" borderRadius="8px" border="1px solid" borderColor="gray.100">
        <Flex px={6} py={4} align="center" justify="space-between" borderBottom="1px solid" borderColor="gray.50">
          <Text fontFamily="Syne" fontWeight="700" fontSize="15px">Recent Orders</Text>
          <Text fontSize="12px" color="brand.500" cursor="pointer" fontFamily="DM Sans">
            View all →
          </Text>
        </Flex>
        <VStack spacing={0} align="stretch" divider={<Box borderBottom="1px solid" borderColor="gray.50" />}>
          {orders.length === 0 ? (
            <Box py={12} textAlign="center">
              <Text color="gray.400" fontSize="14px">No orders yet</Text>
            </Box>
          ) : (
            orders.map(order => (
              <Flex key={order.id} px={6} py={4} align="center" gap={4} _hover={{ bg: 'gray.50' }} cursor="pointer">
                <Box flex={1}>
                  <Text fontSize="14px" fontWeight="500" mb={0.5}>{order.clientName}</Text>
                  <Text fontSize="12px" color="gray.400" fontFamily="mono">
                    {order.sourceLanguage} → {order.targetLanguage}
                  </Text>
                </Box>
                <Text fontSize="12px" color="gray.400">
                  {new Date(order.createdAt).toLocaleDateString('uk-UA')}
                </Text>
                <StatusBadge status={order.status} />
                <Text fontSize="14px" fontWeight="600" fontFamily="mono" color="gray.700">
                  ₴{order.totalPrice.toLocaleString()}
                </Text>
              </Flex>
            ))
          )}
        </VStack>
      </Box>
    </Box>
  );
}
