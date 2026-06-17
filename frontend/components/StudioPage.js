'use client';

import { useState, useEffect } from 'react';
import { API } from '../lib/api';
import ContactForm from './contactForm';

// ── Theme definitions ───────────────────────────────────────────────────────
const THEMES = {
    champagne: {
        label: 'Champagne',
        dot: '#B8864E',
        '--bg': '#FAF8F3',
        '--surface': '#FFFFFF',
        '--border': '#E5DBCE',
        '--text': '#1C1208',
        '--muted': '#7A6A55',
        '--accent': '#B8864E',
        '--accent-fg': '#FFFFFF',
        '--hero-bg': '#EFE7DA',
        '--shadow': '0 2px 24px rgba(184,134,78,0.10)',
        '--shadow-hover': '0 12px 40px rgba(184,134,78,0.18)',
    },
    blush: {
        label: 'Blush Rose',
        dot: '#C0617A',
        '--bg': '#FEF8F9',
        '--surface': '#FFFFFF',
        '--border': '#F0D4DA',
        '--text': '#1A0E12',
        '--muted': '#8A5F68',
        '--accent': '#C0617A',
        '--accent-fg': '#FFFFFF',
        '--hero-bg': '#FAE8EC',
        '--shadow': '0 2px 24px rgba(192,97,122,0.10)',
        '--shadow-hover': '0 12px 40px rgba(192,97,122,0.18)',
    },
    sage: {
        label: 'Sage Garden',
        dot: '#5A8A6A',
        '--bg': '#F5F8F5',
        '--surface': '#FFFFFF',
        '--border': '#CADDCe',
        '--text': '#0D1A0E',
        '--muted': '#4D6E55',
        '--accent': '#5A8A6A',
        '--accent-fg': '#FFFFFF',
        '--hero-bg': '#E3EFE6',
        '--shadow': '0 2px 24px rgba(90,138,106,0.10)',
        '--shadow-hover': '0 12px 40px rgba(90,138,106,0.18)',
    },
    twilight: {
        label: 'Twilight',
        dot: '#C9A96E',
        '--bg': '#0E1117',
        '--surface': '#171C28',
        '--border': '#252B3B',
        '--text': '#F0EDE8',
        '--muted': '#8A8FA8',
        '--accent': '#C9A96E',
        '--accent-fg': '#0E1117',
        '--hero-bg': '#101524',
        '--shadow': '0 2px 24px rgba(0,0,0,0.40)',
        '--shadow-hover': '0 12px 40px rgba(0,0,0,0.55)',
    },
};

// ── WhatsApp SVG icon ────────────────────────────────────────────────────────
function WhatsAppIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
    );
}

// ── Main component ───────────────────────────────────────────────────────────
export default function StudioPageUI({ b }) {
    const [themeKey, setThemeKey] = useState('champagne');
    const [showContactForm, setShowContactForm] = useState(false);

    // ─── Helper to get full image URL using API constant ──────────────────
    const getImageUrl = (url) => {
        if (!url) return '';
        if (url.startsWith('http')) return url;
        if (url.startsWith('/uploads')) {
            return `${API}${url}`;
        }
        return url;
    };

    // Persist theme across page visits
    useEffect(() => {
        const saved = localStorage.getItem('studio-theme');
        if (saved && THEMES[saved]) setThemeKey(saved);
    }, []);

    function applyTheme(key) {
        setThemeKey(key);
        localStorage.setItem('studio-theme', key);
    }

    const t = THEMES[themeKey];

    // Build CSS variable map for the root element
    const cssVars = Object.fromEntries(
        Object.entries(t).filter(([k]) => k.startsWith('--'))
    );

    return (
        <>
            {/* Google Fonts */}
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400;1,600&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500&display=swap');

                .sp-root {
                    font-family: 'DM Sans', system-ui, sans-serif;
                    background: var(--bg);
                    color: var(--text);
                    min-height: 100vh;
                    transition: background 0.35s ease, color 0.35s ease;
                    -webkit-font-smoothing: antialiased;
                }
                .sp-display {
                    font-family: 'Cormorant Garamond', Georgia, serif;
                }
                /* Floating theme switcher */
                .sp-theme-bar {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    z-index: 200;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    background: var(--surface);
                    border: 1px solid var(--border);
                    border-radius: 999px;
                    padding: 8px 14px;
                    box-shadow: var(--shadow);
                    transition: background 0.35s, border 0.35s;
                }
                .sp-theme-bar span {
                    font-size: 10px;
                    font-weight: 500;
                    letter-spacing: 0.1em;
                    text-transform: uppercase;
                    color: var(--muted);
                    margin-right: 2px;
                }
                .sp-dot {
                    width: 20px;
                    height: 20px;
                    border-radius: 50%;
                    border: 2px solid transparent;
                    cursor: pointer;
                    transition: transform 0.2s, border-color 0.2s;
                    outline: none;
                    padding: 0;
                    background: transparent;
                }
                .sp-dot:hover { transform: scale(1.25); }
                .sp-dot.active { border-color: var(--text); }

                /* Hero - Reduced padding */
                .sp-hero {
                    background: var(--hero-bg);
                    padding: clamp(40px, 6vw, 80px) 24px clamp(48px, 8vw, 100px);
                    text-align: center;
                    position: relative;
                    transition: background 0.35s;
                }
                .sp-hero-eyebrow {
                    font-family: 'DM Sans', sans-serif;
                    font-size: 11px;
                    letter-spacing: 0.2em;
                    text-transform: uppercase;
                    color: var(--muted);
                    margin: 0 0 12px;
                }
                .sp-hero-name {
                    font-size: clamp(36px, 8vw, 72px);
                    font-weight: 700;
                    line-height: 1.0;
                    margin: 0;
                    letter-spacing: -0.01em;
                }
                .sp-divider {
                    width: 40px;
                    height: 2px;
                    background: var(--accent);
                    margin: 16px auto;
                    transition: background 0.35s;
                }
                .sp-hero-headline {
                    font-size: clamp(14px, 2vw, 18px);
                    color: var(--muted);
                    max-width: 500px;
                    margin: 0 auto 24px;
                    line-height: 1.6;
                    font-weight: 300;
                }

                /* WhatsApp button */
                .sp-wa-btn {
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    background: var(--accent);
                    color: var(--accent-fg);
                    font-family: 'DM Sans', sans-serif;
                    font-size: 13px;
                    font-weight: 500;
                    letter-spacing: 0.04em;
                    text-decoration: none;
                    padding: 12px 24px;
                    border-radius: 999px;
                    transition: opacity 0.2s, transform 0.25s;
                }
                .sp-wa-btn:hover { opacity: 0.85; transform: translateY(-2px); }

                /* Contact Button - Floating */
                .sp-contact-btn {
                    position: fixed;
                    bottom: 24px;
                    right: 24px;
                    z-index: 100;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    background: var(--accent);
                    color: var(--accent-fg);
                    font-family: 'DM Sans', sans-serif;
                    font-size: 14px;
                    font-weight: 500;
                    padding: 14px 24px;
                    border-radius: 999px;
                    border: none;
                    cursor: pointer;
                    box-shadow: 0 4px 20px rgba(0,0,0,0.15);
                    transition: transform 0.3s ease, box-shadow 0.3s ease;
                }
                .sp-contact-btn:hover {
                    transform: translateY(-3px);
                    box-shadow: 0 8px 30px rgba(0,0,0,0.25);
                }
                .sp-contact-btn svg {
                    width: 20px;
                    height: 20px;
                }

                /* About */
                .sp-about {
                    max-width: 720px;
                    margin: 0 auto;
                    padding: clamp(32px, 5vw, 60px) 24px;
                }
                .sp-about-card {
                    background: var(--surface);
                    border: 1px solid var(--border);
                    border-radius: 16px;
                    padding: clamp(24px, 4vw, 40px);
                    box-shadow: var(--shadow);
                    transition: background 0.35s, border 0.35s;
                }
                .sp-about-label {
                    font-size: 10px;
                    letter-spacing: 0.2em;
                    text-transform: uppercase;
                    color: var(--accent);
                    margin: 0 0 8px;
                    display: block;
                    transition: color 0.35s;
                }
                .sp-about-text {
                    font-size: clamp(15px, 1.8vw, 17px);
                    line-height: 1.75;
                    font-weight: 300;
                    color: var(--text);
                    margin: 0;
                }

                /* Gallery */
                .sp-gallery {
                    max-width: 1240px;
                    margin: 0 auto;
                    padding: 0 24px clamp(40px, 6vw, 80px);
                }
                .sp-section-header {
                    text-align: center;
                    margin-bottom: 32px;
                }
                .sp-section-label {
                    font-size: 10px;
                    letter-spacing: 0.2em;
                    text-transform: uppercase;
                    color: var(--accent);
                    display: block;
                    margin-bottom: 6px;
                    transition: color 0.35s;
                }
                .sp-section-title {
                    font-size: clamp(28px, 4vw, 40px);
                    font-weight: 600;
                    margin: 0;
                    line-height: 1.1;
                }
                .sp-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
                    gap: 20px;
                }
                .sp-card {
                    background: var(--surface);
                    border: 1px solid var(--border);
                    border-radius: 14px;
                    overflow: hidden;
                    box-shadow: var(--shadow);
                    text-decoration: none;
                    color: inherit;
                    display: block;
                    transition:
                        transform 0.35s cubic-bezier(0.25, 0.8, 0.25, 1),
                        box-shadow 0.35s cubic-bezier(0.25, 0.8, 0.25, 1),
                        background 0.35s,
                        border 0.35s;
                }
                .sp-card:hover {
                    transform: translateY(-4px);
                    box-shadow: var(--shadow-hover);
                }
                .sp-card-img-wrap {
                    overflow: hidden;
                    height: 220px;
                }
                .sp-card-img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    display: block;
                    transition: transform 0.55s cubic-bezier(0.25, 0.8, 0.25, 1);
                }
                .sp-card:hover .sp-card-img {
                    transform: scale(1.05);
                }
                .sp-card-body {
                    padding: 14px 18px 18px;
                }
                .sp-card-title {
                    font-family: 'Cormorant Garamond', serif;
                    font-size: 18px;
                    font-weight: 600;
                    margin: 0 0 2px;
                    line-height: 1.2;
                }
                .sp-card-type {
                    font-size: 10px;
                    letter-spacing: 0.15em;
                    text-transform: uppercase;
                    color: var(--muted);
                    margin: 0;
                }

                /* Footer CTA */
                .sp-cta {
                    background: var(--hero-bg);
                    padding: clamp(40px, 6vw, 80px) 24px;
                    text-align: center;
                    transition: background 0.35s;
                }
                .sp-cta-title {
                    font-size: clamp(24px, 4vw, 40px);
                    font-weight: 600;
                    margin: 0 0 8px;
                    line-height: 1.15;
                }
                .sp-cta-sub {
                    font-size: 15px;
                    color: var(--muted);
                    font-weight: 300;
                    margin: 0 0 28px;
                }

                /* Footer */
                .sp-footer {
                    border-top: 1px solid var(--border);
                    padding: 20px 24px;
                    text-align: center;
                    font-size: 12px;
                    color: var(--muted);
                    transition: border 0.35s;
                }

                /* Mobile responsive */
                @media (max-width: 600px) {
                    .sp-contact-btn span { display: none; }
                    .sp-contact-btn { padding: 14px; border-radius: 50%; }
                    .sp-grid {
                        grid-template-columns: 1fr 1fr;
                        gap: 12px;
                    }
                    .sp-card-img-wrap { height: 160px; }
                    .sp-card-body { padding: 10px 12px 14px; }
                    .sp-card-title { font-size: 15px; }
                }
                @media (max-width: 400px) {
                    .sp-grid { grid-template-columns: 1fr; }
                }

                @media (prefers-reduced-motion: reduce) {
                    .sp-card, .sp-card-img, .sp-wa-btn, .sp-contact-btn { transition: none !important; }
                }
            `}</style>

            <div className="sp-root" style={cssVars}>

                {/* ── Floating Theme Switcher ───────────────────────────────── */}
                <div className="sp-theme-bar" role="group" aria-label="Choose colour theme">
                    <span>Theme</span>
                    {Object.entries(THEMES).map(([key, th]) => (
                        <button
                            key={key}
                            className={`sp-dot${themeKey === key ? ' active' : ''}`}
                            style={{ background: th.dot }}
                            title={th.label}
                            aria-label={th.label}
                            aria-pressed={themeKey === key}
                            onClick={() => applyTheme(key)}
                        />
                    ))}
                </div>

                {/* ── Floating Contact Button ───────────────────────────────── */}
                <button
                    className="sp-contact-btn"
                    onClick={() => setShowContactForm(true)}
                    style={{
                        backgroundColor: t['--accent'],
                        color: t['--accent-fg'],
                    }}
                >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
                    </svg>
                    <span>Contact Us</span>
                </button>

                {/* ── Contact Form Modal ───────────────────────────────────── */}
                {showContactForm && (
                    <ContactForm
                        onClose={() => setShowContactForm(false)}
                        businessEmail={b.contactEmail || b.email}
                        businessName={b.name}
                    />
                )}

                {/* ── Hero ─────────────────────────────────────────────────── */}
                <section className="sp-hero">
                    {b.city && (
                        <p className="sp-hero-eyebrow">{b.city}</p>
                    )}

                    <h1 className="sp-display sp-hero-name">
                        {b.name}
                    </h1>

                    <div className="sp-divider" />

                    {b.headline && (
                        <p className="sp-hero-headline">
                            {b.headline}
                        </p>
                    )}

                    {b.whatsapp && (
                        <a
                            className="sp-wa-btn"
                            href={`https://wa.me/${b.whatsapp}`}
                            target="_blank"
                            rel="noreferrer"
                        >
                            <WhatsAppIcon />
                            Book a session on WhatsApp
                        </a>
                    )}
                </section>

                {/* ── About ────────────────────────────────────────────────── */}
                {b.about && (
                    <section className="sp-about">
                        <div className="sp-about-card">
                            <span className="sp-about-label">About the Studio</span>
                            <p className="sp-about-text">{b.about}</p>
                        </div>
                    </section>
                )}

                {/* ── Gallery ──────────────────────────────────────────────── */}
                {(b.gallery || []).length > 0 && (
                    <section className="sp-gallery">
                        <div className="sp-section-header">
                            <span className="sp-section-label">Portfolio</span>
                            <h2 className="sp-display sp-section-title">Our Work</h2>
                            <div className="sp-divider" style={{ marginTop: 14 }} />
                        </div>

                        <div className="sp-grid">
                            {(b.gallery || []).map((g, i) => (
                                <a
                                    key={i}
                                    href={getImageUrl(g.url)}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="sp-card"
                                >
                                    <div className="sp-card-img-wrap">
                                        <img
                                            className="sp-card-img"
                                            src={getImageUrl(g.thumbnail || g.url)}
                                            alt={g.title || 'Studio work'}
                                            loading="lazy"
                                            onError={(e) => {
                                                e.target.onerror = null;
                                                e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400"%3E%3Crect width="400" height="400" fill="%23eeeeee"/%3E%3Ctext x="50%25" y="50%25" font-family="Arial" font-size="24" fill="%23999999" text-anchor="middle" dy=".3em"%3ENo Image%3C/text%3E%3C/svg%3E';
                                            }}
                                        />
                                    </div>
                                    <div className="sp-card-body">
                                        <p className="sp-card-title">
                                            {g.title || 'Sample work'}
                                        </p>
                                        {g.type && (
                                            <p className="sp-card-type">{g.type}</p>
                                        )}
                                    </div>
                                </a>
                            ))}
                        </div>
                    </section>
                )}

                {/* ── Footer CTA ───────────────────────────────────────────── */}
                {b.whatsapp && (
                    <section className="sp-cta">
                        <h2 className="sp-display sp-cta-title">
                            Ready to begin your story?
                        </h2>
                        <p className="sp-cta-sub">
                            Reach out and let's create something beautiful together.
                        </p>
                        <a
                            className="sp-wa-btn"
                            href={`https://wa.me/${b.whatsapp}`}
                            target="_blank"
                            rel="noreferrer"
                        >
                            <WhatsAppIcon />
                            Let's talk
                        </a>
                    </section>
                )}

                {/* ── Footer ───────────────────────────────────────────────── */}
                <footer className="sp-footer">
                    © {new Date().getFullYear()} {b.name}
                    {b.city ? ` · ${b.city}` : ''}
                </footer>

            </div>
        </>
    );
}