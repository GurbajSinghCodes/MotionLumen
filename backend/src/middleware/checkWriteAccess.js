module.exports = (req, res, next) => {
    // If request is marked as read-only, block ALL write operations
    if (req.isReadOnly) {
        const writeMethods = ['POST', 'PUT', 'PATCH', 'DELETE'];
        if (writeMethods.includes(req.method)) {
            return res.status(403).json({
                message: req.readOnlyMessage || 'Your subscription has expired. Please renew to make changes.',
                code: 'SUBSCRIPTION_EXPIRED',
                isReadOnly: true,
            });
        }
    }
    next();
};