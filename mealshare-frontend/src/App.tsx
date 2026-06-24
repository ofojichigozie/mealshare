import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { useAuth } from './hooks';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { Layout } from './components/layout/Layout';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { MealPlanner } from './pages/MealPlanner';
import { ShoppingList } from './pages/ShoppingList';
import { CostSplitting } from './pages/CostSplitting';
import { Household } from './pages/Household';
import { Profile } from './pages/Profile';

function App() {
  // Auth initialization is handled within useAuth hook
  useAuth();

  return (
    <>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/meal-planner" element={<MealPlanner />} />
              <Route path="/shopping-list" element={<ShoppingList />} />
              <Route path="/costs" element={<CostSplitting />} />
              <Route path="/household" element={<Household />} />
              <Route path="/profile" element={<Profile />} />
            </Route>
          </Route>

          {/* Redirect root to dashboard */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          {/* 404 - Redirect to dashboard */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>

      {/* Sonner Toast Notifications */}
      <Toaster position="top-right" richColors closeButton />
    </>
  );
}

export default App;
