import React, { useEffect, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../lib/api';
import { notify, formatApiError } from '../../../lib/notify';
import type { Address } from '../../../types/api';
import { AddressType } from '../../../types/api';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Button } from '../../../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';

interface AddressFormProps {
  address?: Address | null;
  onClose: () => void;
  onSuccess: () => void;
}

interface AddressFormData {
  street: string;
  streetNumber?: string;
  city: string;
  province: string;
  zipCode: string;
  neighborhood?: string;
  floor?: string;
  apartment?: string;
  country: string;
  type: AddressType;
  isDefault: boolean;
}

const AddressForm: React.FC<AddressFormProps> = ({ address, onClose, onSuccess }) => {
  const queryClient = useQueryClient();
  const isEditing = !!address;
  
  const [formData, setFormData] = useState<AddressFormData>({
    street: '',
    streetNumber: '',
    city: '',
    province: '',
    zipCode: '',
    neighborhood: '',
    floor: '',
    apartment: '',
    country: 'US',
    type: 'SHIPPING',
    isDefault: false,
  });
  
  const [errors, setErrors] = useState<Partial<Record<keyof AddressFormData, string>>>({});
  
  useEffect(() => {
    if (address) {
      setFormData({
        street: address.street,
        streetNumber: address.streetNumber || '',
        city: address.city,
        province: address.province,
        zipCode: address.zipCode,
        neighborhood: address.neighborhood || '',
        floor: address.floor || '',
        apartment: address.apartment || '',
        country: address.country,
        type: address.type,
        isDefault: address.isDefault,
      });
    }
  }, [address]);
  
  const createAddress = useMutation({
    mutationFn: (data: AddressFormData) => apiClient.post<Address>('/addresses', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
      notify.success('Address added successfully');
      onSuccess();
      onClose();
    },
    onError: (error) => notify.error(formatApiError(error)),
  });
  
  const updateAddress = useMutation({
    mutationFn: (data: AddressFormData) => {
      if (!address) throw new Error('No address to update');
      return apiClient.patch<Address>(`/addresses/${address.id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
      notify.success('Address updated successfully');
      onSuccess();
      onClose();
    },
    onError: (error) => notify.error(formatApiError(error)),
  });
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (errors[name as keyof AddressFormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };
  
  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof AddressFormData, string>> = {};
    let valid = true;
    
    if (!formData.street.trim()) {
      newErrors.street = 'Street is required';
      valid = false;
    }
    if (!formData.city.trim()) {
      newErrors.city = 'City is required';
      valid = false;
    }
    if (!formData.province.trim()) {
      newErrors.province = 'State/Province is required';
      valid = false;
    }
    if (!formData.zipCode.trim()) {
      newErrors.zipCode = 'ZIP/Postal code is required';
      valid = false;
    }
    if (!formData.country.trim()) {
      newErrors.country = 'Country is required';
      valid = false;
    }
    
    setErrors(newErrors);
    return valid;
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    if (isEditing) {
      updateAddress.mutate(formData);
    } else {
      createAddress.mutate(formData);
    }
  };
  
  const isSubmitting = createAddress.isPending || updateAddress.isPending;
  
  return (
    <div className="p-6">
      <h3 className="text-lg font-semibold font-monos mb-4">
        {isEditing ? 'Edit Address' : 'Add New Address'}
      </h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="sm:col-span-2 space-y-2">
            <Label htmlFor="street">Street*</Label>
            <Input
              id="street"
              name="street"
              value={formData.street}
              onChange={handleChange}
              className={errors.street ? 'border-destructive' : ''}
            />
            {errors.street && <p className="text-sm text-destructive font-monos">{errors.street}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="streetNumber">Number</Label>
            <Input id="streetNumber" name="streetNumber" value={formData.streetNumber} onChange={handleChange} />
          </div>
        </div>
        
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="city">City*</Label>
            <Input
              id="city"
              name="city"
              value={formData.city}
              onChange={handleChange}
              className={errors.city ? 'border-destructive' : ''}
            />
            {errors.city && <p className="text-sm text-destructive font-monos">{errors.city}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="province">State/Province*</Label>
            <Input
              id="province"
              name="province"
              value={formData.province}
              onChange={handleChange}
              className={errors.province ? 'border-destructive' : ''}
            />
            {errors.province && <p className="text-sm text-destructive font-monos">{errors.province}</p>}
          </div>
        </div>
        
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="zipCode">ZIP/Postal Code*</Label>
            <Input
              id="zipCode"
              name="zipCode"
              value={formData.zipCode}
              onChange={handleChange}
              className={errors.zipCode ? 'border-destructive' : ''}
            />
            {errors.zipCode && <p className="text-sm text-destructive font-monos">{errors.zipCode}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="country">Country*</Label>
            <Select
              value={formData.country}
              onValueChange={(value) => setFormData((prev) => ({ ...prev, country: value }))}
            >
              <SelectTrigger id="country">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="US">United States</SelectItem>
                <SelectItem value="CA">Canada</SelectItem>
                <SelectItem value="MX">Mexico</SelectItem>
                <SelectItem value="GB">United Kingdom</SelectItem>
                <SelectItem value="AU">Australia</SelectItem>
                <SelectItem value="DE">Germany</SelectItem>
                <SelectItem value="FR">France</SelectItem>
              </SelectContent>
            </Select>
            {errors.country && <p className="text-sm text-destructive font-monos">{errors.country}</p>}
          </div>
        </div>
        
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="neighborhood">Neighborhood</Label>
            <Input id="neighborhood" name="neighborhood" value={formData.neighborhood} onChange={handleChange} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="floor">Floor</Label>
            <Input id="floor" name="floor" value={formData.floor} onChange={handleChange} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="apartment">Apartment</Label>
            <Input id="apartment" name="apartment" value={formData.apartment} onChange={handleChange} />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label>Address Type</Label>
          <div className="flex space-x-4">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="radio"
                name="type"
                value="SHIPPING"
                checked={formData.type === 'SHIPPING'}
                onChange={handleChange}
                className="h-4 w-4"
              />
              <span className="text-sm font-monos">Shipping</span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="radio"
                name="type"
                value="BILLING"
                checked={formData.type === 'BILLING'}
                onChange={handleChange}
                className="h-4 w-4"
              />
              <span className="text-sm font-monos">Billing</span>
            </label>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <input
            id="isDefault"
            name="isDefault"
            type="checkbox"
            checked={formData.isDefault}
            onChange={handleChange}
            className="h-4 w-4 rounded border-gray-300"
          />
          <Label htmlFor="isDefault" className="font-normal font-monos cursor-pointer">
            Set as default {formData.type === 'SHIPPING' ? 'shipping' : 'billing'} address
          </Label>
        </div>
        
        <div className="flex justify-end space-x-3 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : isEditing ? 'Update' : 'Add'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AddressForm;
