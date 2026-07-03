// src/lib/api/index.js

export { default as apiClient } from './client';
export { default as productsApi } from './productsApi';
export { default as categoriesApi } from './categoriesApi';
export { default as brandsApi } from './brandsApi';
export { default as rfqApi } from './rfqApi';
export { default as settingsApi } from './settingsApi';
export { default as searchLogsApi } from './searchLogsApi';

// Also export a combined object for convenience
import productsApi from './productsApi';
import categoriesApi from './categoriesApi';
import brandsApi from './brandsApi';
import rfqApi from './rfqApi';
import settingsApi from './settingsApi';
import searchLogsApi from './searchLogsApi';

const api = {
  products: productsApi,
  categories: categoriesApi,
  brands: brandsApi,
  rfq: rfqApi,
  settings: settingsApi,
  searchLogs: searchLogsApi,
};

export default api;