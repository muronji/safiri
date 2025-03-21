import apiClient from "./apiClient";

/**
 * Login user and store JWT token
 */
export const loginUser = async (credentials) => {
    try {
        const { data } = await apiClient.post("/v1/auth/login", credentials);
        localStorage.setItem("token", data.token);
        localStorage.setItem("userId", data.user.id);
        return data;
    } catch (error) {
        console.error("Login error:", error.response?.data || error.message);
        throw error;
    }
};

/**
 * Register user
 */
export const registerUser = async (formData) => {
    try {
        const { data } = await apiClient.post("/v1/auth/register", formData);
        return data;
    } catch (error) {
        console.error("Registration error:", error.response?.data || error.message);
        throw error;
    }
};

/**
 * Fetch transactions for a user
 */
export const fetchUserTransactions = async (userId) => {
    try {
        const { data } = await apiClient.get(`/transaction/customer/${userId}`);
        console.log("Raw data from API:", data); // Add this for debugging

        return data.map((tx) => {
            // Map database field names to component field names
            const transaction = {
                transactionDate: tx.transaction_date,
                txRef: tx.tx_ref || 'N/A',
                amount: parseFloat(tx.amount || 0),
                transactionType: tx.transaction_type || 'Unknown',
                transactionStatus: tx.transaction_status || 'Unknown'
            };
            console.log("Mapped transaction:", transaction); // Add this for debugging
            return transaction;
        });
    } catch (error) {
        console.error("Error fetching transactions:", error.response?.data || error.message);
        return [];
    }
};

/**
 * Fetch user wallet balance
 */
export const fetchWalletBalance = async (userId) => {
    try {
        const { data } = await apiClient.get(`/wallet/balance/${userId}`);
        return data;
    } catch (error) {
        console.error("Error fetching wallet balance:", error.response?.data || error.message);
        return { success: false, balance: 0 };
    }
};

/**
 * Perform a B2C transaction
 */
export const performB2CTransaction = async (id, requestData) => {
    try {
        const { data } = await apiClient.post(`/b2c-transaction/${id}`, requestData);
        return data;
    } catch (error) {
        console.error("Error performing B2C transaction:", error.response?.data || error.message);
        throw error;
    }
};

/**
 * Fund wallet
 */
export const fundWallet = async (userId, amount) => {
    try {
        const { data } = await apiClient.post("/payment/fund-wallet", {
            id: userId,
            currency: "USD",
            amount: amount,
        });

        if (data.status === "SUCCESS" && data.sessionUrl) {
            window.location.href = data.sessionUrl;
        } else {
            throw new Error("Failed to initiate Stripe checkout.");
        }
    } catch (error) {
        console.error("Error funding wallet:", error.response?.data || error.message);
        throw error;
    }
};

/**
 * Fetch customer profile
 */
export const getCustomerProfile = async () => {
    try {
        const userId = localStorage.getItem("userId");
        if (!userId) throw new Error("Unauthorized: No userId found.");

        const { data } = await apiClient.get(`/v1/users/profile/${userId}`);
        return data;
    } catch (error) {
        console.error("Error fetching profile:", error.response?.data || error.message);
        throw error;
    }
};

/**
 * Update customer profile
 */
export const updateCustomerProfile = async (formData) => {
    try {
        const { data } = await apiClient.put("/v1/users/", formData);
        return data;
    } catch (error) {
        console.error("Error updating profile:", error.response?.data || error.message);
        throw error;
    }
};
