import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from '../components/ProtectedRoute';

// Layouts imports
import DashboardLayout from '../layouts/DashboardLayout';
import AdminLayout from '../layouts/AdminLayout'; // <-- 1. Əlavə edildi

// Main pages imports
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import DashboardPage from '../pages/DashboardPage';
import AccountsPage from '../pages/AccountsPage';
import AccountDetailsPage from '../pages/AccountDetailsPage';
import CreateAccountPage from '../pages/CreateAccountPage';
import CardsPage from '../pages/CardsPage';
import CreateCardPage from '../pages/CreateCardPage';
import TransferPage from '../pages/TransferPage';
import TransactionsPage from '../pages/TransactionsPage';
import ProfilePage from '../pages/ProfilePage';
import NotFoundPage from '../pages/NotFoundPage';
import CardDetailPage from '../pages/CardDetailPage';
import PaymentsPage from '../pages/PaymentsPage';
import OwnTransferPage from '../pages/OwnTransferPage';
import UtilityPaymentPage from '../pages/UtilityPaymentPage';
import MobilePaymentsPage from '../pages/MobilePaymentsPage';
import InternetPaymentsPage from '../pages/InternetPaymentsPage';
import GovPaymentsPage from '../pages/GovPaymentsPage';
import CreditPaymentsPage from '../pages/CreditPaymentsPage';
import GamesPaymentsPage from '../pages/GamesPaymentsPage';
import TvPaymentsPage from '../pages/TvPaymentsPage';
import BranchesPage from '../pages/BranchesPage';
import PartnersPage from '../pages/PartnersPage';
import ContactPage from '../pages/ContactPage';
import CampaignsPage from '../pages/CampaignsPage';
import NotificationsPage from '../pages/NotificationsPage';

import AdminDashboard from '../pages/admin/Dashboard';
import Users from '../pages/admin/Users';
import CardsManagement from '../pages/admin/CardsManagement';
import AdminTransactions from '../pages/admin/Transactions';
import AdminNotificationsPage from '../pages/admin/AdminNotificationsPage';
import ProductsPage from '../pages/ProductsPage';
import Credit from '../pages/Credit';
import MyCredits from '../pages/MyCredits';
import AdminCredit from '../pages/admin/AdminCredit';

export const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="accounts" element={<AccountsPage />} />
        <Route path="accounts/:id" element={<AccountDetailsPage />} />
        <Route path="accounts/create" element={<CreateAccountPage />} />
        <Route path="cards" element={<CardsPage />} />
        <Route path="cards/:id" element={<CardDetailPage />} />
        <Route path="cards/create" element={<CreateCardPage />} />
        <Route path="transfer" element={<TransferPage />} />
        <Route path="transfer-own" element={<OwnTransferPage />} />
        <Route path="transactions" element={<TransactionsPage />} />
        <Route path="payments" element={<PaymentsPage />} />
        <Route path ="products" element={<ProductsPage />} />
        <Route path="credit" element={<Credit />} />
        <Route path ="my-credit" element={<MyCredits />} />
        
        <Route path="payments/utility" element={<UtilityPaymentPage />} />
        <Route path="payments/mobile" element={<MobilePaymentsPage />} />
        <Route path="payments/internet" element={<InternetPaymentsPage />} />
        <Route path="payments/gov" element={<GovPaymentsPage />} />
        <Route path="payments/credit" element={<CreditPaymentsPage />} />
        <Route path="payments/games" element={<GamesPaymentsPage />} />
        <Route path="payments/tv" element={<TvPaymentsPage />} />
        
        <Route path="branches" element={<BranchesPage />} />
        <Route path="partners" element={<PartnersPage />} />
        <Route path="contact" element={<ContactPage />} />
        <Route path="campaigns" element={<CampaignsPage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="notifications" element={<NotificationsPage />} />

        <Route path="*" element={<NotFoundPage />} />
      </Route>

      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="users" element={<Users />} />
        <Route path="cards" element={<CardsManagement />} />
        <Route path="transactions" element={<AdminTransactions />} />
        <Route path="notifications" element={<AdminNotificationsPage />} />
        <Route path="credit" element={<AdminCredit />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;