import axios from "axios";

const API_BASE_URL = "https://2400-41-89-10-241.ngrok-free.app/api";

// Create an Axios instance
const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: { "Content-Type": "application/json" },
    withCredentials: true, // ✅ Ensures cookies are sent & received automatically
});

// Remove the Authorization header logic
export default apiClient;
