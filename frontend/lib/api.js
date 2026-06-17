export const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// ─── Token Helpers ──────────────────────────────────────────────
export function token() {
    if (typeof window === 'undefined') return '';
    return localStorage.getItem('token') || '';
}

export const isAuthenticated = () => !!token();

export const logout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
};

// ─── Base API Request ──────────────────────────────────────────
export async function api(path, opts = {}) {
    const res = await fetch(`${API}${path}`, {
        ...opts,
        headers: {
            'Content-Type': 'application/json',
            ...(opts.headers || {}),
            ...(token() ? { Authorization: `Bearer ${token()}` } : {})
        }
    });
    const data = await res.json().catch(() => ({}));

    // ✅ For auth/me, always return data even with warnings
    if (path === '/api/auth/me') {
        // Always return the data, even if status is not OK
        // The frontend will handle warnings
        return data;
    }

    // For all other endpoints, throw error if not OK
    if (!res.ok) throw new Error(data.message || 'Request failed');
    return data;
}

// ─── File Download with Authentication ─────────────────────────
export async function downloadFile(path, fileName) {
    const tokenValue = token();
    if (!tokenValue) {
        throw new Error('Not authenticated');
    }

    const response = await fetch(`${API}${path}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${tokenValue}`,
        },
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || 'Failed to download file');
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName || 'download.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
}

// ─── API Paths ──────────────────────────────────────────────────
export const PATHS = {
    // Auth
    auth: {
        login: '/api/auth/login',
        register: '/api/auth/register',
        me: '/api/auth/me',
    },

    // Business Profile
    business: {
        profile: '/api/businessprofile/profile',
        logo: '/api/businessprofile/profile/logo',
        gallery: '/api/businessprofile/profile/gallery',
        galleryItem: (index) => `/api/businessprofile/profile/gallery/${index}`,
    },

    // Clients
    clients: {
        base: '/api/clients',
        single: (id) => `/api/clients/${id}`,
        invoice: (id) => `/api/clients/${id}/invoice.pdf`,
        invoiceData: (id) => `/api/clients/${id}/invoice-data`,
        cleanup: '/api/clients/invoices/cleanup',
    },
};

// ─── Auth API Functions ──────────────────────────────────────
export const authAPI = {
    login: async (email, password) => {
        const response = await api(PATHS.auth.login, {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });

        if (response.token) {
            localStorage.setItem('token', response.token);
        }

        return response;
    },

    register: (data) =>
        api(PATHS.auth.register, {
            method: 'POST',
            body: JSON.stringify(data)
        }),

    me: async () => {
        const tokenValue = token();
        if (!tokenValue) {
            throw new Error('Not authenticated');
        }

        const response = await fetch(`${API}${PATHS.auth.me}`, {
            headers: {
                'Authorization': `Bearer ${tokenValue}`,
            },
        });

        const data = await response.json().catch(() => ({}));

        // ✅ Always return the data, even with warnings
        // The caller will handle warnings appropriately
        return data;
    },

    // ─── Check subscription status ──────────────────────────
    getSubscriptionStatus: async () => {
        try {
            const response = await authAPI.me();
            const business = response.business || {};
            const warnings = response.warnings || [];

            const isExpired = warnings.some(w => w.type === 'SUBSCRIPTION_EXPIRED');
            const isExpiringSoon = warnings.some(w => w.type === 'SUBSCRIPTION_EXPIRING_SOON');
            const isDisabled = warnings.some(w => w.type === 'ACCOUNT_DISABLED');

            let daysLeft = null;
            if (business.subscriptionEndDate) {
                const now = new Date();
                const expiry = new Date(business.subscriptionEndDate);
                if (expiry > now) {
                    daysLeft = Math.floor((expiry - now) / (1000 * 60 * 60 * 24));
                }
            }

            return {
                isExpired,
                isExpiringSoon,
                isDisabled,
                daysLeft,
                subscriptionEndDate: business.subscriptionEndDate,
                status: business.status,
                plan: business.plan,
                warnings,
                business,
            };
        } catch (error) {
            console.error('Error checking subscription status:', error);
            return {
                isExpired: false,
                isExpiringSoon: false,
                isDisabled: false,
                daysLeft: null,
                subscriptionEndDate: null,
                status: 'unknown',
                plan: 'unknown',
                warnings: [],
                business: null,
            };
        }
    },
};
// ─── Contact API Functions ──────────────────────────────────
export const contactAPI = {
    sendInquiry: (data) =>
        api('/api/contact', {
            method: 'POST',
            body: JSON.stringify(data)
        }).then(res => res),
};
// ─── Business Profile API Functions ──────────────────────────
export const businessAPI = {
    getProfile: () =>
        api(PATHS.business.profile).then(res => res.business),

    updateProfile: (data) =>
        api(PATHS.business.profile, {
            method: 'PUT',
            body: JSON.stringify(data)
        }).then(res => res.business),

    uploadLogo: async (file) => {
        const formData = new FormData();
        formData.append('logo', file);

        const response = await fetch(`${API}${PATHS.business.logo}`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token()}` },
            body: formData,
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Failed to upload logo');
        return data;
    },
    uploadGalleryImage: async (file, title, type) => {
        const formData = new FormData();
        formData.append('image', file);
        formData.append('title', title || file.name.split('.')[0] || 'Untitled');
        formData.append('type', type || (file.type.startsWith('video/') ? 'video' : 'image'));

        const response = await fetch(`${API}${PATHS.business.gallery}/upload`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token()}` },
            body: formData,
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Upload failed');
        return data;
    },

    deleteLogo: () =>
        api(PATHS.business.logo, { method: 'DELETE' }),

    addGalleryItem: (data) =>
        api(PATHS.business.gallery, {
            method: 'POST',
            body: JSON.stringify(data)
        }).then(res => res.gallery),

    updateGalleryItem: (index, data) =>
        api(PATHS.business.galleryItem(index), {
            method: 'PUT',
            body: JSON.stringify(data)
        }).then(res => res.gallery),

    removeGalleryItem: (index) =>
        api(PATHS.business.galleryItem(index), {
            method: 'DELETE'
        }).then(res => res.gallery),
};

// ─── Clients API Functions ──────────────────────────────────
export const clientsAPI = {
    getAll: () =>
        api(PATHS.clients.base).then(res => res.clients || []),

    getOne: (id) =>
        api(PATHS.clients.single(id)).then(res => res.client),

    create: (data) =>
        api(PATHS.clients.base, {
            method: 'POST',
            body: JSON.stringify(data)
        }).then(res => res.client),

    update: (id, data) =>
        api(PATHS.clients.single(id), {
            method: 'PUT',
            body: JSON.stringify(data)
        }).then(res => res.client),

    delete: (id) =>
        api(PATHS.clients.single(id), {
            method: 'DELETE'
        }),

    // ─── Invoice Functions ──────────────────────────────────
    downloadInvoice: (id, fileName) =>
        downloadFile(PATHS.clients.invoice(id), fileName || `invoice-${id}.pdf`),

    getInvoiceData: (id) =>
        api(PATHS.clients.invoiceData(id)).then(res => res.client),

    cleanupInvoices: () =>
        api(PATHS.clients.cleanup, {
            method: 'DELETE'
        }),
};
// ─── Public API Functions ──────────────────────────────────
export const publicAPI = {
    // Get all public studios for landing page
    getStudios: () =>
        api('/api/businessProfile/public/studios').then(res => res.studios || []),
    getStudio: (slug) =>
        api(`/api/business/public/${slug}`).then(res => res.business),
};
// ─── Export All ──────────────────────────────────────────────
export default {
    api,
    token,
    isAuthenticated,
    logout,
    downloadFile,
    PATHS,
    authAPI,
    businessAPI,
    contactAPI,
    clientsAPI,
    publicAPI,
    API
};