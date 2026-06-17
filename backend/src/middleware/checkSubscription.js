module.exports = async (req, res, next) => {
    try {
        const business = req.business;

        // ─── Check if account is manually disabled ─────────────
        // If admin disabled the account, block ALL access
        if (business.status === 'inactive') {
            return res.status(403).json({
                message: 'Account has been disabled by admin. Please contact support.',
                code: 'ACCOUNT_DISABLED',
            });
        }

        // ─── Check if subscription is expired ──────────────────
        // If expired but account is active, allow read-only access
        if (business.subscriptionEndDate && new Date() > new Date(business.subscriptionEndDate)) {
            // Mark as read-only (allow viewing but block editing)
            req.isReadOnly = true;
            req.readOnlyMessage = 'Your subscription has expired. You can view your data but cannot make changes. Please renew to continue editing.';
            // ✅ Allow the request to continue (don't return 403)
            return next();
        }

        // ─── Active subscription ──────────────────────────────
        req.isReadOnly = false;
        next();

    } catch (error) {
        console.error('Error in subscription check:', error);
        next();
    }
};