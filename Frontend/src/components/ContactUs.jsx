import React from 'react';
import '../styles/ContactUs.css';
import { GrSend } from "react-icons/gr";

export default function ContactUs() {
    return (
        <div className="contact-page">
            <h1>Contact Us</h1>

            <div className="contact-card">
                <h2>Have any Queries/suggestions?</h2>
                <p>Please feel free to reach out to us at:</p>
                <a href="divyam.2426mca1749@kiet.edu" className="contact-email">divyam.2426mca1749@kiet.edu</a>
                <a href="divyam.2426mca1749@kiet.edu" className="contact-button"><GrSend /></a>
            </div>
        </div>
    );
}
