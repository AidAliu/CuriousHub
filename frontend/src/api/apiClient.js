import axios from 'axios';

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
      localStorage.removeItem('token'); 
      window.location.href = '/login'; 
      alert('Your session has expired. Please log in again.');
    }
    return Promise.reject(error);
  }
);

export default apiClient;
