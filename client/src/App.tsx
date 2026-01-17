import { Routes, Route } from "react-router-dom";
import { LoginForm } from "./components/auth/LoginForm";
import { RegisterForm } from "./components/auth/RegisterForm";
import { ProtectedRoute } from "./components/common/ProtectedRoute";
import { AdminDashboard } from "./components/AdminDashboard";
import { ManagerDashboard } from "./components/ManagerDashboard";
import { UserDashboard } from "./components/UserDashboard";
import { UserRole } from "./enums/UserRole";

function App() {
  return (
    <Routes>
      {/* Javne rute */}
      <Route path="/login" element={<LoginForm />} />
      <Route path="/register" element={<RegisterForm />} />

      {/* Admin ruta - samo za ADMIN */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      {/* Manager ruta - samo za MANAGER */}
      <Route
        path="/manager"
        element={
          <ProtectedRoute allowedRoles={[UserRole.MANAGER]}>
            <ManagerDashboard />
          </ProtectedRoute>
        }
      />

      {/* Home ruta - svi prijavljeni korisnici */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <UserDashboard />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;