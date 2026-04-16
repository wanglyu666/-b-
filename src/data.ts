import {
  Product,
  Notification,
  Contract,
  Bill,
  Member,
  EngineeringProject,
  MaintenanceProject,
  OrganizationTeam,
  OrganizationSpace,
} from './types';

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
  { name: '完工', value: 70, color: '#f99ffc' },
  { name: '在施', value: 30, color: '#b19eef' }, 
];

export const pieDataWarranty = [
  { name: '在保', value: 85, color: '#A1D573' },
  { name: '过保', value: 15, color: '#163300' }, 
];

export const distributionData = [
  { name: '上海市', value: 450 },
  { name: '四川省', value: 380 },
  { name: '重庆市', value: 320 },
  { name: '北京市', value: 280 },
  { name: '广州市', value: 150 },
  { name: '深圳市', value: 120 },
  { name: '杭州市', value: 100 },
];

export const COLORS_DIST = ['#ff9ffc', 'rgba(255, 159, 252, 0.75)', 'rgba(255, 159, 252, 0.5)', 'rgba(255, 159, 252, 0.25)', '#f3f4f6'];

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

export const engineeringProjects: EngineeringProject[] = [
  // 待开工
  {
    id: '2',
    no: 'PRJ-2023-002',
    name: '绿地中心 45 层办公区装修',
    address: '绿地中心 4501-4508',
    amount: '¥ 1,200,000',
    manager: '李志强',
    contact: '139-1234-5678',
    status: '待开工',
    startDate: '2023-11-20'
  },
  {
    id: '8',
    no: 'PRJ-2023-006',
    name: '云端咖啡厅整体软装',
    address: '云端大厦 12 层',
    amount: '¥ 150,000',
    manager: '李志强',
    contact: '139-1234-5678',
    status: '待开工',
    startDate: '2023-12-01'
  },
  {
    id: '9',
    no: 'PRJ-2023-007',
    name: '高新科技园 A 栋大堂改造',
    address: '高新科技园 A 栋',
    amount: '¥ 450,000',
    manager: '张伟',
    contact: '137-9876-5432',
    status: '待开工',
    startDate: '2023-12-15'
  },
  {
    id: '10',
    no: 'PRJ-2023-008',
    name: '城市书房室内设计与施工',
    address: '文化广场 1 号',
    amount: '¥ 280,000',
    manager: '刘洋',
    contact: '136-5555-6666',
    status: '待开工',
    startDate: '2024-01-10'
  },
  // 施工中
  {
    id: '1',
    no: 'PRJ-2023-001',
    name: '星海湾一号别墅全屋定制',
    address: '星海湾一号 32 栋',
    amount: '¥ 350,000',
    manager: '王建国',
    contact: '138-0013-8001',
    status: '施工中',
    startDate: '2023-10-15'
  },
  {
    id: '7',
    no: 'PRJ-2023-005',
    name: '金融中心 VIP 接待室升级',
    address: '金融中心 A 座 50 层',
    amount: '¥ 220,000',
    manager: '王建国',
    contact: '138-0013-8001',
    status: '施工中',
    startDate: '2023-11-05'
  },
  {
    id: '11',
    no: 'PRJ-2023-009',
    name: '国际会展中心展厅搭建',
    address: '国际会展中心 3 号馆',
    amount: '¥ 850,000',
    manager: '陈明',
    contact: '135-8888-9999',
    status: '施工中',
    startDate: '2023-11-10'
  },
  {
    id: '12',
    no: 'PRJ-2023-010',
    name: '滨海商业街外立面改造',
    address: '滨海商业街 1-15 号',
    amount: '¥ 1,500,000',
    manager: '赵强',
    contact: '133-2222-3333',
    status: '施工中',
    startDate: '2023-10-20'
  },
  // 已完工
  {
    id: '3',
    no: 'PRJ-2023-003',
    name: '万科城 3 期精装房改造',
    address: '万科城 3 期 12 栋 1502',
    amount: '¥ 180,000',
    manager: '张伟',
    contact: '137-9876-5432',
    status: '已完工',
    startDate: '2023-08-01',
    endDate: '2023-10-30'
  },
  {
    id: '13',
    no: 'PRJ-2023-011',
    name: '青年公寓样板间装修',
    address: '青年路 88 号',
    amount: '¥ 120,000',
    manager: '李志强',
    contact: '139-1234-5678',
    status: '已完工',
    startDate: '2023-09-01',
    endDate: '2023-10-15'
  },
  {
    id: '14',
    no: 'PRJ-2023-012',
    name: '社区医疗中心内部装修',
    address: '健康路 12 号',
    amount: '¥ 560,000',
    manager: '王建国',
    contact: '138-0013-8001',
    status: '已完工',
    startDate: '2023-07-15',
    endDate: '2023-11-01'
  },
  // 已结算
  {
    id: '4',
    no: 'PRJ-2023-004',
    name: '时代广场商铺软装陈设',
    address: '时代广场 1 层 A-05',
    amount: '¥ 85,000',
    manager: '刘洋',
    contact: '136-5555-6666',
    status: '已结算',
    startDate: '2023-07-10',
    endDate: '2023-08-15'
  },
  {
    id: '15',
    no: 'PRJ-2023-013',
    name: '创意产业园办公室装修',
    address: '创意园 B 区 3 栋',
    amount: '¥ 320,000',
    manager: '陈明',
    contact: '135-8888-9999',
    status: '已结算',
    startDate: '2023-05-10',
    endDate: '2023-07-20'
  },
  {
    id: '16',
    no: 'PRJ-2023-014',
    name: '连锁超市货架及照明安装',
    address: '全市 5 家分店',
    amount: '¥ 480,000',
    manager: '赵强',
    contact: '133-2222-3333',
    status: '已结算',
    startDate: '2023-06-01',
    endDate: '2023-08-30'
  },
  // 保修中
  {
    id: '5',
    no: 'PRJ-2022-089',
    name: '阳光海岸度假酒店大堂家具',
    address: '阳光海岸大道 88 号',
    amount: '¥ 2,500,000',
    manager: '陈明',
    contact: '135-8888-9999',
    status: '保修中',
    startDate: '2022-05-01',
    endDate: '2022-12-20'
  },
  {
    id: '17',
    no: 'PRJ-2022-090',
    name: '市图书馆阅览室升级',
    address: '学府路 100 号',
    amount: '¥ 890,000',
    manager: '张伟',
    contact: '137-9876-5432',
    status: '保修中',
    startDate: '2022-08-15',
    endDate: '2023-01-10'
  },
  {
    id: '18',
    no: 'PRJ-2022-091',
    name: '实验小学多功能厅改造',
    address: '教育路 5 号',
    amount: '¥ 650,000',
    manager: '刘洋',
    contact: '136-5555-6666',
    status: '保修中',
    startDate: '2022-07-01',
    endDate: '2022-08-25'
  },
  // 保修外
  {
    id: '6',
    no: 'PRJ-2021-045',
    name: '蓝天科技园员工餐厅配套',
    address: '高新园区蓝天路 1 号',
    amount: '¥ 450,000',
    manager: '赵强',
    contact: '133-2222-3333',
    status: '保修外',
    startDate: '2021-03-15',
    endDate: '2021-05-30'
  },
  {
    id: '19',
    no: 'PRJ-2021-046',
    name: '老旧小区外墙翻新工程',
    address: '和平区幸福里小区',
    amount: '¥ 1,100,000',
    manager: '王建国',
    contact: '138-0013-8001',
    status: '保修外',
    startDate: '2021-04-10',
    endDate: '2021-09-15'
  },
  {
    id: '20',
    no: 'PRJ-2020-022',
    name: '地铁 2 号线站点标识安装',
    address: '地铁 2 号线全线',
    amount: '¥ 780,000',
    manager: '李志强',
    contact: '139-1234-5678',
    status: '保修外',
    startDate: '2020-05-01',
    endDate: '2020-11-30'
  },
  // 额外添加的项目以演示分页
  {
    id: '21',
    no: 'PRJ-2024-001',
    name: '未来科技城研发中心装修',
    address: '未来路 1 号',
    amount: '¥ 2,800,000',
    manager: '王建国',
    contact: '138-0013-8001',
    status: '施工中',
    startDate: '2024-02-01'
  },
  {
    id: '22',
    no: 'PRJ-2024-002',
    name: '智慧园区监控系统集成',
    address: '智慧大道 88 号',
    amount: '¥ 450,000',
    manager: '陈明',
    contact: '135-8888-9999',
    status: '施工中',
    startDate: '2024-02-15'
  },
  {
    id: '23',
    no: 'PRJ-2024-003',
    name: '滨江花园景观亮化工程',
    address: '滨江路 200 号',
    amount: '¥ 1,200,000',
    manager: '赵强',
    contact: '133-2222-3333',
    status: '施工中',
    startDate: '2024-03-01'
  },
  {
    id: '24',
    no: 'PRJ-2024-004',
    name: '新华书店旗舰店软装',
    address: '解放路 10 号',
    amount: '¥ 320,000',
    manager: '刘洋',
    contact: '136-5555-6666',
    status: '施工中',
    startDate: '2024-03-10'
  },
  {
    id: '25',
    no: 'PRJ-2024-005',
    name: '奥体中心体育馆翻新',
    address: '奥体路 1 号',
    amount: '¥ 5,600,000',
    manager: '李志强',
    contact: '139-1234-5678',
    status: '施工中',
    startDate: '2024-01-20'
  },
  {
    id: '26',
    no: 'PRJ-2024-006',
    name: '万象城精品店整体装修',
    address: '万象城 2 层',
    amount: '¥ 880,000',
    manager: '张伟',
    contact: '137-9876-5432',
    status: '施工中',
    startDate: '2024-02-20'
  },
  {
    id: '27',
    no: 'PRJ-2024-007',
    name: '希尔顿酒店宴会厅改造',
    address: '滨海大道 1 号',
    amount: '¥ 1,500,000',
    manager: '王建国',
    contact: '138-0013-8001',
    status: '施工中',
    startDate: '2024-03-05'
  },
  {
    id: '28',
    no: 'PRJ-2024-008',
    name: '数字图书馆多媒体室',
    address: '文化路 50 号',
    amount: '¥ 420,000',
    manager: '陈明',
    contact: '135-8888-9999',
    status: '施工中',
    startDate: '2024-03-15'
  },
  {
    id: '29',
    no: 'PRJ-2024-009',
    name: '软件园 B 区外墙清洗',
    address: '软件园 B 区',
    amount: '¥ 150,000',
    manager: '赵强',
    contact: '133-2222-3333',
    status: '施工中',
    startDate: '2024-03-20'
  },
  {
    id: '30',
    no: 'PRJ-2024-010',
    name: '实验中学实验室升级',
    address: '实验路 10 号',
    amount: '¥ 680,000',
    manager: '刘洋',
    contact: '136-5555-6666',
    status: '施工中',
    startDate: '2024-02-10'
  }
];

export const maintenanceProjects: MaintenanceProject[] = [
  // 待开工 (12)
  { id: 'M-01', no: 'WB-2024-001', name: '中央空调系统年度维保', address: '海淀区科技园 A 座', manager: '李志强', contact: '139-1234-5678', status: '待开工' },
  { id: 'M-02', no: 'WB-2024-002', name: '消防喷淋管道检修', address: '朝阳区望京 SOHO T1', manager: '王建国', contact: '138-0013-8001', status: '待开工' },
  { id: 'M-03', no: 'WB-2024-003', name: '电梯机房设备保养', address: '丰台区总部基地 16 号楼', manager: '张伟', contact: '137-9876-5432', status: '待开工' },
  { id: 'M-04', no: 'WB-2024-004', name: '地下车库排水系统维护', address: '西城区金融街 8 号院', manager: '陈明', contact: '135-8888-9999', status: '待开工' },
  { id: 'M-05', no: 'WB-2024-005', name: '楼宇智能照明系统巡检', address: '中关村软件园二期 3 号楼', manager: '刘洋', contact: '136-5555-6666', status: '待开工' },
  { id: 'M-06', no: 'WB-2024-006', name: '外墙幕墙密封胶更换', address: '国贸中心写字楼 A 座', manager: '赵强', contact: '133-2222-3333', status: '待开工' },
  { id: 'M-07', no: 'WB-2024-007', name: '配电房高压开关柜检测', address: '亦庄经济开发区 E9 区', manager: '李志强', contact: '139-1234-5678', status: '待开工' },
  { id: 'M-08', no: 'WB-2024-008', name: '新风系统滤网更换', address: '东城区银河大厦 21 层', manager: '王建国', contact: '138-0013-8001', status: '待开工' },
  { id: 'M-09', no: 'WB-2024-009', name: '屋顶防水层修补', address: '通州区万达广场 B 座', manager: '张伟', contact: '137-9876-5432', status: '待开工' },
  { id: 'M-10', no: 'WB-2024-010', name: '监控摄像头清洁与校准', address: '昌平区回龙观产业园', manager: '陈明', contact: '135-8888-9999', status: '待开工' },
  { id: 'M-11', no: 'WB-2024-011', name: '给排水管道防腐处理', address: '大兴区星光影视园 5 号', manager: '刘洋', contact: '136-5555-6666', status: '待开工' },
  { id: 'M-12', no: 'WB-2024-012', name: '弱电机房UPS电池更换', address: '石景山区科技馆路 9 号', manager: '赵强', contact: '133-2222-3333', status: '待开工' },
  // 施工中 (5)
  { id: 'M-13', no: 'WB-2024-013', name: '绿地中心45层办公区装修', address: '绿地中心 4501-4508', manager: '李志强', contact: '139-1234-5678', status: '施工中' },
  { id: 'M-14', no: 'WB-2024-014', name: '云端咖啡厅整体软装', address: '云端大厦 12 层', manager: '李志强', contact: '139-1234-5678', status: '施工中' },
  { id: 'M-15', no: 'WB-2024-015', name: '高新科技园A栋大堂改造', address: '高新科技园 A 栋', manager: '张伟', contact: '137-9876-5432', status: '施工中' },
  { id: 'M-16', no: 'WB-2024-016', name: '城市书房室内设计与施工', address: '文化广场 1 号', manager: '刘洋', contact: '136-5555-6666', status: '施工中' },
  { id: 'M-17', no: 'WB-2024-017', name: '星海湾一号别墅空调维保', address: '星海湾一号 32 栋', manager: '王建国', contact: '138-0013-8001', status: '施工中' },
  // 已完工 (34)
  { id: 'M-18', no: 'WB-2023-001', name: '万科城3期消防系统检修', address: '万科城 3 期 12 栋', manager: '张伟', contact: '137-9876-5432', status: '已完工' },
  { id: 'M-19', no: 'WB-2023-002', name: '时代广场电梯年度维保', address: '时代广场 1 层', manager: '刘洋', contact: '136-5555-6666', status: '已完工' },
  { id: 'M-20', no: 'WB-2023-003', name: '阳光海岸酒店空调保养', address: '阳光海岸大道 88 号', manager: '陈明', contact: '135-8888-9999', status: '已完工' },
  { id: 'M-21', no: 'WB-2023-004', name: '金融中心配电房维护', address: '金融中心 A 座 B1', manager: '王建国', contact: '138-0013-8001', status: '已完工' },
  { id: 'M-22', no: 'WB-2023-005', name: '国际会展中心水电检修', address: '国际会展中心 3 号馆', manager: '赵强', contact: '133-2222-3333', status: '已完工' },
  { id: 'M-23', no: 'WB-2023-006', name: '滨海商业街灯光维护', address: '滨海商业街 1-15 号', manager: '李志强', contact: '139-1234-5678', status: '已完工' },
  { id: 'M-24', no: 'WB-2023-007', name: '创意园区安防系统升级', address: '创意园 B 区 3 栋', manager: '张伟', contact: '137-9876-5432', status: '已完工' },
  { id: 'M-25', no: 'WB-2023-008', name: '实验中学暖通系统保养', address: '实验路 10 号', manager: '刘洋', contact: '136-5555-6666', status: '已完工' },
  { id: 'M-26', no: 'WB-2023-009', name: '市图书馆消防设备巡检', address: '学府路 100 号', manager: '陈明', contact: '135-8888-9999', status: '已完工' },
  { id: 'M-27', no: 'WB-2023-010', name: '奥体中心强电系统检修', address: '奥体路 1 号', manager: '王建国', contact: '138-0013-8001', status: '已完工' },
  { id: 'M-28', no: 'WB-2023-011', name: '新华书店弱电系统维护', address: '解放路 10 号', manager: '赵强', contact: '133-2222-3333', status: '已完工' },
  { id: 'M-29', no: 'WB-2023-012', name: '希尔顿酒店电梯检测', address: '滨海大道 1 号', manager: '李志强', contact: '139-1234-5678', status: '已完工' },
  { id: 'M-30', no: 'WB-2023-013', name: '数字图书馆空调清洗', address: '文化路 50 号', manager: '张伟', contact: '137-9876-5432', status: '已完工' },
  { id: 'M-31', no: 'WB-2023-014', name: '软件园B区供暖管道检修', address: '软件园 B 区', manager: '刘洋', contact: '136-5555-6666', status: '已完工' },
  { id: 'M-32', no: 'WB-2023-015', name: '万象城排污系统疏通', address: '万象城 B1 层', manager: '陈明', contact: '135-8888-9999', status: '已完工' },
  { id: 'M-33', no: 'WB-2023-016', name: '青年公寓外墙防水施工', address: '青年路 88 号', manager: '王建国', contact: '138-0013-8001', status: '已完工' },
  { id: 'M-34', no: 'WB-2023-017', name: '社区医疗中心电气检测', address: '健康路 12 号', manager: '赵强', contact: '133-2222-3333', status: '已完工' },
  { id: 'M-35', no: 'WB-2023-018', name: '地铁2号线通风系统维保', address: '地铁 2 号线全线', manager: '李志强', contact: '139-1234-5678', status: '已完工' },
  { id: 'M-36', no: 'WB-2023-019', name: '未来科技城消防年检', address: '未来路 1 号', manager: '张伟', contact: '137-9876-5432', status: '已完工' },
  { id: 'M-37', no: 'WB-2023-020', name: '智慧园区门禁系统维护', address: '智慧大道 88 号', manager: '刘洋', contact: '136-5555-6666', status: '已完工' },
  { id: 'M-38', no: 'WB-2023-021', name: '滨江花园电梯钢丝绳更换', address: '滨江路 200 号', manager: '陈明', contact: '135-8888-9999', status: '已完工' },
  { id: 'M-39', no: 'WB-2023-022', name: '连锁超市冷链设备保养', address: '全市 5 家分店', manager: '王建国', contact: '138-0013-8001', status: '已完工' },
  { id: 'M-40', no: 'WB-2023-023', name: '实验小学教室照明改造', address: '教育路 5 号', manager: '赵强', contact: '133-2222-3333', status: '已完工' },
  { id: 'M-41', no: 'WB-2023-024', name: '蓝天科技园水泵房维护', address: '高新园区蓝天路 1 号', manager: '李志强', contact: '139-1234-5678', status: '已完工' },
  { id: 'M-42', no: 'WB-2023-025', name: '老旧小区燃气管道检测', address: '和平区幸福里小区', manager: '张伟', contact: '137-9876-5432', status: '已完工' },
  { id: 'M-43', no: 'WB-2023-026', name: '高新区写字楼玻璃幕墙清洗', address: '高新区创新大厦', manager: '刘洋', contact: '136-5555-6666', status: '已完工' },
  { id: 'M-44', no: 'WB-2023-027', name: '度假村泳池水处理维保', address: '南山度假村', manager: '陈明', contact: '135-8888-9999', status: '已完工' },
  { id: 'M-45', no: 'WB-2023-028', name: '商务中心中央热水系统保养', address: '商务中心 A 座', manager: '王建国', contact: '138-0013-8001', status: '已完工' },
  { id: 'M-46', no: 'WB-2023-029', name: '科技孵化器网络机房巡检', address: '孵化器大楼 5 层', manager: '赵强', contact: '133-2222-3333', status: '已完工' },
  { id: 'M-47', no: 'WB-2023-030', name: '文化中心舞台灯光检修', address: '文化中心大剧院', manager: '李志强', contact: '139-1234-5678', status: '已完工' },
  { id: 'M-48', no: 'WB-2023-031', name: '体育公园照明系统维护', address: '体育公园主场馆', manager: '张伟', contact: '137-9876-5432', status: '已完工' },
  { id: 'M-49', no: 'WB-2023-032', name: '购物广场自动扶梯保养', address: '购物广场 1-3 层', manager: '刘洋', contact: '136-5555-6666', status: '已完工' },
  { id: 'M-50', no: 'WB-2023-033', name: '工业园区变压器检测', address: '工业园区配电中心', manager: '陈明', contact: '135-8888-9999', status: '已完工' },
  { id: 'M-51', no: 'WB-2023-034', name: '医院手术室洁净空调维保', address: '市第一人民医院 3 号楼', manager: '王建国', contact: '138-0013-8001', status: '已完工' },
];

export const members: Member[] = [
  { id: 1, name: '张伟', role: '项目经理', initial: '张', bgColor: 'bg-blue-500', online: true, phone: '138-0013-8001', team: '维保一组', email: 'zhangwei@example.com', memberType: '内部成员', remarks: '负责 A 区商业综合体项目统筹与对外协调。', responsibleSpace: 'A 区 · 商业综合体、B 区 · 写字楼群' },
  { id: 2, name: '李秀英', role: '高级工程师', initial: '李', bgColor: 'bg-green-500', online: false, phone: '139-2234-5678', team: '维保一组', email: 'lixiuying@example.com', memberType: '内部成员', remarks: '暖通方案审核与节能改造技术支持。', responsibleSpace: 'A 区 · 商业综合体' },
  { id: 3, name: '王强', role: '现场监理', initial: '王', bgColor: 'bg-yellow-500', online: true, phone: '137-3344-9900', team: '维保二组', email: 'wangqiang@example.com', memberType: '外部成员', remarks: '现场安全巡检与施工质量验收。', responsibleSpace: '工业园区 · 配电中心', company: '宏达机电工程有限公司' },
  { id: 4, name: '刘洋', role: '机电工程师', initial: '刘', bgColor: 'bg-indigo-500', online: true, phone: '136-5566-7788', team: '维保二组', email: 'liuyang@example.com', memberType: '内部成员', remarks: '机电安装与调试，配合竣工验收。', responsibleSpace: 'C 区 · 产业园一期' },
  { id: 5, name: '陈明', role: '安全员', initial: '陈', bgColor: 'bg-rose-500', online: false, phone: '135-6677-8899', team: '维保一组', email: 'chenming@example.com', memberType: '内部成员', remarks: '专项安全培训与隐患整改跟踪。', responsibleSpace: '全区域安全巡检' },
  { id: 6, name: '赵敏', role: '资料员', initial: '赵', bgColor: 'bg-teal-500', online: true, phone: '133-7788-9900', team: '维保二组', email: 'zhaomin@example.com', memberType: '内部成员', remarks: '竣工资料归档与图纸版本管理。', responsibleSpace: '总部档案室、项目资料库' },
];

/**
 * 团队「包含人员」头像彩圈仅用色（与 UI 色板一致，禁止其它色值）
 */
export const TEAM_MEMBER_AVATAR_COLORS = [
  '#B9D8AB',
  '#9BC07C',
  '#519B61',
  '#D2D47B',
  '#B0D4C5',
  '#B2C4D7',
] as const;

const C = TEAM_MEMBER_AVATAR_COLORS;

/** 组织与架构 · 团队（团队页网格与首页侧栏共用） */
export const organizationTeams: OrganizationTeam[] = [
  {
    id: 't1',
    name: '维保一组',
    leader: '张伟',
    space: 'A 区 · 商业综合体',
    createdAt: '2024-03-15',
    members: [
      { initial: '张', color: C[0] },
      { initial: '李', color: C[1] },
      { initial: '王', color: C[2] },
      { initial: '江', color: C[3] },
    ],
  },
  {
    id: 't2',
    name: '维保二组',
    leader: '李秀英',
    space: 'B 区 · 工业园区',
    createdAt: '2024-06-01',
    members: [
      { initial: '刘', color: C[4] },
      { initial: '陈', color: C[5] },
      { initial: '赵', color: C[0] },
    ],
  },
  {
    id: 't3',
    name: '维保三组',
    leader: '王强',
    space: 'C 区 · 研发中心',
    createdAt: '2024-08-20',
    members: [
      { initial: '王', color: C[1] },
      { initial: '周', color: C[2] },
      { initial: '吴', color: C[3] },
    ],
  },
  {
    id: 't4',
    name: '工程支持组',
    leader: '刘洋',
    space: '全区域巡检',
    createdAt: '2024-05-10',
    members: [
      { initial: '刘', color: C[4] },
      { initial: '郑', color: C[5] },
    ],
  },
  {
    id: 't5',
    name: '应急响应组',
    leader: '陈明',
    space: '机动调配',
    createdAt: '2024-07-01',
    members: [
      { initial: '陈', color: C[0] },
      { initial: '孙', color: C[1] },
      { initial: '钱', color: C[2] },
    ],
  },
  {
    id: 't6',
    name: '资料与合规组',
    leader: '赵敏',
    space: '总部大楼',
    createdAt: '2024-09-12',
    members: [
      { initial: '赵', color: C[3] },
      { initial: '冯', color: C[4] },
    ],
  },
];

/** 组织与架构 · 空间列表 */
export const organizationSpaces: OrganizationSpace[] = [
  {
    id: 's1',
    name: '北京总部',
    owner: '张伟',
    province: '北京市',
    city: '北京市',
    district: '朝阳区',
    address: '住邦2000商务中心4号楼5层',
    area: '1000㎡',
  },
  {
    id: 's2',
    name: '上海运营中心',
    owner: '李秀英',
    province: '上海市',
    city: '上海市',
    district: '浦东新区',
    address: '陆家嘴环路1000号恒生银行大厦15层',
    area: '850㎡',
  },
  {
    id: 's3',
    name: '深圳研发中心',
    owner: '刘洋',
    province: '广东省',
    city: '深圳市',
    district: '南山区',
    address: '科技园南区深南大道9988号',
    area: '1200㎡',
  },
  {
    id: 's4',
    name: '成都备件仓',
    owner: '陈明',
    province: '四川省',
    city: '成都市',
    district: '双流区',
    address: '航空港物流园B区7号库',
    area: '3200㎡',
  },
];
