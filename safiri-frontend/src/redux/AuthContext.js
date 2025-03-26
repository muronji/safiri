import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import axios from "axios";
import {loginUser, logoutUser, fetchUserDetails} from "../apicalls";
import {useNavigate} from "react-router-dom";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);

    const checkAuthStatus = useCallback(async () => {
        try {
            // First, check if the user is authenticated
            const response = await axios.get("/api/v1/auth/me", {
                withCredentials: true,
            });

            // If authenticated, fetch full user details
            if (response.data) {
                const userDetails = await fetchUserDetails(); // Add this API call
                setUser(userDetails);
                setIsAuthenticated(true);
            }
        } catch (error) {
            setUser(null);
            setIsAuthenticated(false);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        checkAuthStatus();
    }, [checkAuthStatus]);

    const login = async (credentials) => {
        try {
            const userData = await loginUser(credentials);

            // Fetch full user details after login
            const fullUserDetails = await fetchUserDetails();

            setUser(fullUserDetails);
            setIsAuthenticated(true);
            return true;
        } catch (error) {
            console.error("Login failed:", error);
            setUser(null);
            setIsAuthenticated(false);
            throw error;
        }
    };

    const logout = async () => {
        try {
            const success = await logoutUser();
            if (success) {
                setUser(null);
                setIsAuthenticated(false);
            }
            return success;
        } catch (error) {
            console.error("Logout failed:", error);
            return false;
        }
    };

    return (
        <AuthContext.Provider value={{
            user,
            setUser,
            isAuthenticated,
            login,
            logout,
            loading
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};