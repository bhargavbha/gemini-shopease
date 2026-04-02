import BaseService from './BaseService';

const ApiService = {
  get: (url, config = {}) => BaseService.get(url, config),
  post: (url, data = {}, config = {}) => BaseService.post(url, data, config),
  put: (url, data = {}, config = {}) => BaseService.put(url, data, config),
  delete: (url, config = {}) => BaseService.delete(url, config),
};

export default ApiService;
