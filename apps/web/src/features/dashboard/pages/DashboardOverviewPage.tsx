import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag } from 'lucide-react';
import { useAuthStore } from '../../../stores';
import { apiClient } from '../../../lib/api';
import type { Order, Product, PaginatedResponse } from '../../../types/api';
import { OrderStatus } from '../../../types/api';
import { DashboardLoading, DashboardError, DashboardEmptyState } from '../components/DashboardStates';

interface OrderWithTotal extends Order {
  total: number;
}

interface ProductWithCategory extends Product {
  category: string;
}

interface OrdersResponse extends PaginatedResponse<OrderWithTotal> {
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    statusCount?: Record<OrderStatus, number>;
    addressCount?: number;
  }
}

const DashboardOverviewPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  
  // Fetch recent orders
  const { 
    data: recentOrdersData, 
    isLoading: ordersLoading,
    error: ordersError,
    refetch: refetchOrders
  } = useQuery<OrdersResponse>({
    queryKey: ['recentOrders'],
    queryFn: async () => {
      return apiClient.get<OrdersResponse>('/orders', { limit: '5' });
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Extract orders
  const recentOrders = recentOrdersData?.data || [];

  // Fetch recommended products
  const { 
    data: recommendedProductsData,
    isLoading: productsLoading,
    error: productsError,
    refetch: refetchProducts
  } = useQuery<PaginatedResponse<ProductWithCategory>>({
    queryKey: ['recommendedProducts'],
    queryFn: async () => {
      return apiClient.get<PaginatedResponse<ProductWithCategory>>('/products/bestsellers', { limit: '4' });
    },
    enabled: !!user,
    staleTime: 15 * 60 * 1000, // 15 minutes
  });

  const recommendedProducts = recommendedProductsData?.data || [];

  // Combined loading state
  const isLoading = ordersLoading || productsLoading;

  // Check for errors
  if (ordersError || productsError) {
    const error = ordersError || productsError;
    return (
      <DashboardError 
        message="Failed to load dashboard data" 
        details={error instanceof Error ? error.message : 'An unexpected error occurred'} 
        onRetry={() => {
          refetchOrders();
          refetchProducts();
        }} 
      />
    );
  }

  // Show loading state while data is being fetched
  if (isLoading) {
    return <DashboardLoading message="Loading your dashboard..." />;
  }

  return (
    <div className="space-y-6">
        
      {/* Welcome Section */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h1 className="text-2xl font-semibold font-monos text-gray-900">Welcome back, {user?.name || 'User'}</h1>
        <p className="mt-2 text-gray-600">
          Manage your account, view orders, and save your preferences.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-sm font-medium font-monos text-gray-500">Total Orders</h3>
          <p className="mt-2 text-3xl font-semibold font-monos text-gray-900">
            {recentOrdersData?.meta?.total || 0}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-sm font-medium font-monos text-gray-500">Pending Orders</h3>
          <p className="mt-2 text-3xl font-semibold font-monos text-gray-900">
            {recentOrdersData?.meta?.statusCount?.[OrderStatus.PENDING] || 0}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-sm font-medium font-monos text-gray-500">Completed Orders</h3>
          <p className="mt-2 text-3xl font-semibold font-monos text-gray-900">
            {recentOrdersData?.meta?.statusCount?.[OrderStatus.DELIVERED] || 0}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-sm font-medium font-monos text-gray-500">Saved Addresses</h3>
          <p className="mt-2 text-3xl font-semibold font-monos text-gray-900">
            {recentOrdersData?.meta?.addressCount || 0}
          </p>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-medium font-monos text-gray-900">Recent Orders</h2>
          <Link to="/dashboard/orders" className="text-sm text-indigo-600 hover:text-indigo-900">
            View all orders
          </Link>
        </div>

        {recentOrders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium font-monos text-gray-500 uppercase tracking-wider">
                    Order #
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium font-monos text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium font-monos text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium font-monos text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium font-monos text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentOrders.map((order: OrderWithTotal) => (
                  <tr key={order.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium font-monos text-gray-900">
                      #{order.orderNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold font-monos rounded-full 
                        ${order.status === OrderStatus.PENDING ? 'bg-yellow-100 text-yellow-800' : 
                          order.status === OrderStatus.CONFIRMED ? 'bg-green-100 text-green-800' : 
                          order.status === OrderStatus.DELIVERED ? 'bg-blue-100 text-blue-800' : 
                          'bg-gray-100 text-gray-800'}`
                      }>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      ${parseFloat(order.totalAmount).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <Link 
                        to={`/dashboard/orders?id=${order.id}`} 
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        Details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <DashboardEmptyState 
            title="No Orders Found" 
            message="You haven't placed any orders yet. Start shopping to see your orders here."
            icon={<ShoppingBag className="h-12 w-12 text-gray-400" />}
            action={{
              label: "Browse Products",
              onClick: () => navigate("/products")
            }}
          />
        )}
      </div>

      {/* Recommended Products */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-lg font-medium font-monos text-gray-900 mb-6">Recommended Products</h2>
        
        {recommendedProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {recommendedProducts.map((product: ProductWithCategory) => (
              <div key={product.id} className="group relative">
                <div className="aspect-h-1 aspect-w-1 w-full overflow-hidden rounded-lg bg-gray-100 group-hover:opacity-75">
                  <img
                    src={product.images[0]?.url || 'https://placehold.co/300x300?text=No+Image'}
                    alt={product.name}
                    className="h-48 w-full object-cover object-center"
                  />
                </div>
                <div className="mt-4 flex justify-between">
                  <div>
                    <h3 className="text-sm font-monos text-gray-700">
                      <Link to={`/products/${product.id}`}>
                        <span aria-hidden="true" className="absolute inset-0" />
                        {product.name}
                      </Link>
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {product.category || (product.categories?.length > 0 ? product.categories[0].name : 'Uncategorized')}
                    </p>
                  </div>
                  <p className="text-sm font-medium font-monos text-gray-900">
                    ${parseFloat(product.price).toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <DashboardEmptyState 
            title="No Recommendations" 
            message="We don't have any product recommendations for you right now."
            action={{
              label: "Browse Products",
              onClick: () => navigate("/products")
            }}
          />
        )}
      </div>
    </div>
  );
};

export default DashboardOverviewPage;
