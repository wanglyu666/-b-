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
  name: string;
  location: string;
  date: string;
}

export interface Bill {
  id: number;
  status: 'confirm' | 'pay' | 'paid';
  no: string;
  prjNo: string;
  name: string;
  amount: string;
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
}
