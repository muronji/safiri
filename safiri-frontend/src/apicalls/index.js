import apiClient from "./apiClient";
import transactions from "../pages/Transactions";

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
        console.log("Raw data from API:", data); // Debugging

        // Map database field names to component field names
        const mappedTransactions = data.map(txn => ({
            amount: txn.amount,
            transactionDate: txn.transactionDate, // ✅ Correct field name
            transactionStatus: txn.transactionStatus || "Unknown", // ✅ Correct field name
            transactionType: txn.transactionType || "Unknown", // ✅ Correct field name
            txRef: txn.txRef || "N/A" // ✅ Handle missing field
        }));

        console.log("Mapped transactions:", mappedTransactions); // Debugging

        return mappedTransactions;
    } catch (error) {
        console.error("Error fetching transactions:", error.response?.data || error.message);
        return [];
    }
};
;

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
export const performB2CTransaction = async (id, values) => {
    const transactionData = {
        PartyB: values.receiver,  // Map "receiver" to "PartyB"
        Amount: values.amount       // Map "amount" to "Amount"
    };

    try {
        const { data } = await apiClient.post(`mobile-money/b2c-transaction/${id}`, transactionData);
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
