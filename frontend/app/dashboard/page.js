'use client';

import { useEffect, useState } from 'react';
import { clientsAPI, authAPI, logout } from '../../lib/api';
import {
    Plus,
    Edit,
    Trash2,
    Download,
    X,
    User,
    Calendar,
    FileText,
    DollarSign,
    Users,
    Camera,
    Video,
    Drone,
    Sparkles,
    Briefcase,
    Coffee,
    Wrench,
    Film,
    Image as ImageIcon,
    MoreHorizontal,
    TrendingUp,
    TrendingDown,
    Wallet,
    PieChart,
    ChevronDown,
    ChevronUp,
    CheckCircle,
    XCircle,
    AlertCircle,
    Building2,
} from 'lucide-react';

// ─── blank form ───────────────────────────────────────────────────────────────
const blank = {
    clientName: '',
    invoiceId: '',
    preWeddingDate: '',
    shootCharges: 0,
    amountReceived: 0,
    photographers: [],
    videographers: [],
    droneOperators: [],
    makeupArtist: '',
    makeupCharge: 0,
    makeupPaid: false,
    agentName: '',
    agentCommission: 0,
    agentPaid: false,
    food: 0,
    setup: 0,
    videoEdit: 0,
    photoEdit: 0,
    otherExpense: 0,
    notes: '',
};

// ─── section divider ──────────────────────────────────────────────────────────
function SectionTitle({ children, icon: Icon }) {
    return (
        <div className="md:col-span-2 mt-4">
            <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-500 border-b border-white/10 pb-2 flex items-center gap-2">
                {Icon && <Icon size={16} />}
                {children}
            </h3>
        </div>
    );
}

// ─── dynamic staff list ─────────────────────────────────────
function StaffList({ label, items, onChange, icon: Icon, disabled }) {
    function add() {
        if (disabled) return;
        onChange([...items, { name: '', charge: 0, paid: false }]);
    }
    function remove(i) {
        if (disabled) return;
        onChange(items.filter((_, idx) => idx !== i));
    }
    function update(i, key, value) {
        if (disabled) return;
        onChange(items.map((item, idx) => (idx === i ? { ...item, [key]: value } : item)));
    }

    return (
        <div className="md:col-span-2">
            <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-semibold text-zinc-300 flex items-center gap-2">
                    {Icon && <Icon size={16} />}
                    {label}
                </span>
                {!disabled && (
                    <button type="button" className="btn2 text-sm" style={{ padding: '6px 12px' }} onClick={add}>
                        <Plus size={14} className="inline mr-1" /> Add
                    </button>
                )}
            </div>

            {items.length === 0 ? (
                <p className="text-zinc-600 text-xs">No {label.toLowerCase()} added yet.</p>
            ) : (
                <div className="flex flex-col gap-2">
                    {items.map((item, i) => (
                        <div key={i} className="flex flex-wrap gap-2 items-center bg-white/5 rounded-xl p-3">
                            <input
                                className="input flex-1"
                                style={{ width: 'auto', minWidth: '120px' }}
                                placeholder="Name"
                                value={item.name}
                                onChange={e => update(i, 'name', e.target.value)}
                                disabled={disabled}
                            />
                            <input
                                className="input"
                                style={{ width: '120px', flexShrink: 0 }}
                                type="number"
                                placeholder="Charge ₹"
                                value={item.charge}
                                onChange={e => update(i, 'charge', Number(e.target.value || 0))}
                                disabled={disabled}
                            />
                            <label className="flex items-center gap-1.5 text-sm text-zinc-300 cursor-pointer select-none whitespace-nowrap">
                                <input
                                    type="checkbox"
                                    checked={item.paid}
                                    onChange={e => update(i, 'paid', e.target.checked)}
                                    className="w-4 h-4 accent-white"
                                    disabled={disabled}
                                />
                                Paid
                            </label>
                            {!disabled && (
                                <button
                                    type="button"
                                    className="btn2"
                                    style={{ padding: '6px 10px', flexShrink: 0 }}
                                    onClick={() => remove(i)}
                                >
                                    <X size={14} />
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

// ─── main dashboard ───────────────────────────────────────────────────────────
export default function Dashboard() {
    const [me, setMe] = useState(null);
    const [clients, setClients] = useState([]);
    const [form, setForm] = useState(blank);
    const [err, setErr] = useState('');
    const [activeTab, setActiveTab] = useState('history');
    const [editingClient, setEditingClient] = useState(null);
    const [loading, setLoading] = useState(true);
    const [downloading, setDownloading] = useState(null);
    const [expandedClient, setExpandedClient] = useState(null);
    const [isReadOnly, setIsReadOnly] = useState(false);
    const [statusMessage, setStatusMessage] = useState(null);
    const [stats, setStats] = useState({
        totalClients: 0,
        totalRevenue: 0,
        totalProfit: 0,
        pendingAmount: 0
    });
    // ─── Add this after state declarations ──────────────────────
    const canEdit = me?.status === 'active' && !isReadOnly;
    async function load() {
        setLoading(true);
        try {
            const response = await authAPI.me();
            const meData = response.business;
            const warnings = response.warnings || [];

            if (!meData) {
                location.href = '/login';
                return;
            }

            // ─── Check if account is disabled by admin ──────────
            const isAccountDisabled = meData.status === 'inactive';

            // ─── Check if subscription is expired from warnings ──
            const isSubscriptionExpired = warnings.some(w => w.type === 'SUBSCRIPTION_EXPIRED');
            const isExpiringSoon = warnings.some(w => w.type === 'SUBSCRIPTION_EXPIRING_SOON');

            // ─── Set read-only mode ──────────────────────────────
            // Read-only if subscription expired (but account is active)
            // If account is disabled, we don't set read-only - we just show error
            const readOnly = !isAccountDisabled && isSubscriptionExpired;
            setIsReadOnly(readOnly);

            // ─── Set status message ──────────────────────────────
            if (isAccountDisabled) {
                setStatusMessage({
                    type: 'error',
                    title: 'Account Disabled',
                    message: 'Your account has been disabled by admin. Please contact support.'
                });
            } else if (isSubscriptionExpired) {
                setStatusMessage({
                    type: 'warning',
                    title: 'Subscription Expired',
                    message: 'Your subscription has expired. You can view your data but cannot make changes. Please renew to continue editing.'
                });
            } else if (isExpiringSoon) {
                const expiringWarning = warnings.find(w => w.type === 'SUBSCRIPTION_EXPIRING_SOON');
                setStatusMessage({
                    type: 'info',
                    title: 'Subscription Expiring Soon',
                    message: `Your subscription will expire in ${expiringWarning?.daysLeft || 'a few'} days. Please renew to avoid interruption.`
                });
            } else {
                setStatusMessage(null);
            }

            setMe(meData);

            // ─── Load clients ─────────────────────────────────────
            const clientsData = await clientsAPI.getAll();
            setClients(clientsData);

            // ─── Calculate stats ──────────────────────────────────
            const clientList = clientsData || [];
            const totalRevenue = clientList.reduce((sum, c) => sum + (c.shootCharges || 0), 0);
            const totalProfit = clientList.reduce((sum, c) => sum + (c.profit || 0), 0);
            const pendingAmount = clientList.reduce((sum, c) => sum + (c.amountPending || 0), 0);

            setStats({
                totalClients: clientList.length,
                totalRevenue,
                totalProfit,
                pendingAmount
            });
        } catch (e) {
            console.error('Load error:', e);
            if (e.message === 'Unauthorized' || e.message === 'Not authenticated') {
                location.href = '/login';
            }
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => { load(); }, []);

    async function save(e) {
        e.preventDefault();

        // ─── Block save if account is disabled ──────────────────
        if (isReadOnly) {
            setErr('Cannot make changes. Your account is disabled.');
            return;
        }

        setErr('');
        setLoading(true);
        try {
            if (!form.clientName.trim()) {
                throw new Error('Client name is required');
            }
            if (!form.invoiceId.trim()) {
                throw new Error('Invoice ID is required');
            }
            if (!form.preWeddingDate) {
                throw new Error('Shoot date is required');
            }

            const submitData = {
                ...form,
                shootCharges: Number(form.shootCharges) || 0,
                amountReceived: Number(form.amountReceived) || 0,
                makeupCharge: Number(form.makeupCharge) || 0,
                agentCommission: Number(form.agentCommission) || 0,
                food: Number(form.food) || 0,
                setup: Number(form.setup) || 0,
                videoEdit: Number(form.videoEdit) || 0,
                photoEdit: Number(form.photoEdit) || 0,
                otherExpense: Number(form.otherExpense) || 0,
            };

            if (editingClient) {
                await clientsAPI.update(editingClient._id, submitData);
            } else {
                await clientsAPI.create(submitData);
            }
            setForm(blank);
            setEditingClient(null);
            await load();
            setActiveTab('history');
        } catch (e) {
            setErr(e.message);
        } finally {
            setLoading(false);
        }
    }

    function startEdit(client) {
        // ─── Block edit if account is disabled ──────────────────
        if (isReadOnly) {
            alert('Cannot edit. Your account is disabled.');
            return;
        }

        setEditingClient(client);
        setForm({
            clientName: client.clientName || '',
            invoiceId: client.invoiceId || '',
            preWeddingDate: client.preWeddingDate
                ? new Date(client.preWeddingDate).toISOString().split('T')[0]
                : '',
            shootCharges: Number(client.shootCharges || 0),
            amountReceived: Number(client.amountReceived || 0),
            photographers: (client.photographers || []).map(p => ({
                name: p.name || '',
                charge: Number(p.charge || 0),
                paid: Boolean(p.paid),
            })),
            videographers: (client.videographers || []).map(p => ({
                name: p.name || '',
                charge: Number(p.charge || 0),
                paid: Boolean(p.paid),
            })),
            droneOperators: (client.droneOperators || []).map(p => ({
                name: p.name || '',
                charge: Number(p.charge || 0),
                paid: Boolean(p.paid),
            })),
            makeupArtist: client.makeupArtist || '',
            makeupCharge: Number(client.makeupCharge || 0),
            makeupPaid: Boolean(client.makeupPaid),
            agentName: client.agentName || '',
            agentCommission: Number(client.agentCommission || 0),
            agentPaid: Boolean(client.agentPaid),
            food: Number(client.food || 0),
            setup: Number(client.setup || 0),
            videoEdit: Number(client.videoEdit || 0),
            photoEdit: Number(client.photoEdit || 0),
            otherExpense: Number(client.otherExpense || 0),
            notes: client.notes || '',
        });
        setActiveTab('add');
        setExpandedClient(null);
    }

    function cancelEdit() {
        setEditingClient(null);
        setForm(blank);
        setErr('');
    }

    async function deleteClient(id) {
        // ─── Block delete if account is disabled ─────────────────
        if (isReadOnly) {
            alert('Cannot delete. Your account is disabled.');
            return;
        }

        if (!confirm('Are you sure you want to delete this client?')) return;
        setLoading(true);
        try {
            await clientsAPI.delete(id);
            await load();
        } catch (e) {
            alert(e.message);
        } finally {
            setLoading(false);
        }
    }

    async function handleDownloadInvoice(clientId, invoiceId) {
        setDownloading(clientId);
        try {
            await clientsAPI.downloadInvoice(clientId, `invoice-${invoiceId}.pdf`);
        } catch (error) {
            alert(error.message || 'Failed to download invoice');
        } finally {
            setDownloading(null);
        }
    }

    function toggleExpand(clientId) {
        setExpandedClient(expandedClient === clientId ? null : clientId);
    }

    const set = (key, value) => setForm(f => ({ ...f, [key]: value }));
    const setNum = (key, value) => setForm(f => ({ ...f, [key]: Number(value || 0) }));

    if (loading && !clients.length) return <main className="p-8">Loading...</main>;
    if (!me) {
        window.location.href = '/login';
        return null;
    }

    return (
        <main className="max-w-7xl mx-auto p-6">

            {/* ── Status Banner ────────────────────────────────────────────── */}
            {statusMessage && (
                <div className={`p-4 rounded-xl mb-6 border ${statusMessage.type === 'error'
                    ? 'bg-red-900/20 border-red-800/50 text-red-300'
                    : statusMessage.type === 'warning'
                        ? 'bg-yellow-900/20 border-yellow-800/50 text-yellow-300'
                        : 'bg-blue-900/20 border-blue-800/50 text-blue-300'
                    }`}>
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                            <strong>{statusMessage.title}</strong>
                            <span className="ml-2 text-sm">{statusMessage.message}</span>
                        </div>
                        {(statusMessage.type === 'warning' || statusMessage.type === 'info') && (
                            <button
                                className="btn text-sm py-1 px-4"
                                onClick={() => window.location.href = '/renew'}
                            >
                                Renew Now
                            </button>
                        )}
                        {statusMessage.type === 'error' && (
                            <button
                                className="btn2 text-sm py-1 px-4"
                                onClick={() => window.location.href = '/contact-support'}
                            >
                                Contact Support
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* ── Header ─────────────────────────────────────────────────────── */}
            <div className="flex flex-wrap justify-between gap-4 items-center">
                <div>
                    <h1 className="text-4xl font-black flex items-center gap-3">
                        <Building2 size={32} className="text-zinc-400" />
                        {me.name} Admin
                    </h1>
                    <p className="text-zinc-300 mt-2">
                        Public page:{' '}
                        <a className="underline hover:text-white" href={`/studio/${me.slug}`}>
                            /studio/{me.slug}
                        </a>
                    </p>
                    {isReadOnly && (
                        <p className="text-red-400 text-sm mt-1 flex items-center gap-2">
                            <AlertCircle size={14} />
                            Account Disabled - Read-Only Mode
                        </p>
                    )}
                </div>
                <div className="flex gap-3">
                    <button
                        className="btn2 hover:bg-white/10 transition flex items-center gap-2"
                        onClick={() => { location.href = '/dashboard/gallery'; }}
                    >
                        <ImageIcon size={16} />
                        Gallery
                    </button>
                    <button
                        className="btn2 hover:bg-white/10 transition flex items-center gap-2"
                        onClick={() => { location.href = '/dashboard/profile'; }}
                    >
                        <User size={16} />
                        Profile
                    </button>
                    <button
                        className="btn2 bg-red-800 hover:bg-red-600 transition flex items-center gap-2"
                        onClick={logout}
                    >
                        Logout
                    </button>
                </div>
            </div>

            {/* ── Stats Cards ────────────────────────────────────────────────── */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
                <div className="card p-4">
                    <p className="text-zinc-400 text-xs uppercase tracking-wider flex items-center gap-2">
                        <Users size={14} /> Total Clients
                    </p>
                    <p className="text-2xl font-bold mt-1">{stats.totalClients}</p>
                </div>
                <div className="card p-4">
                    <p className="text-zinc-400 text-xs uppercase tracking-wider flex items-center gap-2">
                        <Wallet size={14} /> Total Revenue
                    </p>
                    <p className="text-2xl font-bold mt-1">₹{stats.totalRevenue.toLocaleString('en-IN')}</p>
                </div>
                <div className="card p-4">
                    <p className="text-zinc-400 text-xs uppercase tracking-wider flex items-center gap-2">
                        {stats.totalProfit >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                        Total Profit
                    </p>
                    <p className={`text-2xl font-bold mt-1 ${stats.totalProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        ₹{stats.totalProfit.toLocaleString('en-IN')}
                    </p>
                </div>
                <div className="card p-4">
                    <p className="text-zinc-400 text-xs uppercase tracking-wider flex items-center gap-2">
                        <AlertCircle size={14} /> Pending Amount
                    </p>
                    <p className="text-2xl font-bold mt-1 text-yellow-400">₹{stats.pendingAmount.toLocaleString('en-IN')}</p>
                </div>
            </div>

            {/* ── Tabs ────────────────────────────────────────────────────────── */}
            <div className="flex gap-3 mt-8">
                <button
                    onClick={() => {
                        if (isReadOnly) {
                            alert('Cannot add/edit. Your account is disabled.');
                            return;
                        }
                        setActiveTab('add');
                        cancelEdit();
                        setExpandedClient(null);
                    }}
                    className={`${activeTab === 'add' ? 'btn' : 'btn2'} flex items-center gap-2 ${isReadOnly ? 'opacity-50 cursor-not-allowed' : ''}`}
                    disabled={isReadOnly}
                >
                    <Plus size={16} />
                    {editingClient ? 'Edit Client' : 'Add New Client'}
                </button>
                <button
                    onClick={() => setActiveTab('history')}
                    className={`${activeTab === 'history' ? 'btn' : 'btn2'} flex items-center gap-2`}
                >
                    <FileText size={16} />
                    View Client History
                </button>
            </div>

            {/* ── Add / Edit Form ─────────────────────────────────────────────── */}
            {activeTab === 'add' && (
                <section className="card p-6 mt-6">
                    <h2 className="text-2xl font-bold mb-1 flex items-center gap-2">
                        {editingClient ? <Edit size={24} /> : <Plus size={24} />}
                        {editingClient ? 'Edit Client Work' : 'Add Client Work'}
                    </h2>
                    <p className="text-zinc-400 mb-6">
                        {editingClient
                            ? 'Update this client record and save changes.'
                            : 'Fill all client, shoot, payment and expense details here.'}
                    </p>

                    {isReadOnly && (
                        <div className="mb-4 p-3 rounded-xl bg-red-900/20 border border-red-800/50 text-red-300 text-sm flex items-center gap-2">
                            <AlertCircle size={16} />
                            Account Disabled: You cannot make changes. Please contact support.
                        </div>
                    )}

                    <form onSubmit={save} className="grid md:grid-cols-2 gap-5">

                        <SectionTitle icon={User}>Basic Info</SectionTitle>

                        <div>
                            <label className="block mb-2 text-sm font-semibold text-zinc-300 flex items-center gap-2">
                                <User size={14} /> Client Name *
                            </label>
                            <input
                                className="input"
                                placeholder="Enter bride/groom or client name"
                                value={form.clientName}
                                onChange={e => set('clientName', e.target.value)}
                                disabled={isReadOnly}
                                required
                            />
                        </div>

                        <div>
                            <label className="block mb-2 text-sm font-semibold text-zinc-300 flex items-center gap-2">
                                <FileText size={14} /> Invoice ID *
                            </label>
                            <input
                                className="input"
                                placeholder="Example: INV-001"
                                value={form.invoiceId}
                                onChange={e => set('invoiceId', e.target.value)}
                                disabled={isReadOnly}
                                required
                            />
                        </div>

                        <div>
                            <label className="block mb-2 text-sm font-semibold text-zinc-300 flex items-center gap-2">
                                <Calendar size={14} /> Date of Shoot *
                            </label>
                            <input
                                className="input"
                                type="date"
                                value={form.preWeddingDate}
                                onChange={e => set('preWeddingDate', e.target.value)}
                                disabled={isReadOnly}
                                required
                            />
                        </div>

                        <SectionTitle icon={DollarSign}>Payment</SectionTitle>

                        {[
                            { key: 'shootCharges', label: 'Shoot Charges' },
                            { key: 'amountReceived', label: 'Total Amount Received' },
                        ].map(f => (
                            <div key={f.key}>
                                <label className="block mb-2 text-sm font-semibold text-zinc-300">{f.label}</label>
                                <input
                                    className="input"
                                    type="number"
                                    placeholder={`Enter ${f.label.toLowerCase()}`}
                                    value={form[f.key] || ''}
                                    onChange={e => setNum(f.key, e.target.value)}
                                    disabled={isReadOnly}
                                />
                            </div>
                        ))}

                        <SectionTitle icon={Users}>Team</SectionTitle>

                        <StaffList
                            label="Photographers"
                            icon={Camera}
                            items={form.photographers}
                            onChange={val => set('photographers', val)}
                            disabled={isReadOnly}
                        />
                        <StaffList
                            label="Videographers"
                            icon={Video}
                            items={form.videographers}
                            onChange={val => set('videographers', val)}
                            disabled={isReadOnly}
                        />
                        <StaffList
                            label="Drone Operators"
                            icon={Drone}
                            items={form.droneOperators}
                            onChange={val => set('droneOperators', val)}
                            disabled={isReadOnly}
                        />

                        <SectionTitle icon={Sparkles}>Makeup</SectionTitle>

                        <div>
                            <label className="block mb-2 text-sm font-semibold text-zinc-300">Makeup Artist</label>
                            <input
                                className="input"
                                placeholder="Enter makeup artist name"
                                value={form.makeupArtist}
                                onChange={e => set('makeupArtist', e.target.value)}
                                disabled={isReadOnly}
                            />
                        </div>

                        <div>
                            <label className="block mb-2 text-sm font-semibold text-zinc-300">Makeup Charge</label>
                            <input
                                className="input"
                                type="number"
                                placeholder="Enter makeup charge"
                                value={form.makeupCharge || ''}
                                onChange={e => setNum('makeupCharge', e.target.value)}
                                disabled={isReadOnly}
                            />
                        </div>

                        <label className="flex items-center gap-2 text-sm font-semibold text-zinc-300 cursor-pointer select-none">
                            <input
                                type="checkbox"
                                checked={form.makeupPaid}
                                onChange={e => set('makeupPaid', e.target.checked)}
                                className="w-4 h-4 accent-white"
                                disabled={isReadOnly}
                            />
                            Makeup Paid
                        </label>

                        <SectionTitle icon={Briefcase}>Agent</SectionTitle>

                        <div>
                            <label className="block mb-2 text-sm font-semibold text-zinc-300">Agent Name</label>
                            <input
                                className="input"
                                placeholder="Enter agent name"
                                value={form.agentName}
                                onChange={e => set('agentName', e.target.value)}
                                disabled={isReadOnly}
                            />
                        </div>

                        <div>
                            <label className="block mb-2 text-sm font-semibold text-zinc-300">Agent Commission</label>
                            <input
                                className="input"
                                type="number"
                                placeholder="Enter commission amount"
                                value={form.agentCommission || ''}
                                onChange={e => setNum('agentCommission', e.target.value)}
                                disabled={isReadOnly}
                            />
                        </div>

                        <label className="flex items-center gap-2 text-sm font-semibold text-zinc-300 cursor-pointer select-none">
                            <input
                                type="checkbox"
                                checked={form.agentPaid}
                                onChange={e => set('agentPaid', e.target.checked)}
                                className="w-4 h-4 accent-white"
                                disabled={isReadOnly}
                            />
                            Agent Paid
                        </label>

                        <SectionTitle icon={PieChart}>Other Expenses</SectionTitle>

                        {[
                            { key: 'food', label: 'Food Expense', icon: Coffee },
                            { key: 'setup', label: 'Setup Expense', icon: Wrench },
                            { key: 'videoEdit', label: 'Video Editing', icon: Film },
                            { key: 'photoEdit', label: 'Photo Editing', icon: ImageIcon },
                            { key: 'otherExpense', label: 'Other Expense', icon: MoreHorizontal },
                        ].map(f => (
                            <div key={f.key}>
                                <label className="block mb-2 text-sm font-semibold text-zinc-300 flex items-center gap-2">
                                    {f.icon && <f.icon size={14} />} {f.label}
                                </label>
                                <input
                                    className="input"
                                    type="number"
                                    placeholder={`Enter ${f.label.toLowerCase()}`}
                                    value={form[f.key] || ''}
                                    onChange={e => setNum(f.key, e.target.value)}
                                    disabled={isReadOnly}
                                />
                            </div>
                        ))}

                        <div className="md:col-span-2">
                            <label className="block mb-2 text-sm font-semibold text-zinc-300">Notes</label>
                            <textarea
                                className="input min-h-28"
                                placeholder="Enter any extra notes about this client or shoot"
                                value={form.notes}
                                onChange={e => set('notes', e.target.value)}
                                disabled={isReadOnly}
                            />
                        </div>

                        {err && <p className="md:col-span-2 text-red-400 bg-red-900/20 p-3 rounded-xl border border-red-800/50">{err}</p>}

                        <div className="md:col-span-2 flex gap-3">
                            <button
                                className={`btn flex-1 hover:bg-zinc-200 transition flex items-center justify-center gap-2 ${isReadOnly ? 'opacity-50 cursor-not-allowed' : ''}`}
                                type="submit"
                                disabled={loading || isReadOnly}
                            >
                                {loading ? 'Saving...' : editingClient ? <><Edit size={16} /> Update Client</> : <><Plus size={16} /> Save Client</>}
                            </button>
                            {editingClient && (
                                <button type="button" className="btn2 flex-1 hover:bg-white/10 transition flex items-center justify-center gap-2" onClick={cancelEdit}>
                                    <X size={16} /> Cancel Edit
                                </button>
                            )}
                        </div>
                    </form>
                </section>
            )}

            {/* ── History ─────────────────────────────────────────────────────── */}
            {activeTab === 'history' && (
                <section className="mt-6">
                    <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                        <FileText size={24} />
                        All Clients / Past Work
                        <span className="text-zinc-400 text-sm font-normal ml-2">
                            ({clients.length} records)
                        </span>
                        {isReadOnly && (
                            <span className="text-xs bg-red-900/30 text-red-400 px-3 py-1 rounded-full ml-2">
                                Read-Only
                            </span>
                        )}
                    </h2>

                    {clients.length === 0 ? (
                        <div className="card p-6 text-zinc-400">No client records found yet.</div>
                    ) : (
                        <div className="grid gap-4">
                            {clients.map(c => {
                                const isExpanded = expandedClient === c._id;
                                const teamLines = [
                                    ...(c.photographers || []).map(p => `📷 ${p.name}${p.paid ? '' : ' (unpaid)'}`),
                                    ...(c.videographers || []).map(p => `🎬 ${p.name}${p.paid ? '' : ' (unpaid)'}`),
                                    ...(c.droneOperators || []).map(p => `🚁 ${p.name}${p.paid ? '' : ' (unpaid)'}`),
                                ];

                                return (
                                    <div key={c._id} className="card p-5 hover:border-white/30 transition">
                                        <div className="flex flex-wrap justify-between gap-4">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-3">
                                                    <h3 className="text-2xl font-bold">{c.clientName}</h3>
                                                    <span className="text-xs bg-white/10 px-3 py-1 rounded-full text-zinc-400">
                                                        #{c.invoiceId}
                                                    </span>
                                                </div>
                                                <p className="text-zinc-400 mt-1 flex items-center gap-2">
                                                    <Calendar size={14} />
                                                    {c.preWeddingDate
                                                        ? new Date(c.preWeddingDate).toLocaleDateString('en-IN', {
                                                            day: 'numeric',
                                                            month: 'short',
                                                            year: 'numeric'
                                                        })
                                                        : 'No date'}
                                                </p>

                                                {/* ── Financial summary ── */}
                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
                                                    <div className="bg-white/5 rounded-xl p-3">
                                                        <p className="text-zinc-400 text-xs mb-1 flex items-center gap-1">
                                                            <DollarSign size={12} /> Shoot Charges
                                                        </p>
                                                        <p className="font-bold text-lg">
                                                            ₹{Number(c.shootCharges || 0).toLocaleString('en-IN')}
                                                        </p>
                                                    </div>
                                                    <div className="bg-white/5 rounded-xl p-3">
                                                        <p className="text-zinc-400 text-xs mb-1 flex items-center gap-1">
                                                            <CheckCircle size={12} /> Received
                                                        </p>
                                                        <p className="font-bold text-lg text-green-400">
                                                            ₹{Number(c.amountReceived || 0).toLocaleString('en-IN')}
                                                        </p>
                                                    </div>
                                                    <div className="bg-white/5 rounded-xl p-3">
                                                        <p className="text-zinc-400 text-xs mb-1 flex items-center gap-1">
                                                            <AlertCircle size={12} /> Pending
                                                        </p>
                                                        <p className={`font-bold text-lg ${Number(c.amountPending || 0) > 0 ? 'text-yellow-400' : 'text-green-400'}`}>
                                                            ₹{Number(c.amountPending || 0).toLocaleString('en-IN')}
                                                        </p>
                                                    </div>
                                                    <div className="bg-white/5 rounded-xl p-3">
                                                        <p className="text-zinc-400 text-xs mb-1 flex items-center gap-1">
                                                            {Number(c.profit) >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                                                            Net Profit
                                                        </p>
                                                        <p className={`font-bold text-lg ${Number(c.profit) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                                            ₹{Number(c.profit || 0).toLocaleString('en-IN')}
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* ── Expand/Collapse Button ── */}
                                                <button
                                                    onClick={() => toggleExpand(c._id)}
                                                    className="mt-3 text-sm text-zinc-400 hover:text-white transition flex items-center gap-1"
                                                >
                                                    {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                                    {isExpanded ? 'Show Less' : 'Show More Details'}
                                                </button>

                                                {/* ── Expanded Details ── */}
                                                {isExpanded && (
                                                    <div className="mt-4 space-y-4 border-t border-white/10 pt-4">
                                                        {/* Team */}
                                                        {teamLines.length > 0 && (
                                                            <div>
                                                                <h4 className="text-sm font-semibold text-zinc-300 mb-2 flex items-center gap-2">
                                                                    <Users size={14} /> Team Members
                                                                </h4>
                                                                <div className="flex flex-wrap gap-2">
                                                                    {teamLines.map((line, idx) => (
                                                                        <span key={idx} className="text-xs bg-white/5 px-3 py-1 rounded-full text-zinc-300">
                                                                            {line}
                                                                        </span>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}

                                                        {/* Makeup & Agent */}
                                                        {(c.makeupArtist || c.agentName) && (
                                                            <div>
                                                                <h4 className="text-sm font-semibold text-zinc-300 mb-2 flex items-center gap-2">
                                                                    <Briefcase size={14} /> Additional Details
                                                                </h4>
                                                                <div className="flex flex-wrap gap-3">
                                                                    {c.makeupArtist && (
                                                                        <span className="text-sm text-zinc-300 flex items-center gap-1">
                                                                            <Sparkles size={14} /> {c.makeupArtist}
                                                                            {c.makeupPaid ? <CheckCircle size={14} className="text-green-400" /> : <XCircle size={14} className="text-red-400" />}
                                                                        </span>
                                                                    )}
                                                                    {c.agentName && (
                                                                        <span className="text-sm text-zinc-300 flex items-center gap-1">
                                                                            <Briefcase size={14} /> {c.agentName}
                                                                            {c.agentPaid ? <CheckCircle size={14} className="text-green-400" /> : <XCircle size={14} className="text-red-400" />}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        )}

                                                        {/* Expenses Breakdown */}
                                                        <div>
                                                            <h4 className="text-sm font-semibold text-zinc-300 mb-2 flex items-center gap-2">
                                                                <PieChart size={14} /> Expenses Breakdown
                                                            </h4>
                                                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                                                {c.food > 0 && <span className="text-xs bg-white/5 px-3 py-1 rounded-full">🍽️ Food: ₹{c.food}</span>}
                                                                {c.setup > 0 && <span className="text-xs bg-white/5 px-3 py-1 rounded-full">🔧 Setup: ₹{c.setup}</span>}
                                                                {c.videoEdit > 0 && <span className="text-xs bg-white/5 px-3 py-1 rounded-full">🎬 Video Edit: ₹{c.videoEdit}</span>}
                                                                {c.photoEdit > 0 && <span className="text-xs bg-white/5 px-3 py-1 rounded-full">🖼️ Photo Edit: ₹{c.photoEdit}</span>}
                                                                {c.otherExpense > 0 && <span className="text-xs bg-white/5 px-3 py-1 rounded-full">📋 Other: ₹{c.otherExpense}</span>}
                                                            </div>
                                                            <p className="text-xs text-zinc-500 mt-2">
                                                                Total Expenses: ₹{Number(c.totalExpenses || 0).toLocaleString('en-IN')}
                                                            </p>
                                                        </div>

                                                        {/* Notes */}
                                                        {c.notes && (
                                                            <div>
                                                                <h4 className="text-sm font-semibold text-zinc-300 mb-1">📝 Notes</h4>
                                                                <p className="text-sm text-zinc-400">{c.notes}</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex flex-wrap gap-3 h-fit">
                                                <button
                                                    className={`btn2 hover:bg-white/10 transition flex items-center gap-2 ${!canEdit ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                    onClick={() => startEdit(c)}
                                                    disabled={!canEdit}
                                                    title={!canEdit ? (me?.status === 'inactive' ? 'Account disabled' : 'Subscription expired - please renew') : ''}
                                                >
                                                    <Edit size={16} /> Edit
                                                </button>
                                                <button
                                                    className={`btn2 hover:bg-red-900/30 border-red-800/30 transition flex items-center gap-2 ${!canEdit ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                    onClick={() => deleteClient(c._id)}
                                                    disabled={!canEdit}
                                                    title={!canEdit ? (me?.status === 'inactive' ? 'Account disabled' : 'Subscription expired - please renew') : ''}
                                                >
                                                    <Trash2 size={16} /> Delete
                                                </button>
                                                <button
                                                    className={`btn hover:bg-zinc-200 transition flex items-center gap-2 ${downloading === c._id ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                    onClick={() => handleDownloadInvoice(c._id, c.invoiceId)}
                                                    disabled={downloading === c._id}
                                                >
                                                    {downloading === c._id ? (
                                                        '⏳ Generating...'
                                                    ) : (
                                                        <>
                                                            <Download size={16} /> Invoice PDF
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </section>
            )}
        </main>
    );
}