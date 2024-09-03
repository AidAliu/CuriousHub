import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://localhost:8080/curioushub/api/v1',
  headers: {
    Authorization: `Bearer ${localStorage.getItem('token')}`
  }
});

apiClient.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Get the refresh token from local storage
        const refreshToken = localStorage.getItem('refreshToken');

        // Call the refresh token endpoint
        const { data } = await axios.post('http://localhost:8080/curioushub/api/v1/auth/refresh', {
          refreshToken: refreshToken
        });

        // Save the new token and refresh token
        localStorage.setItem('token', data.token);
        localStorage.setItem('refreshToken', data.refreshToken);

        // Update the authorization header
        apiClient.defaults.headers['Authorization'] = `Bearer ${data.token}`;
        originalRequest.headers['Authorization'] = `Bearer ${data.token}`;

        // Retry the original request
        return apiClient(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        alert('Your session has expired. Please log in again.');
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
