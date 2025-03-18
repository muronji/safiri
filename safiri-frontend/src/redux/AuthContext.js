import React, { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);

    // Load authentication state from localStorage on mount
    // Load authentication state from localStorage on mount
    useEffect(() => {
        const savedUser = localStorage.getItem("user");
        const savedToken = localStorage.getItem("authToken");

        if (savedUser) {
            try {
                setUser(JSON.parse(savedUser));  // Only parse if it's not null
            } catch (error) {
                console.error("Error parsing user JSON:", error);
                localStorage.removeItem("user"); // Clear corrupted data
            }
        }

        if (savedToken) {
            setToken(savedToken); // No need to parse the token (it's a string)
        }
    }, []);


    // Login function - saves user and token
    const login = (userData, authToken) => {
        localStorage.setItem("user", JSON.stringify(userData));
        localStorage.setItem("authToken", authToken);
        setUser(userData);
        setToken(authToken);
    };

    // Logout function - clears authentication data
    const logout = () => {
        localStorage.removeItem("user");
        localStorage.removeItem("authToken");
        setUser(null);
        setToken(null);
    };

    return (
        <AuthContext.Provider value={{ user, token, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

// Custom hook for using authentication context
export const useAuth = () => {
    const context = useContext(AuthContext);
    console.log("useAuth() context:", context); // Debugging output
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};

