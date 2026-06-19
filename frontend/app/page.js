'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { publicAPI, contactAPI, API } from '../lib/api';
const contactEmail = process.env.NEXT_PUBLIC_CONTACT_EMAIL || 'your-actual-email@gmail.com';
const businessName = process.env.NEXT_PUBLIC_BUSINESS_NAME || 'MotionLumen';

const wa = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '919876543210';

export default function Home() {
    const [studios, setStudios] = useState([]);
    const [filteredStudios, setFilteredStudios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showContactForm, setShowContactForm] = useState(false);
    const [contactFormData, setContactFormData] = useState({
        name: '',
        whatsapp: '',
        email: '',
        message: '',
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [contactSuccess, setContactSuccess] = useState(false);
    const [contactError, setContactError] = useState('');

    // ─── Helper to get full image URL ──────────────────────────────
    const getImageUrl = (url) => {
        if (!url) return '';
        if (url.startsWith('http')) return url;
        if (url.startsWith('/uploads')) {
            return `${API}${url}`;
        }
        return url;
    };

    useEffect(() => {
        fetchStudios();
    }, []);

    useEffect(() => {
        filterStudios();
    }, [searchTerm, studios]);

    async function fetchStudios() {
        try {
            const studiosData = await publicAPI.getStudios();
            setStudios(studiosData);
            setFilteredStudios(studiosData);
        } catch (error) {
            console.error('Error fetching studios:', error);
        } finally {
            setLoading(false);
        }
    }

    function filterStudios() {
        if (!searchTerm.trim()) {
            setFilteredStudios(studios);
            return;
        }

        const term = searchTerm.toLowerCase().trim();
        const filtered = studios.filter(studio => {
            return (
                studio.name?.toLowerCase().includes(term) ||
                studio.city?.toLowerCase().includes(term) ||
                studio.ownerName?.toLowerCase().includes(term) ||
                studio.headline?.toLowerCase().includes(term) ||
                studio.about?.toLowerCase().includes(term) ||
                studio.address?.city?.toLowerCase().includes(term) ||
                studio.address?.state?.toLowerCase().includes(term)
            );
        });
        setFilteredStudios(filtered);
    }

    const handleContactSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setContactError('');

        try {
            await contactAPI.sendInquiry({
                name: contactFormData.name,
                whatsapp: contactFormData.whatsapp,
                email: contactFormData.email || '',
                message: contactFormData.message,
                businessEmail: contactEmail,
                businessName: businessName,
            });

            setContactSuccess(true);
            setContactFormData({ name: '', whatsapp: '', email: '', message: '' });
            setTimeout(() => {
                setContactSuccess(false);
                setShowContactForm(false);
            }, 3000);
        } catch (err) {
            setContactError(err.message || 'Failed to send message');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Handle WhatsApp click without triggering the parent Link
    const handleWhatsAppClick = (e, phone) => {
        e.preventDefault();
        e.stopPropagation();
        window.open(`https://wa.me/${phone}`, '_blank');
    };

    return (
        <>
            <style>{`
                * {
                    box-sizing: border-box;
                }
                .landing-root {
                    background: #FAF8F3;
                    color: #1C1208;
                    min-height: 100vh;
                    font-family: 'DM Sans', system-ui, sans-serif;
                }
                .landing-btn {
                    display: inline-block;
                    padding: 10px 20px;
                    border-radius: 999px;
                    font-weight: 600;
                    font-size: 13px;
                    text-decoration: none;
                    transition: all 0.3s ease;
                    cursor: pointer;
                    border: none;
                    font-family: inherit;
                    white-space: nowrap;
                    text-align: center;
                }
                @media (max-width: 480px) {
                    .landing-btn {
                        font-size: 11px;
                        padding: 8px 14px;
                    }
                }
                .landing-btn-primary {
                    background: #1C1208;
                    color: #FAF8F3;
                }
                .landing-btn-primary:hover {
                    background: #3d2c1a;
                    transform: translateY(-2px);
                }
                .landing-btn-secondary {
                    background: transparent;
                    color: #1C1208;
                    border: 2px solid #1C1208;
                }
                .landing-btn-secondary:hover {
                    background: #1C1208;
                    color: #FAF8F3;
                    transform: translateY(-2px);
                }
                .landing-btn-accent {
                    background: #B8864E;
                    color: #FFFFFF;
                }
                .landing-btn-accent:hover {
                    background: #a07543;
                    transform: translateY(-2px);
                }
                .landing-card {
                    background: #FFFFFF;
                    border: 1px solid #E5DBCE;
                    border-radius: 20px;
                    padding: 20px;
                    transition: all 0.3s ease;
                    box-shadow: 0 2px 24px rgba(184,134,78,0.08);
                }
                .landing-card:hover {
                    box-shadow: 0 12px 40px rgba(184,134,78,0.15);
                    transform: translateY(-4px);
                }
                .landing-search {
                    width: 100%;
                    padding: 12px 18px;
                    border-radius: 999px;
                    border: 2px solid #E5DBCE;
                    background: #FFFFFF;
                    font-size: 15px;
                    outline: none;
                    transition: border-color 0.3s ease;
                    font-family: inherit;
                    color: #1C1208;
                }
                @media (max-width: 480px) {
                    .landing-search {
                        font-size: 14px;
                        padding: 10px 16px;
                    }
                }
                .landing-search:focus {
                    border-color: #B8864E;
                }
                .landing-search::placeholder {
                    color: #7A6A55;
                }
                .studio-card-img-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 4px;
                }
                .studio-card-img-grid img {
                    width: 100%;
                    height: 100px;
                    object-fit: cover;
                    border-radius: 6px;
                }
                .studio-card-img-grid img:first-child {
                    grid-column: 1 / -1;
                    height: 150px;
                }
                .whatsapp-link {
                    color: #B8864E;
                    text-decoration: none;
                    font-size: 13px;
                    display: inline-flex;
                    align-items: center;
                    gap: 4px;
                    cursor: pointer;
                }
                .whatsapp-link:hover {
                    text-decoration: underline;
                }
                .modal-overlay {
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
                    padding: 16px;
                    backdrop-filter: blur(4px);
                }
                .modal-content {
                    background: #FFFFFF;
                    border-radius: 20px;
                    padding: 28px 24px;
                    max-width: 420px;
                    width: 100%;
                    max-height: 90vh;
                    overflow-y: auto;
                    position: relative;
                }
                @media (max-width: 480px) {
                    .modal-content {
                        padding: 20px 16px;
                        margin: 10px;
                    }
                }
                .modal-close {
                    position: absolute;
                    top: 12px;
                    right: 12px;
                    background: none;
                    border: none;
                    font-size: 22px;
                    cursor: pointer;
                    color: #7A6A55;
                    padding: 4px 8px;
                    border-radius: 8px;
                    transition: background 0.2s;
                }
                .modal-close:hover {
                    background: #f0ece6;
                }
                .nav-buttons {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 8px;
                    align-items: center;
                }
                @media (max-width: 480px) {
                    .nav-buttons {
                        gap: 6px;
                    }
                }
                .hero-title {
                    font-size: 3rem;
                    line-height: 1.1;
                }
                @media (max-width: 768px) {
                    .hero-title {
                        font-size: 2.5rem;
                    }
                }
                @media (max-width: 480px) {
                    .hero-title {
                        font-size: 2rem;
                    }
                }
                .hero-subtitle {
                    font-size: 1.1rem;
                }
                @media (max-width: 480px) {
                    .hero-subtitle {
                        font-size: 0.95rem;
                    }
                }
                .section-title {
                    font-size: 2rem;
                }
                @media (max-width: 480px) {
                    .section-title {
                        font-size: 1.5rem;
                    }
                }
                .studio-name {
                    font-size: 1.2rem;
                }
                @media (max-width: 480px) {
                    .studio-name {
                        font-size: 1rem;
                    }
                }
                .hero-grid {
                    grid-template-columns: 1fr 1fr;
                }
                @media (max-width: 768px) {
                    .hero-grid {
                        grid-template-columns: 1fr;
                    }
                    .hero-image-grid {
                        order: -1;
                    }
                }
                .hero-image-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 12px;
                }
                @media (max-width: 480px) {
                    .hero-image-grid {
                        gap: 8px;
                    }
                }
                .hero-image-grid img {
                    border-radius: 16px;
                    width: 100%;
                    object-fit: cover;
                }
                .hero-image-tall {
                    height: 240px;
                }
                @media (max-width: 480px) {
                    .hero-image-tall {
                        height: 160px;
                    }
                }
                .hero-image-short {
                    height: 160px;
                }
                @media (max-width: 480px) {
                    .hero-image-short {
                        height: 120px;
                    }
                }
                .studio-grid {
                    display: grid;
                    gap: 24px;
                    grid-template-columns: repeat(3, 1fr);
                }
                @media (max-width: 1024px) {
                    .studio-grid {
                        grid-template-columns: repeat(2, 1fr);
                    }
                }
                @media (max-width: 640px) {
                    .studio-grid {
                        grid-template-columns: 1fr;
                        gap: 16px;
                    }
                }
                .footer-links {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 16px;
                }
                @media (max-width: 480px) {
                    .footer-links {
                        gap: 12px;
                    }
                    .footer-links a, .footer-links button {
                        font-size: 12px;
                    }
                }
            `}</style>

            <div className="landing-root">
                {/* ─── Navbar ────────────────────────────────────────────── */}
                <nav className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6 flex flex-wrap justify-between items-center gap-3">
                    <b className="text-xl sm:text-2xl font-bold" style={{ color: '#1C1208' }}>
                        MotionLumen
                    </b>
                    <div className="nav-buttons">
                        <Link href="/login" className="landing-btn landing-btn-secondary">
                            Business Login
                        </Link>
                        <a
                            className="landing-btn landing-btn-accent"
                            href={`https://wa.me/${wa}?text=I want to enroll my studio on MotionLumen`}
                            target="_blank"
                            rel="noreferrer"
                        >
                            Enroll on WhatsApp
                        </a>
                    </div>
                </nav>

                {/* ─── Hero ──────────────────────────────────────────────── */}
                <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16 md:py-20">
                    <div className="hero-grid grid gap-8 md:gap-12 items-center">
                        <div>
                            <h1 className="hero-title font-black leading-tight" style={{ color: '#1C1208' }}>
                                Find the perfect wedding studio
                            </h1>
                            <p className="hero-subtitle mt-4 sm:mt-6" style={{ color: '#7A6A55' }}>
                                Browse through India's best wedding photography and videography studios.
                                Every studio has a public portfolio, contact info, and booking options.
                            </p>
                            <div className="mt-6 sm:mt-8 flex flex-wrap gap-3">
                                <a
                                    className="landing-btn landing-btn-accent"
                                    href={`https://wa.me/${wa}?text=I want to enroll my studio on MotionLumen`}
                                    target="_blank"
                                    rel="noreferrer"
                                >
                                    Enroll Your Studio
                                </a>
                                <button
                                    className="landing-btn landing-btn-secondary"
                                    onClick={() => setShowContactForm(true)}
                                >
                                    Contact Developer
                                </button>
                            </div>
                        </div>
                        <div className="hero-image-grid">
                            <img
                                className="hero-image-tall col-span-2"
                                src="https://images.unsplash.com/photo-1529634597503-139d3726fed5?q=80&w=900"
                                alt="Wedding photography"
                            />
                            <img
                                className="hero-image-short"
                                src="https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=900"
                                alt="Wedding couple"
                            />
                            <img
                                className="hero-image-short"
                                src="https://images.unsplash.com/photo-1606800052052-a08af7148866?q=80&w=900"
                                alt="Wedding venue"
                            />
                        </div>
                    </div>
                </section>

                {/* ─── Search & Studio List ────────────────────────────── */}
                <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-16 sm:pb-20">
                    <div className="mb-6 sm:mb-8">
                        <h2 className="section-title font-bold mb-3 sm:mb-4" style={{ color: '#1C1208' }}>
                            Browse Studios
                        </h2>
                        <input
                            type="text"
                            className="landing-search"
                            placeholder="Search by studio name, city, owner name..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        {searchTerm && (
                            <p className="mt-2 text-sm" style={{ color: '#7A6A55' }}>
                                Found {filteredStudios.length} studio{filteredStudios.length !== 1 ? 's' : ''}
                            </p>
                        )}
                    </div>

                    {loading ? (
                        <div className="text-center py-12" style={{ color: '#7A6A55' }}>
                            Loading studios...
                        </div>
                    ) : filteredStudios.length === 0 ? (
                        <div className="text-center py-12" style={{ color: '#7A6A55' }}>
                            {searchTerm ? 'No studios found matching your search.' : 'No studios registered yet.'}
                            <div className="mt-4">
                                <a
                                    className="landing-btn landing-btn-accent"
                                    href={`https://wa.me/${wa}?text=I want to enroll my studio on MotionLumen`}
                                    target="_blank"
                                    rel="noreferrer"
                                >
                                    Enroll Your Studio
                                </a>
                            </div>
                        </div>
                    ) : (
                        <div className="studio-grid">
                            {filteredStudios.map((studio) => (
                                <Link
                                    key={studio._id}
                                    href={`/studio/${studio.slug}`}
                                    className="landing-card block no-underline"
                                >
                                    <div className="studio-card-img-grid">
                                        {studio.gallery && studio.gallery.length > 0 ? (
                                            <>
                                                <img
                                                    src={getImageUrl(studio.gallery[0]?.thumbnail || studio.gallery[0]?.url) || '/placeholder-image.png'}
                                                    alt={studio.name}
                                                    style={{ gridColumn: '1 / -1', height: '150px', objectFit: 'cover', borderRadius: '8px' }}
                                                    onError={(e) => {
                                                        e.target.onerror = null;
                                                        e.target.src = '/placeholder-image.png';
                                                    }}
                                                />
                                                {studio.gallery[1] && (
                                                    <img
                                                        src={getImageUrl(studio.gallery[1]?.thumbnail || studio.gallery[1]?.url) || '/placeholder-image.png'}
                                                        alt={studio.name}
                                                        style={{ height: '100px', objectFit: 'cover', borderRadius: '8px' }}
                                                        onError={(e) => {
                                                            e.target.onerror = null;
                                                            e.target.src = '/placeholder-image.png';
                                                        }}
                                                    />
                                                )}
                                                {studio.gallery[2] && (
                                                    <img
                                                        src={getImageUrl(studio.gallery[2]?.thumbnail || studio.gallery[2]?.url) || '/placeholder-image.png'}
                                                        alt={studio.name}
                                                        style={{ height: '100px', objectFit: 'cover', borderRadius: '8px' }}
                                                        onError={(e) => {
                                                            e.target.onerror = null;
                                                            e.target.src = '/placeholder-image.png';
                                                        }}
                                                    />
                                                )}
                                            </>
                                        ) : (
                                            <div
                                                style={{
                                                    gridColumn: '1 / -1',
                                                    height: '150px',
                                                    background: '#F0ECE6',
                                                    borderRadius: '8px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    color: '#7A6A55',
                                                    fontSize: '13px'
                                                }}
                                            >
                                                No photos yet
                                            </div>
                                        )}
                                    </div>

                                    <div className="mt-3">
                                        <h3 className="studio-name font-bold" style={{ color: '#1C1208' }}>
                                            {studio.name}
                                        </h3>
                                        {studio.city && (
                                            <p className="text-xs sm:text-sm" style={{ color: '#7A6A55' }}>
                                                📍 {studio.city}
                                            </p>
                                        )}
                                        {studio.headline && (
                                            <p className="text-xs sm:text-sm mt-1" style={{ color: '#7A6A55' }}>
                                                {studio.headline}
                                            </p>
                                        )}
                                        <div className="mt-3 flex items-center gap-3 flex-wrap">
                                            {studio.whatsapp && (
                                                <span
                                                    className="whatsapp-link"
                                                    onClick={(e) => handleWhatsAppClick(e, studio.whatsapp)}
                                                >
                                                    📱 WhatsApp
                                                </span>
                                            )}
                                            <span className="text-xs" style={{ color: '#7A6A55' }}>
                                                Click to view →
                                            </span>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </section>

                {/* ─── Footer ────────────────────────────────────────────── */}
                <footer className="border-t" style={{ borderColor: '#E5DBCE' }}>
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 flex flex-wrap justify-between items-center gap-3">
                        <p className="text-xs sm:text-sm" style={{ color: '#7A6A55' }}>
                            © {new Date().getFullYear()} MotionLumen. All rights reserved.
                        </p>
                        <div className="footer-links">
                            <button
                                className="text-xs sm:text-sm"
                                style={{ color: '#7A6A55' }}
                                onClick={() => setShowContactForm(true)}
                            >
                                Contact Developer
                            </button>
                            <a
                                className="text-xs sm:text-sm"
                                style={{ color: '#7A6A55' }}
                                href={`https://wa.me/${wa}`}
                                target="_blank"
                                rel="noreferrer"
                            >
                                WhatsApp
                            </a>
                            <Link href="/login" className="text-xs sm:text-sm" style={{ color: '#7A6A55' }}>
                                Business Login
                            </Link>
                        </div>
                    </div>
                </footer>

                {/* ─── Contact Modal ────────────────────────────────────── */}
                {showContactForm && (
                    <div className="modal-overlay" onClick={() => setShowContactForm(false)}>
                        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                            <button className="modal-close" onClick={() => setShowContactForm(false)}>✕</button>

                            {contactSuccess ? (
                                <div className="text-center py-6 sm:py-8">
                                    <div style={{ fontSize: '40px', marginBottom: '12px' }}>✓</div>
                                    <h3 className="text-lg sm:text-xl font-bold" style={{ color: '#1C1208' }}>Thank you!</h3>
                                    <p className="text-sm sm:text-base" style={{ color: '#7A6A55' }}>We'll get back to you soon.</p>
                                </div>
                            ) : (
                                <>
                                    <h2 className="text-xl sm:text-2xl font-bold mb-2" style={{ color: '#1C1208' }}>
                                        Contact Developer
                                    </h2>
                                    <p className="text-sm sm:text-base mb-4 sm:mb-6" style={{ color: '#7A6A55' }}>
                                        Have questions about MotionLumen? Reach out to us.
                                    </p>

                                    <form onSubmit={handleContactSubmit}>
                                        <div className="mb-3 sm:mb-4">
                                            <label className="block text-xs sm:text-sm font-medium mb-1" style={{ color: '#1C1208' }}>
                                                Your Name *
                                            </label>
                                            <input
                                                type="text"
                                                className="w-full p-2.5 sm:p-3 rounded-xl border-2 outline-none text-sm"
                                                style={{ borderColor: '#E5DBCE', background: '#FAF8F3' }}
                                                placeholder="John Doe"
                                                value={contactFormData.name}
                                                onChange={(e) => setContactFormData({ ...contactFormData, name: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div className="mb-3 sm:mb-4">
                                            <label className="block text-xs sm:text-sm font-medium mb-1" style={{ color: '#1C1208' }}>
                                                WhatsApp Number *
                                            </label>
                                            <input
                                                type="tel"
                                                className="w-full p-2.5 sm:p-3 rounded-xl border-2 outline-none text-sm"
                                                style={{ borderColor: '#E5DBCE', background: '#FAF8F3' }}
                                                placeholder="+91 98765 43210"
                                                value={contactFormData.whatsapp || ''}
                                                onChange={(e) => setContactFormData({ ...contactFormData, whatsapp: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div className="mb-3 sm:mb-4">
                                            <label className="block text-xs sm:text-sm font-medium mb-1" style={{ color: '#1C1208' }}>
                                                Email (Optional)
                                            </label>
                                            <input
                                                type="email"
                                                className="w-full p-2.5 sm:p-3 rounded-xl border-2 outline-none text-sm"
                                                style={{ borderColor: '#E5DBCE', background: '#FAF8F3' }}
                                                placeholder="john@example.com"
                                                value={contactFormData.email || ''}
                                                onChange={(e) => setContactFormData({ ...contactFormData, email: e.target.value })}
                                            />
                                        </div>
                                        <div className="mb-3 sm:mb-4">
                                            <label className="block text-xs sm:text-sm font-medium mb-1" style={{ color: '#1C1208' }}>
                                                Your Message *
                                            </label>
                                            <textarea
                                                className="w-full p-2.5 sm:p-3 rounded-xl border-2 outline-none min-h-[80px] sm:min-h-[100px] text-sm"
                                                style={{ borderColor: '#E5DBCE', background: '#FAF8F3' }}
                                                placeholder="Tell us how we can help..."
                                                value={contactFormData.message}
                                                onChange={(e) => setContactFormData({ ...contactFormData, message: e.target.value })}
                                                required
                                            />
                                        </div>
                                        {contactError && (
                                            <p className="text-xs sm:text-sm mb-3" style={{ color: '#dc3545' }}>
                                                {contactError}
                                            </p>
                                        )}
                                        <button
                                            type="submit"
                                            className="landing-btn landing-btn-primary w-full text-center"
                                            disabled={isSubmitting}
                                        >
                                            {isSubmitting ? 'Sending...' : 'Send Message'}
                                        </button>
                                    </form>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}