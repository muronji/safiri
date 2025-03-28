import axios from "axios";

const API_BASE_URL = "https://8d07-196-207-172-170.ngrok-free.app/api";

// Create an Axios instance
const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: { "Content-Type": "application/json" },
    withCredentials: true, // ✅ Ensures cookies are sent & received automatically
});

// Remove the Authorization header logic
export default apiClient;
