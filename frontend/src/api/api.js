import axios from 'axios';
import config from '../config';

// Create an axios instance with the base URL
const apiClient = axios.create({
  baseURL: config.api.baseURL,
});

// Function to fetch all product metrics
export const fetchProductMetrics = async () => {
  try {
    const response = await apiClient.get('/product_metrics');
    return response.data;
  } catch (error) {
    console.error('Error fetching product metrics:', error);
    throw error;
  }
};

// Export the axios instance if needed
export { apiClient };