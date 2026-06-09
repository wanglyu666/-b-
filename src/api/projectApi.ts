import { get } from '../utils/request';
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
 * 获取维保项目列表（使用 mock 数据，如需真接口请自行添加）
 */
export async function fetchMaintenanceProjects(): Promise<any[]> {
  return [];
}
