/** 咨询单状态与列表（咨询与反馈首页预览、全部咨询页共用） */
export const CONSULTATION_STATUSES = ['待回复', '进行中', '已结束'] as const;
export type ConsultationSheetStatus = (typeof CONSULTATION_STATUSES)[number];

export type ConsultationRecord = {
  id: string;
  no: string;
  title: string;
  time: string;
  requirement: string;
  /** 咨询类别 */
  category: string;
  contact: string;
  contactPhone: string;
  status: ConsultationSheetStatus;
};

export const allConsultations: ConsultationRecord[] = [
  // 待回复
  {
    id: 'c1',
    no: 'ZX-2026-0312',
    title: '门店空调系统选型咨询',
    time: '2026-03-28 14:20',
    requirement: '需要了解多联机与风冷模块机在本项目中的适用性，并给出大致造价区间供立项参考。',
    category: '暖通选型',
    contact: '王磊',
    contactPhone: '138-0001-2233',
    status: '待回复',
  },
  {
    id: 'c2',
    no: 'ZX-2026-0311',
    title: '精装房改造工期与进场条件',
    time: '2026-03-27 09:15',
    requirement: '确认最短施工周期、物业报批材料清单及周末是否可静音施工。',
    category: '工期与进场',
    contact: '陈静',
    contactPhone: '139-1122-3344',
    status: '待回复',
  },
  {
    id: 'c3',
    no: 'ZX-2026-0308',
    title: '地坪漆品牌与施工工艺确认',
    time: '2026-03-26 10:00',
    requirement: '需提供耐磨等级、环保认证及基层含水率要求说明。',
    category: '装饰材料',
    contact: '赵明',
    contactPhone: '136-5566-7788',
    status: '待回复',
  },
  {
    id: 'c4',
    no: 'ZX-2026-0305',
    title: '配电增容与电缆走向',
    time: '2026-03-25 16:40',
    requirement: '商场铺位用电负荷复核及临时用电接驳方案。',
    category: '电气',
    contact: '孙悦',
    contactPhone: '137-8899-0011',
    status: '待回复',
  },
  // 进行中
  {
    id: 'c5',
    no: 'ZX-2026-0288',
    title: '消防改造方案二次沟通',
    time: '2026-03-26 16:00',
    requirement: '已提供平面图，需根据最新疏散宽度复核喷头布置，并约定下周现场勘查时间。',
    category: '消防',
    contact: '周强',
    contactPhone: '135-2233-4455',
    status: '进行中',
  },
  {
    id: 'c6',
    no: 'ZX-2026-0285',
    title: '弱电点位与智能家居对接',
    time: '2026-03-25 11:30',
    requirement: '与业主指定品牌网关对接协议与弱电箱扩容方案，需输出接口清单。',
    category: '弱电智能化',
    contact: '李娜',
    contactPhone: '133-6677-8899',
    status: '进行中',
  },
  {
    id: 'c7',
    no: 'ZX-2026-0280',
    title: '新风风量与风口布置复核',
    time: '2026-03-24 14:10',
    requirement: '根据最新平面调整风口位置，并确认主机检修空间。',
    category: '暖通',
    contact: '吴刚',
    contactPhone: '131-4455-6677',
    status: '进行中',
  },
  {
    id: 'c8',
    no: 'ZX-2026-0276',
    title: '给排水接驳点位',
    time: '2026-03-23 09:20',
    requirement: '厨房排水坡度与隔油池位置需与物业图纸核对。',
    category: '给排水',
    contact: '郑华',
    contactPhone: '132-9988-7766',
    status: '进行中',
  },
  // 已结束
  {
    id: 'c9',
    no: 'ZX-2026-0190',
    title: '幕墙清洗服务年度合同条款',
    time: '2026-03-10 10:00',
    requirement: '已确认服务频次、保险条款及违约责任，业主无异议，归档结案。',
    category: '外立面',
    contact: '钱伟',
    contactPhone: '134-3344-5566',
    status: '已结束',
  },
  {
    id: 'c10',
    no: 'ZX-2026-0185',
    title: '屋面防水材料品牌确认',
    time: '2026-02-28 15:45',
    requirement: '按设计封样品牌执行，并完成样品留存与质保年限书面确认。',
    category: '防水',
    contact: '冯敏',
    contactPhone: '136-7788-9900',
    status: '已结束',
  },
  {
    id: 'c11',
    no: 'ZX-2026-0172',
    title: '室内空气质量检测标准',
    time: '2026-02-15 11:00',
    requirement: '约定检测点位数量、封闭时间及超标处理流程，已结案。',
    category: '环保检测',
    contact: '何琳',
    contactPhone: '138-1122-8899',
    status: '已结束',
  },
];

export function consultationsInStatus(status: ConsultationSheetStatus): ConsultationRecord[] {
  return allConsultations.filter((c) => c.status === status);
}

/** 首页「咨询单」区域仅展示每条状态前若干条 */
export function previewConsultations(status: ConsultationSheetStatus, max = 2): ConsultationRecord[] {
  return consultationsInStatus(status).slice(0, max);
}
