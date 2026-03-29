import api from './api';

const AUTH_KEY = 'nexus_auth_user';

export const login = async (email, password) => {
    try {
        const { data } = await api.post('/auth/login', { email, password });
        localStorage.setItem(AUTH_KEY, JSON.stringify(data));
        return { success: true, user: data };
    } catch (error) {
        console.error("Auth Login Error:", error);
        return {
            success: false,
            message: error.response?.data?.message || `Login failed: ${error.message}`
        };
    }
};

export const register = async (userData) => {
    try {
        const { data } = await api.post('/auth/register', userData);
        localStorage.setItem(AUTH_KEY, JSON.stringify(data));
        return { success: true, user: data };
    } catch (error) {
        console.error("Auth Register Error:", error);
        return {
            success: false,
            message: error.response?.data?.message || `Registration failed: ${error.message}`
        };
    }
};

export const updateUser = async (updates) => {
    const user = getCurrentUser();
    if (!user) return { success: false, message: "User not authenticated" };

    try {
        // Optimistic update for immediate feedback
        const optimisticUser = { ...user, ...updates };
        localStorage.setItem(AUTH_KEY, JSON.stringify(optimisticUser));

        // Call API
        const { data } = await api.put('/users/profile', updates);

        // Update with server response (which might include token/extra fields)
        const updatedUser = { ...user, ...data };
        localStorage.setItem(AUTH_KEY, JSON.stringify(updatedUser));
        return { success: true, user: updatedUser };
    } catch (error) {
        console.error("Update User Error:", error);

        // Handle Network Error explicitly
        if (!error.response) {
            return {
                success: false,
                message: "Network Error: Cannot connect to server. Is the backend running?"
            };
        }

        return {
            success: false,
            message: error.response?.data?.message || "Failed to update profile on server"
        };
    }
};

export const logout = () => {
    localStorage.removeItem(AUTH_KEY);
    window.location.href = '/login';
};

export const getCurrentUser = () => {
    const userStr = localStorage.getItem(AUTH_KEY);
    if (!userStr) return null;
    try {
        return JSON.parse(userStr);
    } catch {
        return null;
    }
};

export const isAuthenticated = () => {
    return !!getCurrentUser();
};

export const searchStudents = async (query) => {
    try {
        const { data } = await api.get(`/auth/search-students?query=${query}`);
        return data;
    } catch (error) {
        console.error("Search Error:", error);
        return [];
    }
};
