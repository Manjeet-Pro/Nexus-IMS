import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Create axios instance
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add a request interceptor to inject the token
api.interceptors.request.use(
    (config) => {
        const user = JSON.parse(localStorage.getItem('nexus_auth_user'));
        if (user && user.token) {
            config.headers.Authorization = `Bearer ${user.token}`;
        }

        // Auto-prepend /api to the URL if it doesn't have it
        if (config.url && !config.url.startsWith('/api') && !config.url.startsWith('http')) {
            const separator = config.url.startsWith('/') ? '' : '/';
            config.url = `/api${separator}${config.url}`;
        }

        return config;
    },
    (error) => Promise.reject(error)
);

// Add a response interceptor to handle maintenance mode
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 503) {
            window.location.href = '/maintenance';
        }
        return Promise.reject(error);
    }
);

export default api;
