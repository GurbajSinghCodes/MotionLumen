'use client';

import { useState } from 'react';
import { api } from '../../lib/api';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function Login() {
    const [form, setForm] = useState({ email: '', password: '' });
    const [msg, setMsg] = useState('');
    const [loading, setLoading] = useState(false);

    async function submit(e) {
        e.preventDefault();
        setLoading(true);
        setMsg('');

        try {
            const d = await api('/api/auth/login', {
                method: 'POST',
                body: JSON.stringify(form),
            });

            // ─── Handle Account Disabled (No login allowed) ────
            if (d.code === 'ACCOUNT_DISABLED') {
                toast.error(d.message, {
                    position: "top-right",
                    autoClose: 10000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                });
                setMsg(d.message);
                setLoading(false);
                return; // Don't proceed
            }

            // ─── Store token ────────────────────────────────────
            if (d.token) {
                localStorage.setItem('token', d.token);
            } else {
                throw new Error('No token received');
            }

            // ─── Show warnings if any (subscription related) ────
            if (d.warnings && d.warnings.length > 0) {
                const warning = d.warnings[0]; // Show only first warning

                if (warning.type === 'SUBSCRIPTION_EXPIRED') {
                    toast.warning(warning.message, {
                        position: "top-right",
                        autoClose: 8000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                    });
                } else if (warning.type === 'SUBSCRIPTION_EXPIRING_SOON') {
                    toast.info(warning.message, {
                        position: "top-right",
                        autoClose: 8000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                    });
                }
            }

            // ─── Redirect based on role ──────────────────────────
            setTimeout(() => {
                if (d.business.role === 'superadmin') {
                    window.location.href = '/admin';
                } else {
                    window.location.href = '/dashboard';
                }
            }, 1500);

        } catch (err) {
            setMsg(err.message);
            toast.error(err.message || 'Login failed. Please try again.', {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
            });
            setLoading(false);
        }
    }

    return (
        <main className="min-h-screen grid place-items-center p-6 bg-[#09090b]">
            <ToastContainer
                position="top-right"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="dark"
            />

            <form onSubmit={submit} className="card p-8 max-w-md w-full">
                <h1 className="text-3xl font-black">Business Login</h1>

                <input
                    className="input mt-6"
                    placeholder="Email"
                    value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                />

                <input
                    className="input mt-3"
                    placeholder="Password"
                    type="password"
                    value={form.password}
                    onChange={e => setForm({ ...form, password: e.target.value })}
                />

                <button
                    className="btn w-full mt-5 flex items-center justify-center gap-2"
                    type="submit"
                    disabled={loading}
                >
                    {loading ? (
                        <>
                            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                            </svg>
                            Logging in...
                        </>
                    ) : (
                        'Login'
                    )}
                </button>

                {msg && (
                    <p className="text-red-400 mt-3 text-sm bg-red-900/20 p-3 rounded-xl border border-red-800/50">
                        {msg}
                    </p>
                )}
            </form>
        </main>
    );
}