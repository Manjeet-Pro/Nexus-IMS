const SystemConfig = require('../models/SystemConfig');

const checkMaintenance = async (req, res, next) => {
    try {
        // Skip maintenance check for admins
        if (req.user && req.user.role === 'admin') {
            return next();
        }

        const config = await SystemConfig.findOne();
        if (config && config.maintenanceMode) {
            return res.status(503).json({
                maintenance: true,
                message: config.maintenanceMessage || 'System is under maintenance.'
            });
        }
        next();
    } catch (error) {
        next(); // Proceed if check fails, better than blocking everything if DB is weird
    }
};

module.exports = checkMaintenance;
