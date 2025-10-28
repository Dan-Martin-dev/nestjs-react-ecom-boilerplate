import React from 'react';
import { useNavigate, Route, Routes } from 'react-router-dom';
import { useCurrentUser } from '../../../hooks/useAuth';

interface AdminMenuItem {
  id: string;
  label: string;
  path: string;
  icon?: React.ReactNode;
}

const ADMIN_MENU: AdminMenuItem[] = [
  { id: 'dashboard', label: 'Dashboard', path: '/admin' },
  { id: 'audit', label: 'Audit Logs', path: '/admin/audit' },
  { id: 'users', label: 'Users', path: '/admin/users' },
  { id: 'products', label: 'Products', path: '/admin/products' },
  { id: 'orders', label: 'Orders', path: '/admin/orders' },
  { id: 'categories', label: 'Categories', path: '/admin/categories' },
];

const AdminLayout: React.FC = () => {
  const user = useCurrentUser();
  const navigate = useNavigate();

  // Redirect if not admin
  React.useEffect(() => {
    if (user && user.role !== 'ADMIN') {
      navigate('/');
    }
  }, [user, navigate]);

  if (!user || user.role !== 'ADMIN') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <span className="text-xl font-bold">Admin Dashboard</span>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                {ADMIN_MENU.map((item) => (
                  <a
                    key={item.id}
                    href={item.path}
                    className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                  >
                    {item.label}
                  </a>
                ))}
              </div>
            </div>
            <div className="flex items-center">
              <span className="text-sm text-gray-500">
                {user.email} (Admin)
              </span>
            </div>
          </div>
        </div>
      </nav>

      <main className="py-10">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <Routes>
            <Route path="/" element={<AdminDashboard />} />
            <Route path="/audit" element={<AuditLogs />} />
            <Route path="/users" element={<UsersManagement />} />
            <Route path="/products" element={<ProductsManagement />} />
            <Route path="/orders" element={<OrdersManagement />} />
            <Route path="/categories" element={<CategoriesManagement />} />
          </Routes>
        </div>
      </main>
    </div>
  );
};

// Placeholder components - these will be implemented in separate files
const AdminDashboard = () => (
  <div>
    <h1 className="text-2xl font-semibold mb-6">Dashboard Overview</h1>
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {/* Stats cards will go here */}
    </div>
  </div>
);

import AuditLogs from './AuditLogs';

const UsersManagement = () => (
  <div>
    <h1 className="text-2xl font-semibold mb-6">Users Management</h1>
    {/* Users table will go here */}
  </div>
);

const ProductsManagement = () => (
  <div>
    <h1 className="text-2xl font-semibold mb-6">Products Management</h1>
    {/* Products table will go here */}
  </div>
);

const OrdersManagement = () => (
  <div>
    <h1 className="text-2xl font-semibold mb-6">Orders Management</h1>
    {/* Orders table will go here */}
  </div>
);

const CategoriesManagement = () => (
  <div>
    <h1 className="text-2xl font-semibold mb-6">Categories Management</h1>
    {/* Categories table will go here */}
  </div>
);

export default AdminLayout;
