import React, { useState } from 'react';
import { useDashboard } from '../hooks/useDashboard';
import { notify } from '../../../lib/notify';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';

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
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };
  
  const validateForm = () => {
    let valid = true;
    const newErrors = { ...errors };
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
      valid = false;
    }
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
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    if (formData.name !== user?.name || formData.email !== user?.email) {
      updateUser({ name: formData.name, email: formData.email });
    } else {
      notify.info('No changes to update');
    }
  };
  
  if (isLoading) {
    return <div className="flex justify-center py-10 text-muted-foreground">Loading account information...</div>;
  }
  
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Account Settings</h2>
        <p className="text-muted-foreground">Update your account information</p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" name="name" type="text" autoComplete="name" value={formData.name} onChange={handleChange} className={errors.name ? 'border-destructive' : ''} />
              {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email address</Label>
              <Input id="email" name="email" type="email" autoComplete="email" value={formData.email} onChange={handleChange} className={errors.email ? 'border-destructive' : ''} />
              {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
            </div>
            <div className="space-y-2">
              <Label>Account Type</Label>
              <div><Badge variant="secondary">{user?.role || 'CUSTOMER'}</Badge></div>
            </div>
            <div className="space-y-2">
              <Label>Member since</Label>
              <div className="text-sm text-muted-foreground">{user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</div>
            </div>
            <Button type="submit" disabled={isUpdating}>{isUpdating ? 'Saving...' : 'Save Changes'}</Button>
          </form>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Security</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">For security reasons, password changes must be initiated via the reset password feature.</p>
          <Button variant="outline">Reset Password</Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default AccountPage;
