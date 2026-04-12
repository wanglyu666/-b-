export type BackendRouteConfig = {
  name: string;
  path: string;
  componentKey: string;
  meta?: Record<string, unknown>;
};

/**
 * 后端路由配置接口（当前为演示桩）。
 * 生产接入时改为真实 HTTP 请求并返回路由清单。
 */
export async function fetchBackendRoutes(): Promise<BackendRouteConfig[]> {
  return [];
}
