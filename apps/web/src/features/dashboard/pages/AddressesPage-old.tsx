import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../lib/api';
import { formatApiError, notify } from '../../../lib/notify';
import AddressForm from '../components/AddressForm';
import type { Address } from '../../../types/api';
import { AddressType } from '../../../types/api';

const AddressesPage: React.FC = () => {
  // State for address management
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [addressType, setAddressType] = useState<AddressType | 'ALL'>('ALL');
  
  // Query client for cache invalidation
  const queryClient = useQueryClient();

  // Fetch addresses
  const { data: addresses = [], isLoading } = useQuery<Address[]>({
    queryKey: ['addresses'],
    queryFn: async () => {
      const response = await apiClient.get<Address[]>('/addresses');
      return response;
    },
  });

  // Delete address mutation
  const { mutate: deleteAddress, isPending: isDeleting } = useMutation({
    mutationFn: async (addressId: string) => {
      await apiClient.delete(`/addresses/${addressId}`);
      return addressId;
    },
    onSuccess: (deletedAddressId) => {
      queryClient.setQueryData(['addresses'], 
        (oldData: Address[] | undefined) => 
          oldData ? oldData.filter(address => address.id !== deletedAddressId) : []
      );
      notify.success('Address deleted successfully');
    },
    onError: (error) => {
      notify.error(formatApiError(error));
    },
  });

  // Handle address deletion
  const handleDeleteAddress = (addressId: string) => {
    if (window.confirm('Are you sure you want to delete this address?')) {
      deleteAddress(addressId);
    }
  };

  // Filter addresses by type
  const filteredAddresses = addressType === 'ALL'
    ? addresses
    : addresses.filter(address => address.type === addressType);

  // Group addresses by type
  const shippingAddresses = addresses.filter(address => address.type === 'SHIPPING');
  const billingAddresses = addresses.filter(address => address.type === 'BILLING');
  
  // Check if there are default addresses
  const hasDefaultShipping = shippingAddresses.some(address => address.isDefault);
  const hasDefaultBilling = billingAddresses.some(address => address.isDefault);

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h2 className="text-2xl font-semibold font-mono text-gray-900">Your Addresses</h2>
        <p className="mt-1 text-sm text-gray-500">Manage your shipping and billing addresses</p>
      </div>

      {/* Address Type Filter */}
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-2 sm:space-y-0">
          <button
            onClick={() => setAddressType('ALL')}
            className={`px-4 py-2 text-sm font-medium rounded-md ${
              addressType === 'ALL'
                ? 'bg-gray-900 text-white'
                : 'bg-white text-gray-700 border border-gray-300'
            }`}
          >
            All Addresses
          </button>
          <button
            onClick={() => setAddressType('SHIPPING')}
            className={`px-4 py-2 text-sm font-medium rounded-md ${
              addressType === 'SHIPPING'
                ? 'bg-gray-900 text-white'
                : 'bg-white text-gray-700 border border-gray-300'
            }`}
          >
            Shipping
          </button>
          <button
            onClick={() => setAddressType('BILLING')}
            className={`px-4 py-2 text-sm font-medium rounded-md ${
              addressType === 'BILLING'
                ? 'bg-gray-900 text-white'
                : 'bg-white text-gray-700 border border-gray-300'
            }`}
          >
            Billing
          </button>
          <div className="flex-1"></div>
          <button
            onClick={() => {
              setSelectedAddress(null);
              setShowAddressForm(true);
            }}
            className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700"
          >
            Add New Address
          </button>
        </div>
      </div>

      {/* Form for adding/editing address */}
      {showAddressForm && (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <AddressForm
            address={selectedAddress}
            onClose={() => {
              setShowAddressForm(false);
              setSelectedAddress(null);
            }}
            onSuccess={() => {
              // Refresh addresses after successful operation
              queryClient.invalidateQueries({ queryKey: ['addresses'] });
            }}
          />
        </div>
      )}

      {/* Addresses List */}
      {isLoading ? (
        <div className="text-center p-8">Loading addresses...</div>
      ) : filteredAddresses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredAddresses.map((address) => (
            <div
              key={address.id}
              className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 relative"
            >
              {/* Default Label */}
              {address.isDefault && (
                <span className="absolute top-2 right-2 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                  Default {address.type.toLowerCase()}
                </span>
              )}
              
              {/* Address Type Badge */}
              <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium mb-2 ${
                address.type === 'SHIPPING' ? 'bg-indigo-100 text-indigo-800' : 'bg-green-100 text-green-800'
              }`}>
                {address.type}
              </span>
              
              {/* Address Details */}
              <div className="space-y-1 text-sm text-gray-700">
                <p>{address.street} {address.streetNumber || ''}</p>
                {(address.floor || address.apartment) && (
                  <p>
                    {address.floor && `Floor ${address.floor}`}
                    {address.floor && address.apartment && ', '}
                    {address.apartment && `Apt ${address.apartment}`}
                  </p>
                )}
                {address.neighborhood && <p>{address.neighborhood}</p>}
                <p>{address.city}, {address.province} {address.zipCode}</p>
                <p>{address.country}</p>
              </div>
              
              {/* Actions */}
              <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between">
                <button
                  onClick={() => {
                    setSelectedAddress(address);
                    setShowAddressForm(true);
                  }}
                  className="text-sm text-indigo-600 hover:text-indigo-900"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteAddress(address.id)}
                  disabled={isDeleting}
                  className="text-sm text-red-600 hover:text-red-900"
                >
                  {isDeleting ? 'Deleting...' : 'Delete'}
                </button>
              </div>
              
              {/* Set as default button (show only if not default) */}
              {!address.isDefault && (
                <button
                  onClick={() => {
                    setSelectedAddress({
                      ...address,
                      isDefault: true
                    });
                    setShowAddressForm(true);
                  }}
                  className="mt-3 text-sm text-gray-600 hover:text-gray-900 underline"
                >
                  Set as default {address.type === 'SHIPPING' ? 'shipping' : 'billing'} address
                </button>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white p-8 rounded-lg shadow-sm text-center">
          <p className="text-gray-500 mb-4">No addresses found.</p>
          <button
            onClick={() => {
              setSelectedAddress(null);
              setShowAddressForm(true);
            }}
            className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700"
          >
            Add New Address
          </button>
        </div>
      )}

      {/* Information about default addresses */}
      <div className="bg-blue-50 p-4 rounded-lg text-sm text-blue-800">
        <h4 className="font-medium mb-2">About Default Addresses</h4>
        <ul className="list-disc pl-5 space-y-1">
          <li>
            {hasDefaultShipping 
              ? 'You have a default shipping address set.'
              : 'You have no default shipping address. Set one to speed up checkout.'}
          </li>
          <li>
            {hasDefaultBilling
              ? 'You have a default billing address set.'
              : 'You have no default billing address. Set one to speed up checkout.'}
          </li>
          <li>Default addresses are used automatically during checkout.</li>
        </ul>
      </div>
    </div>
  );
};

export default AddressesPage;
