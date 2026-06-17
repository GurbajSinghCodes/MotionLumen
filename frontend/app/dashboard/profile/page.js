'use client';

import { useState, useEffect } from 'react';
import { businessAPI, API, logout } from '../../../lib/api';

export default function BusinessProfile() {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [isEditing, setIsEditing] = useState(false);
    const [logoError, setLogoError] = useState(false);

    useEffect(() => {
        loadProfile();
    }, []);

    async function loadProfile() {
        try {
            const data = await businessAPI.getProfile();
            setProfile(data);
            setLogoError(false);
        } catch (err) {
            setMessage({ type: 'error', text: err.message || 'Failed to load profile' });
        } finally {
            setLoading(false);
        }
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setSaving(true);
        setMessage({ type: '', text: '' });

        try {
            const updated = await businessAPI.updateProfile({
                name: profile.name,
                ownerName: profile.ownerName,
                phone: profile.phone,
                contactEmail: profile.contactEmail,
                address: profile.address,
                gstNumber: profile.gstNumber,
                invoiceFooter: profile.invoiceFooter,
                instagram: profile.instagram,
                whatsapp: profile.whatsapp,
                headline: profile.headline,
                about: profile.about,
            });
            setProfile(updated);
            setIsEditing(false);
            setMessage({ type: 'success', text: 'Profile updated successfully!' });
        } catch (err) {
            setMessage({ type: 'error', text: err.message || 'Failed to update profile' });
        } finally {
            setSaving(false);
        }
    }

    async function handleLogoUpload(e) {
        const file = e.target.files[0];
        if (!file) return;

        try {
            const result = await businessAPI.uploadLogo(file);
            setProfile({ ...profile, logoUrl: result.logoUrl });
            setLogoError(false);
            setMessage({ type: 'success', text: 'Logo uploaded successfully!' });
        } catch (err) {
            setMessage({ type: 'error', text: err.message });
        }
    }

    async function handleDeleteLogo() {
        if (!confirm('Are you sure you want to delete the logo?')) return;

        try {
            await businessAPI.deleteLogo();
            setProfile({ ...profile, logoUrl: '' });
            setLogoError(false);
            setMessage({ type: 'success', text: 'Logo deleted successfully!' });
        } catch (err) {
            setMessage({ type: 'error', text: err.message });
        }
    }

    function handleChange(e) {
        const { name, value } = e.target;
        setProfile({ ...profile, [name]: value });
    }

    function handleAddressChange(e) {
        const { name, value } = e.target;
        setProfile({
            ...profile,
            address: { ...profile.address, [name]: value }
        });
    }

    // Helper function to get full image URL
    function getLogoUrl() {
        if (!profile?.logoUrl) return null;
        if (profile.logoUrl.startsWith('http')) {
            return profile.logoUrl;
        }
        return `${API}${profile.logoUrl}`;
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-zinc-400">Loading profile...</div>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="text-center py-12">
                <p className="text-zinc-400">No profile found</p>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-6">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold">Business Profile</h1>
                    <p className="text-zinc-400 mt-1">Manage your business information</p>
                </div>
                <div className="flex gap-3">
                    {!isEditing ? (
                        <button
                            className="btn"
                            onClick={() => setIsEditing(true)}
                        >
                            Edit Profile
                        </button>
                    ) : (
                        <button
                            className="btn2"
                            onClick={() => {
                                setIsEditing(false);
                                loadProfile();
                            }}
                        >
                            Cancel
                        </button>
                    )}
                    <button
                        className="btn2 bg-red-800 hover:bg-red-600 transition"
                        onClick={logout}
                    >
                        Logout
                    </button>
                </div>
            </div>

            {/* Message */}
            {message.text && (
                <div className={`p-4 rounded-xl mb-6 ${message.type === 'success'
                    ? 'bg-green-900/20 text-green-400 border border-green-800/50'
                    : 'bg-red-900/20 text-red-400 border border-red-800/50'
                    }`}>
                    {message.text}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Logo Section */}
                <div className="card p-6">
                    <h2 className="text-xl font-bold mb-4">Logo</h2>
                    <div className="flex items-center gap-6">
                        {profile.logoUrl ? (
                            <div className="relative">
                                <img
                                    src={getLogoUrl()}
                                    alt="Business Logo"
                                    className="w-24 h-24 object-cover rounded-lg border border-white/10"
                                    onError={(e) => {
                                        console.error('Failed to load logo:', getLogoUrl());
                                        setLogoError(true);
                                        e.target.onerror = null;
                                        e.target.src = '/placeholder-logo.png';
                                    }}
                                />
                                {isEditing && (
                                    <button
                                        type="button"
                                        onClick={handleDeleteLogo}
                                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600 transition"
                                    >
                                        ✕
                                    </button>
                                )}
                            </div>
                        ) : (
                            <div className="w-24 h-24 bg-white/5 rounded-lg border-2 border-dashed border-white/10 flex items-center justify-center text-zinc-500 text-sm">
                                {logoError ? 'Error loading' : 'No logo'}
                            </div>
                        )}
                        {isEditing && (
                            <div>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleLogoUpload}
                                    className="hidden"
                                    id="logo-upload"
                                />
                                <label
                                    htmlFor="logo-upload"
                                    className="btn2 cursor-pointer inline-block hover:bg-white/10 transition"
                                >
                                    {profile.logoUrl ? 'Change Logo' : 'Upload Logo'}
                                </label>
                                <p className="text-xs text-zinc-500 mt-1">Max 5MB • JPG, PNG, GIF, WEBP</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Basic Information */}
                <div className="card p-6">
                    <h2 className="text-xl font-bold mb-4">Basic Information</h2>
                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <label className="block mb-2 text-sm font-semibold text-zinc-300">
                                Business Name *
                            </label>
                            <input
                                className="input"
                                name="name"
                                value={profile.name || ''}
                                onChange={handleChange}
                                disabled={!isEditing}
                                required
                            />
                        </div>
                        <div>
                            <label className="block mb-2 text-sm font-semibold text-zinc-300">
                                Owner Name
                            </label>
                            <input
                                className="input"
                                name="ownerName"
                                value={profile.ownerName || ''}
                                onChange={handleChange}
                                disabled={!isEditing}
                            />
                        </div>
                        <div>
                            <label className="block mb-2 text-sm font-semibold text-zinc-300">
                                Phone
                            </label>
                            <input
                                className="input"
                                name="phone"
                                value={profile.phone || ''}
                                onChange={handleChange}
                                disabled={!isEditing}
                            />
                        </div>
                        <div>
                            <label className="block mb-2 text-sm font-semibold text-zinc-300">
                                Contact Email (for enquiries)
                            </label>
                            <input
                                className="input"
                                type="email"
                                name="contactEmail"
                                value={profile.contactEmail || ''}
                                onChange={handleChange}
                                disabled={!isEditing}
                            />
                            <p className="text-xs text-zinc-500 mt-1">
                                This email appears on invoices for client enquiries
                            </p>
                        </div>
                        <div>
                            <label className="block mb-2 text-sm font-semibold text-zinc-300">
                                Registration Email
                            </label>
                            <input
                                className="input opacity-60"
                                value={profile.email || ''}
                                disabled
                            />
                            <p className="text-xs text-zinc-500 mt-1">
                                Used for login (cannot be changed here)
                            </p>
                        </div>
                    </div>
                </div>

                {/* Address */}
                <div className="card p-6">
                    <h2 className="text-xl font-bold mb-4">Business Address</h2>
                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                            <label className="block mb-2 text-sm font-semibold text-zinc-300">
                                Street Address
                            </label>
                            <input
                                className="input"
                                name="street"
                                value={profile.address?.street || ''}
                                onChange={handleAddressChange}
                                disabled={!isEditing}
                            />
                        </div>
                        <div>
                            <label className="block mb-2 text-sm font-semibold text-zinc-300">
                                City
                            </label>
                            <input
                                className="input"
                                name="city"
                                value={profile.address?.city || ''}
                                onChange={handleAddressChange}
                                disabled={!isEditing}
                            />
                        </div>
                        <div>
                            <label className="block mb-2 text-sm font-semibold text-zinc-300">
                                State
                            </label>
                            <input
                                className="input"
                                name="state"
                                value={profile.address?.state || ''}
                                onChange={handleAddressChange}
                                disabled={!isEditing}
                            />
                        </div>
                        <div>
                            <label className="block mb-2 text-sm font-semibold text-zinc-300">
                                Pincode
                            </label>
                            <input
                                className="input"
                                name="pincode"
                                value={profile.address?.pincode || ''}
                                onChange={handleAddressChange}
                                disabled={!isEditing}
                            />
                        </div>
                        <div>
                            <label className="block mb-2 text-sm font-semibold text-zinc-300">
                                Country
                            </label>
                            <input
                                className="input"
                                name="country"
                                value={profile.address?.country || 'India'}
                                onChange={handleAddressChange}
                                disabled={!isEditing}
                            />
                        </div>
                    </div>
                </div>

                {/* Business Details */}
                <div className="card p-6">
                    <h2 className="text-xl font-bold mb-4">Business Details</h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block mb-2 text-sm font-semibold text-zinc-300">
                                GST Number
                            </label>
                            <input
                                className="input"
                                name="gstNumber"
                                value={profile.gstNumber || ''}
                                onChange={handleChange}
                                disabled={!isEditing}
                            />
                        </div>
                        <div>
                            <label className="block mb-2 text-sm font-semibold text-zinc-300">
                                Invoice Footer Text
                            </label>
                            <input
                                className="input"
                                name="invoiceFooter"
                                value={profile.invoiceFooter || ''}
                                onChange={handleChange}
                                disabled={!isEditing}
                                placeholder="Thank you for your business!"
                            />
                            <p className="text-xs text-zinc-500 mt-1">
                                This text appears at the bottom of all invoices
                            </p>
                        </div>
                    </div>
                </div>

                {/* Social Media */}
                <div className="card p-6">
                    <h2 className="text-xl font-bold mb-4">Social Media</h2>
                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <label className="block mb-2 text-sm font-semibold text-zinc-300">
                                Instagram
                            </label>
                            <input
                                className="input"
                                name="instagram"
                                value={profile.instagram || ''}
                                onChange={handleChange}
                                disabled={!isEditing}
                                placeholder="@username"
                            />
                        </div>
                        <div>
                            <label className="block mb-2 text-sm font-semibold text-zinc-300">
                                WhatsApp
                            </label>
                            <input
                                className="input"
                                name="whatsapp"
                                value={profile.whatsapp || ''}
                                onChange={handleChange}
                                disabled={!isEditing}
                                placeholder="Phone number with country code"
                            />
                        </div>
                    </div>
                </div>

                {/* About */}
                <div className="card p-6">
                    <h2 className="text-xl font-bold mb-4">About Your Studio</h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block mb-2 text-sm font-semibold text-zinc-300">
                                Headline
                            </label>
                            <input
                                className="input"
                                name="headline"
                                value={profile.headline || ''}
                                onChange={handleChange}
                                disabled={!isEditing}
                                placeholder="Premium pre-wedding photography and films"
                            />
                        </div>
                        <div>
                            <label className="block mb-2 text-sm font-semibold text-zinc-300">
                                About
                            </label>
                            <textarea
                                className="input min-h-32"
                                name="about"
                                value={profile.about || ''}
                                onChange={handleChange}
                                disabled={!isEditing}
                                placeholder="Tell clients about your studio..."
                            />
                        </div>
                    </div>
                </div>

                {/* Subscription Info (Read Only) */}
                <div className="card p-6 bg-white/5">
                    <h2 className="text-xl font-bold mb-4">Subscription Information</h2>
                    <div className="grid md:grid-cols-3 gap-4">
                        <div>
                            <p className="text-sm text-zinc-400">Plan</p>
                            <p className="font-semibold capitalize">{profile.plan || 'N/A'}</p>
                        </div>
                        <div>
                            <p className="text-sm text-zinc-400">Status</p>
                            <p className={`font-semibold ${profile.status === 'active' ? 'text-green-400' : 'text-red-400'}`}>
                                {profile.status || 'N/A'}
                            </p>
                        </div>
                        {profile.subscriptionEndDate && (
                            <div>
                                <p className="text-sm text-zinc-400">Subscription Ends</p>
                                <p className="font-semibold">
                                    {new Date(profile.subscriptionEndDate).toLocaleDateString('en-IN', {
                                        day: 'numeric',
                                        month: 'short',
                                        year: 'numeric'
                                    })}
                                </p>
                            </div>
                        )}
                    </div>
                    <p className="text-xs text-zinc-500 mt-4">
                        For subscription changes, please contact support.
                    </p>
                </div>

                {/* Save Button */}
                {isEditing && (
                    <div className="flex gap-3">
                        <button
                            type="submit"
                            className="btn flex-1"
                            disabled={saving}
                        >
                            {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                        <button
                            type="button"
                            className="btn2 flex-1"
                            onClick={() => {
                                setIsEditing(false);
                                loadProfile();
                            }}
                        >
                            Cancel
                        </button>
                    </div>
                )}
            </form>
        </div>
    );
}