const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const slugify = require('slugify');
const Business = require('../models/Business');
const { auth } = require('../middleware/auth');
const superAdmin = require('../middleware/superAdmin');

// ─── Register ──────────────────────────────────────────────────
router.post('/register', auth, superAdmin, async (req, res) => {
    try {
        const { name, ownerName, email, password, phone, city, whatsapp } = req.body;
        if (!name || !email || !password)
            return res.status(400).json(
                { message: 'Name, email and password required' }
            );
        let base = slugify(name, { lower: true, strict: true });
        let slug = base, i = 1;
        while (await Business.findOne({ slug })) slug = `${base}-${i++}`;
        const hash = await bcrypt.hash(password, 10);
        const b = await Business.create({ name, ownerName, email, password: hash, phone, city, whatsapp, slug });
        res.json(
            { message: 'Business created', business: { id: b._id, name: b.name, slug: b.slug, email: b.email } })
    } catch (e) { res.status(400).json({ message: e.message }) }
});

// ─── Login ─────────────────────────────────────────────────────
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const b = await Business.findOne({ email });
        if (!b || !(await bcrypt.compare(password, b.password))) {
            return res.status(401).json({
                message: 'Invalid login credentials',
            });
        }

        if (b.deletedAt) {
            return res.status(403).json({
                message: 'Account has been deleted. Please contact support.',
                code: 'ACCOUNT_DELETED',
            });
        }

        // ─── CRITICAL: Check if account is manually disabled ──
        // If admin disabled the account, BLOCK login completely
        if (b.status === 'inactive') {
            return res.status(403).json({
                message: 'Account has been disabled by admin. Please contact support.',
                code: 'ACCOUNT_DISABLED',
            });
        }

        // ─── Check subscription status ──────────────────────
        const now = new Date();
        const isExpired = b.subscriptionEndDate && new Date(b.subscriptionEndDate) < now;

        // ─── Generate token ────────────────────────────────────
        const token = jwt.sign(
            {
                id: b._id,
                role: b.role,
            },
            process.env.JWT_SECRET,
            {
                expiresIn: '7d',
            }
        );

        // ─── Prepare response ──────────────────────────────────
        const response = {
            token,
            business: {
                id: b._id,
                name: b.name,
                slug: b.slug,
                email: b.email,
                role: b.role,
                plan: b.plan,
                status: b.status,
                subscriptionEndDate: b.subscriptionEndDate,
            },
            warnings: [],
        };

        // ─── Add warning if subscription expired ──────────────
        if (isExpired) {
            response.warnings.push({
                type: 'SUBSCRIPTION_EXPIRED',
                message: 'Your subscription has expired. You can view your data but cannot make changes. Please renew to continue editing.',
                severity: 'warning',
                expiryDate: b.subscriptionEndDate,
            });
        } else if (b.subscriptionEndDate) {
            // Check if expiring soon (within 7 days)
            const expiry = new Date(b.subscriptionEndDate);
            const daysLeft = Math.floor((expiry - now) / (1000 * 60 * 60 * 24));

            if (daysLeft <= 7) {
                response.warnings.push({
                    type: 'SUBSCRIPTION_EXPIRING_SOON',
                    message: `Your subscription will expire in ${daysLeft} days. Please renew to avoid interruption.`,
                    severity: 'warning',
                    daysLeft,
                    expiryDate: b.subscriptionEndDate,
                });
            }
        }

        res.json(response);

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            message: 'Login failed. Please try again.',
        });
    }
});

// ─── Get Current User ─────────────────────────────────────────
// ─── Get Current User ─────────────────────────────────────────
router.get('/me', auth, (req, res) => {
    const business = req.business.toJSON ? req.business.toJSON() : req.business;

    const warnings = [];
    const now = new Date();
    const isExpired = business.subscriptionEndDate && new Date(business.subscriptionEndDate) < now;
    const isDisabled = business.status !== 'active';

    // ─── If account is disabled by admin ──────────────────────
    if (isDisabled) {
        warnings.push({
            type: 'ACCOUNT_DISABLED',
            message: 'Your account is disabled by admin. Please contact support.',
            severity: 'error',
        });
    }

    // ─── If subscription expired (but account is active) ──────
    // ✅ This is just a warning - user can still access
    if (!isDisabled && isExpired) {
        warnings.push({
            type: 'SUBSCRIPTION_EXPIRED',
            message: 'Your subscription has expired. Please renew to continue using all features.',
            severity: 'warning',
            expiryDate: business.subscriptionEndDate,
        });
    } else if (!isDisabled && business.subscriptionEndDate) {
        const expiry = new Date(business.subscriptionEndDate);
        const daysLeft = Math.floor((expiry - now) / (1000 * 60 * 60 * 24));
        if (daysLeft <= 7) {
            warnings.push({
                type: 'SUBSCRIPTION_EXPIRING_SOON',
                message: `Your subscription will expire in ${daysLeft} days. Please renew.`,
                severity: 'warning',
                daysLeft,
                expiryDate: business.subscriptionEndDate,
            });
        }
    }

    res.json({
        business,
        warnings,
    });
});

module.exports = router;