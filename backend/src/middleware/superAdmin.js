module.exports = (req, res, next) => {

    if (!req.business) {
        return res.status(401).json({
            message: 'Unauthorized',
        });
    }

    if (req.business.role !== 'superadmin') {
        return res.status(403).json({
            message: 'Super Admin access required',
        });
    }

    next();
};