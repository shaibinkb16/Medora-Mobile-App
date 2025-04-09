import axios from "axios";

const API = axios.create({
  baseURL: "http://192.168.162.200:5000/api", // change this as needed
});

// Add token to headers if present
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("admin_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default API;
