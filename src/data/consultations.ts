import { ref } from 'vue';

/** 咨询单状态与列表（咨询与反馈首页预览、全部咨询页共用） */
export const CONSULTATION_STATUSES = ['待回复', '进行中', '已结束'] as const;
export type ConsultationSheetStatus = (typeof CONSULTATION_STATUSES)[number];

/** 购物车咨询提交时商品快照，用于详情「产品信息」Tab */
export type ConsultationCartLineSnapshot = {
  id: number;
  name: string;
  category: string;
  price: number;
  quantity: number;
  image: string;
};

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
  /** 期望勘查时间（yyyy-mm-dd） */
  surveyDate?: string;
  /** 期望服务开始时间（yyyy-mm-dd） */
  serviceStartDate?: string;
  /** 工期（天） */
  durationDays?: number;
  /** 报价展示：如 暂无报价、已报价 */
  quoteStatus?: string;
  /** 服务地址 */
  serviceAddress?: string;
  /** 是否需要报价 */
  needQuote?: '是' | '否';
  /** 报价时间（与「报价时间的确认」对应） */
  quoteTime?: string;
  /**
   * 相关资料（合并需求文件、现场照片、图纸、报价单等说明）
   */
  relatedMaterials?: string;
  /** 来自购物车咨询：提交时车内商品快照 */
  cartLineItems?: ConsultationCartLineSnapshot[];
};

/** 用户从购物车提交的咨询单（会话内追加在静态数据之前展示） */
export const dynamicConsultations = ref<ConsultationRecord[]>([]);

export function prependDynamicConsultation(record: ConsultationRecord) {
  dynamicConsultations.value = [record, ...dynamicConsultations.value];
}

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
    surveyDate: '2026-03-22',
    serviceStartDate: '2026-03-28',
    durationDays: 18,
    quoteStatus: '暂无报价',
    serviceAddress: '上海市静安区曹家渡街道智慧广场（武宁南路）',
    needQuote: '否',
    quoteTime: '暂无',
    relatedMaterials: '暂无上传',
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
    surveyDate: '2026-03-25',
    serviceStartDate: '2026-04-01',
    durationDays: 21,
    quoteStatus: '暂无报价',
    serviceAddress: '上海市浦东新区陆家嘴环路 1000 号',
    needQuote: '是',
    quoteTime: '2026-04-02',
    relatedMaterials: '平面图 PDF、现场照片 3 张',
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
    surveyDate: '2026-03-24',
    serviceStartDate: '2026-03-30',
    durationDays: 7,
    quoteStatus: '暂无报价',
    serviceAddress: '上海市徐汇区虹桥路 1 号商场 3F',
    needQuote: '否',
    quoteTime: '暂无',
    relatedMaterials: '暂无上传',
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
    surveyDate: '2026-03-26',
    serviceStartDate: '2026-04-05',
    durationDays: 12,
    quoteStatus: '暂无报价',
    serviceAddress: '上海市黄浦区南京东路 300 号铺位',
    needQuote: '否',
    quoteTime: '暂无',
    relatedMaterials: '电气图纸 1 份',
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
    surveyDate: '2026-03-20',
    serviceStartDate: '2026-03-27',
    durationDays: 30,
    quoteStatus: '已报价',
    serviceAddress: '上海市杨浦区国权路 168 号',
    needQuote: '是',
    quoteTime: '2026-03-28',
    relatedMaterials: '平面图、消防报审图、现场照片',
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
    surveyDate: '2026-03-23',
    serviceStartDate: '2026-04-02',
    durationDays: 14,
    quoteStatus: '暂无报价',
    serviceAddress: '上海市长宁区延安西路 500 号',
    needQuote: '是',
    quoteTime: '待确认',
    relatedMaterials: '弱电点位表、网关协议说明',
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
    surveyDate: '2026-03-21',
    serviceStartDate: '2026-03-29',
    durationDays: 10,
    quoteStatus: '暂无报价',
    serviceAddress: '上海市静安区南京西路 1266 号',
    needQuote: '否',
    quoteTime: '暂无',
    relatedMaterials: '暂无上传',
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
    surveyDate: '2026-03-18',
    serviceStartDate: '2026-03-25',
    durationDays: 5,
    quoteStatus: '暂无报价',
    serviceAddress: '上海市静安区余姚路 288 号',
    needQuote: '否',
    quoteTime: '暂无',
    relatedMaterials: '给排水图纸',
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
    surveyDate: '2026-03-01',
    serviceStartDate: '2026-03-08',
    durationDays: 365,
    quoteStatus: '已报价',
    serviceAddress: '上海市浦东新区世纪大道 1 号',
    needQuote: '否',
    quoteTime: '2026-03-05',
    relatedMaterials: '年度合同扫描件、报价单',
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
    surveyDate: '2026-02-20',
    serviceStartDate: '2026-02-20',
    durationDays: 3,
    quoteStatus: '暂无报价',
    serviceAddress: '上海市闵行区莘松路 380 号',
    needQuote: '否',
    quoteTime: '暂无',
    relatedMaterials: '暂无上传',
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
    surveyDate: '2026-02-10',
    serviceStartDate: '2026-02-12',
    durationDays: 2,
    quoteStatus: '暂无报价',
    serviceAddress: '上海市嘉定区嘉定新城 1 号',
    needQuote: '否',
    quoteTime: '暂无',
    relatedMaterials: '检测标准说明、结案纪要',
  },
];

export function consultationsInStatus(status: ConsultationSheetStatus): ConsultationRecord[] {
  const fromDynamic = dynamicConsultations.value.filter((c) => c.status === status);
  const fromStatic = allConsultations.filter((c) => c.status === status);
  return [...fromDynamic, ...fromStatic];
}

/** 静态 + 动态合并（按 id 查找、最新排序等） */
export function allConsultationsMerged(): ConsultationRecord[] {
  return [...dynamicConsultations.value, ...allConsultations];
}

/** 指定状态下按咨询时间（time）倒序，取前 limit 条（咨询与反馈首页「咨询单」两条卡片） */
export function latestConsultationsInStatus(
  status: ConsultationSheetStatus,
  limit: number,
): ConsultationRecord[] {
  const list = [...consultationsInStatus(status)];
  list.sort((a, b) => b.time.localeCompare(a.time, 'zh-CN'));
  return list.slice(0, limit);
}

export function findConsultationById(id: string): ConsultationRecord | undefined {
  return allConsultationsMerged().find((c) => c.id === id);
}

/** 首页「咨询单」区域仅展示每条状态前若干条 */
export function previewConsultations(status: ConsultationSheetStatus, max = 2): ConsultationRecord[] {
  return consultationsInStatus(status).slice(0, max);
}

/** 询价页：单条交流记录（全部咨询详情「询价」Tab） */
export type ConsultationInquiryMessage = {
  id: string;
  senderName: string;
  sentAt: string;
  content: string;
  /** 可下载附件文件名；无则「下载附件」置灰 */
  attachmentFileName?: string;
};

/** 动态咨询单对应的询价交流（与 inquiryMessagesByConsultationId 合并） */
export const dynamicInquiryMessagesByConsultationId = ref<Record<string, ConsultationInquiryMessage[]>>({});

export function appendDynamicInquiryMessages(consultationId: string, messages: ConsultationInquiryMessage[]) {
  const prev = dynamicInquiryMessagesByConsultationId.value[consultationId] ?? [];
  dynamicInquiryMessagesByConsultationId.value = {
    ...dynamicInquiryMessagesByConsultationId.value,
    [consultationId]: [...prev, ...messages],
  };
}

const inquiryMessagesByConsultationId: Record<string, ConsultationInquiryMessage[]> = {
  c1: [
    {
      id: 'c1-1',
      senderName: '王磊',
      sentAt: '2026-03-28 15:30',
      content:
        '您好，关于多联机与风冷模块机在本项目中的适用性，我们已请技术同事做了初步评估，请查收附件中的方案摘要与大致造价区间，供立项参考；若需现场勘查可再约时间。',
      attachmentFileName: '空调选型初稿.pdf',
    },
    {
      id: 'c1-2',
      senderName: '商务-李颖',
      sentAt: '2026-03-29 10:12',
      content: '已收到，本周内反馈是否安排现场。',
      attachmentFileName: '沟通纪要.txt',
    },
    {
      id: 'c1-3',
      senderName: '系统',
      sentAt: '2026-03-29 18:00',
      content: '报价单已更新。',
      attachmentFileName: '报价单_v2.xlsx',
    },
  ],
  c2: [
    {
      id: 'c2-1',
      senderName: '陈静',
      sentAt: '2026-03-27 11:20',
      content: '物业要求补充周末施工说明，详见附件。',
      attachmentFileName: '物业要求.pdf',
    },
    {
      id: 'c2-2',
      senderName: '项目经理-张',
      sentAt: '2026-03-28 09:00',
      content: '收到，我们会调整工期表。',
    },
  ],
  c3: [
    {
      id: 'c3-1',
      senderName: '赵明',
      sentAt: '2026-03-26 14:00',
      content: '耐磨与环保认证证书见附件。',
      attachmentFileName: '证书扫描件.zip',
    },
  ],
  c4: [
    {
      id: 'c4-1',
      senderName: '孙悦',
      sentAt: '2026-03-25 17:10',
      content: '负荷表已核对。',
      attachmentFileName: '负荷表.xlsx',
    },
  ],
  c5: [
    {
      id: 'c5-1',
      senderName: '周强',
      sentAt: '2026-03-26 16:30',
      content: '平面图已更新，请按新疏散宽度复核喷头；附件为最新 CAD。',
      attachmentFileName: '平面_20260326.dwg',
    },
  ],
  c6: [
    {
      id: 'c6-1',
      senderName: '李娜',
      sentAt: '2026-03-25 12:00',
      content: '网关协议与接口清单见附件。',
      attachmentFileName: '接口清单.docx',
    },
  ],
  c7: [
    {
      id: 'c7-1',
      senderName: '吴刚',
      sentAt: '2026-03-24 15:00',
      content: '风口布置草图供参考。',
      attachmentFileName: '风口草图.pdf',
    },
  ],
  c8: [
    {
      id: 'c8-1',
      senderName: '郑华',
      sentAt: '2026-03-23 10:30',
      content: '与物业图纸核对结果见附件说明。',
      attachmentFileName: '核对说明.txt',
    },
  ],
  c9: [
    {
      id: 'c9-1',
      senderName: '钱伟',
      sentAt: '2026-03-10 11:00',
      content: '合同条款无异议，归档用扫描件见附件。',
      attachmentFileName: '合同扫描.pdf',
    },
  ],
  c10: [
    {
      id: 'c10-1',
      senderName: '冯敏',
      sentAt: '2026-02-28 16:00',
      content: '封样与质保已确认。',
      attachmentFileName: '封样照片.zip',
    },
  ],
  c11: [
    {
      id: 'c11-1',
      senderName: '何琳',
      sentAt: '2026-02-15 12:00',
      content: '检测与结案流程已书面确认，见附件纪要。',
      attachmentFileName: '结案纪要.pdf',
    },
  ],
};

export function inquiryMessagesFor(consultationId: string): ConsultationInquiryMessage[] {
  const base = inquiryMessagesByConsultationId[consultationId] ?? [];
  const extra = dynamicInquiryMessagesByConsultationId.value[consultationId] ?? [];
  return [...base, ...extra];
}
