'use client';

import { useEffect, useState } from 'react';
import { api } from '../../lib/api';

const blankBusiness = {
    name: '',
    ownerName: '',
    email: '',
    password: '',
    phone: '',
    city: '',
    whatsapp: '',
    plan: 'trial',
    trialDays: 2,
    subscriptionMonths: 1,
};

function LabeledField({ label, required, children }) {
    return (
        <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-widest text-zinc-400">
                {label}
                {required && <span className="text-red-400 ml-1">*</span>}
            </label>
            {children}
        </div>
    );
}

function StatCard({ label, value, accent }) {
    return (
        <div className="card px-5 py-4 flex flex-col gap-1">
            <span className="text-xs font-semibold uppercase tracking-widest text-zinc-500">
                {label}
            </span>
            <span className={`text-3xl font-black ${accent}`}>{value}</span>
        </div>
    );
}

export default function AdminPage() {
    const [me, setMe] = useState(null);
    const [businesses, setBusinesses] = useState([]);
    const [form, setForm] = useState(blankBusiness);
    const [msg, setMsg] = useState('');
    const [activeTab, setActiveTab] = useState('create');
    const [expiryDates, setExpiryDates] = useState({});
    const [editingPlan, setEditingPlan] = useState(null);
    const [planChanges, setPlanChanges] = useState({});

    async function load() {
        try {
            const meData = await api('/api/auth/me');

            if (meData.business.role !== 'superadmin') {
                location.href = '/dashboard';
                return;
            }

            setMe(meData.business);

            const businessData = await api('/api/admin/businesses');
            setBusinesses(businessData.businesses);
        } catch {
            location.href = '/login';
        }
    }

    useEffect(() => {
        load();
    }, []);

    async function createBusiness(e) {
        e.preventDefault();

        try {
            await api('/api/admin/businesses', {
                method: 'POST',
                body: JSON.stringify(form),
            });

            setMsg('Business created successfully');
            setForm(blankBusiness);
            load();
            setActiveTab('list');
        } catch (e) {
            setMsg(e.message);
        }
    }

    async function toggleStatus(id) {
        await api(`/api/admin/businesses/${id}/status`, { method: 'PUT' });
        load();
    }

    async function updateExpiry(id, expiryDate) {
        if (!expiryDate) return;

        await api(`/api/admin/businesses/${id}/renew`, {
            method: 'PUT',
            body: JSON.stringify({
                expiryDate,
            }),
        });

        load();
    }

    async function updatePlan(id, planData) {
        try {
            await api(`/api/admin/businesses/${id}/plan`, {
                method: 'PUT',
                body: JSON.stringify(planData),
            });

            setEditingPlan(null);
            setPlanChanges({});
            load();
            setMsg('Plan updated successfully');
        } catch (e) {
            setMsg(e.message);
        }
    }

    function startPlanEdit(business) {
        setEditingPlan(business._id);
        setPlanChanges({
            plan: business.plan,
            trialDays: business.trialDays || 2,
            subscriptionMonths: business.subscriptionMonths || 1,
        });
    }

    function cancelPlanEdit() {
        setEditingPlan(null);
        setPlanChanges({});
    }

    if (!me) {
        return (
            <main className="p-8 flex items-center gap-3 text-zinc-400">
                <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Loading admin panel…
            </main>
        );
    }

    const activeCount = businesses.filter((b) => b.status === 'active').length;
    const trialCount = businesses.filter((b) => b.plan === 'trial').length;

    return (
        <main className="max-w-7xl mx-auto p-6 space-y-6">

            {/* ── Header ── */}
            <div className="flex flex-wrap justify-between items-start gap-4">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500 mb-1">
                        Logged in as {me.email}
                    </p>
                    <h1 className="text-4xl font-black leading-tight">
                        Super Admin Panel
                    </h1>
                    <p className="text-zinc-400 mt-1">
                        Manage all subscribed studios from one place
                    </p>
                </div>

                <button
                    className="btn2"
                    onClick={() => {
                        localStorage.removeItem('token');
                        location.href = '/login';
                    }}
                >
                    Logout
                </button>
            </div>

            {/* ── Stats ── */}
            <div className="grid grid-cols-3 gap-3">
                <StatCard label="Total Studios" value={businesses.length} accent="text-white" />
                <StatCard label="Active" value={activeCount} accent="text-green-400" />
                <StatCard label="On Trial" value={trialCount} accent="text-yellow-400" />
            </div>

            {/* ── Tabs ── */}
            <div className="flex gap-3">
                <button
                    className={activeTab === 'create' ? 'btn' : 'btn2'}
                    onClick={() => { setMsg(''); setActiveTab('create'); }}
                >
                    + Create Business
                </button>

                <button
                    className={activeTab === 'list' ? 'btn' : 'btn2'}
                    onClick={() => setActiveTab('list')}
                >
                    Manage Businesses
                    {businesses.length > 0 && (
                        <span className="ml-2 bg-white/10 text-xs rounded-full px-2 py-0.5">
                            {businesses.length}
                        </span>
                    )}
                </button>
            </div>

            {/* ── Create Form ── */}
            {activeTab === 'create' && (
                <section className="card p-6">
                    <h2 className="text-2xl font-bold mb-1">Create New Business</h2>
                    <p className="text-zinc-400 text-sm mb-6">
                        Fill in the studio details. Fields marked <span className="text-red-400">*</span> are required.
                    </p>

                    <form onSubmit={createBusiness} className="space-y-6">

                        {/* Row 1 – Studio identity */}
                        <fieldset className="space-y-2">
                            <legend className="text-xs font-semibold uppercase tracking-widest text-zinc-500 mb-3">
                                Studio Identity
                            </legend>
                            <div className="grid md:grid-cols-2 gap-4">
                                <LabeledField label="Studio Name" required>
                                    <input
                                        className="input"
                                        placeholder="e.g. Sharma Photography"
                                        value={form.name}
                                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                                    />
                                </LabeledField>

                                <LabeledField label="Owner Name" required>
                                    <input
                                        className="input"
                                        placeholder="e.g. Rajesh Sharma"
                                        value={form.ownerName}
                                        onChange={(e) => setForm({ ...form, ownerName: e.target.value })}
                                    />
                                </LabeledField>

                                <LabeledField label="City">
                                    <input
                                        className="input"
                                        placeholder="e.g. Jaipur"
                                        value={form.city}
                                        onChange={(e) => setForm({ ...form, city: e.target.value })}
                                    />
                                </LabeledField>
                            </div>
                        </fieldset>

                        <hr className="border-zinc-700/60" />

                        {/* Row 2 – Login credentials */}
                        <fieldset className="space-y-2">
                            <legend className="text-xs font-semibold uppercase tracking-widest text-zinc-500 mb-3">
                                Login Credentials
                            </legend>
                            <div className="grid md:grid-cols-2 gap-4">
                                <LabeledField label="Email Address" required>
                                    <input
                                        className="input"
                                        type="email"
                                        placeholder="e.g. studio@example.com"
                                        value={form.email}
                                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                                    />
                                </LabeledField>

                                <LabeledField label="Password" required>
                                    <input
                                        className="input"
                                        type="password"
                                        placeholder="Set a strong password"
                                        value={form.password}
                                        onChange={(e) => setForm({ ...form, password: e.target.value })}
                                    />
                                </LabeledField>
                            </div>
                        </fieldset>

                        <hr className="border-zinc-700/60" />

                        {/* Row 3 – Contact */}
                        <fieldset className="space-y-2">
                            <legend className="text-xs font-semibold uppercase tracking-widest text-zinc-500 mb-3">
                                Contact Details
                            </legend>
                            <div className="grid md:grid-cols-2 gap-4">
                                <LabeledField label="Phone Number">
                                    <input
                                        className="input"
                                        placeholder="e.g. 9876543210"
                                        value={form.phone}
                                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                                    />
                                </LabeledField>

                                <LabeledField label="WhatsApp Number">
                                    <input
                                        className="input"
                                        placeholder="e.g. 9876543210 (for client chat)"
                                        value={form.whatsapp}
                                        onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
                                    />
                                </LabeledField>
                            </div>
                        </fieldset>

                        <hr className="border-zinc-700/60" />

                        {/* Row 4 – Plan */}
                        <fieldset className="space-y-2">
                            <legend className="text-xs font-semibold uppercase tracking-widest text-zinc-500 mb-3">
                                Subscription Plan
                            </legend>
                            <div className="grid md:grid-cols-2 gap-4">
                                <LabeledField label="Plan Type" required>
                                    <select
                                        className="input bg-[#1a1a1a] text-white"
                                        style={{ backgroundColor: '#1a1a1a', color: '#fafafa' }}
                                        value={form.plan}
                                        onChange={(e) => setForm({ ...form, plan: e.target.value })}
                                    >
                                        <option value="trial">Trial — limited access</option>
                                        <option value="subscription">Subscription — full access</option>
                                    </select>
                                </LabeledField>

                                {form.plan === 'trial' && (
                                    <LabeledField label="Trial Duration (days)">
                                        <input
                                            className="input"
                                            type="number"
                                            min={1}
                                            placeholder="e.g. 7"
                                            value={form.trialDays}
                                            onChange={(e) =>
                                                setForm({ ...form, trialDays: Number(e.target.value) })
                                            }
                                        />
                                    </LabeledField>
                                )}

                                {form.plan === 'subscription' && (
                                    <LabeledField label="Subscription Length (months)">
                                        <input
                                            className="input"
                                            type="number"
                                            min={1}
                                            placeholder="e.g. 6"
                                            value={form.subscriptionMonths}
                                            onChange={(e) =>
                                                setForm({ ...form, subscriptionMonths: Number(e.target.value) })
                                            }
                                        />
                                    </LabeledField>
                                )}
                            </div>
                        </fieldset>

                        <div className="pt-2">
                            <button type="submit" className="btn w-full">
                                Create Business
                            </button>
                        </div>

                        {msg && (
                            <p className={`text-sm text-center font-medium ${msg.toLowerCase().includes('success') ? 'text-green-400' : 'text-red-400'}`}>
                                {msg}
                            </p>
                        )}
                    </form>
                </section>
            )}

            {/* ── Business List ── */}
            {activeTab === 'list' && (
                <section className="space-y-4">
                    {businesses.length === 0 && (
                        <div className="card p-10 text-center text-zinc-500">
                            No businesses yet. Create one to get started.
                        </div>
                    )}

                    {businesses.map((b) => (
                        <div key={b._id} className="card p-5">
                            <div className="flex flex-wrap justify-between gap-4">

                                {/* Info */}
                                <div className="space-y-3 min-w-0">
                                    <div>
                                        <h3 className="text-xl font-bold leading-tight">{b.name}</h3>
                                        <p className="text-zinc-400 text-sm">{b.email}</p>
                                    </div>

                                    <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm">
                                        <div>
                                            <span className="text-xs uppercase tracking-widest text-zinc-500 block">Plan</span>
                                            {editingPlan === b._id ? (
                                                <div className="flex items-center gap-2">
                                                    <select
                                                        className="input !w-auto !py-1 !px-2 text-sm bg-[#1a1a1a] text-white"
                                                        style={{ backgroundColor: '#1a1a1a', color: '#fafafa' }}
                                                        value={planChanges.plan}
                                                        onChange={(e) => setPlanChanges({ ...planChanges, plan: e.target.value })}
                                                    >
                                                        <option value="trial">Trial</option>
                                                        <option value="subscription">Subscription</option>
                                                    </select>
                                                    {planChanges.plan === 'trial' && (
                                                        <div className="flex items-center gap-1">
                                                            <input
                                                                className="input !w-20 !py-1 !px-2 text-sm"
                                                                type="number"
                                                                min={1}
                                                                value={planChanges.trialDays}
                                                                onChange={(e) => setPlanChanges({ ...planChanges, trialDays: Number(e.target.value) || 0 })}
                                                            />
                                                            <span className="text-xs text-zinc-400">days</span>
                                                        </div>
                                                    )}
                                                    {planChanges.plan === 'subscription' && (
                                                        <div className="flex items-center gap-1">
                                                            <input
                                                                className="input !w-20 !py-1 !px-2 text-sm"
                                                                type="number"
                                                                min={1}
                                                                value={planChanges.subscriptionMonths}
                                                                onChange={(e) => setPlanChanges({ ...planChanges, subscriptionMonths: Number(e.target.value) || 0 })}
                                                            />
                                                            <span className="text-xs text-zinc-400">months</span>
                                                        </div>
                                                    )}
                                                </div>
                                            ) : (
                                                <span className="font-medium capitalize">{b.plan}</span>
                                            )}
                                        </div>

                                        <div>
                                            <span className="text-xs uppercase tracking-widest text-zinc-500 block">Status</span>
                                            <span className={`font-semibold ${b.status === 'active' ? 'text-green-400' : 'text-red-400'}`}>
                                                {b.status === 'active' ? '● Active' : '● Inactive'}
                                            </span>
                                        </div>

                                        <div>
                                            <span className="text-xs uppercase tracking-widest text-zinc-500 block">Expires</span>
                                            <span className="font-medium">
                                                {b.subscriptionEndDate
                                                    ? new Date(b.subscriptionEndDate).toLocaleDateString('en-IN')
                                                    : '—'}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex flex-wrap gap-2 items-start">
                                    <button
                                        className="btn2"
                                        title={b.status === 'active' ? 'Disable this studio' : 'Re-enable this studio'}
                                        onClick={() => toggleStatus(b._id)}
                                    >
                                        {b.status === 'active' ? 'Disable' : 'Enable'}
                                    </button>

                                    {editingPlan === b._id ? (
                                        <>
                                            <button
                                                className="btn"
                                                onClick={() => updatePlan(b._id, planChanges)}
                                            >
                                                Save Plan
                                            </button>
                                            <button
                                                className="btn2"
                                                onClick={cancelPlanEdit}
                                            >
                                                Cancel
                                            </button>
                                        </>
                                    ) : (
                                        <button
                                            className="btn2"
                                            onClick={() => startPlanEdit(b)}
                                        >
                                            Change Plan
                                        </button>
                                    )}

                                    <div className="flex gap-2 items-center">
                                        <input
                                            type="date"
                                            className="input !w-auto"
                                            value={
                                                expiryDates[b._id] ??
                                                (
                                                    b.subscriptionEndDate
                                                        ? new Date(b.subscriptionEndDate)
                                                            .toISOString()
                                                            .split('T')[0]
                                                        : ''
                                                )
                                            }
                                            onChange={(e) =>
                                                setExpiryDates({
                                                    ...expiryDates,
                                                    [b._id]: e.target.value,
                                                })
                                            }
                                        />

                                        <button
                                            className="btn2"
                                            onClick={() =>
                                                updateExpiry(
                                                    b._id,
                                                    expiryDates[b._id]
                                                )
                                            }
                                        >
                                            Update Expiry
                                        </button>
                                    </div>


                                </div>
                            </div>
                        </div>
                    ))}
                </section>
            )}
        </main>
    );
}