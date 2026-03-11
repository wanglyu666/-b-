import { Product, Notification, Contract, Bill, Member } from './types';

export const chartData = [
  { name: '1月', value: 4000 },
  { name: '2月', value: 3000 },
  { name: '3月', value: 5000 },
  { name: '4月', value: 2780 },
  { name: '5月', value: 1890 },
  { name: '6月', value: 2390 },
  { name: '7月', value: 3490 },
];

export const notifications: Notification[] = [
  { id: 1, title: '订单合成成功通知', content: '订单已合并成功，合并退款将原路退回您的支付账户中。', time: '1分钟前', read: false },
  { id: 2, title: '先乘后付订单取消通知', content: '本单为「先乘后付」不产生车费扣款。', time: '2023.10.05', read: true },
  { id: 3, title: '退款通知', content: '订单支付金额已退款成功，请在原支付账户中查看。', time: '2023.10.05', read: true },
  { id: 4, title: '行程取消成功，退款已到账', content: '已支付车费将照路退还，请在原支付账户中查看。', time: '2023.10.05', read: true },
  { id: 5, title: '关注公众号，乘车有优惠！', content: '动动手，福利即来！点击查看如何领取优惠券 >>', time: '2023.10.03', read: true },
];

const baseProducts = [
  { name: 'Muren 单人扶手椅', category: '宜家', price: 210.00, image: 'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?auto=format&fit=crop&q=80&w=600' },
  { name: 'Standmon 脚凳', category: '宜家', price: 310.00, image: 'https://images.unsplash.com/photo-1592078615290-033ee584e267?auto=format&fit=crop&q=80&w=600' },
  { name: 'Hemlingby 双人沙发', category: '宜家', price: 610.00, image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&q=80&w=600' },
  { name: 'Kallax 储物架', category: '收纳', price: 120.00, image: 'https://images.unsplash.com/photo-1594620302200-9a762244a156?auto=format&fit=crop&q=80&w=600' },
  { name: 'Poäng 摇椅', category: '宜家', price: 450.00, image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&q=80&w=600' },
  { name: 'Billy 书架', category: '收纳', price: 299.00, image: 'https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&q=80&w=600' },
  { name: 'Ektorp 三人沙发', category: '客厅', price: 899.00, image: 'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&q=80&w=600' },
  { name: 'Lack 边桌', category: '桌子', price: 49.00, image: 'https://images.unsplash.com/photo-1532372320572-cda25653a26d?auto=format&fit=crop&q=80&w=600' },
];

export const products: Product[] = Array.from({ length: 32 }, (_, i) => {
  const base = baseProducts[i % baseProducts.length];
  return {
    id: i + 1,
    name: `${base.name} ${Math.floor(i / 8) > 0 ? (Math.floor(i / 8) + 1) + '代' : ''}`,
    category: base.category,
    price: base.price + (i * 10),
    rating: 4 + (i % 2),
    image: base.image,
    desc: `这款${base.name}将时尚设计与舒适感完美融合，线条流畅，符合人体工程学，色彩鲜艳。非常适合现代室内装饰，为您的空间增添风格与功能性。`
  };
});

export const pieDataStatus = [
  { name: '完工', value: 70, color: '#FFEB69' },
  { name: '在施', value: 30, color: '#3A341C' }, 
];

export const pieDataWarranty = [
  { name: '在保', value: 85, color: '#A1D573' },
  { name: '过保', value: 15, color: '#163300' }, 
];

export const distributionData = [
  { name: '上海市', value: 400 },
  { name: '四川省', value: 300 },
  { name: '重庆市', value: 300 },
  { name: '北京市', value: 200 },
];

export const COLORS_DIST = ['#A1D573', '#FFEB69', '#1f2937', '#9ca3af'];

export const contractData: Contract[] = [
  { id: 1, no: 'HT-2024001', name: '2024年度中央空调维保合同', location: '海淀区科技园A座', date: '2024-01-15' },
  { id: 2, no: 'HT-2024002', name: '消防设施改造工程合同', location: '朝阳区望京SOHO', date: '2024-02-10' },
  { id: 3, no: 'HT-2024003', name: '安防监控系统升级协议', location: '西城区金融中心', date: '2024-03-05' },
  { id: 4, no: 'HT-2024004', name: '电梯定期巡检服务合同', location: '丰台区总部基地', date: '2024-03-22' },
];

export const billData: Bill[] = [
  { id: 1, status: 'confirm', no: 'ORD-2024001', prjNo: 'PRJ-001', name: '电梯系统升级', amount: '¥120,000' },
  { id: 2, status: 'confirm', no: 'ORD-2024002', prjNo: 'PRJ-005', name: '大堂照明改造', amount: '¥45,000' },
  { id: 3, status: 'confirm', no: 'ORD-2024003', prjNo: 'PRJ-012', name: '机房降噪处理', amount: '¥28,500' },
  { id: 4, status: 'pay', no: 'ORD-2024004', prjNo: 'PRJ-008', name: '外墙防水修补', amount: '¥56,000' },
  { id: 5, status: 'pay', no: 'ORD-2024005', prjNo: 'PRJ-015', name: '地下车库排风', amount: '¥34,200' },
  { id: 6, status: 'pay', no: 'ORD-2024006', prjNo: 'PRJ-019', name: '园林绿化养护', amount: '¥15,800' },
  { id: 7, status: 'paid', no: 'ORD-2024007', prjNo: 'PRJ-002', name: '消防水泵更换', amount: '¥85,000' },
  { id: 8, status: 'paid', no: 'ORD-2024008', prjNo: 'PRJ-006', name: '监控探头加装', amount: '¥22,500' },
  { id: 9, status: 'paid', no: 'ORD-2024009', prjNo: 'PRJ-011', name: '门禁系统升级', amount: '¥41,000' },
];

export const members: Member[] = [
  { id: 1, name: '张伟', role: '项目经理', initial: '张', bgColor: 'bg-blue-500', online: true },
  { id: 2, name: '李秀英', role: '高级工程师', initial: '李', bgColor: 'bg-green-500', online: false },
  { id: 3, name: '王强', role: '现场监理', initial: '王', bgColor: 'bg-yellow-500', online: true },
];
