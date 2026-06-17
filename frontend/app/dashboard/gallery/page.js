'use client';

import { useState, useEffect } from 'react';
import { businessAPI, authAPI, API } from '../../../lib/api';
import {
    Plus,
    Trash2,
    Edit2,
    X,
    Image as ImageIcon,
    Video,
    Upload,
    Loader2,
    AlertCircle,
    CheckCircle,
    Eye,
    ExternalLink
} from 'lucide-react';

export default function GalleryPage() {
    const [gallery, setGallery] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [editingIndex, setEditingIndex] = useState(null);
    const [editForm, setEditForm] = useState({ title: '', type: '' });
    const [message, setMessage] = useState({ type: '', text: '' });
    const [isReadOnly, setIsReadOnly] = useState(false);
    const [me, setMe] = useState(null);
    const [uploadProgress, setUploadProgress] = useState(0);

    useEffect(() => {
        loadGallery();
        checkUserStatus();
    }, []);

    async function checkUserStatus() {
        try {
            const response = await authAPI.me();
            const meData = response.business;
            const warnings = response.warnings || [];
            setMe(meData);

            const isAccountDisabled = meData?.status === 'inactive';
            const isSubscriptionExpired = warnings.some(w => w.type === 'SUBSCRIPTION_EXPIRED');
            setIsReadOnly(isAccountDisabled || isSubscriptionExpired);
        } catch (error) {
            console.error('Error checking user status:', error);
        }
    }

    async function loadGallery() {
        setLoading(true);
        try {
            const data = await businessAPI.getProfile();
            console.log('📸 Gallery data loaded:', data?.gallery);
            setGallery(data?.gallery || []);
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to load gallery' });
        } finally {
            setLoading(false);
        }
    }

    const canEdit = me?.status === 'active' && !isReadOnly;

    // ─── Helper to get full image URL from backend ──────────────────────
    const getImageUrl = (url) => {
        if (!url) return '';
        if (url.startsWith('http')) return url;
        if (url.startsWith('/uploads')) {
            // Use the API constant from lib/api.js (points to backend)
            return `${API}${url}`;
        }
        return url;
    };

    async function handleUpload(e) {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        if (!canEdit) {
            setMessage({
                type: 'error',
                text: 'Cannot upload. Subscription expired or account disabled.'
            });
            return;
        }

        setUploading(true);
        setUploadProgress(0);
        setMessage({ type: '', text: '' });

        let successCount = 0;
        let errorCount = 0;

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            try {
                setUploadProgress(Math.round(((i + 1) / files.length) * 100));

                const type = file.type.startsWith('video/') ? 'video' : 'image';
                const title = file.name.split('.')[0] || 'Untitled';

                // ─── Use businessAPI to upload ────────────────────────────
                const result = await businessAPI.uploadGalleryImage(file, title, type);
                console.log('📸 Upload result:', result);
                successCount++;
            } catch (error) {
                console.error('Upload error:', error);
                errorCount++;
            }
        }

        setUploadProgress(100);
        setUploading(false);

        // ─── Reload gallery ──────────────────────────────────────────────
        await loadGallery();

        if (successCount > 0 && errorCount === 0) {
            setMessage({
                type: 'success',
                text: `Successfully uploaded ${successCount} file(s)`
            });
        } else if (successCount > 0 && errorCount > 0) {
            setMessage({
                type: 'warning',
                text: `Uploaded ${successCount} file(s), ${errorCount} failed`
            });
        } else {
            setMessage({
                type: 'error',
                text: 'Failed to upload files'
            });
        }
    }

    async function handleDelete(index) {
        if (!canEdit) {
            setMessage({
                type: 'error',
                text: 'Cannot delete. Subscription expired or account disabled.'
            });
            return;
        }

        if (!confirm('Are you sure you want to delete this item?')) return;

        try {
            await businessAPI.removeGalleryItem(index);
            await loadGallery();
            setMessage({ type: 'success', text: 'Item deleted successfully' });
        } catch (error) {
            setMessage({ type: 'error', text: error.message || 'Failed to delete' });
        }
    }

    function startEdit(index) {
        if (!canEdit) {
            setMessage({
                type: 'error',
                text: 'Cannot edit. Subscription expired or account disabled.'
            });
            return;
        }
        setEditingIndex(index);
        setEditForm({
            title: gallery[index]?.title || '',
            type: gallery[index]?.type || 'image',
        });
    }

    async function saveEdit(index) {
        try {
            await businessAPI.updateGalleryItem(index, {
                title: editForm.title,
                type: editForm.type,
            });
            await loadGallery();
            setEditingIndex(null);
            setMessage({ type: 'success', text: 'Item updated successfully' });
        } catch (error) {
            setMessage({ type: 'error', text: error.message || 'Failed to update' });
        }
    }

    function cancelEdit() {
        setEditingIndex(null);
        setEditForm({ title: '', type: '' });
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="flex items-center gap-3 text-zinc-400">
                    <Loader2 className="animate-spin" size={24} />
                    Loading gallery...
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto p-6">
            {/* ─── Header ──────────────────────────────────────────────────── */}
            <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-3">
                        <ImageIcon size={32} className="text-zinc-400" />
                        Gallery Management
                    </h1>
                    <p className="text-zinc-400 mt-1">
                        Manage your portfolio and sample work
                        {isReadOnly && (
                            <span className="ml-2 text-xs bg-yellow-900/30 text-yellow-400 px-3 py-1 rounded-full">
                                Read-Only
                            </span>
                        )}
                    </p>
                </div>

                {canEdit && (
                    <div>
                        <label className="btn cursor-pointer hover:bg-zinc-200 transition flex items-center gap-2">
                            <Plus size={18} />
                            Add Photos
                            <input
                                type="file"
                                multiple
                                accept="image/*,video/*"
                                className="hidden"
                                onChange={handleUpload}
                                disabled={uploading}
                            />
                        </label>
                    </div>
                )}
            </div>

            {/* ─── Message ────────────────────────────────────────────────── */}
            {message.text && (
                <div className={`p-4 rounded-xl mb-6 flex items-center gap-2 ${message.type === 'success'
                    ? 'bg-green-900/20 border border-green-800/50 text-green-400'
                    : message.type === 'warning'
                        ? 'bg-yellow-900/20 border border-yellow-800/50 text-yellow-400'
                        : 'bg-red-900/20 border border-red-800/50 text-red-400'
                    }`}>
                    {message.type === 'success' && <CheckCircle size={18} />}
                    {message.type === 'error' && <AlertCircle size={18} />}
                    {message.type === 'warning' && <AlertCircle size={18} />}
                    {message.text}
                </div>
            )}

            {/* ─── Upload Progress ───────────────────────────────────────── */}
            {uploading && (
                <div className="mb-6">
                    <div className="flex items-center justify-between text-sm text-zinc-400 mb-2">
                        <span>Uploading files...</span>
                        <span>{uploadProgress}%</span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                        <div
                            className="bg-accent h-full transition-all duration-300"
                            style={{ width: `${uploadProgress}%` }}
                        />
                    </div>
                </div>
            )}

            {/* ─── Gallery Grid ──────────────────────────────────────────── */}
            {gallery.length === 0 ? (
                <div className="card p-12 text-center">
                    <div className="flex flex-col items-center gap-4">
                        <ImageIcon size={48} className="text-zinc-600" />
                        <div>
                            <h3 className="text-lg font-semibold text-zinc-300">No gallery items yet</h3>
                            <p className="text-zinc-500 text-sm mt-1">
                                {canEdit
                                    ? 'Click "Add Photos" to upload your portfolio images.'
                                    : 'Contact your admin to add gallery items.'}
                            </p>
                        </div>
                        {canEdit && (
                            <label className="btn2 cursor-pointer hover:bg-white/10 transition flex items-center gap-2">
                                <Upload size={16} />
                                Upload your first photo
                                <input
                                    type="file"
                                    multiple
                                    accept="image/*,video/*"
                                    className="hidden"
                                    onChange={handleUpload}
                                />
                            </label>
                        )}
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {gallery.map((item, index) => (
                        <div key={index} className="card overflow-hidden group relative">
                            {/* ─── Image ───────────────────────────────────── */}
                            <div className="aspect-square overflow-hidden bg-zinc-900 relative">
                                {item.type === 'video' ? (
                                    <div className="w-full h-full flex items-center justify-center bg-zinc-800">
                                        <Video size={32} className="text-zinc-500" />
                                        <span className="absolute bottom-2 right-2 text-xs bg-black/70 px-2 py-1 rounded text-zinc-300">
                                            Video
                                        </span>
                                    </div>
                                ) : (
                                    <img
                                        src={getImageUrl(item.thumbnail || item.url)}
                                        alt={item.title || 'Gallery item'}
                                        className="w-full h-full object-cover"
                                        loading="lazy"
                                        onError={(e) => {
                                            console.error('❌ Image failed to load:', e.target.src);
                                            e.target.onerror = null;
                                            // Fallback to a data URI if image fails to load
                                            e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400"%3E%3Crect width="400" height="400" fill="%23222222"/%3E%3Ctext x="50%25" y="50%25" font-family="Arial" font-size="24" fill="%23666666" text-anchor="middle" dy=".3em"%3ENo Image%3C/text%3E%3C/svg%3E';
                                        }}
                                    />
                                )}
                            </div>

                            {/* ─── Info ────────────────────────────────────── */}
                            <div className="p-3">
                                {editingIndex === index ? (
                                    <div className="space-y-2">
                                        <input
                                            className="input text-sm"
                                            value={editForm.title}
                                            onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                                            placeholder="Title"
                                        />
                                        <select
                                            className="input text-sm"
                                            value={editForm.type}
                                            onChange={(e) => setEditForm({ ...editForm, type: e.target.value })}
                                        >
                                            <option value="image">Image</option>
                                            <option value="video">Video</option>
                                        </select>
                                        <div className="flex gap-2">
                                            <button
                                                className="btn text-sm py-1 px-3 flex-1"
                                                onClick={() => saveEdit(index)}
                                            >
                                                Save
                                            </button>
                                            <button
                                                className="btn2 text-sm py-1 px-3"
                                                onClick={cancelEdit}
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <p className="font-medium text-sm truncate">
                                            {item.title || 'Untitled'}
                                        </p>
                                        <p className="text-xs text-zinc-500 capitalize">
                                            {item.type || 'image'}
                                        </p>
                                    </>
                                )}
                            </div>

                            {/* ─── Actions ────────────────────────────────── */}
                            {!editingIndex && canEdit && (
                                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        className="bg-black/70 hover:bg-black/90 text-white p-1.5 rounded-lg transition"
                                        onClick={() => startEdit(index)}
                                        title="Edit"
                                    >
                                        <Edit2 size={14} />
                                    </button>
                                    <button
                                        className="bg-red-500/80 hover:bg-red-600 text-white p-1.5 rounded-lg transition"
                                        onClick={() => handleDelete(index)}
                                        title="Delete"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            )}

                            {/* ─── View Link ──────────────────────────────── */}
                            <a
                                href={getImageUrl(item.url)}
                                target="_blank"
                                rel="noreferrer"
                                className="absolute bottom-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/70 text-white p-1.5 rounded-lg"
                                title="View full size"
                            >
                                <ExternalLink size={14} />
                            </a>

                            {/* ─── Read-Only Overlay ──────────────────────── */}
                            {isReadOnly && (
                                <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <span className="text-white text-xs bg-black/60 px-3 py-1 rounded-full">
                                        Read-Only
                                    </span>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* ─── Gallery Stats ────────────────────────────────────────── */}
            {gallery.length > 0 && (
                <div className="mt-6 text-sm text-zinc-500">
                    Total: {gallery.length} item(s)
                </div>
            )}
        </div>
    );
}