import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Layout } from './components/Layout';

// ... existing imports ...
import { Login } from './pages/Auth/Login';
import { Register } from './pages/Auth/Register';
import { ForgotPassword } from './pages/Auth/ForgotPassword';
import { LandingPage } from './pages/LandingPage';
import { Marketplace } from './pages/Marketplace';
import { AboutUs } from './pages/Legal/AboutUs';
import { PrivacyPolicy } from './pages/Legal/PrivacyPolicy';
import { TermsAndConditions } from './pages/Legal/Terms';
import { UserAgreement } from './pages/Legal/Agreement';
import { UserDashboard } from './pages/Dashboard/UserDashboard';
import { Tasks } from './pages/Dashboard/Tasks';
import { Wallet } from './pages/Dashboard/Wallet';
import { Activation } from './pages/Dashboard/Activation';
import { Referrals } from './pages/Dashboard/Referrals';
import { OfficialWorker } from './pages/Dashboard/OfficialWorker';
import { CpaOffers } from './pages/Dashboard/CpaOffers';
import { FreeResources } from './pages/Dashboard/FreeResources';
import { Feed } from './pages/Dashboard/Feed';
import { CreatePost } from './pages/Dashboard/CreatePost';
import { PostView } from './pages/Dashboard/PostView';
import { MyGigs } from './pages/Dashboard/MyGigs';
import { CreateGig } from './pages/Dashboard/CreateGig';
import { AdvertiserDashboard } from './pages/Dashboard/Advertiser/AdvertiserDashboard';
import { CreateJob } from './pages/Dashboard/Advertiser/CreateJob';
import { MyAds } from './pages/Dashboard/Advertiser/MyAds';
import { AdvertiserDeposit } from './pages/Dashboard/Advertiser/AdvertiserDeposit';
import { CreateCpa } from './pages/Dashboard/Advertiser/CreateCpa';
import { AdminDashboard } from './pages/Admin/AdminDashboard';
import { ManageDeposits } from './pages/Admin/ManageDeposits';
import { ManageTasks } from './pages/Admin/ManageTasks';
import { TaskApprovals } from './pages/Admin/TaskApprovals';
import { ManageUsers } from './pages/Admin/ManageUsers';
import { ManageWithdrawals } from './pages/Admin/ManageWithdrawals';
import { OfficialWorkerRequests } from './pages/Admin/OfficialWorkerRequests';
import { OfficialWorkerJobs } from './pages/Admin/OfficialWorkerJobs';
import { AdminSettings } from './pages/Admin/AdminSettings';
import { ManageGigs } from './pages/Admin/ManageGigs';
import { ManageCategories } from './pages/Admin/ManageCategories'; 
import { ManageCpa } from './pages/Admin/ManageCpa';
import { ManageContent } from './pages/Admin/ManageContent';
import { SecretCodeGenerator } from './pages/Admin/SecretCodeGenerator';
import { ManageHighPayingJobs } from './pages/Admin/ManageHighPayingJobs';
import { TestExternalSite } from './pages/TestExternalSite';

// NEW IMPORTS
import { UserNotifications } from './pages/Dashboard/UserNotifications';
import { UserSupport } from './pages/Dashboard/UserSupport';
import { AdminBroadcast } from './pages/Admin/AdminBroadcast';
import { AdminInbox } from './pages/Admin/AdminInbox';
import { Giveaway } from './pages/Dashboard/Giveaway';
import { ManageGiveaway } from './pages/Admin/ManageGiveaway';


const ProtectedRoute: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return <div className="p-10 text-center">Loading...</div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <Layout>{children}</Layout>;
};

const AdminRoute: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const { user, isLoading } = useAuth();
  if (isLoading) return <div>...</div>;
  if (user?.role !== 'ADMIN') return <Navigate to="/dashboard" replace />;
  return <Layout>{children}</Layout>;
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <HashRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/marketplace" element={<Marketplace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/signup" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/external-test-site" element={<TestExternalSite />} />
          <Route path="/about-us" element={<AboutUs />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<TermsAndConditions />} />
          <Route path="/agreement" element={<UserAgreement />} />
          
          <Route path="/dashboard" element={<ProtectedRoute><UserDashboard /></ProtectedRoute>} />
          <Route path="/tasks" element={<ProtectedRoute><Tasks /></ProtectedRoute>} />
          <Route path="/cpa-offers" element={<ProtectedRoute><CpaOffers /></ProtectedRoute>} />
          <Route path="/wallet" element={<ProtectedRoute><Wallet /></ProtectedRoute>} />
          <Route path="/activation" element={<ProtectedRoute><Activation /></ProtectedRoute>} />
          <Route path="/referrals" element={<ProtectedRoute><Referrals /></ProtectedRoute>} />
          <Route path="/official-job" element={<ProtectedRoute><OfficialWorker /></ProtectedRoute>} />
          <Route path="/free-resources" element={<ProtectedRoute><FreeResources /></ProtectedRoute>} />
          
          {/* GIVEAWAY ROUTE */}
          <Route path="/giveaway" element={<ProtectedRoute><Giveaway /></ProtectedRoute>} />
          
          {/* NEW ROUTES */}
          <Route path="/notifications" element={<ProtectedRoute><UserNotifications /></ProtectedRoute>} />
          <Route path="/messages" element={<ProtectedRoute><UserSupport /></ProtectedRoute>} />
          <Route path="/support" element={<ProtectedRoute><UserSupport /></ProtectedRoute>} />
          
          <Route path="/feed" element={<ProtectedRoute><Feed /></ProtectedRoute>} />
          <Route path="/create-post" element={<ProtectedRoute><CreatePost /></ProtectedRoute>} />
          <Route path="/post/:id" element={<ProtectedRoute><PostView /></ProtectedRoute>} />
          <Route path="/my-gigs" element={<ProtectedRoute><MyGigs /></ProtectedRoute>} />
          <Route path="/my-gigs/create" element={<ProtectedRoute><CreateGig /></ProtectedRoute>} />
          <Route path="/my-gigs/edit/:id" element={<ProtectedRoute><CreateGig /></ProtectedRoute>} />

          <Route path="/advertiser" element={<ProtectedRoute><AdvertiserDashboard /></ProtectedRoute>} />
          <Route path="/advertiser/create-job" element={<ProtectedRoute><CreateJob /></ProtectedRoute>} />
          <Route path="/advertiser/create-cpa" element={<ProtectedRoute><CreateCpa /></ProtectedRoute>} />
          <Route path="/advertiser/my-ads" element={<ProtectedRoute><MyAds /></ProtectedRoute>} />
          <Route path="/advertiser/deposit" element={<ProtectedRoute><AdvertiserDeposit /></ProtectedRoute>} />
          
          <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
          <Route path="/admin/deposits" element={<AdminRoute><ManageDeposits /></AdminRoute>} />
          <Route path="/admin/users" element={<AdminRoute><ManageUsers /></AdminRoute>} />
          <Route path="/admin/tasks" element={<AdminRoute><ManageTasks /></AdminRoute>} />
          <Route path="/admin/manage-cpa" element={<AdminRoute><ManageCpa /></AdminRoute>} />
          <Route path="/admin/manage-content" element={<AdminRoute><ManageContent /></AdminRoute>} />
          <Route path="/admin/approvals" element={<AdminRoute><TaskApprovals /></AdminRoute>} />
          <Route path="/admin/withdrawals" element={<AdminRoute><ManageWithdrawals /></AdminRoute>} />
          <Route path="/admin/official-requests" element={<AdminRoute><OfficialWorkerRequests /></AdminRoute>} />
          <Route path="/admin/official-jobs" element={<AdminRoute><OfficialWorkerJobs /></AdminRoute>} />
          <Route path="/admin/hp-jobs" element={<AdminRoute><ManageHighPayingJobs /></AdminRoute>} />
          <Route path="/admin/secret-codes" element={<AdminRoute><SecretCodeGenerator /></AdminRoute>} />
          <Route path="/admin/settings" element={<AdminRoute><AdminSettings /></AdminRoute>} />
          <Route path="/admin/gigs" element={<AdminRoute><ManageGigs /></AdminRoute>} />
          <Route path="/admin/categories" element={<AdminRoute><ManageCategories /></AdminRoute>} />
          
          {/* GIVEAWAY ADMIN ROUTE */}
          <Route path="/admin/giveaway" element={<AdminRoute><ManageGiveaway /></AdminRoute>} />

          {/* NEW ADMIN ROUTES */}
          <Route path="/admin/broadcast" element={<AdminRoute><AdminBroadcast /></AdminRoute>} />
          <Route path="/admin/inbox" element={<AdminRoute><AdminInbox /></AdminRoute>} />
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </HashRouter>
    </AuthProvider>
  );
};

export default App;
