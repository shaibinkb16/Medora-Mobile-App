import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Login from "./pages/Login";
import Register from "./pages/Register";
import PendingApproval from "./pages/PendingApproval";
import ProtectedRoute from "./components/ProtectedRoute";
import DashboardPage from "./pages/superadmin/DashboardPage";
import UsersPage from "./pages/superadmin/UsersPage";
import RecordsPage from "./pages/superadmin/RecordsPredictionsPage";
import NotificationsPage from "./pages/superadmin/NotificationsPage"; // ✅ New
import SidebarLayout from "./components/SidebarLayout";
import "./index.css";
import "antd/dist/reset.css"; // For Ant Design v5

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Admin-only route */}
        <Route
          path="/pending-approval"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <PendingApproval />
            </ProtectedRoute>
          }
        />

        {/* Superadmin layout with sidebar */}
        <Route
          path="/"
          element={
            <ProtectedRoute allowedRoles={["superadmin"]}>
              <SidebarLayout />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="users" element={<UsersPage />} />
          <Route path="records" element={<RecordsPage />} />
          <Route path="notifications" element={<NotificationsPage />} /> {/* ✅ NEW */}
        </Route>

        {/* Fallback route */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
