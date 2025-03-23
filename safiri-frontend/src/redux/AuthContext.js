import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAuthStatus = async () => {
            console.log("Checking auth status...");
            try {
                const response = await axios.get("/api/v1/auth/me", {
                    withCredentials: true,
                });
                console.log("Auth check successful, user:", response.data);
                setUser(response.data);
                setIsAuthenticated(true);
            } catch (error) {
                console.log("Auth check failed:", error);
                setUser(null);
                setIsAuthenticated(false);
            } finally {
                setLoading(false);
            }
        };

        checkAuthStatus();
    }, []);

// Add this to see when the context values change
    useEffect(() => {
        console.log("Auth context updated - Current user:", user);
    }, [user]);
    const login = async (credentials) => {
        try {
            const response = await axios.post("/api/v1/auth/login", credentials, {
                withCredentials: true, // Ensures cookies are sent
            });
            setUser(response.data.user);
            setIsAuthenticated(true);
            return response.data;
        } catch (error) {
            console.error("Login failed:", error);
            throw error;
        }
    };

    const logout = async () => {
        try {
            await axios.post("/api/v1/auth/logout", {}, { withCredentials: true });
            setUser(null);
            setIsAuthenticated(false);
        } catch (error) {
            console.error("Logout failed:", error);
            // Even if the server request fails, clear the state
            setUser(null);
            setIsAuthenticated(false);
        }
    };

    return (
        <AuthContext.Provider value={{ user, isAuthenticated, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

// Custom hook for using authentication context
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};