import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/logo.jpg';
import {
  FiHome, FiGrid, FiBook, FiLayers, FiHelpCircle,
  FiFileText, FiLogOut, FiMenu, FiX, FiCreditCard, FiDollarSign,
  FiUsers, FiBarChart2, FiShield, FiSettings,
} from 'react-icons/fi';
import { useState } from 'react';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/admin');
  };

  const menuItems = [
    { path: '/admin', icon: <FiHome />, label: 'Dashboard' },
    { path: '/admin/students', icon: <FiUsers />, label: 'Students' },
    { path: '/admin/categories', icon: <FiGrid />, label: 'Categories' },
    { path: '/admin/subjects', icon: <FiBook />, label: 'Subjects' },
    { path: '/admin/levels', icon: <FiLayers />, label: 'Levels' },
    { path: '/admin/questions', icon: <FiHelpCircle />, label: 'Questions' },
    { path: '/admin/exams', icon: <FiFileText />, label: 'Exams' },
    { path: '/admin/reports', icon: <FiBarChart2 />, label: 'Reports' },
    { path: '/admin/violations', icon: <FiShield />, label: 'Violations' },
    { path: '/admin/payment-plans', icon: <FiCreditCard />, label: 'Plans' },
    { path: '/admin/payment-history', icon: <FiDollarSign />, label: 'Payments' },
    { path: '/admin/settings', icon: <FiSettings />, label: 'Settings' },
  ];

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        <div className="sidebar-brand">
          <img src={logo} alt="Logo" className="sidebar-logo" />
          {!collapsed && <h2 className="brand-text">TestBharti</h2>}
        </div>
        <button className="toggle-btn" onClick={() => setCollapsed(!collapsed)}>
          {collapsed ? <FiMenu /> : <FiX />}
        </button>
      </div>

      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            end={item.path === '/admin'}
          >
            <span className="nav-icon">{item.icon}</span>
            {!collapsed && <span className="nav-label">{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        {!collapsed && (
          <div className="user-info">
            <p className="user-name">{user?.name}</p>
            <p className="user-role">Admin</p>
          </div>
        )}
        <button className="logout-btn" onClick={handleLogout}>
          <FiLogOut />
          {!collapsed && <span className="nav-label">Logout</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
