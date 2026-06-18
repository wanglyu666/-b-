/**
 * 统一请求工具
 * 封装 fetch 请求，支持统一前缀、请求头、错误处理
 */
import { getToken } from './auth';

const BASE_URL = 'http://customer.justpai.com/prod-api';

/**
 * 获取 Authorization header
 */
function getAuthHeader() {
  const token = getToken();
  return token ? `Bearer ${token}` : '';
}

/**
 * 通用请求方法
 * @param {string} url - 请求路径（会拼接 BASE_URL）
 * @param {RequestInit} options - fetch 选项
 * @returns {Promise<any>} 响应数据的 data 字段
 */
export async function request(url, options = {}) {
  const fullUrl = url.startsWith('http') ? url : `${BASE_URL}${url}`;
  
  const defaultHeaders = {
    'Content-Type': 'application/json',
    'Authorization': getAuthHeader(),
  };

  const config = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(fullUrl, config);
    
    if (!response.ok) {
      throw new Error(`请求失败: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    
    // 假设后端返回格式为 { code, msg, data }
    if (result.code !== 200 && result.code !== 0 && result.code !== undefined) {
      console.warn(`[request] 接口返回异常:`, result);
    }
    
    return result;
  } catch (error) {
    console.error(`[request] 请求出错:`, error);
    throw error;
  }
}

/**
 * GET 请求
 */
export function get(url, params = {}, options = {}) {
  const queryString = new URLSearchParams(params).toString();
  const fullUrl = queryString ? `${url}?${queryString}` : url;
  return request(fullUrl, { ...options, method: 'GET' });
}

/**
 * POST 请求
 */
export function post(url, data = {}, options = {}) {
  return request(url, {
    ...options,
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * PUT 请求
 */
export function put(url, data = {}, options = {}) {
  return request(url, {
    ...options,
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

/**
 * DELETE 请求
 */
export function del(url, data = {}, options = {}) {
  return request(url, {
    ...options,
    method: 'DELETE',
    body: JSON.stringify(data),
  });
}

export default request;
