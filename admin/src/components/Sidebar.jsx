import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  FiHome, FiGrid, FiBook, FiLayers, FiHelpCircle,
  FiFileText, FiLogOut, FiMenu, FiX,
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

  const menuItems = [
    { path: '/', icon: <FiHome />, label: 'Dashboard' },
    { path: '/categories', icon: <FiGrid />, label: 'Categories' },
    { path: '/subjects', icon: <FiBook />, label: 'Subjects' },
    { path: '/levels', icon: <FiLayers />, label: 'Levels' },
    { path: '/questions', icon: <FiHelpCircle />, label: 'Questions' },
    { path: '/exams', icon: <FiFileText />, label: 'Exams' },
  ];

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        {!collapsed && <h2>Exam Admin</h2>}
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
            <p className="user-role">Master Admin</p>
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
