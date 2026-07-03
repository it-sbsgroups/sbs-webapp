import apiClient from './client';

const subscribersApi = {
  // Public newsletter signup → POST /subscribers/subscribe
  async subscribe(data) {
    return apiClient.post('/subscribers/subscribe', data);
  },
};

export default subscribersApi;
