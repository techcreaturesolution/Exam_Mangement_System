import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
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
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="students" element={<UserManager />} />
            <Route path="categories" element={<Categories />} />
            <Route path="subjects" element={<Subjects />} />
            <Route path="levels" element={<Levels />} />
            <Route path="questions" element={<Questions />} />
            <Route path="exams" element={<Exams />} />
            <Route path="reports" element={<Reports />} />
            <Route path="violations" element={<Violations />} />
            <Route path="payment-plans" element={<PaymentPlans />} />
            <Route path="payment-history" element={<PaymentHistory />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Routes>
      </Router>
      <ToastContainer position="top-right" autoClose={3000} />
    </AuthProvider>
  );
}

export default App;
