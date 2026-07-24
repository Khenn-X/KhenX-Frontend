import { Routes, Route } from "react-router-dom";
import { Suspense, lazy } from "react";

import ProtectedRoute from "./ProtectedRoute";
import AgentRoute from "./AgentRoute";
import AdminRoute from "./AdminRoute";
import SuperadminRoute from "./SuperAdminRoute";

import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import DashboardLayout from "../components/layout/DashboardLayout";
import AdminLayout from "../components/layout/AdminLayout";
import LoadingSpinner from "../components/shared/LoadingSpinner";

// Public
const HomePage = lazy(() => import("../pages/public/HomePage"));
const AboutPage = lazy(() => import("../pages/public/AboutPage"));
const HowItWorksPage = lazy(() => import("../pages/public/HowItWorksPage"));
const ListingsPage = lazy(() => import("../pages/public/ListingsPage"));
const ListingDetailPage = lazy(
  () => import("../pages/public/ListingDetailPage"),
);
const NeighbourhoodPage = lazy(
  () => import("../pages/public/NeighbourhoodPage"),
);
const ContributePage = lazy(() => import("../pages/public/ContributeDataPage"));
const NotFoundPage = lazy(() => import("../pages/public/NotFoundPage"));

// Auth
const LoginPage = lazy(() => import("../pages/auth/LoginPage"));
const SignupPage = lazy(() => import("../pages/auth/SignupPage"));
const ForgotPasswordPage = lazy(
  () => import("../pages/auth/ForgotPasswordPage"),
);
const ResetPasswordPage = lazy(() => import("../pages/auth/ResetPasswordPage"));
const VerifyEmailPage = lazy(() => import("../pages/auth/VerifyEmailPage"));

// Seeker
const SeekerDashboardPage = lazy(
  () => import("../pages/seeker/SeekerDashboardPage"),
);
const SavedListingsPage = lazy(
  () => import("../pages/seeker/SavedListingsPage"),
);

// Agent
const AgentDashboardPage = lazy(
  () => import("../pages/agent/AgentDashboardPage"),
);
const AgentListingsPage = lazy(
  () => import("../pages/agent/AgentListingsPage"),
);
const CreateListingPage = lazy(
  () => import("../pages/agent/CreateListingPage"),
);
const EditListingPage = lazy(() => import("../pages/agent/EditListingPage"));
const AgentEnquiriesPage = lazy(
  () => import("../pages/agent/AgentEnquiriesPage"),
);
const KYCPage = lazy(() => import("../pages/agent/KYCPage"));
const AgentProfilePage = lazy(() => import("../pages/agent/AgentProfilePage"));

// Admin
const AdminDashboardPage = lazy(
  () => import("../pages/admin/AdminDashboardPage"),
);
const AdminListingsPage = lazy(
  () => import("../pages/admin/AdminListingsPage"),
);
const AdminKYCPage = lazy(() => import("../pages/admin/AdminKYCPage"));
const AdminFraudPage = lazy(() => import("../pages/admin/AdminFraudPage"));
const AdminAgentsPage = lazy(() => import("../pages/admin/AdminAgentsPage"));

// Superadmin
const SuperadminDashboardPage = lazy(
  () => import("../pages/superadmin/SuperadminDashboardPage"),
);
const SuperadminAdminRequestsPage = lazy(
  () => import("../pages/superadmin/SuperadminAdminRequestsPage"),
);

const PublicLayout = ({ children }: { children: React.ReactNode }) => (
  <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
    <Navbar />
    <main className="flex-1">{children}</main>
    <Footer />
  </div>
);

const AuthLayout = ({ children }: { children: React.ReactNode }) => (
  <div className="min-h-screen flex flex-col bg-[#0A1628]">
    <Navbar />
    <main className="flex-1 flex items-center">
      {children}
    </main>
  </div>
);

const AppRouter = () => {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
          <LoadingSpinner size="lg" />
        </div>
      }
    >
      <Routes>
        {/* ── PUBLIC ──────────────────────────────────────────────────── */}
        <Route
          path="/"
          element={
            <PublicLayout>
              <HomePage />
            </PublicLayout>
          }
        />
        <Route
          path="/about"
          element={
            <PublicLayout>
              <AboutPage />
            </PublicLayout>
          }
        />
        <Route
          path="/listings"
          element={
            <PublicLayout>
              <ListingsPage />
            </PublicLayout>
          }
        />
        <Route
          path="/listings/:id"
          element={
            <PublicLayout>
              <ListingDetailPage />
            </PublicLayout>
          }
        />
        <Route
          path="/neighbourhood"
          element={
            <PublicLayout>
              <NeighbourhoodPage />
            </PublicLayout>
          }
        />
        <Route
        path="/contribute"
        element={<PublicLayout> <NeighbourhoodPage />
        </PublicLayout>
        }
        
        <Route
          path="/how-it-works"
          element={
            <PublicLayout>
              <HowItWorksPage />
            </PublicLayout>
          }
        />

        {/* ── AUTH ────────────────────────────────────────────────────── */}
        <Route
          path="/login"
          element={
            <AuthLayout>
              <LoginPage />
            </AuthLayout>
          }
        />
        <Route
          path="/signup"
          element={
            <AuthLayout>
              <SignupPage />
            </AuthLayout>
          }
        />
        <Route
          path="/forgot-password"
          element={
            <AuthLayout>
              <ForgotPasswordPage />
            </AuthLayout>
          }
        />
        <Route
          path="/reset-password/:token"
          element={
            <AuthLayout>
              <ResetPasswordPage />
            </AuthLayout>
          }
        />
        <Route
          path="/verify-email"
          element={
            <AuthLayout>
              <VerifyEmailPage />
            </AuthLayout>
          }
        />

        {/* ── SEEKER ──────────────────────────────────────────────────── */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <PublicLayout>
                <SeekerDashboardPage />
              </PublicLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/saved"
          element={
            <ProtectedRoute>
              <PublicLayout>
                <SavedListingsPage />
              </PublicLayout>
            </ProtectedRoute>
          }
        />

        {/* ── AGENT ───────────────────────────────────────────────────── */}
        <Route
          path="/agent/dashboard"
          element={
            <AgentRoute>
              <DashboardLayout>
                <AgentDashboardPage />
              </DashboardLayout>
            </AgentRoute>
          }
        />
        <Route
          path="/agent/listings"
          element={
            <AgentRoute>
              <DashboardLayout>
                <AgentListingsPage />
              </DashboardLayout>
            </AgentRoute>
          }
        />
        <Route
          path="/agent/listings/new"
          element={
            <AgentRoute>
              <DashboardLayout>
                <CreateListingPage />
              </DashboardLayout>
            </AgentRoute>
          }
        />
        <Route
          path="/agent/listings/:id/edit"
          element={
            <AgentRoute>
              <DashboardLayout>
                <EditListingPage />
              </DashboardLayout>
            </AgentRoute>
          }
        />
        <Route
          path="/agent/enquiries"
          element={
            <AgentRoute>
              <DashboardLayout>
                <AgentEnquiriesPage />
              </DashboardLayout>
            </AgentRoute>
          }
        />
        <Route
          path="/agent/kyc"
          element={
            <AgentRoute>
              <DashboardLayout>
                <KYCPage />
              </DashboardLayout>
            </AgentRoute>
          }
        />
        <Route
          path="/agent/profile"
          element={
            <AgentRoute>
              <DashboardLayout>
                <AgentProfilePage />
              </DashboardLayout>
            </AgentRoute>
          }
        />

        {/* ── ADMIN (admin + superadmin can access) ───────────────────── */}
        <Route
          path="/admin/dashboard"
          element={
            <AdminRoute>
              <AdminLayout>
                <AdminDashboardPage />
              </AdminLayout>
            </AdminRoute>
          }
        />
        <Route
          path="/admin/listings"
          element={
            <AdminRoute>
              <AdminLayout>
                <AdminListingsPage />
              </AdminLayout>
            </AdminRoute>
          }
        />
        <Route
          path="/admin/kyc"
          element={
            <AdminRoute>
              <AdminLayout>
                <AdminKYCPage />
              </AdminLayout>
            </AdminRoute>
          }
        />
        <Route
          path="/admin/fraud"
          element={
            <AdminRoute>
              <AdminLayout>
                <AdminFraudPage />
              </AdminLayout>
            </AdminRoute>
          }
        />
        <Route
          path="/admin/agents"
          element={
            <AdminRoute>
              <AdminLayout>
                <AdminAgentsPage />
              </AdminLayout>
            </AdminRoute>
          }
        />

        {/* ── SUPERADMIN (superadmin only) ────────────────────────────── */}
        <Route
          path="/superadmin/dashboard"
          element={
            <SuperadminRoute>
              <AdminLayout>
                <SuperadminDashboardPage />
              </AdminLayout>
            </SuperadminRoute>
          }
        />
        <Route
          path="/superadmin/admin-requests"
          element={
            <SuperadminRoute>
              <AdminLayout>
                <SuperadminAdminRequestsPage />
              </AdminLayout>
            </SuperadminRoute>
          }
        />

        {/* ── 404 ─────────────────────────────────────────────────────── */}
        <Route
          path="*"
          element={
            <PublicLayout>
              <NotFoundPage />
            </PublicLayout>
          }
        />
      </Routes>
    </Suspense>
  );
};

export default AppRouter;
