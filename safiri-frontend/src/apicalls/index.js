import axios from "axios";

const API_BASE_URL = "https://1e83-197-139-54-10.ngrok-free.app/api";

/**
 * Login user and store JWT token
 */
export const loginUser = async (credentials) => {
    try {
        const response = await fetch(`${API_BASE_URL}/v1/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(credentials),
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.message || "Login failed!");

        localStorage.setItem("token", data.token);
        localStorage.setItem("userId", data.user.id);

        return data;
    } catch (error) {
        console.error("Login error:", error);
        throw error;
    }
};

/**
 * Register user
 */
export const registerUser = async (formData) => {
    try {
        const response = await fetch(`${API_BASE_URL}/v1/auth/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData),
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.message || "Registration failed!");

        return data;
    } catch (error) {
        console.error("Registration error:", error);
        throw error;
    }
};

/**
 * Fetch transactions for a user
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
        return [];
    }
};

/**
 * Fetch user wallet balance
 */
export const fetchWalletBalance = async (userId) => {
    try {
        console.log("Fetching wallet balance for user:", userId);

        const token = localStorage.getItem("token")?.trim();
        if (!token) {
            console.warn("No JWT token found or it's empty.");
            return 0;
        }

        const response = await fetch(`${API_BASE_URL}/wallet/balance/${userId}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json",
                "Authorization": `Bearer ${token}`,
            },
        });

        console.log(`Response Status: ${response.status} - ${response.statusText}`);

        // Check if response is JSON
        const contentType = response.headers.get("Content-Type");
        if (!contentType || !contentType.includes("application/json")) {
            const text = await response.text();
            console.error("Unexpected non-JSON response:", text);
            throw new Error("Invalid API response format.");
        }

        if (!response.ok) {
            throw new Error(`API Error: ${response.statusText}`);
        }

        const data = await response.json();
        console.log("Full API Response:", JSON.stringify(data, null, 2));

        return Number(data.balance ?? data.data?.balance ?? 0); // Handle different response formats
    } catch (error) {
        console.error("Error fetching wallet balance:", error.message);
        return 0;
    }
};


/**
 * Perform a B2C transaction
 */
export const performB2CTransaction = async (id, data) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/b2c-transaction/${id}`, data, {
            headers: { "Content-Type": "application/json" },
        });
        return response.data;
    } catch (error) {
        console.error("Error performing B2C transaction:", error);
        throw error;
    }
};

/**
 * Fund wallet
 */
export const fundWallet = async (userId, amount) => {
    try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("Unauthorized: No token found.");

        const response = await fetch(`${API_BASE_URL}/payment/fund-wallet`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
            body: JSON.stringify({
                id: (userId), // Ensure it's a string
                currency: "USD",
                amount: amount
            }),
        });
        if (!response.ok) throw new Error("Wallet top-up failed.");

        const data = await response.json();
        // Redirect to Stripe session URL
        if (data.status === "SUCCESS" && data.sessionUrl) {
            window.location.href = data.sessionUrl;
        } else {
            throw new Error("Failed to initiate Stripe checkout.");
        }


    } catch (error) {
        console.error("Error funding wallet:", error);
        throw error;
    }
};


/**
 * Fetch customer profile
 */
export const getCustomerProfile = async () => {
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId");

    if (!token || !userId) throw new Error("Unauthorized: No token or userId provided.");

    try {
        const response = await fetch(`${API_BASE_URL}/v1/users/profile/${userId}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Failed to fetch profile.");
        }

        return await response.json();
    } catch (error) {
        console.error("Error fetching profile:", error);
        throw error;
    }
};

/**
 * Update customer profile
 */
export const updateCustomerProfile = async (formData) => {
    try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("Unauthorized: No token provided.");

        const response = await fetch(`${API_BASE_URL}/v1/users/`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
            body: JSON.stringify(formData),
        });

        if (!response.ok) throw new Error("Failed to update profile.");

        return await response.json();
    } catch (error) {
        console.error("Error updating profile:", error);
        throw error;
    }
};
