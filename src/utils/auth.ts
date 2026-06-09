const TOKEN_KEY = 'auth_token';

/**
 * 从 localStorage 获取 token
 */
export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

/**
 * 存储 token 到 localStorage
 */
export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

/**
 * 清除 token
 */
export function removeToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

/**
 * 从当前页面 URL 中提取 token 参数
 * 示例：?token=eyJhbGci... 或 &token=eyJhbGci...
 */
export function extractTokenFromUrl(): string | null {
  const params = new URLSearchParams(window.location.search);
  return params.get('token');
}

/**
 * 从 URL 提取 token 并存入缓存，如果 URL 中有 token 则存储后清理 URL
 * @returns 是否成功提取并存储了 token
 */
export function initTokenFromUrl(): boolean {
  const token = extractTokenFromUrl();
  if (token) {
    setToken(token);
    // 清理 URL 中的 token 参数，但不刷新页面
    const url = new URL(window.location.href);
    url.searchParams.delete('token');
    window.history.replaceState({}, '', url.toString());
    return true;
  }
  return false;
}

/**
 * 获取完整 Authorization header 值
 */
export function getAuthorizationHeader(): string {
  const token = getToken();
  return token ? `Bearer ${token}` : '';
}
