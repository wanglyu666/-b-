export interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  rating: number;
  image: string;
  desc: string;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface EngineeringProject {
  id: string;
  no: string;
  name: string;
  address: string;
  amount: string;
  manager: string;
  contact: string;
  status: '待开工' | '施工中' | '已完工' | '已结算' | '保修中' | '保修外';
  startDate?: string;
  endDate?: string;
  projectId?: string;
  isEvaluate?: string;
}

export interface Notification {
  id: number;
  title: string;
  content: string;
  time: string;
  read: boolean;
}

export interface Contract {
  id: number;
  no: string;
  /** 普通合同 | 年框合同 */
  contractType: '普通合同' | '年框合同';
  amount: string;
  date: string;
}

/** 合同档案列表（合同档案页表格，字段参考业务台账） */
export interface ContractArchive {
  id: string;
  no: string;
  contractType: '普通合同' | '年框合同';
  contactName: string;
  phone: string;
  contractTitle: string;
  projectName: string;
  /** 工程地址（普通合同详情弹窗展示） */
  projectAddress: string;
  amount: string;
  signedDate: string;
  /** 年框合同：合同开始日期 YYYY-MM-DD */
  contractStartDate?: string;
  /** 年框合同：合同结束日期 YYYY-MM-DD */
  contractEndDate?: string;
}

export interface Bill {
  id: number;
  status: 'confirm' | 'pay' | 'paid';
  /** 订单编号 */
  no: string;
  /** 旧字段：项目编号（首页卡片已不展示，但保留数据源） */
  prjNo: string;
  /** 项目名称 */
  name: string;
  /** 首页卡片展示用金额（当前口径为“账单金额/合同金额”） */
  amount: string;
  /** 合同编号 */
  contractNo: string;
  /** 合同金额（如 ¥120,000） */
  contractAmount: string;
  /** 已付金额（如 ¥45,000） */
  paidAmount: string;
  /** 付款比例（如 35%） */
  payRatio: string;
  /** 付致金额（按需求文案字段） */
  payToAmount: string;
  /** 申请时间 YYYY-MM-DD（弹窗展示） */
  appliedAt: string;
  /** 付款批次（弹窗展示） */
  paymentBatch: string;
  /** 本次支付批次（弹窗展示） */
  currentPaymentBatch: string;
  /** 本次比例（弹窗展示） */
  currentRatio: string;
  /** 本次支付说明（弹窗展示） */
  currentPayNote: string;

  /** 发票信息（待支付弹窗展示） */
  invoiceType?: string;
  invoiceNo?: string;
  invoiceDate?: string;
  amountExTax?: string;
  amountIncTax?: string;
  paymentDate?: string;
  invoiceRemark?: string;
}

/** 合同签约管理：待签约 / 已签约台账 */
export type ContractSigningStatus = 'pending' | 'signed';

export interface ContractSigningRecord {
  id: string;
  /** 订单编号 */
  no: string;
  /** 签约类型（原订单类型口径） */
  signingType: string;
  contactName: string;
  phone: string;
  /** 金额数字字符串，如 69827.50 */
  amount: string;
  /** 下单时间 YYYY-MM-DD HH:mm:ss */
  submittedAt: string;
  projectAddress: string;
  status: ContractSigningStatus;
}

/** 结算管理：待申请 / 结算审核中 / 待上传结算单 / 已结算 */
export type SettlementStatus =
  | 'pending_apply'
  | 'under_review'
  | 'pending_upload'
  | 'settled';

export interface SettlementRecord {
  id: number;
  status: SettlementStatus;
  /** 订单编号 */
  no: string;
  /** 项目编号 */
  projectNo: string;
  /** 项目名称 */
  name: string;
  /** 合同金额 */
  contractAmount: string;
  /** 结算金额 */
  settlementAmount: string;
  /** 已支付金额 */
  paidAmount: string;
  /** 项目地址 */
  projectAddress: string;
  /** 开工日期 YYYY-MM-DD */
  startDate: string;
  /** 竣工日期 YYYY-MM-DD */
  completionDate: string;
  /** 结算明细 · 合同价款 / 变更费用 / 减项费用 */
  settlementItems: {
    category: string;
    amount: string;
    remark?: string;
  }[];
  /** 结算总价 */
  totalSettlementPrice: string;
  /** 已支付进度款 */
  paidProgressAmount: string;
  /** 质保金 */
  retentionMoney: string;
  /** 变更明细 */
  changeItems: {
    orderNo: string;
    amount: string;
    remark?: string;
  }[];
  /** 减项明细 */
  deductionItems: {
    content: string;
    amount: string;
    remark?: string;
  }[];
  /** 结算日期 YYYY-MM-DD（待上传结算单等） */
  settlementDate?: string;
}

/** 组织与架构 · 团队卡片（列表与首页预览共用） */
export interface OrganizationTeamMemberAvatar {
  initial: string;
  color: string;
  /** 成员 id，用于列表 key；由成员数据推导时填入 */
  memberId?: number;
}

export interface OrganizationTeam {
  id: string;
  name: string;
  leader: string;
  space: string;
  createdAt: string;
  members: OrganizationTeamMemberAvatar[];
}

/** 组织与架构 · 空间（空间管理列表） */
export interface OrganizationSpace {
  id: string;
  name: string;
  /** 负责人 */
  owner: string;
  province: string;
  city: string;
  /** 区/县 */
  district: string;
  /** 具体位置 */
  address: string;
  /** 面积展示，如 1000㎡ */
  area: string;
}

export interface Member {
  id: number;
  name: string;
  role: string;
  initial: string;
  /** 头像彩圈背景色（#RRGGBB，与组织成员色板一致） */
  bgColor: string;
  online: boolean;
  /** 联系电话 */
  phone?: string;
  /** 所属团队 */
  team?: string;
  /** 联系邮箱 */
  email?: string;
  /** 成员类型：内部 / 外部 */
  memberType?: '内部成员' | '外部成员';
  /** 备注 */
  remarks?: string;
  /** 负责空间（成员详情「完整显示」） */
  responsibleSpace?: string;
  /** 所属公司（仅外部成员展示） */
  company?: string;
}

export interface MaintenanceProject {
  id: string;
  no: string;
  name: string;
  address: string;
  manager: string;
  contact: string;
  status: '待开工' | '施工中' | '已完工';
  projectId?: string;
  isEvaluate?: string;
}
