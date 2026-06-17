const router = require('express').Router();
const bcrypt = require('bcryptjs');
const slugify = require('slugify');

const Business = require('../models/Business');
const { auth } = require('../middleware/auth');
const superAdmin = require('../middleware/superAdmin');

router.use(auth);
router.use(superAdmin);

/*
GET ALL BUSINESSES
*/
router.get('/businesses', async (req, res) => {
    const businesses = await Business.find({
        role: 'business',
        deletedAt: null,
    })
        .select('-password')
        .sort({ createdAt: -1 });

    res.json({ businesses });
});

/*
CREATE BUSINESS
*/
router.post('/businesses', async (req, res) => {
    try {
        const {
            name,
            ownerName,
            email,
            password,
            phone,
            city,
            whatsapp,
            plan,
            trialDays,
            subscriptionMonths,
        } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                message: 'Name, email and password required',
            });
        }

        const existing = await Business.findOne({ email });

        if (existing) {
            return res.status(400).json({
                message: 'Email already exists',
            });
        }

        let base = slugify(name, {
            lower: true,
            strict: true,
        });

        let slug = base;
        let i = 1;

        while (await Business.findOne({ slug })) {
            slug = `${base}-${i++}`;
        }

        const hash = await bcrypt.hash(password, 10);

        let endDate = null;

        if (plan === 'trial') {
            endDate = new Date();
            endDate.setDate(
                endDate.getDate() + Number(trialDays || 0)
            );
        }

        if (plan === 'subscription') {
            endDate = new Date();
            endDate.setMonth(
                endDate.getMonth() +
                Number(subscriptionMonths || 1)
            );
        }

        const business = await Business.create({
            name,
            ownerName,
            email,
            password: hash,
            phone,
            city,
            whatsapp,

            slug,

            role: 'business',

            plan,
            trialDays,
            subscriptionMonths,

            subscriptionStartDate: new Date(),
            subscriptionEndDate: endDate,

            createdBy: req.business._id,
        });

        res.json({
            message: 'Business created',
            business,
        });
    } catch (e) {
        res.status(400).json({
            message: e.message,
        });
    }
});

/*
ENABLE / DISABLE
*/
router.put('/businesses/:id/status', async (req, res) => {
    const business = await Business.findById(
        req.params.id
    );

    if (!business) {
        return res.status(404).json({
            message: 'Business not found',
        });
    }

    business.status =
        business.status === 'active'
            ? 'inactive'
            : 'active';

    await business.save();

    res.json({
        message: 'Status updated',
        status: business.status,
    });
});

/*
RENEW SUBSCRIPTION
*/
router.put('/businesses/:id/renew', async (req, res) => {
    const { expiryDate } = req.body;

    const business = await Business.findById(
        req.params.id
    );

    if (!business) {
        return res.status(404).json({
            message: 'Business not found',
        });
    }

    business.subscriptionEndDate =
        new Date(expiryDate);

    business.status = 'active';

    await business.save();

    res.json({
        message: 'Subscription updated',
        business,
    });
});

/*
UPDATE BUSINESS PLAN - ✅ NEW ROUTE ADDED
*/
router.put('/businesses/:id/plan', async (req, res) => {
    try {
        const { plan, trialDays, subscriptionMonths } = req.body;

        // Validate plan
        if (!plan || !['trial', 'subscription'].includes(plan)) {
            return res.status(400).json({
                message: 'Invalid plan type. Must be "trial" or "subscription"'
            });
        }

        const business = await Business.findById(req.params.id);

        if (!business) {
            return res.status(404).json({
                message: 'Business not found'
            });
        }

        // Update plan details
        business.plan = plan;

        if (plan === 'trial') {
            business.trialDays = trialDays || 7;
            business.subscriptionMonths = 0;
            // Update expiry date based on trial days
            const newExpiry = new Date();
            newExpiry.setDate(newExpiry.getDate() + (trialDays || 7));
            business.subscriptionEndDate = newExpiry;
        } else if (plan === 'subscription') {
            business.subscriptionMonths = subscriptionMonths || 1;
            business.trialDays = 0;
            // Update expiry date based on subscription months
            const newExpiry = new Date();
            newExpiry.setMonth(newExpiry.getMonth() + (subscriptionMonths || 1));
            business.subscriptionEndDate = newExpiry;
        }

        await business.save();

        res.json({
            message: 'Plan updated successfully',
            business: {
                _id: business._id,
                name: business.name,
                plan: business.plan,
                trialDays: business.trialDays,
                subscriptionMonths: business.subscriptionMonths,
                subscriptionEndDate: business.subscriptionEndDate,
                status: business.status,
            }
        });
    } catch (error) {
        console.error('Error updating plan:', error);
        res.status(500).json({
            message: 'Error updating plan',
            error: error.message
        });
    }
});

/*
SOFT DELETE
*/
// router.delete('/businesses/:id', async (req, res) => {
//     const business = await Business.findById(req.params.id);

//     if (!business) {
//         return res.status(404).json({
//             message: 'Business not found',
//         });
//     }

//     business.deletedAt = new Date();

//     await business.save();

//     res.json({
//         message: 'Business archived',
//     });
// });

module.exports = router;