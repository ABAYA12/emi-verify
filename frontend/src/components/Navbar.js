import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  FaHome, 
  FaFileAlt, 
  FaClipboardCheck, 
  FaChartBar, 
  FaPlus,
  FaBuilding,
  FaBars,
  FaTimes
} from 'react-icons/fa';
import './Navbar.css';

const Navbar = () => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/" className="nav-brand" onClick={closeMobileMenu}>
          <FaBuilding className="brand-icon" />
          <span className="brand-text">
            <strong>EMI Verify</strong>
            <small>InsightGrid Analytics</small>
          </span>
        </Link>

        <button 
          className="mobile-menu-toggle"
          onClick={toggleMobileMenu}
          aria-label="Toggle navigation menu"
        >
          {isMobileMenuOpen ? <FaTimes /> : <FaBars />}
        </button>

        <div className={`nav-menu ${isMobileMenuOpen ? 'nav-menu-open' : ''}`}>
          <Link 
            to="/dashboard" 
            className={`nav-link ${isActive('/dashboard') || isActive('/') ? 'active' : ''}`}
            onClick={closeMobileMenu}
          >
            <FaHome className="nav-icon" />
            <span className="nav-text">Dashboard</span>
          </Link>

          <div className="nav-dropdown">
            <Link 
              to="/insurance-cases" 
              className={`nav-link ${isActive('/insurance-cases') ? 'active' : ''}`}
              onClick={closeMobileMenu}
            >
              <FaFileAlt className="nav-icon" />
              <span className="nav-text">Insurance Cases</span>
            </Link>
            <div className="nav-dropdown-menu">
              <Link to="/insurance-cases" className="nav-dropdown-item" onClick={closeMobileMenu}>
                <FaFileAlt className="nav-icon" />
                View All Cases
              </Link>
              <Link to="/insurance-cases/add" className="nav-dropdown-item" onClick={closeMobileMenu}>
                <FaPlus className="nav-icon" />
                Add New Case
              </Link>
            </div>
          </div>

          <div className="nav-dropdown">
            <Link 
              to="/document-verifications" 
              className={`nav-link ${isActive('/document-verifications') ? 'active' : ''}`}
              onClick={closeMobileMenu}
            >
              <FaClipboardCheck className="nav-icon" />
              <span className="nav-text">Document Verification</span>
            </Link>
            <div className="nav-dropdown-menu">
              <Link to="/document-verifications" className="nav-dropdown-item" onClick={closeMobileMenu}>
                <FaClipboardCheck className="nav-icon" />
                View All Verifications
              </Link>
              <Link to="/document-verifications/add" className="nav-dropdown-item" onClick={closeMobileMenu}>
                <FaPlus className="nav-icon" />
                Add New Verification
              </Link>
            </div>
          </div>

          <Link 
            to="/analytics" 
            className={`nav-link ${isActive('/analytics') ? 'active' : ''}`}
            onClick={closeMobileMenu}
          >
            <FaChartBar className="nav-icon" />
            <span className="nav-text">Analytics</span>
          </Link>
        </div>

        <div className="nav-status">
          <div className="status-indicator online"></div>
          <span className="status-text">Online</span>
        </div>
      </div>

      {isMobileMenuOpen && <div className="mobile-menu-overlay" onClick={closeMobileMenu}></div>}
    </nav>
  );
};

export default Navbar;
