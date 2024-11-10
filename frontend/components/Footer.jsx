import React from 'react';
import "../css/Footer.css";
import { NavLink } from 'react-router-dom';
import { FaFacebookF, FaTwitter, FaInstagram } from 'react-icons/fa'; // Importing icons from react-icons

function Footer() {
  return (
    <div className="footer">
      <div className="footer-content">
        <div className="footer-logo">
          <h1>RentalsPro</h1>
        </div>
        <div className="footer-links">
          <ul>
            <li><NavLink to="/">Home</NavLink></li>
            <li><NavLink to="/about">About</NavLink></li>
            <li><NavLink to="/services">Services</NavLink></li>
            <li><NavLink to="/vehicles">Vehicles</NavLink></li>
            <li><NavLink to="/contact">Contact</NavLink></li>
          </ul>
        </div>
        <div className="footer-contact">
          <p>&copy; 2024 RentalsPro. All rights reserved.</p>
          <p>Email: support@rentalspro.com</p>
          <p>Phone: +1 234 567 890</p>
        </div>
        <div className="footer-social">
          <p>Follow us on:</p> {/* Keep the "Follow us on" text */}
          <div className="social-icons">
            <NavLink to="#" className="social-icon">
              <FaFacebookF />
              <span className="social-text">Facebook</span>
            </NavLink>
            <NavLink to="#" className="social-icon">
              <FaTwitter />
              <span className="social-text">Twitter</span>
            </NavLink>
            <NavLink to="#" className="social-icon">
              <FaInstagram />
              <span className="social-text">Instagram</span>
            </NavLink>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Footer;