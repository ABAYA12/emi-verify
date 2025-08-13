import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  FaHome, 
  FaFileAlt, 
  FaClipboardCheck, 
  FaChartBar, 
  FaPlus,
  FaBuilding 
} from 'react-icons/fa';
import './Navbar.css';

const Navbar = () => {
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/" className="nav-brand">
          <FaBuilding className="brand-icon" />
          <span className="brand-text">
            <strong>EMI Verify</strong>
            <small>InsightGrid Analytics</small>
          </span>
        </Link>

        <div className="nav-menu">
          <Link 
            to="/dashboard" 
            className={`nav-link ${isActive('/dashboard') || isActive('/') ? 'active' : ''}`}
          >
            <FaHome className="nav-icon" />
            Dashboard
          </Link>

          <div className="nav-dropdown">
            <button className={`nav-link dropdown-toggle ${isActive('/insurance-cases') ? 'active' : ''}`}>
              <FaFileAlt className="nav-icon" />
              Insurance Cases
            </button>
            <div className="nav-dropdown-menu">
              <Link to="/insurance-cases" className="nav-dropdown-item">
                View All Cases
              </Link>
              <Link to="/insurance-cases/add" className="nav-dropdown-item">
                <FaPlus className="nav-icon" />
                Add New Case
              </Link>
            </div>
          </div>

          <div className="nav-dropdown">
            <button className={`nav-link dropdown-toggle ${isActive('/document-verifications') ? 'active' : ''}`}>
              <FaClipboardCheck className="nav-icon" />
              Document Verification
            </button>
            <div className="nav-dropdown-menu">
              <Link to="/document-verifications" className="nav-dropdown-item">
                View All Verifications
              </Link>
              <Link to="/document-verifications/add" className="nav-dropdown-item">
                <FaPlus className="nav-icon" />
                Add New Verification
              </Link>
            </div>
          </div>

          <Link 
            to="/analytics" 
            className={`nav-link ${isActive('/analytics') ? 'active' : ''}`}
          >
            <FaChartBar className="nav-icon" />
            Analytics
          </Link>
        </div>

        <div className="nav-status">
          <div className="status-indicator online"></div>
          <span className="status-text">Online</span>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
