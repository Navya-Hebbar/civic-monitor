// src/api/axios.js
import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "https://civic-monitor.onrender.com";

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // 🔑 cookie auth
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;
