import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const apiClient = axios.create({
  baseURL: 'http://localhost:8080/curioushub/api/v1',
  headers: {
    Authorization: `Bearer ${localStorage.getItem('token')}`
  }
});

apiClient.interceptors.response.use(
  response => response,
  error => {
    if (error.response && error.response.status === 401) {
      // Token expired or unauthorized
      localStorage.removeItem('token'); // Clear the token
      // Direct useNavigate won't work here directly since it's not in a React component
      window.location.href = '/login'; // Use a full page redirect
      alert('Your session has expired. Please log in again.');
    } else if (error.response && error.response.status === 400) {
      alert('There was an issue with your request. Please try again.');
    }
    return Promise.reject(error);
  }
);

export default apiClient;
