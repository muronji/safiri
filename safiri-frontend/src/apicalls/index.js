import apiClient from "./apiClient";
import axios from "axios";

/**
 * Login user - Cookies store JWT automatically
 * Returns the user data which can then be set in your context
 */
export const loginUser = async (credentials) => {
    try {
        const response = await axios.post("/api/v1/auth/login", credentials, {
            withCredentials: true,
        });

        // Return the data instead of trying to set user state here
        return response.data;
    } catch (error) {
        console.error("Login failed:", error);
        throw error;
    }
};

/**
 * Logout user
 */
export const logoutUser = async () => {
    try {
        await axios.post("/api/v1/auth/logout", {}, { withCredentials: true });
        return true; // Indicate successful logout
    } catch (error) {
        console.error("Logout failed:", error);
        return false; // Indicate failed logout
    }
};

/**
 * Fetch user details
 */
export const fetchUserDetails = async () => {
    try {
        const response = await axios.get("/api/v1/auth/me", {
            withCredentials: true
        });
        return response.data;
    } catch (error) {
        console.error("Failed to fetch user details", error);
        throw error;
    }
};

/**
 * Fetch transactions for current user (uses JWT cookie auth)
 */
export const fetchUserTransactions = async () => {
    try {
        const { data } = await apiClient.get(`/transaction/customer`, {
            withCredentials: true,
        });
        return data.map(txn => ({
            amount: txn.amount,
            transactionDate: txn.transactionDate,
            transactionStatus: txn.transactionStatus || "Unknown",
            transactionType: txn.transactionType || "Unknown",
            txRef: txn.txRef || "N/A",
        }));
    } catch (error) {
        console.error("Error fetching transactions:", error.response?.data || error.message);
        return [];
    }
};

/**
 * Fetch user wallet balance for current user
 */
export const fetchWalletBalance = async () => {
    try {
        const { data } = await apiClient.get(`/wallet/balance`, {
            withCredentials: true,
        });
        return data;
    } catch (error) {
        console.error("Error fetching wallet balance:", error.response?.data || error.message);
        return { success: false, balance: 0 };
    }
};

/**
 * Register user
 */
export const registerUser = async (formData) => {
    try {
        const { data } = await apiClient.post("/v1/auth/register", formData, {
            withCredentials: true,
        });
        return data;
    } catch (error) {
        console.error("Registration error:", error.response?.data || error.message);
        throw error;
    }
};

/**
 * Perform a B2C transaction
 */
export const performB2CTransaction = async (values) => {
    const transactionData = {
        Amount: values.amount,
        PartyB: values.receiver
    };

    try {
        const { data } = await apiClient.post(`mobile-money/b2c-transaction`, transactionData, {
            withCredentials: true,
        });
        return data;
    } catch (error) {
        console.error("Error performing B2C transaction:", error.response?.data || error.message);
        throw error;
    }
};

/**
 * Fund wallet
 */
export const fundWallet = async (amount) => {
    try {
        const { data } = await apiClient.post("/payment/fund-wallet", {
            currency: "USD",
            amount: amount,

        }, {
            withCredentials: true,
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
        const { data } = await apiClient.get(`/v1/users/profile`, {
            withCredentials: true,  // Ensures the JWT cookie is sent
        });
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
        const { data } = await apiClient.put("/v1/users/", formData, {
            withCredentials: true,
        });
        return data;
    } catch (error) {
        console.error("Error updating profile:", error.response?.data || error.message);
        throw error;
    }
};

/**
 * Fetch customer reports
 */
export const fetchCustomerReports = async () => {
    try {
        const { data } = await apiClient.get("/v1/admin/customers", {
            withCredentials: true,  // Ensures the JWT cookie is sent
        });
        return data;
    } catch (error) {
        console.error("Error fetching customer reports:", error.response?.data || error.message);
        throw error;
    }
};

/**
 * Fetch all transactions
 */
export const fetchTransactions = async () => {
    try {
        const {data} = await apiClient.get("/v1/admin/transactions", {
            withCredentials: true,
        });
        return data;
    } catch (error) {
        console.error("Error fetching transactions:", error.response?.data || error.message);
        throw error;
    }
}

/**
 * Fetch transactions receipt
 */
export const fetchTransactionsReceipt = async () => {
    try {
        const {data} = await apiClient.get("/transaction/receipt", {
            withCredentials: true,
        });
        return data;
    } catch (error) {
        console.error("Error fetching transactions receipt:", error.response?.data || error.message);
        throw error;
    }
}

/**
 * Fetch dashboard statistics
 */
export const fetchDashboardStatistics = async () => {
    try {
        const { data } = await apiClient.get("/dashboard/statistics", {
            withCredentials: true,
        });
        return data;
    } catch (error) {
        console.error("Error fetching dashboard statistics:", error.response?.data || error.message);
        return {
            totalCustomers: 0,
            totalDepositTransactions: 0,
            totalDepositAmount: 0,
            totalWithdrawalTransactions: 0,
            totalWithdrawalAmount: 0,
            successfulTransactions: 0,
            failedTransactions: 0,
            pendingTransactions: 0,
            averageTransactionAmount: 0,
            mostActiveTransactionPeriod: null
        };
    }
};
