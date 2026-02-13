import axios from 'axios';

const API_BASE_URL = 'http://localhost:5001/api';

const api = axios.create({
    baseURL: API_BASE_URL,
});

export const sendOTP = (phoneNumber) => api.post('/auth/send-otp', { phoneNumber });
export const verifyOTP = (phoneNumber, otp) => api.post('/auth/verify-otp', { phoneNumber, otp });
export const updateProfile = (token, profileData) => api.post('/user/profile', { token, ...profileData });
export const getSpecialists = () => api.get('/specialists');

export default api;
