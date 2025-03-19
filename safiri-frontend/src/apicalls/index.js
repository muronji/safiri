import axios from "axios";
import {message} from "antd";

// src/services/authService.js
const API_BASE_URL = "http://localhost:8080/api";

export const loginUser = async (credentials) => {
    try {
        const response = await fetch(`${API_BASE_URL}/v1/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(credentials),
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.message || "Login failed!");

        // ✅ Save token correctly
        localStorage.setItem("token", data.token);

        return data;
    } catch (error) {
        throw error;
    }
};


export const registerUser = async (formData) => {
    try {
        const response = await fetch(`${API_BASE_URL}/v1/auth/register`, {
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

/**
 * Fetches transactions for a specific user.
 * @param {string} userId - The ID of the user whose transactions need to be fetched.
 * @param {string} token - The authentication token for authorization.
 * @returns {Promise<Array>} - A promise resolving to an array of transactions.
 */
export const fetchUserTransactions = async (userId, token) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/transaction/customer/${userId}`, {
            headers: { Authorization: `Bearer ${token}` },
        });

        return response.data.map((tx) => ({
            txRef: tx.tx_ref,
            amount: tx.amount,
            type: tx.transaction_type,
            status: tx.transaction_status,
            date: new Date(tx.transaction_date).toLocaleString(),
        }));
    } catch (error) {
        console.error("Error fetching transactions:", error);
        throw new Error("Failed to load transactions.");
    }
};

export const fetchWalletBalance = async (userId) => {
    try {
        console.log("Fetching wallet balance for user:", userId);

        // Retrieve JWT token from localStorage
        const token = localStorage.getItem("token");
        if (!token) {
            console.error("No JWT token found in localStorage!");
            throw new Error("Unauthorized: No token provided.");
        }

        // Send API request with Authorization header
        const response = await fetch(`${API_BASE_URL}/wallet/balance/${userId}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`, // Attach JWT token
            },
        });

        if (!response.ok) {
            throw new Error("Failed to fetch wallet balance");
        }

        const balance = await response.json();
        console.log("API Response Wallet Balance:", balance);

        return Number(balance);
    } catch (error) {
        console.error("Error fetching wallet balance:", error);
        return 0;
    }
};

/*
* Perform a B2C transaction by sending money to a user.
* @param {number} id - The user ID.
* @param {Object} data - Transaction data including receiver and amount.
* @returns {Promise} API response.
*/
export const performB2CTransaction = async (id, data) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/b2c-transaction/${id}`, data, {
            headers: {
                "Content-Type": "application/json",
            },
        });
        return response.data;
    } catch (error) {
        console.error("Error performing B2C transaction:", error);
        throw error;
    }
};
