import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const PrivateRoute = ({ children }) => {
    const { isAuthenticated, loading } = useContext(AuthContext);

    if (loading) return <div className="p-8 text-center text-gray-500">Đang tải...</div>;

    return isAuthenticated ? children : <Navigate to="/login" />;
};

export default PrivateRoute;
