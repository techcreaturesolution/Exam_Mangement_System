import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  FiHome, FiGrid, FiBook, FiLayers, FiHelpCircle,
  FiFileText, FiLogOut, FiMenu, FiX, FiCreditCard, FiDollarSign,
  FiUsers, FiBarChart2, FiBriefcase, FiShield,
} from 'react-icons/fi';
import { useState } from 'react';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isMasterAdmin = user?.role === 'master_admin';

  // Master Admin sees company management + all other items
  // Company Admin sees only their company's data
  const masterAdminItems = [
    { path: '/', icon: <FiHome />, label: 'Dashboard' },
    { path: '/companies', icon: <FiBriefcase />, label: 'Companies' },
    { path: '/categories', icon: <FiGrid />, label: 'Categories' },
    { path: '/subjects', icon: <FiBook />, label: 'Subjects' },
    { path: '/levels', icon: <FiLayers />, label: 'Levels' },
    { path: '/questions', icon: <FiHelpCircle />, label: 'Questions' },
    { path: '/exams', icon: <FiFileText />, label: 'Exams' },
    { path: '/payment-plans', icon: <FiCreditCard />, label: 'Payment Plans' },
    { path: '/payment-history', icon: <FiDollarSign />, label: 'Payments' },
    { path: '/users', icon: <FiUsers />, label: 'Users' },
    { path: '/violations', icon: <FiShield />, label: 'Violations' },
    { path: '/reports', icon: <FiBarChart2 />, label: 'Reports' },
  ];

  const companyAdminItems = [
    { path: '/', icon: <FiHome />, label: 'Dashboard' },
    { path: '/categories', icon: <FiGrid />, label: 'Categories' },
    { path: '/subjects', icon: <FiBook />, label: 'Subjects' },
    { path: '/levels', icon: <FiLayers />, label: 'Levels' },
    { path: '/questions', icon: <FiHelpCircle />, label: 'Questions' },
    { path: '/exams', icon: <FiFileText />, label: 'Exams' },
    { path: '/payment-plans', icon: <FiCreditCard />, label: 'Payment Plans' },
    { path: '/payment-history', icon: <FiDollarSign />, label: 'Payments' },
    { path: '/users', icon: <FiUsers />, label: 'Users' },
    { path: '/violations', icon: <FiShield />, label: 'Violations' },
    { path: '/reports', icon: <FiBarChart2 />, label: 'Reports' },
  ];

  const menuItems = isMasterAdmin ? masterAdminItems : companyAdminItems;

  const getRoleLabel = () => {
    if (isMasterAdmin) return 'Master Admin';
    return user?.company?.name || 'Company Admin';
  };

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        {!collapsed && <h2>{isMasterAdmin ? 'Master Admin' : 'Exam Admin'}</h2>}
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
            end={item.path === '/'}
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
            <p className="user-role">{getRoleLabel()}</p>
          </div>
        )}
        <button className="logout-btn" onClick={handleLogout}>
          <FiLogOut />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
