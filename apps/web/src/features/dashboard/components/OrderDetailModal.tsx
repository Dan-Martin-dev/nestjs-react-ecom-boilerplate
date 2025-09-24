import React, { useEffect, useState } from 'react';
import { format } from 'date-fns';

type OrderItemType = {
  id: string;
  quantity: number;
  priceAtPurchase: string;
  productVariant: {
    name: string;
    sku: string;
    product: {
      id: string;
      name: string;
      images: { url: string }[];
    };
  };
};

type OrderType = {
  id: string;
  orderNumber: string;
  status: string;
  totalAmount: string;
  createdAt: string;
  updatedAt: string;
  items: OrderItemType[];
  shippingAddress: {
    street: string;
    streetNumber?: string;
    city: string;
    province: string;
    zipCode: string;
    country: string;
  };
  payment: {
    paymentMethod: string;
    status: string;
  };
};

interface OrderDetailModalProps {
  order: OrderType | null;
  isOpen: boolean;
  onClose: () => void;
}

const OrderDetailModal: React.FC<OrderDetailModalProps> = ({ order, isOpen, onClose }) => {
  const [isMounted, setIsMounted] = useState(false);
  
  useEffect(() => {
    setIsMounted(true);
    
    return () => {
      setIsMounted(false);
    };
  }, []);
  
  if (!isOpen || !order) return null;
  
  // Animation classes for modal
  const backdropClasses = `fixed inset-0 bg-black ${isMounted ? 'bg-opacity-50' : 'bg-opacity-0'} transition-opacity duration-300 z-40`;
  
  const modalClasses = `fixed inset-0 overflow-y-auto z-50 ${isMounted ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`;
  
  return (
    <>
      {/* Backdrop */}
      <div className={backdropClasses} onClick={onClose}></div>
      
      {/* Modal */}
      <div className={modalClasses}>
        <div className="flex min-h-full items-center justify-center p-4">
          <div className="w-full max-w-3xl bg-white rounded-lg shadow-xl">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">
                Order #{order.orderNumber}
              </h3>
              <button
                type="button"
                className="text-gray-400 hover:text-gray-500"
                onClick={onClose}
              >
                <span className="sr-only">Close</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Order Summary */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Order Information</h4>
                  <div className="mt-2 space-y-1 text-sm">
                    <p>
                      <span className="font-medium">Status:</span>{' '}
                      <span className={`inline-flex px-2 text-xs leading-5 font-semibold rounded-full 
                        ${order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : 
                          order.status === 'CONFIRMED' ? 'bg-green-100 text-green-800' :
                          order.status === 'DELIVERED' ? 'bg-blue-100 text-blue-800' : 
                          'bg-gray-100 text-gray-800'}`
                      }>
                        {order.status}
                      </span>
                    </p>
                    <p>
                      <span className="font-medium">Date:</span>{' '}
                      {format(new Date(order.createdAt), 'MMM dd, yyyy')}
                    </p>
                    <p>
                      <span className="font-medium">Payment:</span>{' '}
                      {order.payment.paymentMethod} ({order.payment.status})
                    </p>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Shipping Address</h4>
                  <div className="mt-2 space-y-1 text-sm">
                    <p>{order.shippingAddress.street} {order.shippingAddress.streetNumber || ''}</p>
                    <p>
                      {order.shippingAddress.city}, {order.shippingAddress.province} {order.shippingAddress.zipCode}
                    </p>
                    <p>{order.shippingAddress.country}</p>
                  </div>
                </div>
              </div>
              
              {/* Order Items */}
              <div className="mt-6">
                <h4 className="text-sm font-medium text-gray-500 mb-3">Items</h4>
                <div className="border rounded-md overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Product
                        </th>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Quantity
                        </th>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Price
                        </th>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Subtotal
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {order.items.map((item) => (
                        <tr key={item.id}>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10">
                                <img 
                                  className="h-10 w-10 rounded-md object-cover"
                                  src={
                                    item.productVariant.product.images?.[0]?.url || 
                                    'https://placehold.co/100x100?text=No+Image'
                                  } 
                                  alt={item.productVariant.product.name}
                                />
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {item.productVariant.product.name}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {item.productVariant.name} ({item.productVariant.sku})
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                            {item.quantity}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                            ${parseFloat(item.priceAtPurchase).toFixed(2)}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                            ${(parseFloat(item.priceAtPurchase) * item.quantity).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              
              {/* Order Total */}
              <div className="border-t border-gray-200 pt-4 flex justify-end">
                <div className="w-full max-w-xs">
                  <div className="flex justify-between py-2 text-sm">
                    <span className="font-medium">Subtotal</span>
                    <span className="text-gray-500">
                      ${
                        order.items.reduce(
                          (sum, item) => sum + parseFloat(item.priceAtPurchase) * item.quantity, 
                          0
                        ).toFixed(2)
                      }
                    </span>
                  </div>
                  <div className="flex justify-between py-2 text-sm">
                    <span className="font-medium">Shipping</span>
                    <span className="text-gray-500">$0.00</span>
                  </div>
                  <div className="flex justify-between py-2 text-sm font-medium">
                    <span>Total</span>
                    <span>${parseFloat(order.totalAmount).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
              <button
                type="button"
                className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                onClick={onClose}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default OrderDetailModal;
