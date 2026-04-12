export type TodoNotification = {
  id: number;
  title: string;
  content: string;
  projectName: string;
  projectId: string;
  projectStatus: string;
  viewMode: string;
  time: string;
  kind: 'report' | 'completion' | 'acceptance' | 'evaluation' | 'standards';
  unread?: boolean;
};

export type MediaItem = {
  type: 'image' | 'video';
  url: string;
  thumb?: string;
};

export type MaintenanceRepairItem = {
  id: number;
  no: string;
  projectName: string;
  address: string;
  managerName: string;
  managerPhone: string;
  status: string;
  teamInfo: string;
  startDate: string;
  completionDate: string;
  warrantyPeriod: string;
  reportType: string;
  visitTime: string;
  reason: string;
  images: string[];
  media?: MediaItem[];
};

export type OrderItem = {
  id: number;
  orderNo: string;
  orderAmount: number;
  orderTime: string;
  serviceAddress: string;
  status: string;
};
