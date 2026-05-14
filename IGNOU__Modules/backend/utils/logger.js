/**
 * Simple logger utility for the Nexus Backend
 */
const logger = {
    info: (message, data = '') => {
        console.log(`[INFO] ${new Date().toLocaleTimeString()}: ${message}`, data);
    },
    error: (message, error = '') => {
        console.error(`[ERROR] ${new Date().toLocaleTimeString()}: ${message}`, error);
    },
    warn: (message, data = '') => {
        console.warn(`[WARN] ${new Date().toLocaleTimeString()}: ${message}`, data);
    },
    debug: (message, data = '') => {
        if (process.env.NODE_ENV !== 'production') {
            console.log(`[DEBUG] ${new Date().toLocaleTimeString()}: ${message}`, data);
        }
    }
};

module.exports = logger;
