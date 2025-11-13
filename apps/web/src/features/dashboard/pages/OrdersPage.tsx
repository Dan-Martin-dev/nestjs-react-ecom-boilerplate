import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { ChevronLeft, ChevronRight, Eye } from 'lucide-react';
import { apiClient } from '../../../lib/api';
import OrderDetailModal from '../components/OrderDetailModal';
import type { Order, PaginatedResponse } from '../../../types/api';
import { OrderStatus } from '../../../types/api';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';

const OrdersPage: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const queryParams = {
    page: currentPage,
    limit: 10,
    ...(selectedStatus && selectedStatus !== 'all' && { status: selectedStatus }),
    ...(startDate && { startDate }),
    ...(endDate && { endDate }),
  };

  const { data: ordersData, isLoading } = useQuery<PaginatedResponse<Order>>({
    queryKey: ['orders', queryParams],
    queryFn: async () => {
      return apiClient.get<PaginatedResponse<Order>>('/orders', queryParams);
    },
    placeholderData: (previousData) => previousData,
  });

  const { data: orderDetail } = useQuery({
    queryKey: ['orderDetail', selectedOrderId],
    queryFn: async () => {
      if (!selectedOrderId) return null;
      return apiClient.get<Order>(`/orders/${selectedOrderId}`);
    },
    enabled: !!selectedOrderId,
  });

  const handleViewOrder = (orderId: string) => {
    setSelectedOrderId(orderId);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setStartDate(e.target.value);
    setCurrentPage(1);
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEndDate(e.target.value);
    setCurrentPage(1);
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  };

  const handleNextPage = () => {
    if (ordersData?.meta && currentPage < ordersData.meta.totalPages) {
      setCurrentPage(prev => prev + 1);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold font-monos tracking-tight">Your Orders</h2>
        <p className="text-muted-foreground">View and track your order history</p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="status">Order Status</Label>
              <Select value={selectedStatus || 'all'} onValueChange={(value) => {
                setSelectedStatus(value === 'all' ? '' : value);
                setCurrentPage(1);
              }}>
                <SelectTrigger id="status">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value={OrderStatus.PENDING}>Pending</SelectItem>
                  <SelectItem value={OrderStatus.CONFIRMED}>Confirmed</SelectItem>
                  <SelectItem value={OrderStatus.SHIPPED}>Shipped</SelectItem>
                  <SelectItem value={OrderStatus.DELIVERED}>Delivered</SelectItem>
                  <SelectItem value={OrderStatus.CANCELLED}>Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="startDate">From Date</Label>
              <Input type="date" id="startDate" value={startDate} onChange={handleStartDateChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">To Date</Label>
              <Input type="date" id="endDate" value={endDate} onChange={handleEndDateChange} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Orders</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8 text-muted-foreground">Loading orders...</div>
          ) : ordersData?.data && ordersData.data.length > 0 ? (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order #</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ordersData.data.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium font-monos">#{order.orderNumber}</TableCell>
                      <TableCell>{format(new Date(order.createdAt), 'MMM dd, yyyy')}</TableCell>
                      <TableCell>
                        <Badge variant={order.status === OrderStatus.PENDING ? 'secondary' : order.status === OrderStatus.CONFIRMED ? 'default' : order.status === OrderStatus.SHIPPED ? 'default' : order.status === OrderStatus.DELIVERED ? 'outline' : 'secondary'}>
                          {order.status}
                        </Badge>
                      </TableCell>
                      <TableCell>\${parseFloat(order.totalAmount).toFixed(2)}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" onClick={() => handleViewOrder(order.id)}>
                          <Eye className="h-4 w-4 mr-2" />View Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {ordersData.meta && ordersData.meta.totalPages > 1 && (
                <div className="flex items-center justify-between pt-4">
                  <div className="text-sm text-muted-foreground">
                    Showing <span className="font-medium font-monos">{((currentPage - 1) * 10) + 1}</span> to <span className="font-medium font-monos">{Math.min(currentPage * 10, ordersData.meta.total)}</span> of <span className="font-medium font-monos">{ordersData.meta.total}</span> orders
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm" onClick={handlePreviousPage} disabled={currentPage === 1}>
                      <ChevronLeft className="h-4 w-4 mr-1" />Previous
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleNextPage} disabled={currentPage === ordersData.meta.totalPages}>
                      Next<ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <p className="text-muted-foreground mb-2">No orders found.</p>
              {(selectedStatus || startDate || endDate) && (
                <p className="text-sm text-muted-foreground">Try adjusting your filters to see more results.</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <OrderDetailModal order={orderDetail || null} isOpen={isModalOpen} onClose={closeModal} />
    </div>
  );
};

export default OrdersPage;
