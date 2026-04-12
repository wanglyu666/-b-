import type { MaintenanceRepairItem, OrderItem } from '../types/app-domain';
import { mockLatency } from './mockUtils';

const repairMedia = [
  { type: 'image' as const, url: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=600&h=450&fit=crop' },
  { type: 'image' as const, url: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&h=450&fit=crop' },
  { type: 'video' as const, url: 'https://www.w3schools.com/html/mov_bbb.mp4', thumb: 'https://images.unsplash.com/photo-1590479773265-7464e5d48118?w=600&h=450&fit=crop' },
  { type: 'image' as const, url: 'https://images.unsplash.com/photo-1590479773265-7464e5d48118?w=600&h=450&fit=crop' },
];

const maintenanceRepairSeed: MaintenanceRepairItem[] = [
  { id: 1, no: 'WB202603241401488', projectName: '星巴克上海臻选烘焙工坊', address: '上海市静安区南京西路789号', managerName: '张伟', managerPhone: '13812345678', status: '维保中', teamInfo: '张伟 (13812345678)', startDate: '2025-06-01', completionDate: '2025-12-15', warrantyPeriod: '1年', reportType: '普通', visitTime: '2026-03-24 14:00', reason: '空调系统制冷效果下降，需要检修', images: [], media: repairMedia.slice(0, 3) },
  { id: 2, no: 'WB202603241348443', projectName: '喜茶深圳欢乐海岸店', address: '深圳市南山区滨海大道2008号', managerName: '李芳', managerPhone: '13987654321', status: '维保中', teamInfo: '李芳 (13987654321)', startDate: '2025-03-10', completionDate: '2025-09-30', warrantyPeriod: '1年', reportType: '紧急', visitTime: '2026-03-25 09:30', reason: '门店水管漏水，影响正常营业', images: [], media: repairMedia },
  { id: 3, no: 'WB202603241348302', projectName: '奈雪的茶北京三里屯店', address: '北京市朝阳区三里屯路19号', managerName: '王强', managerPhone: '13700001111', status: '待处理', teamInfo: '王强 (13700001111)', startDate: '2025-08-20', completionDate: '2026-02-28', warrantyPeriod: '1年', reportType: '普通', visitTime: '2026-03-26 10:00', reason: '电路偶发跳闸，需排查原因', images: [], media: [] },
  { id: 4, no: 'WB202603241348139', projectName: '乐乐茶杭州湖滨银泰店', address: '杭州市上城区延安路258号', managerName: '赵敏', managerPhone: '13622223333', status: '已完成', teamInfo: '赵敏 (13622223333)', startDate: '2025-01-15', completionDate: '2025-07-20', warrantyPeriod: '1年', reportType: '普通', visitTime: '2026-03-20 14:30', reason: '地面瓷砖空鼓修补', images: [], media: repairMedia.slice(0, 2) },
  { id: 5, no: 'WB202603241348001', projectName: '瑞幸咖啡广州天河城店', address: '广州市天河区天河路208号', managerName: '刘洋', managerPhone: '13544445555', status: '维保中', teamInfo: '刘洋 (13544445555)', startDate: '2025-05-01', completionDate: '2025-11-30', warrantyPeriod: '1年', reportType: '紧急', visitTime: '2026-03-25 16:00', reason: '消防喷淋系统误报警', images: [], media: [repairMedia[2], repairMedia[0]] },
  { id: 6, no: 'WB202603241347998', projectName: 'Manner Coffee上海静安寺店', address: '上海市静安区南京西路1618号', managerName: '陈晨', managerPhone: '13466667777', status: '维保中', teamInfo: '陈晨 (13466667777)', startDate: '2025-04-10', completionDate: '2025-10-20', warrantyPeriod: '1年', reportType: '普通', visitTime: '2026-03-27 11:00', reason: '店内灯具部分损坏需更换', images: [], media: [] },
];

const orderSeed: OrderItem[] = [
  { id: 1, orderNo: '20250115145532B', orderAmount: 113.38, orderTime: '2025-01-19 14:55:33', serviceAddress: '上海市静安区南京西路789号', status: '已发出' },
  { id: 2, orderNo: '20250107171736A', orderAmount: 2431.93, orderTime: '2025-01-07 17:17:36', serviceAddress: '深圳市南山区滨海大道2008号', status: '已完成' },
  { id: 3, orderNo: '20250731123553S', orderAmount: 11338, orderTime: '2025-07-31 12:33:33', serviceAddress: '北京市朝阳区三里屯路19号', status: '待确认' },
  { id: 4, orderNo: '20250731133240T', orderAmount: 23609.9, orderTime: '2025-07-31 13:37:41', serviceAddress: '杭州市上城区延安路258号', status: '待确认' },
  { id: 5, orderNo: '20250731123152S', orderAmount: 11338, orderTime: '2025-07-31 12:31:53', serviceAddress: '广州市天河区天河路208号', status: '已发出' },
  { id: 6, orderNo: '20250731133742G', orderAmount: 14739.4, orderTime: '2025-07-31 13:37:43', serviceAddress: '上海市静安区南京西路1618号', status: '已完成' },
  { id: 7, orderNo: '20250731122013H', orderAmount: 14738.4, orderTime: '2025-07-31 12:20:13', serviceAddress: '成都市锦江区春熙路188号', status: '已完成' },
  { id: 8, orderNo: '20250730185628K', orderAmount: 1012.05, orderTime: '2025-07-30 18:56:29', serviceAddress: '武汉市江汉区解放大道686号', status: '已完成' },
  { id: 9, orderNo: '20250730184414L', orderAmount: 1116.77, orderTime: '2025-07-30 18:44:14', serviceAddress: '南京市鼓楼区中山北路30号', status: '已完成' },
  { id: 10, orderNo: '20250730184522M', orderAmount: 1012.05, orderTime: '2025-07-30 18:45:22', serviceAddress: '重庆市渝中区解放碑步行街52号', status: '已完成' },
];

export async function fetchMaintenanceRepairOrders(): Promise<MaintenanceRepairItem[]> {
  await mockLatency();
  return maintenanceRepairSeed.map((item) => ({
    ...item,
    images: [...item.images],
    media: item.media ? item.media.map((m) => ({ ...m })) : [],
  }));
}

export async function fetchOrders(): Promise<OrderItem[]> {
  await mockLatency();
  return orderSeed.map((item) => ({ ...item }));
}
