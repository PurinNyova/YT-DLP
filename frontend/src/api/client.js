import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 30000,
});

export const fetchVideoInfo = async (url) => {
  const response = await api.get('/info', { params: { url } });
  return response.data;
};

export const startDownload = async (url, format, quality) => {
  const response = await api.post('/download', { url, format, quality });
  return response.data;
};

export const getDownloadStatus = async (id) => {
  const response = await api.get(`/download/${id}/status`);
  return response.data;
};

export const getDownloadFileURL = (id) => `/api/download/${id}/file`;

export const listDownloads = async (page = 1, pageSize = 20) => {
  const response = await api.get('/downloads', { params: { page, page_size: pageSize } });
  return response.data;
};

export default api;
