
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import AdminLayout from '@/components/Admin/AdminLayout';
import ProductManager from '@/components/Admin/ProductManager';
import ProductEasyManager from '@/components/Admin/ProductEasyManager';
import ProductImageManager from '@/pages/Admin/ProductImageManager';
import ProductDesktopManager from '@/pages/Admin/ProductDesktopManager';
import StorageManager from '@/components/Admin/StorageManager';
import { SpecificationDiagnosticPanel } from '@/components/Admin/SpecificationDiagnosticPanel';

const AdminDashboard = () => {
  return (
    <Routes>
      <Route path="/*" element={<AdminLayout />}>
        <Route index element={<ProductManager />} />
        <Route path="products" element={<ProductManager />} />
        <Route path="easy-manager" element={<ProductEasyManager />} />
        <Route path="images" element={<ProductImageManager />} />
        <Route path="storage" element={<StorageManager />} />
        <Route path="desktop-products" element={<ProductDesktopManager />} />
        <Route path="spec-diagnostic" element={<SpecificationDiagnosticPanel />} />
      </Route>
    </Routes>
  );
};

export default AdminDashboard;
