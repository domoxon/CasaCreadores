import { Navigate, Route, Routes } from "react-router-dom";
import { Footer } from "./components/Footer";
import { Navbar } from "./components/Navbar";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { ScrollToHash } from "./components/ScrollToHash";
import { Account } from "./pages/Account";
import { Activate } from "./pages/Activate";
import { AdminCreatorProfile } from "./pages/AdminCreatorProfile";
import { AdminPanel } from "./pages/AdminPanel";
import { Apply } from "./pages/Apply";
import { CampaignEditor } from "./pages/CampaignEditor";
import { BrandDashboard } from "./pages/BrandDashboard";
import { CampaignCreate } from "./pages/CampaignCreate";
import { CampaignDetail } from "./pages/CampaignDetail";
import { Contact } from "./pages/Contact";
import { Creators } from "./pages/Creators";
import { CreatorDashboard } from "./pages/CreatorDashboard";
import { Diagnostics } from "./pages/Diagnostics";
import { Landing } from "./pages/Landing";
import { Login } from "./pages/Login";
import { NotFound } from "./pages/NotFound";
import { ReviewApplication } from "./pages/ReviewApplication";
import { VerifyEmail } from "./pages/VerifyEmail";

export default function App() {
  return (
    <div className="flex min-h-screen flex-col">
      <ScrollToHash />
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/aplicar" element={<Apply />} />
          <Route path="/registro" element={<Navigate to="/aplicar" replace />} />
          <Route
            path="/revisar/:token"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <ReviewApplication />
              </ProtectedRoute>
            }
          />
          <Route
            path="/cuenta"
            element={
              <ProtectedRoute>
                <Account />
              </ProtectedRoute>
            }
          />
          <Route path="/activar/:token" element={<Activate />} />
          <Route path="/contacto" element={<Contact />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/diagnostico" element={<Diagnostics />} />

          <Route
            path="/marca"
            element={
              <ProtectedRoute allowedRoles={["MARCA"]}>
                <BrandDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/marca/campanas/nueva"
            element={
              <ProtectedRoute allowedRoles={["MARCA"]}>
                <CampaignCreate />
              </ProtectedRoute>
            }
          />
          <Route
            path="/marca/creadores"
            element={
              <ProtectedRoute allowedRoles={["MARCA"]}>
                <Creators />
              </ProtectedRoute>
            }
          />
          <Route
            path="/campanas/:id"
            element={
              <ProtectedRoute>
                <CampaignDetail />
              </ProtectedRoute>
            }
          />

          <Route
            path="/creador"
            element={
              <ProtectedRoute allowedRoles={["CREADOR"]}>
                <CreatorDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <AdminPanel />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/creadores/:id"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <AdminCreatorProfile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/campanas/nueva"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <CampaignEditor />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/campanas/:id"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <CampaignEditor />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
