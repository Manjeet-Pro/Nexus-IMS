import React from 'react';
import { Navigate } from 'react-router-dom';
import { getCurrentUser } from '../utils/auth';

const HomeRedirect = () => {
    const user = getCurrentUser();

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    switch (user.role) {
        case 'admin':
            return <Navigate to="/admin" replace />;
        case 'faculty':
            return <Navigate to="/faculty" replace />;
        case 'student':
            return <Navigate to="/student" replace />;
        case 'parent':
            return <Navigate to="/parent" replace />;
        default:
            return <Navigate to="/login" replace />;
    }
};

export default HomeRedirect;
