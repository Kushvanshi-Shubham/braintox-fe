import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from 'react-hot-toast';
import { Login } from "./pages/Auth/Login";
import { SignUp } from "./pages/Auth/SignUp";
import { ForgotPassword } from "./pages/Auth/ForgotPassword";
import { ResetPassword } from "./pages/Auth/ResetPassword";
import { VerifyEmail } from "./pages/Auth/VerifyEmail";
import { LandingPage } from "./pages/Landingpage";
import { ProtectedRoute } from "./context/ProtectedRoute";
import { useTheme } from "./hooks/useThemes";
import Dashboard from "./pages/dashboard";
import SocialFeed from "./pages/SocialFeed";
import Explore from "./pages/Explore";
import Collections from "./pages/Collections";
import CollectionDetail from "./pages/CollectionDetail";
import { MainLayout } from "./Layouts/MainLayout";
import Profile from "./pages/Auth/Profile";
import UserProfile from "./pages/Auth/UserProfile";
import Discover from "./pages/Discover";
import { ActivityFeed } from "./pages/Activity";
import KnowledgeGraph from "./pages/KnowledgeGraph";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { BackendStatusNotification } from "./components/BackendStatusNotification";
import ImportBookmarks from "./pages/ImportBookmarks";
import Analytics from "./pages/Analytics";
import PublicProfile from "./pages/PublicProfile";
import ApiKeys from "./pages/Settings/ApiKeys";
import ExportData from "./pages/ExportData";
import PublicCollection from "./pages/PublicCollection";
import Admin from "./pages/Admin";
import Pricing from "./pages/Pricing";



function App() {
  useTheme();

  return (
    <ErrorBoundary>
      <BrowserRouter>
        <BackendStatusNotification />
        <Toaster position="top-center" reverseOrder={false} />
        <Routes>
       
        <Route path="/" element={<LandingPage />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/@:username" element={<PublicProfile />} />
        <Route path="/collection/:id/public" element={<PublicCollection />} />
        <Route path="/pricing" element={<Pricing />} />

        {/* Protected routes with MainLayout (includes Navbar with Add Content button) */}
        <Route
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/feed" element={<SocialFeed />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/collections" element={<Collections />} />
          <Route path="/collections/:id" element={<CollectionDetail />} />
          <Route path="/discover" element={<Discover />} />
          <Route path="/activity" element={<ActivityFeed />} />
          <Route path="/graph" element={<KnowledgeGraph />} />
          <Route path="/import" element={<ImportBookmarks />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/settings/api-keys" element={<ApiKeys />} />
          <Route path="/export" element={<ExportData />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/user/:userId" element={<UserProfile />} />
          <Route path="/admin" element={<Admin />} />
        </Route>
      </Routes>
    </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
