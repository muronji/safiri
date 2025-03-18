import axios from "axios";
import {message} from "antd";

// src/services/authService.js
const API_BASE_URL = "http://localhost:8080/api/v1/auth";

export const loginUser = async (credentials) => {
    try {
        const response = await fetch(`${API_BASE_URL}/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(credentials),
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.message || "Login failed!");
        return data; // Return the response data
    } catch (error) {
        throw error; // Propagate error
    }
};

export const registerUser = async (formData) => {
    try {
        const response = await fetch(`${API_BASE_URL}/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Registration failed!");
        }

        return data; // Return response data for further processing
    } catch (error) {
        throw new Error(error.message);
    }
};