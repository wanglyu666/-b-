import { get, post, put, del } from '../utils/request';

// ==================== 用户信息 ====================

/**
 * 获取当前登录用户信息
 * GET /getInfo
 * @returns customerName 用户昵称
 */
export async function fetchUserInfo(): Promise<string> {
  try {
    const res = await get('/getInfo');
    return res?.customer?.customerName || '管理员';
  } catch (error) {
    console.error('获取用户信息失败:', error);
    return '管理员';
  }
}
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
      isEvaluate: String(item.isEvaluate ?? '0'),
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

/** 维保项目施工状态映射 */
const MAINTENANCE_STATUS_MAP: Record<string, string> = {
  '1': '待开工',
  '2': '施工中',
  '3': '已完工',
};

/** 维保项目反向状态映射：中文 → API constructionStatus */
const MAINTENANCE_STATUS_TO_API: Record<string, string> = {
  '待开工': '1',
  '施工中': '2',
  '已完工': '3',
};

/**
 * 获取维保项目列表（根据状态筛选，支持分页和搜索）
 * 接口与工程项目同源 /spot/spotorder/list3，projectType=2
 * @param status 状态：待开工/施工中/已完工
 * @param pageNum 页码，默认 1
 * @param pageSize 每页条数，默认 9
 * @param searchKey 搜索关键词
 */
export async function fetchMaintenanceProjects(
  status?: string,
  pageNum: number = 1,
  pageSize: number = 9,
  searchKey?: string
): Promise<ProjectListResponse> {
  const params: Record<string, any> = {
    pageNum,
    pageSize,
    projectType: '2',
  };

  if (status && MAINTENANCE_STATUS_TO_API[status]) {
    params.constructionStatus = MAINTENANCE_STATUS_TO_API[status];
  }

  if (searchKey && searchKey.trim()) {
    params.projectName = searchKey.trim();
  }

  try {
    const res = await get(API_LIST, params);
    const rawList = res.data?.list || res.data?.records || res.rows || [];
    const total = res.data?.total || res.total || rawList.length;

    const list: EngineeringProject[] = rawList.map((item: any) => ({
      id: String(item.id || ''),
      no: item.projectCode || '',
      name: item.projectName || '',
      address: item.projectAddress || '',
      amount: item.contractAmount ? `¥ ${parseFloat(item.contractAmount).toLocaleString()}` : '¥ 0',
      manager: item.headName2 || '',
      contact: item.headPhone2 || '',
      startDate: item.constructionBeginTime || '',
      endDate: item.constructionEndTime || '',
      status: (status || MAINTENANCE_STATUS_MAP[item.constructionStatus] || '待开工') as EngineeringProject['status'],
      projectId: String(item.projectId || ''),
      isEvaluate: String(item.isEvaluate ?? '0'),
    }));

    return { list, total: Number(total), pageNum, pageSize };
  } catch (error) {
    console.error('获取维保项目列表失败:', error);
    return { list: [], total: 0, pageNum, pageSize };
  }
}

/**
 * 获取维保项目各状态数量（用于管理中心首页统计）
 */
export async function fetchMaintenanceProjectCounts(): Promise<Record<string, number>> {
  const statusKeys = ['待开工', '施工中', '已完工'];
  const results = await Promise.all(
    statusKeys.map(status => fetchMaintenanceProjects(status, 1, 1))
  );
  const counts: Record<string, number> = {};
  statusKeys.forEach((status, i) => {
    counts[status] = results[i].total;
  });
  return counts;
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
  planTime?: string;
  completeFile?: string;
  completeTime?: string;
  status?: string;
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
 * 过程验收-进度管控-缺陷整改（defectType=1, 需要 nodeName/spotOrderId）
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
      planTime: item.planTime || '',
      completeFile: item.completeFile || '',
      completeTime: item.completeTime || '',
      status: String(item.status ?? ''),
    }));

    return { list, total: Number(total), pageNum, pageSize };
  } catch (error) {
    console.error('获取缺陷整改列表失败:', error);
    return { list: [], total: 0, pageNum, pageSize };
  }
}

/**
 * 获取缺陷汇报列表（项目操作指令→缺陷汇报）
 * defectType=2, source=1, 使用 projectId 查询
 */
export async function fetchDefectReportList(
  projectId: string,
  pageNum: number = 1,
  pageSize: number = 10
): Promise<DefectListResponse> {
  try {
    const res = await get('/spot/spotordernodecontroldefect/list', {
      pageNum,
      pageSize,
      projectId,
      source: 1,
      defectType: 2,
    });

    const rawList = res.data?.list || res.data?.records || res.rows || [];
    const total = res.data?.total || res.total || rawList.length;

    const list: DefectItem[] = rawList.map((item: any) => ({
      id: Number(item.id),
      defectFile: item.defectFile || '',
      createTime: item.createTime || '',
      defectDescribe: item.defectDescribe || '',
      planTime: item.planTime || '',
      completeFile: item.completeFile || '',
      completeTime: item.completeTime || '',
      status: String(item.status ?? ''),
    }));

    return { list, total: Number(total), pageNum, pageSize };
  } catch (error) {
    console.error('获取缺陷汇报列表失败:', error);
    return { list: [], total: 0, pageNum, pageSize };
  }
}

/**
 * 删除缺陷记录
 * DELETE /spot/spotordernodecontroldefect/{id}
 */
export async function deleteDefectRecord(id: number): Promise<void> {
  await del(`/spot/spotordernodecontroldefect/${id}`);
}

/** 验收缺陷参数 */
export interface ReviewDefectParams {
  id: number;
  /** 6=通过 7=不通过 */
  status: '6' | '7';
  /** 不通过时的原因 */
  khReason?: string;
}

/**
 * 验收缺陷（通过/不通过）
 * PUT /spot/spotordernodecontroldefect
 * 参考: submitForm2 → updateSpotordernodecontroldefect(this.form)
 */
export async function reviewDefect(params: ReviewDefectParams): Promise<void> {
  await put('/spot/spotordernodecontroldefect', {
    id: params.id,
    status: params.status,
    khReason: params.khReason || '',
  });
}

/** 完工照片项 */
export interface CompletedPhotoItem {
  imgUrl: string;
  text: string;
}

/** 完工资料文件项 */
export interface CompletedFileItem {
  name: string;
  attachment: string;
}

/** 完工资料数据（四个标签页） */
export interface CompletedData {
  acceptance: CompletedFileItem[];   // 验收记录 → data1.dataSelectList
  documents: CompletedFileItem[];    // 资料文件 → data11.dataSelectList
  materials: CompletedFileItem[];    // 材料设备 → data44.dataSelectList
  handover: CompletedFileItem[];     // 交接记录 → data47.dataSelectList
}

/**
 * 获取完工照片
 * GET /spot/spotorder/{spotOrderId}
 */
export async function fetchCompletedPhotos(spotOrderId: string): Promise<CompletedPhotoItem[]> {
  try {
    const res = await get(`/spot/spotorder/${spotOrderId}`);
    const raw = res?.data?.completedPhotos;
    if (!raw) return [];
    const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
    if (!Array.isArray(parsed)) return [];
    return parsed.map((item: any) => ({
      imgUrl: item.imgUrl || '',
      text: item.text || '',
    }));
  } catch (error) {
    console.error('获取完工照片失败:', error);
    return [];
  }
}

/**
 * 获取完工资料（验收记录/资料文件/材料设备/交接记录）
 * GET /spot/spotordercompleteddata/list
 */
export async function fetchCompletedData(spotOrderId: string): Promise<CompletedData> {
  const empty: CompletedData = { acceptance: [], documents: [], materials: [], handover: [] };
  try {
    const res = await get('/spot/spotordercompleteddata/list', {
      pageNum: 1,
      pageSize: 10,
      spotOrderId,
    });
    const rows = res?.rows || [];
    if (!rows.length) return empty;

    const raw = rows[0]?.completedData;
    if (!raw) return empty;
    const obj = typeof raw === 'string' ? JSON.parse(raw) : raw;

    const mapList = (list: any[] | undefined): CompletedFileItem[] => {
      if (!Array.isArray(list)) return [];
      return list.map((item: any) => ({
        name: item.name || '',
        attachment: item.attachment || '',
      }));
    };

    return {
      acceptance: mapList(obj?.data1?.dataSelectList),
      documents: mapList(obj?.data11?.dataSelectList),
      materials: mapList(obj?.data44?.dataSelectList),
      handover: mapList(obj?.data47?.dataSelectList),
    };
  } catch (error) {
    console.error('获取完工资料失败:', error);
    return empty;
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
  spotOrderId?: string;
  projectId: string;
  nodeName?: string;
  defectFile: string;
  defectDescribe: string;
  /** defectType: 1=缺陷整改 2=缺陷汇报 */
  defectType?: '1' | '2';
}

/**
 * 新增缺陷记录（缺陷整改 / 缺陷汇报）
 * defectType=1: 需要 spotOrderId + nodeName（过程验收-缺陷整改）
 * defectType=2: 只需要 projectId（项目操作指令-缺陷汇报）
 */
export async function createDefect(params: CreateDefectParams): Promise<void> {
  const type = params.defectType || '1';
  const payload: Record<string, any> = {
    id: null,
    projectId: Number(params.projectId),
    source: '1',
    defectType: type,
    defectFile: params.defectFile,
    defectDescribe: params.defectDescribe,
  };
  if (type === '1') {
    payload.spotOrderId = Number(params.spotOrderId);
    payload.nodeName = params.nodeName || '';
  }
  await post('/spot/spotordernodecontroldefect', [payload]);
}

// ==================== 项目评价 ====================

/** 评价数据（从接口返回） */
export interface EvaluationData {
  spotOrderId: string;
  projectId: string;
  bzhsgScore: string;
  xcwmsgScore: string;
  qualityScore: string;
  sgjdScore: string;
  fwbzhScore: string;
  attitudeScore: string;
  effectScore: string;
  syntheticScore: string;
  content: string;
  img01?: string;
  img02?: string;
  img03?: string;
  img04?: string;
  img05?: string;
}

/** 提交评价参数 */
export interface SubmitEvaluationParams {
  spotOrderId: string;
  projectId: string;
  syntheticScore: number;
  content: string;
  bzhsgScore?: number;
  xcwmsgScore?: number;
  qualityScore?: number;
  sgjdScore?: number;
  fwbzhScore?: number;
  attitudeScore?: number;
  effectScore?: number;
  img01?: string;
  img02?: string;
  img03?: string;
  img04?: string;
  img05?: string;
}

/**
 * 获取项目评价
 * GET /spot/spotorderevaluate/spotOrderId/${id}
 */
export async function fetchEvaluation(spotOrderId: string): Promise<EvaluationData | null> {
  try {
    const res = await get(`/spot/spotorderevaluate/spotOrderId/${spotOrderId}`);
    const item = res?.data || res;
    if (!item || !item.spotOrderId) return null;
    return {
      spotOrderId: String(item.spotOrderId || ''),
      projectId: String(item.projectId || ''),
      bzhsgScore: String(item.bzhsgScore ?? ''),
      xcwmsgScore: String(item.xcwmsgScore ?? ''),
      qualityScore: String(item.qualityScore ?? ''),
      sgjdScore: String(item.sgjdScore ?? ''),
      fwbzhScore: String(item.fwbzhScore ?? ''),
      attitudeScore: String(item.attitudeScore ?? ''),
      effectScore: String(item.effectScore ?? ''),
      syntheticScore: String(item.syntheticScore ?? ''),
      content: item.content || '',
      img01: item.img01 || '',
      img02: item.img02 || '',
      img03: item.img03 || '',
      img04: item.img04 || '',
      img05: item.img05 || '',
    };
  } catch (error) {
    console.error('获取评价数据失败:', error);
    return null;
  }
}

/**
 * 提交项目评价
 * POST /spot/spotorderevaluate
 */
export async function submitEvaluation(params: SubmitEvaluationParams): Promise<void> {
  const defaultScore = params.syntheticScore;
  await post('/spot/spotorderevaluate', {
    spotOrderId: Number(params.spotOrderId),
    projectId: Number(params.projectId),
    bzhsgScore: params.bzhsgScore ?? defaultScore,
    xcwmsgScore: params.xcwmsgScore ?? defaultScore,
    qualityScore: params.qualityScore ?? defaultScore,
    sgjdScore: params.sgjdScore ?? defaultScore,
    fwbzhScore: params.fwbzhScore ?? defaultScore,
    attitudeScore: params.attitudeScore ?? defaultScore,
    effectScore: params.effectScore ?? defaultScore,
    syntheticScore: params.syntheticScore,
    content: params.content,
    img01: params.img01 || '',
    img02: params.img02 || '',
    img03: params.img03 || '',
    img04: params.img04 || '',
    img05: params.img05 || '',
  });
}

// ==================== 预约管理（客户确认） ====================

/** 预约列表项（spotorder/listWorker 返回） */
export interface SpotOrderWorkerItem {
  id: number;
  projectCode: string;
  projectName: string;
  /** 开工日期 */
  startTime: string;
  /** 竣工日期 */
  endTime: string;
  /** 预约时间 */
  yuyueTime: string;
  /** 倒计时 */
  distanceDateTime: string;
  /** 微信状态：2=待确认预约时间 3=待确认变更时间 4=待客户验收 */
  wxStatus: string;
  /** 客户权限类型：2=客户角色 */
  authorityType: string;
  /** 客户确认预约时间 */
  kfqryyTime: string;
  /** 客户确认变更时间 */
  kfqrbgTime: string;
  /** 变更原因 */
  changeReason: string;
  /** 变更原因备注 */
  changeReasonRemark: string;
  /** 验收图片（逗号分隔URL） */
  ysImgs: string;
  /** 预约次数 */
  yuyueNumber?: number;
}

/** 预约列表分页响应 */
export interface SpotOrderWorkerListResponse {
  list: SpotOrderWorkerItem[];
  total: number;
}

/**
 * 获取现场订单工人端列表（预约管理）
 * GET /spot/spotorder/listWorker
 * @param projectId 项目ID
 * @param pageNum 页码，默认 1
 * @param pageSize 每页条数，默认 10
 */
export async function fetchSpotOrderWorkerList(
  projectId: string,
  pageNum: number = 1,
  pageSize: number = 10
): Promise<SpotOrderWorkerListResponse> {
  try {
    const res = await get('/spot/spotorder/listWorker', { projectId, pageNum, pageSize, projectType: '2' });
    const rows = res?.rows || [];
    const total = res?.total || rows.length;
    const list: SpotOrderWorkerItem[] = rows.map((item: any) => ({
      id: Number(item.id),
      projectCode: item.projectCode || '',
      projectName: item.projectName || '',
      startTime: item.busProject?.startTime || item.startTime || '',
      endTime: item.busProject?.endTime || item.endTime || '',
      yuyueTime: item.yuyueTime || '',
      distanceDateTime: item.distanceDateTime || '',
      wxStatus: String(item.wxStatus ?? ''),
      authorityType: String(item.authorityType ?? ''),
      kfqryyTime: item.kfqryyTime || '',
      kfqrbgTime: item.kfqrbgTime || '',
      changeReason: item.changeReason || '',
      changeReasonRemark: item.changeReasonRemark || '',
      ysImgs: item.ysImgs || '',
      yuyueNumber: Number(item.yuyueNumber) || 1,
    }));
    return { list, total };
  } catch (error) {
    console.error('获取预约列表失败:', error);
    return { list: [], total: 0 };
  }
}

/**
 * 客户确认预约
 * PUT /spot/spotorder/cus
 * 参考: xyw-ui updateSpotorderCus({ id })
 */
export async function confirmSpotOrderCustomer(id: number): Promise<void> {
  await put('/spot/spotorder/cus', { id });
}
