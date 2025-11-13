import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MapPin, Plus, Pencil, Trash2 } from 'lucide-react';
import { apiClient } from '../../../lib/api';
import { formatApiError, notify } from '../../../lib/notify';
import AddressForm from '../components/AddressForm';
import type { Address } from '../../../types/api';
import { AddressType } from '../../../types/api';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';

const AddressesPage: React.FC = () => {
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [addressType, setAddressType] = useState<AddressType | 'ALL'>('ALL');
  const queryClient = useQueryClient();

  const { data: addresses = [], isLoading } = useQuery<Address[]>({
    queryKey: ['addresses'],
    queryFn: async () => apiClient.get<Address[]>('/addresses'),
  });

  const { mutate: deleteAddress, isPending: isDeleting } = useMutation({
    mutationFn: async (addressId: string) => {
      await apiClient.delete(`/addresses/${addressId}`);
      return addressId;
    },
    onSuccess: (deletedAddressId) => {
      queryClient.setQueryData(['addresses'], (oldData: Address[] | undefined) => 
        oldData ? oldData.filter(address => address.id !== deletedAddressId) : []
      );
      notify.success('Address deleted successfully');
    },
    onError: (error) => notify.error(formatApiError(error)),
  });

  const handleDeleteAddress = (addressId: string) => {
    if (window.confirm('Are you sure you want to delete this address?')) {
      deleteAddress(addressId);
    }
  };

  const filteredAddresses = addressType === 'ALL' ? addresses : addresses.filter(address => address.type === addressType);
  const shippingAddresses = addresses.filter(address => address.type === 'SHIPPING');
  const billingAddresses = addresses.filter(address => address.type === 'BILLING');
  const hasDefaultShipping = shippingAddresses.some(address => address.isDefault);
  const hasDefaultBilling = billingAddresses.some(address => address.isDefault);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold font-monos tracking-tight">Your Addresses</h2>
          <p className="text-muted-foreground">Manage your shipping and billing addresses</p>
        </div>
        <Button onClick={() => { setSelectedAddress(null); setShowAddressForm(true); }}>
          <Plus className="h-4 w-4 mr-2" />Add New Address
        </Button>
      </div>

      <div className="flex items-center space-x-2">
        <Button variant={addressType === 'ALL' ? 'default' : 'outline'} size="sm" onClick={() => setAddressType('ALL')}>All Addresses</Button>
        <Button variant={addressType === 'SHIPPING' ? 'default' : 'outline'} size="sm" onClick={() => setAddressType('SHIPPING')}>Shipping</Button>
        <Button variant={addressType === 'BILLING' ? 'default' : 'outline'} size="sm" onClick={() => setAddressType('BILLING')}>Billing</Button>
      </div>

      {showAddressForm && (
        <Card>
          <AddressForm address={selectedAddress} onClose={() => { setShowAddressForm(false); setSelectedAddress(null); }} onSuccess={() => queryClient.invalidateQueries({ queryKey: ['addresses'] })} />
        </Card>
      )}

      {isLoading ? (
        <div className="flex justify-center py-8 text-muted-foreground">Loading addresses...</div>
      ) : filteredAddresses.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2">
          {filteredAddresses.map((address) => (
            <Card key={address.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <Badge variant={address.type === 'SHIPPING' ? 'default' : 'secondary'}>{address.type}</Badge>
                    {address.isDefault && <Badge variant="outline">Default</Badge>}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-sm space-y-1">
                  <p>{address.street} {address.streetNumber || ''}</p>
                  {(address.floor || address.apartment) && <p>{address.floor && `Floor ${address.floor}`}{address.floor && address.apartment && ', '}{address.apartment && `Apt ${address.apartment}`}</p>}
                  {address.neighborhood && <p>{address.neighborhood}</p>}
                  <p>{address.city}, {address.province} {address.zipCode}</p>
                  <p>{address.country}</p>
                </div>
                <div className="flex items-center space-x-2 pt-2 border-t">
                  <Button variant="ghost" size="sm" onClick={() => { setSelectedAddress(address); setShowAddressForm(true); }}>
                    <Pencil className="h-4 w-4 mr-2" />Edit
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDeleteAddress(address.id)} disabled={isDeleting}>
                    <Trash2 className="h-4 w-4 mr-2" />{isDeleting ? 'Deleting...' : 'Delete'}
                  </Button>
                  {!address.isDefault && (
                    <Button variant="outline" size="sm" onClick={() => { setSelectedAddress({ ...address, isDefault: true }); setShowAddressForm(true); }}>Set as Default</Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-8 text-center">
            <MapPin className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">No addresses found.</p>
            <Button onClick={() => { setSelectedAddress(null); setShowAddressForm(true); }}>
              <Plus className="h-4 w-4 mr-2" />Add New Address
            </Button>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>About Default Addresses</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
            <li>{hasDefaultShipping ? 'You have a default shipping address set.' : 'You have no default shipping address. Set one to speed up checkout.'}</li>
            <li>{hasDefaultBilling ? 'You have a default billing address set.' : 'You have no default billing address. Set one to speed up checkout.'}</li>
            <li>Default addresses are used automatically during checkout.</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default AddressesPage;
