import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'http://192.168.162.200:5000/api', // ⚠️ replace with your real backend URL (e.g., http://192.168.x.x:5000/api or deployed one)
  timeout: 10000,
});

export default axiosInstance;
