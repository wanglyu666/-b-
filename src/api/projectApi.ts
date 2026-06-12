import { get, post, put } from '../utils/request';
import type { EngineeringProject } from '../types';

/** 工程项目状态与接口参数映射 */
const STATUS_PARAMS: Record<string, Record<string, string>> = {
  '待开工': { constructionStatus: '1' },
  '施工中': { constructionStatus: '2' },
  '已完工': { constructionStatus: '3' },
  '已结算': { settleStatus: '2' },
  '保修中': { constructionStatus: '4' },
  '保修外': { constructionStatus: '5' },
};

/** 工程项目列表接口 */
const API_LIST = '/spot/spotorder/list3';

/** 接口返回的分页信息 */
export interface ProjectListResponse {
  list: EngineeringProject[];
  total: number;
  pageNum: number;
  pageSize: number;
}

/**
 * 获取工程项目列表（根据状态筛选，支持分页和搜索）
 * @param status 状态：待开工/施工中/已完工/已结算/保修中/保修外
 * @param pageNum 页码，默认 1
 * @param pageSize 每页条数，默认 9
 * @param searchKey 搜索关键词（按 projectName 搜索）
 */
export async function fetchEngineeringProjects(
  status?: string,
  pageNum: number = 1,
  pageSize: number = 9,
  searchKey?: string
): Promise<ProjectListResponse> {
  const params: Record<string, any> = {
    pageNum,
    pageSize,
    projectType: 1,
  };

  // 如果指定了状态，添加对应参数
  if (status && STATUS_PARAMS[status]) {
    Object.assign(params, STATUS_PARAMS[status]);
  }

  // 如果有搜索关键词，按 projectName 搜索
  if (searchKey && searchKey.trim()) {
    params.projectName = searchKey.trim();
  }

  try {
    const res = await get(API_LIST, params);
    
    // 尝试从接口返回中提取数据
    const rawList = res.data?.list || res.data?.records || res.rows || [];
    const total = res.data?.total || res.total || rawList.length;
    
    // 映射后端字段到前端类型
    const list: EngineeringProject[] = rawList.map((item: any) => ({
      id: String(item.id || item.orderId),
      no: item.projectCode || item.orderNo || item.no || '',       // 项目编号
      name: item.projectName || item.name || '',                   // 项目名称
      address: item.projectAddress || item.address || '',         // 项目地址
      amount: item.contractAmount ? `¥ ${parseFloat(item.contractAmount).toLocaleString()}` : '¥ 0',  // 合同金额
      manager: item.headName2 || item.manager || item.principal || '',  // 负责人
      contact: item.headPhone2 || item.contact || item.phone || '',    // 联系方式
      startDate: item.constructionBeginTime || item.startDate || item.planStartDate || '',  // 开工日期
      endDate: item.endDate || item.planEndDate || '',
      status: status || '施工中',
      projectId: String(item.projectId || ''),
    }));

    return {
      list,
      total: Number(total),
      pageNum,
      pageSize,
    };
  } catch (error) {
    console.error('获取工程项目列表失败:', error);
    return {
      list: [],
      total: 0,
      pageNum,
      pageSize,
    };
  }
}

/**
 * 获取全部工程项目（各状态合并，用于首页展示）
 */
export async function fetchAllEngineeringProjects(): Promise<EngineeringProject[]> {
  const statusKeys = Object.keys(STATUS_PARAMS);
  const results = await Promise.all(
    statusKeys.map(status => fetchEngineeringProjects(status, 1, 100))
  );
  return results.flatMap(r => r.list);
}

/**
 * 各状态的项目数量
 */
export interface ProjectCounts {
  '待开工': number;
  '施工中': number;
  '已完工': number;
  '已结算': number;
  '保修中': number;
  '保修外': number;
}

/**
 * 分别请求各状态的项目总数（用于管理中心首页统计）
 */
export async function fetchProjectCounts(): Promise<ProjectCounts> {
  const statusKeys = Object.keys(STATUS_PARAMS) as (keyof ProjectCounts)[];
  const results = await Promise.all(
    statusKeys.map(status => fetchEngineeringProjects(status, 1, 1))
  );
  const counts: any = {};
  statusKeys.forEach((status, i) => {
    counts[status] = results[i].total;
  });
  return counts as ProjectCounts;
}

/**
 * 日报列表项
 */
export interface DailyReportItem {
  id: number;
  type: string;   // 日报名称
  date: string;   // 日期
  name: string;   // 负责人
}

/**
 * 日报列表响应
 */
export interface DailyReportListResponse {
  list: DailyReportItem[];
  total: number;
  pageNum: number;
  pageSize: number;
}

/**
 * 获取日报列表（分页）
 * @param spotOrderId 项目ID
 * @param pageNum 页码，默认 1
 * @param pageSize 每页条数，默认 9
 */
export async function fetchDailyReports(
  spotOrderId: string,
  pageNum: number = 1,
  pageSize: number = 9
): Promise<DailyReportListResponse> {
  try {
    const res = await get('/spot/spotorderdaily/list', {
      pageNum,
      pageSize,
      spotOrderId,
    });

    const rawList = res.data?.list || res.data?.records || res.rows || [];
    const total = res.data?.total || res.total || rawList.length;

    const list: DailyReportItem[] = rawList.map((item: any) => ({
      id: Number(item.id),
      type: item.type || '',
      date: item.date || '',
      name: item.name || '',
    }));

    return {
      list,
      total: Number(total),
      pageNum,
      pageSize,
    };
  } catch (error) {
    console.error('获取日报列表失败:', error);
    return { list: [], total: 0, pageNum, pageSize };
  }
}

/**
 * 通用：从 URL 下载文件并保存到本地
 */
export async function downloadFileFromUrl(fileUrl: string, fileName: string): Promise<void> {
  const response = await fetch(fileUrl);
  if (!response.ok) {
    throw new Error(`下载文件失败: ${response.status}`);
  }
  const blob = await response.blob();
  const blobUrl = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = blobUrl;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(blobUrl);
}

/**
 * 下载单条日报 PDF
 * 接口返回 JSON: { code: 200, data: "https://....pdf" }
 * @param id 日报ID
 */
export async function downloadReportPdf(id: number): Promise<void> {
  const res = await get('/spot/spotorderdaily/getpdf', { id });
  const fileUrl = res?.data;
  if (!fileUrl || typeof fileUrl !== 'string') {
    throw new Error('未获取到文件下载地址');
  }
  await downloadFileFromUrl(fileUrl, `日报_${id}.pdf`);
}

/**
 * 下载全部日报 ZIP
 * 接口返回 JSON: { code: 200, data: "https://....zip" }
 * @param spotOrderId 项目ID
 */
export async function downloadReportZip(spotOrderId: string): Promise<void> {
  const res = await get('/spot/spotorderdaily/getzip', { type: 1, spotOrderId });
  const fileUrl = res?.data;
  if (!fileUrl || typeof fileUrl !== 'string') {
    throw new Error('未获取到文件下载地址');
  }
  await downloadFileFromUrl(fileUrl, `日报合集_${spotOrderId}.zip`);
}

/**
 * 获取维保项目列表（使用 mock 数据，如需真接口请自行添加）
 */
export async function fetchMaintenanceProjects(): Promise<any[]> {
  return [];
}

// ========== 日报详情相关 ==========

/** 工种字典缓存（id → name） */
let workTypeCache: Map<number, string> | null = null;

/**
 * 获取工种字典（id → name 映射），有缓存
 */
export async function fetchWorkTypeMap(): Promise<Map<number, string>> {
  if (workTypeCache) return workTypeCache;

  const res = await get('/business/busworkmanage/listAll');
  const rows = res?.data?.rows || res?.rows || [];
  workTypeCache = new Map();
  rows.forEach((item: any) => {
    workTypeCache!.set(Number(item.id), item.name || '');
  });
  return workTypeCache;
}

/**
 * 日报详情原始数据
 */
export interface DailyReportRaw {
  dailyJson: Record<string, any>;
  dayLaborList: any[];
}

/**
 * 获取单条日报详情
 * @param id 日报ID
 */
export async function fetchDailyReportDetail(id: number): Promise<DailyReportRaw> {
  const res = await get(`/spot/spotorderdaily/${id}`);
  const data = res?.data || res;
  return {
    dailyJson: data.dailyJson ? JSON.parse(data.dailyJson) : {},
    dayLaborList: data.dayLabor ? JSON.parse(data.dayLabor) : [],
  };
}

// ========== 周报相关 ==========

/** 周报列表项 */
export interface WeeklyReportItem {
  id: number;
  type: string;   // 周报名称
  date: string;   // 日期
  name: string;   // 负责人
}

/** 周报列表响应 */
export interface WeeklyReportListResponse {
  list: WeeklyReportItem[];
  total: number;
  pageNum: number;
  pageSize: number;
}

/**
 * 获取周报列表（分页）
 * @param spotOrderId 项目ID
 * @param pageNum 页码，默认 1
 * @param pageSize 每页条数，默认 9
 */
export async function fetchWeeklyReports(
  spotOrderId: string,
  pageNum: number = 1,
  pageSize: number = 9
): Promise<WeeklyReportListResponse> {
  try {
    const res = await get('/spot/spotorderweekly/list', {
      pageNum,
      pageSize,
      spotOrderId,
    });

    const rawList = res.data?.list || res.data?.records || res.rows || [];
    const total = res.data?.total || res.total || rawList.length;

    const list: WeeklyReportItem[] = rawList.map((item: any) => ({
      id: Number(item.id),
      type: item.type || '',
      date: item.date || '',
      name: item.name || '',
    }));

    return {
      list,
      total: Number(total),
      pageNum,
      pageSize,
    };
  } catch (error) {
    console.error('获取周报列表失败:', error);
    return { list: [], total: 0, pageNum, pageSize };
  }
}

/**
 * 周报详情原始数据
 */
export interface WeeklyReportRaw {
  weeklyJson: Record<string, any>;
}

/**
 * 获取单条周报详情
 * @param id 周报ID
 */
export async function fetchWeeklyReportDetail(id: number): Promise<WeeklyReportRaw> {
  const res = await get(`/spot/spotorderweekly/${id}`);
  const data = res?.data || res;
  return {
    weeklyJson: data.weeklyJson ? JSON.parse(data.weeklyJson) : {},
  };
}

// ========== EHS 周报相关 ==========

/** EHS 周报详情原始数据 */
export interface EHSReportRaw {
  secureWeekly: Record<string, any>;
}

/**
 * 获取单条 EHS 周报详情
 * 与周报详情同一个接口，但解析 data.secureWeekly 字段
 * @param id EHS 周报ID
 */
export async function fetchEHSReportDetail(id: number): Promise<EHSReportRaw> {
  const res = await get(`/spot/spotorderweekly/${id}`);
  const data = res?.data || res;
  return {
    secureWeekly: data.secureWeekly ? JSON.parse(data.secureWeekly) : {},
  };
}

// ========== 过程验收相关 ==========

/**
 * 获取招标订单详情（材料管控数据源）
 * @param spotOrderId 项目ID
 */
export async function fetchBidOrderDetail(spotOrderId: string): Promise<{
  draftData: Record<string, any>;
}> {
  try {
    const res = await get(`/bid/bidorder/getDetailBySpotOrderId/${spotOrderId}`);
    const data = res?.data || res;
    const draftData = data.zbData ? JSON.parse(data.zbData) : {};
    return { draftData };
  } catch (error) {
    console.error('获取材料管控数据失败:', error);
    return { draftData: {} };
  }
}

/** 字典项 */
export interface DictItem {
  dictValue: string;
  dictLabel: string;
}

/** 字典缓存 */
const dictCache: Map<string, DictItem[]> = new Map();

/**
 * 获取字典数据（带缓存）
 * @param dictType 字典类型，如 xyw_material_profession_type
 */
export async function fetchDictData(dictType: string): Promise<DictItem[]> {
  if (dictCache.has(dictType)) return dictCache.get(dictType)!;
  try {
    const res = await get(`/system/dict/data/type/${dictType}`);
    const data = res?.data || [];
    const list: DictItem[] = Array.isArray(data) ? data.map((item: any) => ({
      dictValue: String(item.dictValue ?? ''),
      dictLabel: String(item.dictLabel ?? ''),
    })) : [];
    dictCache.set(dictType, list);
    return list;
  } catch (error) {
    console.error(`获取字典 ${dictType} 失败:`, error);
    return [];
  }
}

/**
 * 根据字典 value 获取 label
 */
export function getDictLabel(dictItems: DictItem[], value: string): string {
  const found = dictItems.find(d => d.dictValue === value);
  return found?.dictLabel || value || '-';
}

/** 进度验收节点列表项 */
export interface ProgressNodeItem {
  id: number;
  nodeName: string;
  planTime: string;
  xmzYuyueTime: string;
  kfYuyueTime: string;
  status: string;
  xmzType: string;
  kfType: string;
  ysStatus: string;
}

/** 进度验收节点列表响应 */
export interface ProgressNodeListResponse {
  list: ProgressNodeItem[];
  total: number;
  pageNum: number;
  pageSize: number;
}

/**
 * 获取进度验收节点列表（分页）
 */
export async function fetchProgressNodes(
  spotOrderId: string,
  pageNum: number = 1,
  pageSize: number = 10
): Promise<ProgressNodeListResponse> {
  try {
    const res = await get('/spot/spotordernodecontrol/list', {
      pageNum,
      pageSize,
      spotOrderId,
      type: 1,
    });

    const rawList = res.data?.list || res.data?.records || res.rows || [];
    const total = res.data?.total || res.total || rawList.length;

    const list: ProgressNodeItem[] = rawList.map((item: any) => ({
      id: Number(item.id),
      nodeName: item.nodeName || '',
      planTime: item.planTime || '',
      xmzYuyueTime: item.xmzYuyueTime || '',
      kfYuyueTime: item.kfYuyueTime || '',
      status: String(item.status ?? ''),
      xmzType: String(item.xmzType ?? ''),
      kfType: String(item.kfType ?? ''),
      ysStatus: String(item.ysStatus ?? ''),
    }));

    return { list, total: Number(total), pageNum, pageSize };
  } catch (error) {
    console.error('获取进度验收节点列表失败:', error);
    return { list: [], total: 0, pageNum, pageSize };
  }
}

/** 进度节点详情 */
export interface ProgressNodeDetail {
  form: Record<string, any>;
  controlDataList: { fileUrl: string }[];
}

/**
 * 获取进度节点详情
 */
export async function fetchProgressNodeDetail(id: number): Promise<ProgressNodeDetail> {
  const res = await get(`/spot/spotordernodecontrol/${id}`);
  const data = res?.data || res;
  const controlDataList = data.controlData ? JSON.parse(data.controlData) : [];
  return {
    form: { ...data },
    controlDataList: Array.isArray(controlDataList) ? controlDataList : [],
  };
}

/**
 * 客户预约验收 - 修改节点管控
 * POST /spot/spotordernodecontrol
 */
export async function updateSpotordernodecontrol(data: Record<string, any>): Promise<any> {
  return await put('/spot/spotordernodecontrol', data);
}

/**
 * 客户提交验收评价 - ysStatus: 2通过 3拒绝
 * PUT /spot/spotordernodecontrol/ysStatus
 */
export async function updateYsStatus(data: Record<string, any>): Promise<any> {
  return await put('/spot/spotordernodecontrol/ysStatus', data);
}

/**
 * 修改售后计划（客户预约巡检/验收）
 * PUT /spot/aftersalesplan
 */
export async function updateAftersalesplan(data: Record<string, any>): Promise<any> {
  return await put('/spot/aftersalesplan', data);
}

/** 售后计划列表项 */
export interface AfterSalesPlanItem {
  id: number;
  plan: string;
  planTime: string;
  startTime: string;
  endTime: string;
  status: string;
}

/**
 * 获取售后计划列表
 * GET /spot/aftersalesplan/spotorder/{spotOrderId}
 */
export async function fetchAfterSalesPlans(spotOrderId: string): Promise<AfterSalesPlanItem[]> {
  try {
    const res = await get(`/spot/aftersalesplan/spotorder/${spotOrderId}`);
    const rawList = res?.data?.spotOrderAfterSalesPlans || [];
    return rawList.map((item: any) => ({
      id: Number(item.id),
      plan: item.plan || '',
      planTime: item.planTime || '',
      startTime: item.startTime || '',
      endTime: item.endTime || '',
      status: String(item.status ?? ''),
    }));
  } catch (error) {
    console.error('获取售后计划列表失败:', error);
    return [];
  }
}

/** 缺陷整改列表项 */
export interface DefectItem {
  id: number;
  defectFile: string;
  createTime: string;
  defectDescribe: string;
}

/** 缺陷整改列表响应 */
export interface DefectListResponse {
  list: DefectItem[];
  total: number;
  pageNum: number;
  pageSize: number;
}

/**
 * 获取缺陷整改列表
 */
export async function fetchDefectList(
  spotOrderId: string,
  nodeName: string,
  pageNum: number = 1,
  pageSize: number = 10
): Promise<DefectListResponse> {
  try {
    const res = await get('/spot/spotordernodecontroldefect/list', {
      pageNum,
      pageSize,
      spotOrderId,
      nodeName,
      source: 1,
      defectType: 1,
    });

    const rawList = res.data?.list || res.data?.records || res.rows || [];
    const total = res.data?.total || res.total || rawList.length;

    const list: DefectItem[] = rawList.map((item: any) => ({
      id: Number(item.id),
      defectFile: item.defectFile || '',
      createTime: item.createTime || '',
      defectDescribe: item.defectDescribe || '',
    }));

    return { list, total: Number(total), pageNum, pageSize };
  } catch (error) {
    console.error('获取缺陷整改列表失败:', error);
    return { list: [], total: 0, pageNum, pageSize };
  }
}

/**
 * 上传文件（图片）
 * @param file 文件对象
 * @returns 上传后的 url
 */
export async function uploadFile(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);

  const BASE_URL = 'http://customer.justpai.com/prod-api';
  const { getToken } = await import('../utils/auth');
  const token = getToken();

  const response = await fetch(`${BASE_URL}/business/resources/upload`, {
    method: 'POST',
    headers: {
      'Authorization': token ? `Bearer ${token}` : '',
    },
    body: formData,
  });

  const result = await response.json();
  if (result.code === 200 && result.msg) {
    return result.msg;
  }
  throw new Error(result.msg || '上传失败');
}

/** 创建缺陷接口参数 */
export interface CreateDefectParams {
  spotOrderId: string;
  projectId: string;
  nodeName: string;
  defectFile: string;
  defectDescribe: string;
}

/**
 * 新增缺陷整改记录
 */
export async function createDefect(params: CreateDefectParams): Promise<void> {
  const payload = [{
    id: null,
    spotOrderId: Number(params.spotOrderId),
    projectId: Number(params.projectId),
    nodeName: params.nodeName,
    source: '1',
    defectFile: params.defectFile,
    defectDescribe: params.defectDescribe,
  }];
  await post('/spot/spotordernodecontroldefect', payload);
}
