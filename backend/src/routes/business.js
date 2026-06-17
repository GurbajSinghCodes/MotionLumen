const router = require('express').Router();
const Business = require('../models/Business');
const { auth } = require('../middleware/auth');
const BusinessProfile = require('../models/BusinessProfile');
// ─── Get Public Studio Data ──────────────────────────────────
router.get('/public/:slug', async (req, res) => {
    try {
        const business = await Business.findOne({
            slug: req.params.slug,
            status: 'active',
            deletedAt: null
        });

        if (!business) {
            return res.status(404).json({ message: 'Studio not found' });
        }

        // ✅ Fetch from BusinessProfile to get gallery
        const profile = await BusinessProfile.findOne({
            businessId: business._id
        });

        // ─── Combine data ──────────────────────────────────────
        const businessData = business.toJSON ? business.toJSON() : business;

        // ✅ Use profile data for gallery and public info
        const combined = {
            ...businessData,
            // Profile fields (override business fields with profile data)
            name: profile?.name || business.name,
            ownerName: profile?.ownerName || business.ownerName || '',
            phone: profile?.phone || business.phone || '',
            contactEmail: profile?.contactEmail || business.email,
            address: profile?.address || { city: business.city || '' },
            logoUrl: profile?.logoUrl || '',
            gstNumber: profile?.gstNumber || '',
            invoiceFooter: profile?.invoiceFooter || 'Thank you for your business!',
            instagram: profile?.instagram || business.instagram || '',
            whatsapp: profile?.whatsapp || business.whatsapp || '',
            headline: profile?.headline || business.headline || '',
            about: profile?.about || business.about || '',
            gallery: profile?.gallery || [], // ✅ This is the key fix
            fullAddress: profile?.fullAddress || '',
        };

        res.json({
            success: true,
            business: combined
        });
    } catch (error) {
        console.error('Error fetching public studio:', error);
        res.status(500).json({
            message: 'Error fetching studio data',
            error: error.message
        });
    }
});

router.put('/profile', auth, async (req, res) => {
    const allowed = ['name', 'ownerName', 'phone', 'logoUrl', 'city', 'whatsapp', 'instagram', 'headline', 'about', 'gallery'];
    const data = {};
    allowed.forEach(k => { if (req.body[k] !== undefined) data[k] = req.body[k] });
    const b = await Business.findByIdAndUpdate(req.business._id, data, { new: true }).select('-password');
    res.json({ business: b });
});

module.exports = router;

