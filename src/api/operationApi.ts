import type { MaintenanceRepairItem, OrderItem } from '../types/app-domain';
import { get, post, request } from '../utils/request';
import { getToken } from '../utils/auth';

const BASE_URL = 'http://customer.justpai.com/prod-api';

// ==================== 订单管理 ====================

/** 维保报修状态映射 */
const REPAIR_STATUS_MAP: Record<string, string> = {
  '1': '待维保',
  '2': '维保中',
  '3': '已维保',
};

/**
 * 订单状态映射
 * op_order.status 参考: xyw-system OpOrder.java
 * 1:待确认 2:待支付 3:待签约 4:已支付 5:已签约 6:服务中 7:已完工 8:已取消
 */
const ORDER_STATUS_MAP: Record<string, string> = {
  '1': '待确认',
  '2': '待支付',
  '3': '待签约',
  '4': '已支付',
  '5': '已签约',
  '6': '服务中',
  '7': '已完工',
  '8': '已取消',
};

/**
 * 获取订单列表
 * GET /opproduct/oporder/list
 */
export async function fetchOrders(
  pageNum: number = 1,
  pageSize: number = 10,
  searchCode?: string,
  filterType?: string,
  filterStatus?: string
): Promise<{ list: OrderItem[]; total: number }> {
  const params: Record<string, any> = {
    pageNum,
    pageSize,
  };
  if (searchCode?.trim()) params.code = searchCode.trim();
  if (filterType) params.type = filterType;
  if (filterStatus) params.status = filterStatus;

  try {
    const res = await get('/opproduct/oporder/list', params);
    const rawList = res?.rows || [];
    const total = res?.total || rawList.length;

    const list: OrderItem[] = rawList.map((item: any) => ({
      id: Number(item.opOrder?.id || item.id),
      orderNo: item.opOrder?.code || item.orderNo || '',
      orderAmount: parseFloat(item.opOrder?.orderPrice) || 0,
      orderTime: item.opOrder?.createdTime || item.orderTime || '',
      serviceAddress: item.customerAddress || item.serviceAddress || '',
      status: ORDER_STATUS_MAP[item.opOrder?.status] || item.opOrder?.status || '',
    }));

    return { list, total: Number(total) };
  } catch (error) {
    console.error('获取订单列表失败:', error);
    return { list: [], total: 0 };
  }
}

/** 订单详情行项目 */
export interface OrderDetailLineItem {
  productName: string;
  brand: string;
  model: string;
  quantity: number;
  salePrice: number;
  payPrice: number;
}

/** 订单详情（含客户/地址/行项目等） */
export interface OrderDetail {
  id: number;
  orderNo: string;
  code: string;
  customerName: string;
  customerAddress: string;
  customerContactsName: string;
  customerContactsPhone: string;
  orderPrice: number;
  payDeadline: string;
  payWay: string;
  duration: string;
  remark: string;
  remark2: string;
  opOrderSubDetailList: OrderDetailLineItem[];
  orderSubList?: any[];
  status?: string;
  busCustomer?: {
    companyName: string;
    baileeName: string;
    baileePhone: string;
    registerPhone: string;
    contactsEmail: string;
    registerAddress: string;
    dept?: { deptName: string };
  };
}

/**
 * 获取订单详情
 * GET /opproduct/oporder/{orderId}
 * 参考: xyw-ui/src/views/opproduct/oporder/details.vue → getOporder(id)
 */
export async function fetchOrderDetail(orderId: number): Promise<OrderDetail | null> {
  try {
    const res = await get(`/opproduct/oporder/${orderId}`);
    const data = res?.data;
    if (!data) return null;

    // 客户/地址信息从 orderSubList[0] 取
    const firstSub = data.orderSubList?.[0] || {};

    // 产品行项目扁平化：orderSubList 中各子订单的 orderSubDetailList 汇总
    const allLineItems: OrderDetailLineItem[] = [];
    (data.orderSubList || []).forEach((sub: any) => {
      (sub.orderSubDetailList || []).forEach((item: any) => {
        allLineItems.push({
          productName: item.productName || '',
          brand: item.productBrandName || '',
          model: item.productBrandDetailModel || '',
          quantity: Number(item.orderNumber) || 0,
          salePrice: parseFloat(item.productBrandDetailSaleCost) || 0,
          payPrice: parseFloat(item.payPrice) || 0,
        });
      });
    });

    return {
      id: Number(data.id || 0),
      orderNo: data.code || '',
      code: data.code || '',
      customerName: firstSub.customerContactsName || '',
      customerAddress: firstSub.customerAddress || '',
      customerContactsName: firstSub.customerContactsName || '',
      customerContactsPhone: firstSub.customerContactsPhone || '',
      orderPrice: parseFloat(data.orderPrice) || 0,
      payDeadline: data.payDeadline || '',
      payWay: data.payWay || '',
      duration: data.duration || '',
      remark: data.remark || '',
      remark2: data.remark2 || '',
      opOrderSubDetailList: allLineItems,
      orderSubList: data.orderSubList || [],
      status: data.status,
      busCustomer: data.busCustomer || {},
    };
  } catch (error) {
    console.error('获取订单详情失败:', error);
    return null;
  }
}

// ==================== 维保报修管理 ====================

/**
 * 获取维保报修工单列表
 * GET /opproduct/ordermaintenance/list
 */
export async function fetchMaintenanceRepairOrders(
  pageNum: number = 1,
  pageSize: number = 10,
  searchCode?: string,
  searchOrderCode?: string,
  searchOrderName?: string
): Promise<{ list: MaintenanceRepairItem[]; total: number }> {
  const params: Record<string, any> = {
    pageNum,
    pageSize,
  };
  if (searchCode?.trim()) params.code = searchCode.trim();
  if (searchOrderCode?.trim()) params.orderCode = searchOrderCode.trim();
  if (searchOrderName?.trim()) params.orderName = searchOrderName.trim();

  try {
    const res = await get('/opproduct/ordermaintenance/list', params);
    const rawList = res?.rows || [];
    const total = res?.total || rawList.length;

    const list: MaintenanceRepairItem[] = rawList.map((item: any) => ({
      id: Number(item.id),
      no: item.code || '',
      projectName: item.projectName || '',
      address: item.orderAddress || '',
      managerName: item.directorName || item.customerContactsName || '',
      managerPhone: item.directorPhone || item.customerContactsPhone || '',
      status: REPAIR_STATUS_MAP[item.status] || item.status || '',
      teamInfo: '',
      startDate: item.startDate || '',
      completionDate: item.endDate || '',
      warrantyPeriod: item.warrantyPeriod || '',
      reportType: '',
      visitTime: '',
      reason: '',
      images: [],
      media: [],
    }));

    return { list, total: Number(total) };
  } catch (error) {
    console.error('获取维保报修列表失败:', error);
    return { list: [], total: 0 };
  }
}

/** 维保报修详情 */
export interface MaintenanceRepairDetail {
  id: number;
  code: string;
  projectName: string;
  projectCode: string;
  orderAddress: string;
  directorName: string;
  directorPhone: string;
  status: string;
  bxType: string;        // '1'=普通 '2'=紧急
  bxReason: string;
  doorTime: string;
  files: string;          // 逗号分隔的 URL 列表
  projectType: string;
  orderCode: string;
  orderName: string;
  zbData2?: string;       // JSON 字符串，包含客户/产品信息
}

/**
 * 获取维保报修工单详情
 * GET /opproduct/ordermaintenance/{id}
 */
export async function fetchMaintenanceRepairDetail(id: number): Promise<MaintenanceRepairDetail | null> {
  try {
    const res = await get(`/opproduct/ordermaintenance/${id}`);
    const data = res?.data;
    if (!data) return null;
    return {
      id: Number(data.id || 0),
      code: data.code || '',
      projectName: data.projectName || '',
      projectCode: data.projectCode || '',
      orderAddress: data.orderAddress || '',
      directorName: data.directorName || '',
      directorPhone: data.directorPhone || '',
      status: REPAIR_STATUS_MAP[data.status] || data.status || '',
      bxType: data.bxType || '',
      bxReason: data.bxReason || '',
      doorTime: data.doorTime || '',
      files: data.files || '',
      projectType: data.projectType || '',
      orderCode: data.orderCode || '',
      orderName: data.orderName || '',
      zbData2: data.zbData2 || '',
    };
  } catch (error) {
    console.error('获取维保报修详情失败:', error);
    return null;
  }
}

/**
 * 新增维保报修工单
 * POST /opproduct/ordermaintenance
 */
export async function addMaintenanceRepair(data: Record<string, any>): Promise<any> {
  return await post('/opproduct/ordermaintenance', data);
}

/**
 * 删除维保报修工单
 * DELETE /opproduct/ordermaintenance/{id}
 */
export async function deleteMaintenanceRepair(id: number): Promise<any> {
  const { del } = await import('../utils/request');
  return await del(`/opproduct/ordermaintenance/${id}`);
}

/**
 * 新增维保报修工单（add2 路径 - 无子订单产品选择）
 * POST /opproduct/ordermaintenance/add2
 */
export async function addMaintenanceRepair2(data: Record<string, any>): Promise<any> {
  return await post('/opproduct/ordermaintenance/add2', data);
}

// ==================== 已完工项目（维保报修下拉） ====================

/** 已完工项目选项 */
export interface EndProjectOption {
  projectId: string;
  projectName: string;
  orderCode: string;
  projectCode: string;
  startTime: string;
  endTime: string;
  warrantyPeriod: string;
  contactsName: string;
  contactsPhone: string;
  companyName: string;
  address: string;
  projectDirectorName: string;
  projectDirectorPhone: string;
  directorId: string;
  maintenance: string; // '1' 可维保 '0' 已过维保期
}

/**
 * 获取已完工项目列表（供维保报修新增弹窗下拉选择）
 * GET /business/project-gz/endprojects
 */
export async function fetchEndProjects(): Promise<EndProjectOption[]> {
  try {
    const res = await get('/business/project-gz/endprojects');
    return res?.data || [];
  } catch (error) {
    console.error('获取已完工项目失败:', error);
    return [];
  }
}

// ==================== 公共上传 ====================

/**
 * 上传文件（图片/视频）
 * POST /business/resources/upload
 * 返回 { code: 200, msg: "url" }
 */
export async function uploadFile(file: File): Promise<string | null> {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const token = getToken();
    const res = await fetch(`${BASE_URL}/business/resources/upload`, {
      method: 'POST',
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
      },
      body: formData,
    });

    if (!res.ok) {
      throw new Error(`上传失败: ${res.status}`);
    }

    const result = await res.json();
    if (result.code === 200 && result.msg) {
      return result.msg;
    }
    console.warn('上传返回异常:', result);
    return null;
  } catch (error) {
    console.error('文件上传失败:', error);
    return null;
  }
}
