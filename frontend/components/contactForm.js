'use client';

import { useState } from 'react';
import { contactAPI } from '../lib/api';

export default function ContactForm({ onClose, businessEmail, businessName, theme }) {
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        message: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError('');

        try {
            await contactAPI.sendInquiry({
                ...formData,
                businessEmail,
                businessName,
            });

            setSuccess(true);
            setTimeout(() => {
                onClose();
                setSuccess(false);
                setFormData({ name: '', phone: '', message: '' });
            }, 2000);
        } catch (err) {
            setError(err.message || 'Failed to send message. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    return (
        <div className="contact-form-wrapper">
            <style>{`
                .contact-form-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0,0,0,0.5);
                    z-index: 999;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 20px;
                    animation: fadeIn 0.3s ease;
                }
                .contact-form-container {
                    background: var(--surface);
                    border: 1px solid var(--border);
                    border-radius: 20px;
                    padding: 32px;
                    max-width: 440px;
                    width: 100%;
                    max-height: 90vh;
                    overflow-y: auto;
                    box-shadow: 0 20px 60px rgba(0,0,0,0.3);
                    animation: slideUp 0.3s ease;
                    position: relative;
                }
                .contact-form-close {
                    position: absolute;
                    top: 16px;
                    right: 16px;
                    background: none;
                    border: none;
                    color: var(--muted);
                    font-size: 24px;
                    cursor: pointer;
                    padding: 4px 8px;
                    border-radius: 8px;
                    transition: background 0.2s;
                }
                .contact-form-close:hover {
                    background: var(--border);
                    color: var(--text);
                }
                .contact-form-title {
                    font-family: 'Cormorant Garamond', serif;
                    font-size: 28px;
                    font-weight: 600;
                    color: var(--text);
                    margin: 0 0 4px 0;
                }
                .contact-form-subtitle {
                    font-size: 14px;
                    color: var(--muted);
                    margin: 0 0 24px 0;
                }
                .contact-form-group {
                    margin-bottom: 18px;
                }
                .contact-form-label {
                    display: block;
                    font-size: 12px;
                    font-weight: 500;
                    color: var(--muted);
                    margin-bottom: 6px;
                    letter-spacing: 0.3px;
                }
                .contact-form-input {
                    width: 100%;
                    padding: 12px 14px;
                    background: var(--bg);
                    border: 1px solid var(--border);
                    border-radius: 10px;
                    color: var(--text);
                    font-size: 14px;
                    transition: border-color 0.2s;
                    outline: none;
                    font-family: inherit;
                }
                .contact-form-input:focus {
                    border-color: var(--accent);
                }
                .contact-form-textarea {
                    min-height: 100px;
                    resize: vertical;
                }
                .contact-form-submit {
                    width: 100%;
                    padding: 14px;
                    background: var(--accent);
                    color: var(--accent-fg);
                    border: none;
                    border-radius: 10px;
                    font-size: 16px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: opacity 0.2s, transform 0.2s;
                }
                .contact-form-submit:hover:not(:disabled) {
                    opacity: 0.85;
                    transform: translateY(-2px);
                }
                .contact-form-submit:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                }
                .contact-form-success {
                    text-align: center;
                    padding: 20px 0;
                }
                .contact-form-success-icon {
                    font-size: 48px;
                    display: block;
                    margin-bottom: 12px;
                }
                .contact-form-success-text {
                    color: var(--text);
                    font-size: 18px;
                    font-weight: 500;
                }
                .contact-form-error {
                    color: #ef4444;
                    font-size: 13px;
                    margin-top: 8px;
                    padding: 10px 14px;
                    background: rgba(239,68,68,0.1);
                    border-radius: 8px;
                    border: 1px solid rgba(239,68,68,0.2);
                }
                .contact-form-spinner {
                    display: inline-block;
                    width: 20px;
                    height: 20px;
                    border: 2px solid rgba(255,255,255,0.3);
                    border-top-color: #fff;
                    border-radius: 50%;
                    animation: spin 0.6s linear infinite;
                    margin-right: 8px;
                    vertical-align: middle;
                }
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes slideUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
                @media (max-width: 480px) {
                    .contact-form-container {
                        padding: 24px 20px;
                        margin: 10px;
                        border-radius: 16px;
                    }
                    .contact-form-title {
                        font-size: 24px;
                    }
                }
            `}</style>

            <div className="contact-form-overlay" onClick={onClose}>
                <div className="contact-form-container" onClick={(e) => e.stopPropagation()}>
                    <button className="contact-form-close" onClick={onClose}>✕</button>

                    {success ? (
                        <div className="contact-form-success">
                            <span className="contact-form-success-icon">✓</span>
                            <p className="contact-form-success-text">Thank you!<br />We'll get back to you soon.</p>
                        </div>
                    ) : (
                        <>
                            <h2 className="contact-form-title">Get in Touch</h2>
                            <p className="contact-form-subtitle">We'd love to hear from you</p>

                            <form onSubmit={handleSubmit}>
                                <div className="contact-form-group">
                                    <label className="contact-form-label">Your Name</label>
                                    <input
                                        type="text"
                                        name="name"
                                        className="contact-form-input"
                                        placeholder="John Doe"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <div className="contact-form-group">
                                    <label className="contact-form-label">Phone Number</label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        className="contact-form-input"
                                        placeholder="+91 98765 43210"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <div className="contact-form-group">
                                    <label className="contact-form-label">Your Message</label>
                                    <textarea
                                        name="message"
                                        className="contact-form-input contact-form-textarea"
                                        placeholder="Tell us about your vision..."
                                        value={formData.message}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                {error && <div className="contact-form-error">{error}</div>}

                                <button
                                    type="submit"
                                    className="contact-form-submit"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <span className="contact-form-spinner" />
                                            Sending...
                                        </>
                                    ) : (
                                        'Send Message'
                                    )}
                                </button>
                            </form>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}