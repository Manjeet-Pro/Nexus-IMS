const express = require('express');
const router = express.Router();
const SystemConfig = require('../models/SystemConfig');
const { protect, admin } = require('../middleware/authMiddleware');

// Get system config
router.get('/', async (req, res) => {
    try {
        let config = await SystemConfig.findOne();
        if (!config) {
            config = await SystemConfig.create({ maintenanceMode: false });
        }
        res.json(config);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update system config (Admin only)
router.put('/', protect, admin, async (req, res) => {
    try {
        let config = await SystemConfig.findOne();
        if (!config) {
            config = new SystemConfig();
        }

        config.maintenanceMode = req.body.maintenanceMode !== undefined ? req.body.maintenanceMode : config.maintenanceMode;
        config.maintenanceMessage = req.body.maintenanceMessage || config.maintenanceMessage;
        config.updatedBy = req.user.id;

        await config.save();
        res.json(config);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
