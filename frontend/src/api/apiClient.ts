const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8002';

export const apiClient = {
  async get(endpoint: string) {
    try {
      const response = await fetch(`${BACKEND_URL}${endpoint}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        console.error(`API Error: ${response.status} ${response.statusText}`);
        return null;
      }
      
      return await response.json();
    } catch (error) {
      console.error('API fetch error:', error);
      return null;
    }
  },

  async getProducts(skip = 0, limit = 100) {
    return this.get(`/api/products?skip=${skip}&limit=${limit}`);
  },

  async getProductStats() {
    return this.get('/api/products/stats');
  },

  async getOrders(skip = 0, limit = 100) {
    return this.get(`/orders/api/list?skip=${skip}&limit=${limit}`);
  },

  async getOrderStats() {
    return this.get('/orders/api/stats');
  },

  async getOrdersByStatus(status: string, skip = 0, limit = 100) {
    return this.get(`/orders/api/status/${status}?skip=${skip}&limit=${limit}`);
  },
};
