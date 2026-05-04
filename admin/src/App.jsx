import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Categories from './pages/Categories';
import Subjects from './pages/Subjects';
import Levels from './pages/Levels';
import Questions from './pages/Questions';
import Exams from './pages/Exams';
import PaymentPlans from './pages/PaymentPlans';
import PaymentHistory from './pages/PaymentHistory';
import UserManager from './pages/UserManager';
import Reports from './pages/Reports';
import Violations from './pages/Violations';
import Settings from './pages/Settings';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsConditions from './pages/TermsConditions';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms-conditions" element={<TermsConditions />} />
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="/admin/students" element={<UserManager />} />
            <Route path="/admin/categories" element={<Categories />} />
            <Route path="/admin/subjects" element={<Subjects />} />
            <Route path="/admin/levels" element={<Levels />} />
            <Route path="/admin/questions" element={<Questions />} />
            <Route path="/admin/exams" element={<Exams />} />
            <Route path="/admin/reports" element={<Reports />} />
            <Route path="/admin/violations" element={<Violations />} />
            <Route path="/admin/payment-plans" element={<PaymentPlans />} />
            <Route path="/admin/payment-history" element={<PaymentHistory />} />
            <Route path="/admin/settings" element={<Settings />} />
          </Route>
        </Routes>
      </Router>
      <ToastContainer position="top-right" autoClose={3000} />
    </AuthProvider>
  );
}

export default App;
