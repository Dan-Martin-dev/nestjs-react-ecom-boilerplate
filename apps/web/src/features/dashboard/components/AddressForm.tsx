import React, { useEffect, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../lib/api';
import { notify, formatApiError } from '../../../lib/notify';
import type { Address } from '../../../types/api';
import { AddressType } from '../../../types/api';

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
  
  // Form state
  const [formData, setFormData] = useState<AddressFormData>({
    street: '',
    streetNumber: '',
    city: '',
    province: '',
    zipCode: '',
    neighborhood: '',
    floor: '',
    apartment: '',
    country: 'US', // Default country
    type: 'SHIPPING',
    isDefault: false,
  });
  
  // Form errors
  const [errors, setErrors] = useState<Partial<Record<keyof AddressFormData, string>>>({});
  
  // Set initial form data if editing
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
  
  // Create address mutation
  const createAddress = useMutation({
    mutationFn: (data: AddressFormData) => {
      return apiClient.post<Address>('/addresses', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
      notify.success('Address added successfully');
      onSuccess();
      onClose();
    },
    onError: (error) => {
      notify.error(formatApiError(error));
    },
  });
  
  // Update address mutation
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
    onError: (error) => {
      notify.error(formatApiError(error));
    },
  });
  
  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
    
    // Clear error when field is being edited
    if (errors[name as keyof AddressFormData]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };
  
  // Form validation
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
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    if (isEditing) {
      updateAddress.mutate(formData);
    } else {
      createAddress.mutate(formData);
    }
  };
  
  // Is submitting state
  const isSubmitting = createAddress.isPending || updateAddress.isPending;
  
  return (
    <div className="bg-white rounded-lg p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">
        {isEditing ? 'Edit Address' : 'Add New Address'}
      </h3>
      
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          {/* Street and Street Number */}
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2">
              <label htmlFor="street" className="block text-sm font-medium text-gray-700">
                Street*
              </label>
              <input
                type="text"
                id="street"
                name="street"
                value={formData.street}
                onChange={handleChange}
                className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm p-2 border ${
                  errors.street ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.street && (
                <p className="mt-1 text-sm text-red-600">{errors.street}</p>
              )}
            </div>
            <div>
              <label htmlFor="streetNumber" className="block text-sm font-medium text-gray-700">
                Number
              </label>
              <input
                type="text"
                id="streetNumber"
                name="streetNumber"
                value={formData.streetNumber}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm p-2 border"
              />
            </div>
          </div>
          
          {/* City and Province */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="city" className="block text-sm font-medium text-gray-700">
                City*
              </label>
              <input
                type="text"
                id="city"
                name="city"
                value={formData.city}
                onChange={handleChange}
                className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm p-2 border ${
                  errors.city ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.city && (
                <p className="mt-1 text-sm text-red-600">{errors.city}</p>
              )}
            </div>
            <div>
              <label htmlFor="province" className="block text-sm font-medium text-gray-700">
                State/Province*
              </label>
              <input
                type="text"
                id="province"
                name="province"
                value={formData.province}
                onChange={handleChange}
                className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm p-2 border ${
                  errors.province ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.province && (
                <p className="mt-1 text-sm text-red-600">{errors.province}</p>
              )}
            </div>
          </div>
          
          {/* ZIP and Country */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700">
                ZIP/Postal Code*
              </label>
              <input
                type="text"
                id="zipCode"
                name="zipCode"
                value={formData.zipCode}
                onChange={handleChange}
                className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm p-2 border ${
                  errors.zipCode ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.zipCode && (
                <p className="mt-1 text-sm text-red-600">{errors.zipCode}</p>
              )}
            </div>
            <div>
              <label htmlFor="country" className="block text-sm font-medium text-gray-700">
                Country*
              </label>
              <select
                id="country"
                name="country"
                value={formData.country}
                onChange={handleChange}
                className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm p-2 border ${
                  errors.country ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="US">United States</option>
                <option value="CA">Canada</option>
                <option value="MX">Mexico</option>
                <option value="GB">United Kingdom</option>
                <option value="AU">Australia</option>
                <option value="DE">Germany</option>
                <option value="FR">France</option>
                {/* Add more countries as needed */}
              </select>
              {errors.country && (
                <p className="mt-1 text-sm text-red-600">{errors.country}</p>
              )}
            </div>
          </div>
          
          {/* Neighborhood, Floor, Apartment */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label htmlFor="neighborhood" className="block text-sm font-medium text-gray-700">
                Neighborhood
              </label>
              <input
                type="text"
                id="neighborhood"
                name="neighborhood"
                value={formData.neighborhood}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm p-2 border"
              />
            </div>
            <div>
              <label htmlFor="floor" className="block text-sm font-medium text-gray-700">
                Floor
              </label>
              <input
                type="text"
                id="floor"
                name="floor"
                value={formData.floor}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm p-2 border"
              />
            </div>
            <div>
              <label htmlFor="apartment" className="block text-sm font-medium text-gray-700">
                Apartment
              </label>
              <input
                type="text"
                id="apartment"
                name="apartment"
                value={formData.apartment}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm p-2 border"
              />
            </div>
          </div>
          
          {/* Address Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Address Type
            </label>
            <div className="flex space-x-4">
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  name="type"
                  value="SHIPPING"
                  checked={formData.type === 'SHIPPING'}
                  onChange={handleChange}
                  className="form-radio h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="ml-2 text-sm text-gray-700">Shipping</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  name="type"
                  value="BILLING"
                  checked={formData.type === 'BILLING'}
                  onChange={handleChange}
                  className="form-radio h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="ml-2 text-sm text-gray-700">Billing</span>
              </label>
            </div>
          </div>
          
          {/* Default Address */}
          <div className="flex items-center">
            <input
              id="isDefault"
              name="isDefault"
              type="checkbox"
              checked={formData.isDefault}
              onChange={handleChange}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <label htmlFor="isDefault" className="ml-2 block text-sm text-gray-700">
              Set as default {formData.type === 'SHIPPING' ? 'shipping' : 'billing'} address
            </label>
          </div>
        </div>
        
        {/* Form Actions */}
        <div className="mt-6 flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none ${
              isSubmitting ? 'opacity-75 cursor-not-allowed' : ''
            }`}
          >
            {isSubmitting ? 'Saving...' : isEditing ? 'Update' : 'Add'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddressForm;
