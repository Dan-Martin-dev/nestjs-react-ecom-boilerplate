import React, { useState } from 'react';
import { useDashboard } from '../hooks/useDashboard';
import { notify } from '../../../lib/notify';

const AccountPage: React.FC = () => {
  const { user, isLoading, isUpdating, updateUser } = useDashboard();
  
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
  });
  
  const [errors, setErrors] = useState({
    name: '',
    email: '',
  });
  
  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user types
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };
  
  // Form validation
  const validateForm = () => {
    let valid = true;
    const newErrors = { ...errors };
    
    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
      valid = false;
    }
    
    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
      valid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
      valid = false;
    }
    
    setErrors(newErrors);
    return valid;
  };
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    // Only update if there are changes
    if (formData.name !== user?.name || formData.email !== user?.email) {
      updateUser({
        name: formData.name,
        email: formData.email
      });
    } else {
      notify.info('No changes to update');
    }
  };
  
  if (isLoading) {
    return <div className="flex justify-center py-10">Loading account information...</div>;
  }
  
  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900">Account Settings</h2>
        <p className="mt-1 text-sm text-gray-500">Update your account information</p>
      </div>
      
      <div className="bg-white shadow-sm rounded-lg p-6">
        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            {/* Name field */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Name
              </label>
              <div className="mt-1">
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`shadow-sm block w-full sm:text-sm rounded-md p-2 border ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
                />
                {errors.name && (
                  <p className="mt-2 text-sm text-red-600">{errors.name}</p>
                )}
              </div>
            </div>
            
            {/* Email field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`shadow-sm block w-full sm:text-sm rounded-md p-2 border ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
                />
                {errors.email && (
                  <p className="mt-2 text-sm text-red-600">{errors.email}</p>
                )}
              </div>
            </div>
            
            {/* User Role - display only */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Account Type
              </label>
              <div className="mt-1">
                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                  {user?.role || 'CUSTOMER'}
                </span>
              </div>
            </div>
            
            {/* Member since - display only */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Member since
              </label>
              <div className="mt-1 text-sm text-gray-500">
                {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
              </div>
            </div>
            
            {/* Submit button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={isUpdating}
                className={`inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${isUpdating ? 'opacity-75 cursor-not-allowed' : ''}`}
              >
                {isUpdating ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </form>
      </div>
      
      {/* Security section */}
      <div className="mt-8 bg-white shadow-sm rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Security</h3>
        <div className="space-y-4">
          <p className="text-sm text-gray-500">
            For security reasons, password changes must be initiated via the reset password feature.
          </p>
          <button
            type="button"
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Reset Password
          </button>
        </div>
      </div>
    </div>
  );
};

export default AccountPage;
