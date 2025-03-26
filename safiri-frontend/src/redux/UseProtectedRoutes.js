import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

export const useProtectedRoute = () => {
    const { user, loading } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        // Only redirect if loading is complete and no user is found
        if (!loading && !user) {
            navigate("/login");
        }
    }, [user, loading, navigate]);

    // Return user only if loading is complete
    return loading ? null : user;
};