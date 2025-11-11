import React from 'react';
import { Link } from 'react-router-dom'
import '../styles/Footer.css';

const Footer = () => {
    return (
        <div className="footer-container">
            <div className="footer-copyright">
                ©2025 Exam Quest
            </div>
            <div className="footer-links">
                <div className="footer-link">
                    <Link to="/aboutus">About Us</Link>
                </div>
                <div className="footer-link">
                    <Link to="/ContactUs">Contact Us</Link>
                </div>
                <div className="footer-link">
                    <Link to="/curriculum">Curriculum</Link>
                </div>
                <div className="footer-link">
                    <Link to="/faq">FAQ</Link>
                </div>
            </div>
        </div>
    );
}

export default Footer;