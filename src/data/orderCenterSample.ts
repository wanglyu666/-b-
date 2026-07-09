export type OrderCenterStatus = '已签约' | '服务中' | '已完工' | '已取消' | '已评价';

export interface OrderCenterLineItem {
  id: number;
  major: string;
  subjectCode: string;
  subjectName: string;
  calcRule: string;
  brand: string;
  model: string;
  spec: string;
  description: string;
  unit: string;
  taxIncludedPrice: number;
}

export interface OrderCenterItem {
  id: string;
  orderNo: string;
  contractNo: string;
  orderTime: string;
  signedTime: string;
  status: OrderCenterStatus;
  orderAmount: number;
  serviceAddress: string;
  productTitle: string;
  productImage: string;
  itemCount: number;
  lineItems: OrderCenterLineItem[];
}

export const REFUND_REASON_OPTIONS = [
  '商品质量问题',
  '商品与描述不符',
  '重复下单',
  '不再需要',
  '其他',
] as const;

export type RefundReason = (typeof REFUND_REASON_OPTIONS)[number];

const ORDER_LINE_ITEMS: Record<string, OrderCenterLineItem[]> = {
  'oc-001': [
    {
      id: 1001,
      major: '装饰',
      subjectCode: 'KM-0003',
      subjectName: 'Hemlingby 双人沙发',
      calcRule: '按项计',
      brand: '宜家',
      model: 'Hemlingby',
      spec: '标准款',
      description: '双人沙发，含基础安装服务',
      unit: '项',
      taxIncludedPrice: 630.0,
    },
  ],
  'oc-002': [
    {
      id: 1002,
      major: '装饰',
      subjectCode: 'KM-0001',
      subjectName: 'Muren 单人扶手椅',
      calcRule: '按项计',
      brand: '宜家',
      model: 'Muren',
      spec: '标准款',
      description: '单人扶手椅，含基础安装服务',
      unit: '项',
      taxIncludedPrice: 520.0,
    },
    {
      id: 1003,
      major: '装饰',
      subjectCode: 'KM-0002',
      subjectName: 'Standmon 脚凳',
      calcRule: '按项计',
      brand: '宜家',
      model: 'Standmon',
      spec: '标准款',
      description: '配套脚凳，含基础安装服务',
      unit: '项',
      taxIncludedPrice: 760.0,
    },
  ],
  'oc-003': [
    {
      id: 1004,
      major: '装饰',
      subjectCode: 'KM-0005',
      subjectName: 'Poäng 摇椅',
      calcRule: '按项计',
      brand: '宜家',
      model: 'Poäng',
      spec: '标准款',
      description: '摇椅主体，含基础安装服务',
      unit: '项',
      taxIncludedPrice: 980.0,
    },
    {
      id: 1005,
      major: '装饰',
      subjectCode: 'KM-0004',
      subjectName: 'Kallax 储物架',
      calcRule: '按项计',
      brand: '收纳',
      model: 'Kallax',
      spec: '4x4',
      description: '储物架组装与固定',
      unit: '项',
      taxIncludedPrice: 720.0,
    },
    {
      id: 1006,
      major: '装饰',
      subjectCode: 'KM-0002',
      subjectName: 'Standmon 脚凳',
      calcRule: '按项计',
      brand: '宜家',
      model: 'Standmon',
      spec: '标准款',
      description: '配套脚凳，含基础安装服务',
      unit: '项',
      taxIncludedPrice: 760.0,
    },
  ],
  'oc-004': [
    {
      id: 1007,
      major: '装饰',
      subjectCode: 'KM-0002',
      subjectName: 'Standmon 脚凳',
      calcRule: '按项计',
      brand: '宜家',
      model: 'Standmon',
      spec: '标准款',
      description: '脚凳主体，含基础安装服务',
      unit: '项',
      taxIncludedPrice: 920.0,
    },
  ],
  'oc-101': [
    {
      id: 2001,
      major: '装饰',
      subjectCode: 'KM-0005',
      subjectName: 'Poäng 摇椅',
      calcRule: '按项计',
      brand: '宜家',
      model: 'Poäng',
      spec: '标准款',
      description: '摇椅主体，含上门安装与调试',
      unit: '项',
      taxIncludedPrice: 980.0,
    },
  ],
  'oc-102': [
    {
      id: 2002,
      major: '装饰',
      subjectCode: 'KM-0004',
      subjectName: 'Kallax 储物架',
      calcRule: '按项计',
      brand: '收纳',
      model: 'Kallax',
      spec: '4x4',
      description: '储物架组装与墙面固定',
      unit: '项',
      taxIncludedPrice: 720.0,
    },
    {
      id: 2003,
      major: '装饰',
      subjectCode: 'KM-0001',
      subjectName: 'Muren 单人扶手椅',
      calcRule: '按项计',
      brand: '宜家',
      model: 'Muren',
      spec: '标准款',
      description: '单人扶手椅，含基础安装服务',
      unit: '项',
      taxIncludedPrice: 520.0,
    },
  ],
  'oc-103': [
    {
      id: 2004,
      major: '装饰',
      subjectCode: 'KM-0003',
      subjectName: 'Hemlingby 双人沙发',
      calcRule: '按项计',
      brand: '宜家',
      model: 'Hemlingby',
      spec: '标准款',
      description: '双人沙发，含配送与安装',
      unit: '项',
      taxIncludedPrice: 630.0,
    },
    {
      id: 2005,
      major: '装饰',
      subjectCode: 'KM-0002',
      subjectName: 'Standmon 脚凳',
      calcRule: '按项计',
      brand: '宜家',
      model: 'Standmon',
      spec: '标准款',
      description: '配套脚凳，含基础安装服务',
      unit: '项',
      taxIncludedPrice: 760.0,
    },
  ],
  'oc-201': [
    {
      id: 3001,
      major: '装饰',
      subjectCode: 'KM-0001',
      subjectName: 'Muren 单人扶手椅',
      calcRule: '按项计',
      brand: '宜家',
      model: 'Muren',
      spec: '标准款',
      description: '单人扶手椅，含基础安装服务',
      unit: '项',
      taxIncludedPrice: 520.0,
    },
  ],
  'oc-202': [
    {
      id: 3002,
      major: '装饰',
      subjectCode: 'KM-0003',
      subjectName: 'Hemlingby 双人沙发',
      calcRule: '按项计',
      brand: '宜家',
      model: 'Hemlingby',
      spec: '标准款',
      description: '双人沙发，含配送与安装',
      unit: '项',
      taxIncludedPrice: 630.0,
    },
    {
      id: 3003,
      major: '装饰',
      subjectCode: 'KM-0002',
      subjectName: 'Standmon 脚凳',
      calcRule: '按项计',
      brand: '宜家',
      model: 'Standmon',
      spec: '标准款',
      description: '配套脚凳，含基础安装服务',
      unit: '项',
      taxIncludedPrice: 760.0,
    },
  ],
  'oc-203': [
    {
      id: 3004,
      major: '装饰',
      subjectCode: 'KM-0004',
      subjectName: 'Kallax 储物架',
      calcRule: '按项计',
      brand: '收纳',
      model: 'Kallax',
      spec: '4x4',
      description: '储物架组装与固定',
      unit: '项',
      taxIncludedPrice: 720.0,
    },
  ],
  'oc-301': [
    {
      id: 4001,
      major: '装饰',
      subjectCode: 'KM-0001',
      subjectName: 'Poäng 摇椅',
      calcRule: '按项计',
      brand: '宜家',
      model: 'Poäng',
      spec: '标准款',
      description: '摇椅，含基础安装服务',
      unit: '项',
      taxIncludedPrice: 980.0,
    },
  ],
  'oc-302': [
    {
      id: 4002,
      major: '装饰',
      subjectCode: 'KM-0003',
      subjectName: 'Hemlingby 双人沙发',
      calcRule: '按项计',
      brand: '宜家',
      model: 'Hemlingby',
      spec: '标准款',
      description: '双人沙发，含配送与安装',
      unit: '项',
      taxIncludedPrice: 630.0,
    },
    {
      id: 4003,
      major: '装饰',
      subjectCode: 'KM-0002',
      subjectName: 'Standmon 脚凳',
      calcRule: '按项计',
      brand: '宜家',
      model: 'Standmon',
      spec: '标准款',
      description: '配套脚凳，含基础安装服务',
      unit: '项',
      taxIncludedPrice: 760.0,
    },
  ],
  'oc-303': [
    {
      id: 4004,
      major: '装饰',
      subjectCode: 'KM-0004',
      subjectName: 'Kallax 储物架',
      calcRule: '按项计',
      brand: '收纳',
      model: 'Kallax',
      spec: '2x4',
      description: '储物架组装与固定',
      unit: '项',
      taxIncludedPrice: 580.0,
    },
  ],
  'oc-401': [
    {
      id: 5001,
      major: '装饰',
      subjectCode: 'KM-0001',
      subjectName: 'Muren 单人扶手椅',
      calcRule: '按项计',
      brand: '宜家',
      model: 'Muren',
      spec: '标准款',
      description: '单人扶手椅，含基础安装服务',
      unit: '项',
      taxIncludedPrice: 520.0,
    },
  ],
  'oc-402': [
    {
      id: 5002,
      major: '装饰',
      subjectCode: 'KM-0003',
      subjectName: 'Hemlingby 双人沙发',
      calcRule: '按项计',
      brand: '宜家',
      model: 'Hemlingby',
      spec: '标准款',
      description: '双人沙发，含配送与安装',
      unit: '项',
      taxIncludedPrice: 630.0,
    },
    {
      id: 5003,
      major: '装饰',
      subjectCode: 'KM-0002',
      subjectName: 'Standmon 脚凳',
      calcRule: '按项计',
      brand: '宜家',
      model: 'Standmon',
      spec: '标准款',
      description: '配套脚凳，含基础安装服务',
      unit: '项',
      taxIncludedPrice: 760.0,
    },
  ],
  'oc-403': [
    {
      id: 5004,
      major: '装饰',
      subjectCode: 'KM-0004',
      subjectName: 'Kallax 储物架',
      calcRule: '按项计',
      brand: '收纳',
      model: 'Kallax',
      spec: '4x4',
      description: '储物架组装与固定',
      unit: '项',
      taxIncludedPrice: 720.0,
    },
  ],
};

export function getOrderLineItems(orderId: string): OrderCenterLineItem[] {
  return ORDER_LINE_ITEMS[orderId]?.map((item) => ({ ...item })) ?? [];
}

export interface OrderCustomerInfoRow {
  label: string;
  value: string;
}

export function buildOrderCustomerInfo(
  order: OrderCenterItem,
  customerName: string,
  contactPhone: string,
): OrderCustomerInfoRow[] {
  return [
    { label: '订单编号', value: order.orderNo },
    { label: '合同编号', value: order.contractNo },
    { label: '订单状态', value: order.status },
    { label: '联系人', value: customerName },
    { label: '联系电话', value: contactPhone },
    { label: '服务地址', value: order.serviceAddress },
    { label: '下单时间', value: order.orderTime },
    {
      label:
        order.status === '已完工' || order.status === '已评价'
          ? '完工时间'
          : order.status === '已取消'
            ? '取消时间'
            : '服务开始时间',
      value: order.signedTime,
    },
    { label: '订单金额', value: `¥${order.orderAmount.toFixed(2)}` },
  ];
}

export const SIGNED_ORDER_SAMPLES: OrderCenterItem[] = [
  {
    id: 'oc-001',
    orderNo: 'JS-20260705-128',
    contractNo: 'HT-20260705-001',
    orderTime: '2026/07/05 14:32',
    signedTime: '2026/07/06 10:18',
    status: '已签约',
    orderAmount: 630.0,
    serviceAddress: '北京市海淀区中关村大街1号海龙大厦3层',
    productTitle: 'Hemlingby 双人沙发',
    productImage:
      'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&q=80&w=600',
    itemCount: 1,
    lineItems: ORDER_LINE_ITEMS['oc-001'],
  },
  {
    id: 'oc-002',
    orderNo: 'JS-20260703-096',
    contractNo: 'HT-20260703-002',
    orderTime: '2026/07/03 09:15',
    signedTime: '2026/07/04 16:42',
    status: '已签约',
    orderAmount: 1280.0,
    serviceAddress: '北京市朝阳区望京街10号望京SOHO T3',
    productTitle: 'Muren 单人扶手椅 等 2 件商品',
    productImage:
      'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?auto=format&fit=crop&q=80&w=600',
    itemCount: 2,
    lineItems: ORDER_LINE_ITEMS['oc-002'],
  },
  {
    id: 'oc-003',
    orderNo: 'JS-20260628-074',
    contractNo: 'HT-20260628-003',
    orderTime: '2026/06/28 11:08',
    signedTime: '2026/06/29 09:30',
    status: '已签约',
    orderAmount: 2460.0,
    serviceAddress: '北京市西城区金融大街35号国际企业大厦',
    productTitle: 'Poäng 摇椅 等 3 件商品',
    productImage:
      'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&q=80&w=600',
    itemCount: 3,
    lineItems: ORDER_LINE_ITEMS['oc-003'],
  },
  {
    id: 'oc-004',
    orderNo: 'JS-20260620-051',
    contractNo: 'HT-20260620-004',
    orderTime: '2026/06/20 16:45',
    signedTime: '2026/06/21 14:05',
    status: '已签约',
    orderAmount: 920.0,
    serviceAddress: '北京市丰台区南四环西路188号总部基地17区',
    productTitle: 'Standmon 脚凳',
    productImage:
      'https://images.unsplash.com/photo-1592078615290-033ee584e267?auto=format&fit=crop&q=80&w=600',
    itemCount: 1,
    lineItems: ORDER_LINE_ITEMS['oc-004'],
  },
];

export const IN_SERVICE_ORDER_SAMPLES: OrderCenterItem[] = [
  {
    id: 'oc-101',
    orderNo: 'JS-20260701-082',
    contractNo: 'HT-20260701-101',
    orderTime: '2026/07/01 10:20',
    signedTime: '2026/07/08 09:15',
    status: '服务中',
    orderAmount: 980.0,
    serviceAddress: '北京市海淀区中关村软件园二期A座',
    productTitle: 'Poäng 摇椅',
    productImage:
      'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&q=80&w=600',
    itemCount: 1,
    lineItems: ORDER_LINE_ITEMS['oc-101'],
  },
  {
    id: 'oc-102',
    orderNo: 'JS-20260625-063',
    contractNo: 'HT-20260625-102',
    orderTime: '2026/06/25 15:40',
    signedTime: '2026/07/07 14:30',
    status: '服务中',
    orderAmount: 1240.0,
    serviceAddress: '北京市朝阳区建国门外大街1号国贸大厦',
    productTitle: 'Kallax 储物架 等 2 件商品',
    productImage:
      'https://images.unsplash.com/photo-1594620302200-9a762244a156?auto=format&fit=crop&q=80&w=600',
    itemCount: 2,
    lineItems: ORDER_LINE_ITEMS['oc-102'],
  },
  {
    id: 'oc-103',
    orderNo: 'JS-20260618-041',
    contractNo: 'HT-20260618-103',
    orderTime: '2026/06/18 11:05',
    signedTime: '2026/07/06 08:50',
    status: '服务中',
    orderAmount: 1390.0,
    serviceAddress: '北京市东城区王府井大街88号',
    productTitle: 'Hemlingby 双人沙发 等 2 件商品',
    productImage:
      'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&q=80&w=600',
    itemCount: 2,
    lineItems: ORDER_LINE_ITEMS['oc-103'],
  },
];

export const COMPLETED_ORDER_SAMPLES: OrderCenterItem[] = [
  {
    id: 'oc-201',
    orderNo: 'JS-20260610-035',
    contractNo: 'HT-20260610-201',
    orderTime: '2026/06/10 09:30',
    signedTime: '2026/07/01 16:20',
    status: '已完工',
    orderAmount: 520.0,
    serviceAddress: '北京市海淀区知春路76号中关村写字楼',
    productTitle: 'Muren 单人扶手椅',
    productImage:
      'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?auto=format&fit=crop&q=80&w=600',
    itemCount: 1,
    lineItems: ORDER_LINE_ITEMS['oc-201'],
  },
  {
    id: 'oc-202',
    orderNo: 'JS-20260528-022',
    contractNo: 'HT-20260528-202',
    orderTime: '2026/05/28 14:15',
    signedTime: '2026/06/30 11:45',
    status: '已完工',
    orderAmount: 1390.0,
    serviceAddress: '北京市朝阳区光华路15号泰达时代中心',
    productTitle: 'Hemlingby 双人沙发 等 2 件商品',
    productImage:
      'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&q=80&w=600',
    itemCount: 2,
    lineItems: ORDER_LINE_ITEMS['oc-202'],
  },
  {
    id: 'oc-203',
    orderNo: 'JS-20260515-018',
    contractNo: 'HT-20260515-203',
    orderTime: '2026/05/15 11:00',
    signedTime: '2026/06/25 17:10',
    status: '已完工',
    orderAmount: 720.0,
    serviceAddress: '北京市西城区西单北大街131号',
    productTitle: 'Kallax 储物架',
    productImage:
      'https://images.unsplash.com/photo-1594620302200-9a762244a156?auto=format&fit=crop&q=80&w=600',
    itemCount: 1,
    lineItems: ORDER_LINE_ITEMS['oc-203'],
  },
];

export const CANCELLED_ORDER_SAMPLES: OrderCenterItem[] = [
  {
    id: 'oc-301',
    orderNo: 'JS-20260622-048',
    contractNo: 'HT-20260622-301',
    orderTime: '2026/06/22 13:20',
    signedTime: '2026/06/23 09:45',
    status: '已取消',
    orderAmount: 980.0,
    serviceAddress: '北京市海淀区学院路30号科研楼',
    productTitle: 'Poäng 摇椅',
    productImage:
      'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&q=80&w=600',
    itemCount: 1,
    lineItems: ORDER_LINE_ITEMS['oc-301'],
  },
  {
    id: 'oc-302',
    orderNo: 'JS-20260608-027',
    contractNo: 'HT-20260608-302',
    orderTime: '2026/06/08 16:50',
    signedTime: '2026/06/09 11:30',
    status: '已取消',
    orderAmount: 1390.0,
    serviceAddress: '北京市朝阳区望京SOHO T3',
    productTitle: 'Hemlingby 双人沙发 等 2 件商品',
    productImage:
      'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&q=80&w=600',
    itemCount: 2,
    lineItems: ORDER_LINE_ITEMS['oc-302'],
  },
  {
    id: 'oc-303',
    orderNo: 'JS-20260520-014',
    contractNo: 'HT-20260520-303',
    orderTime: '2026/05/20 10:05',
    signedTime: '2026/05/21 15:18',
    status: '已取消',
    orderAmount: 580.0,
    serviceAddress: '北京市丰台区方庄芳群园二区',
    productTitle: 'Kallax 储物架',
    productImage:
      'https://images.unsplash.com/photo-1594620302200-9a762244a156?auto=format&fit=crop&q=80&w=600',
    itemCount: 1,
    lineItems: ORDER_LINE_ITEMS['oc-303'],
  },
];

export const EVALUATED_ORDER_SAMPLES: OrderCenterItem[] = [
  {
    id: 'oc-401',
    orderNo: 'JS-20260502-011',
    contractNo: 'HT-20260502-401',
    orderTime: '2026/05/02 08:40',
    signedTime: '2026/05/20 14:30',
    status: '已评价',
    orderAmount: 520.0,
    serviceAddress: '北京市海淀区中关村南大街5号理工科技大厦',
    productTitle: 'Muren 单人扶手椅',
    productImage:
      'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?auto=format&fit=crop&q=80&w=600',
    itemCount: 1,
    lineItems: ORDER_LINE_ITEMS['oc-401'],
  },
  {
    id: 'oc-402',
    orderNo: 'JS-20260418-006',
    contractNo: 'HT-20260418-402',
    orderTime: '2026/04/18 11:25',
    signedTime: '2026/05/10 16:55',
    status: '已评价',
    orderAmount: 1390.0,
    serviceAddress: '北京市朝阳区三里屯路19号院',
    productTitle: 'Hemlingby 双人沙发 等 2 件商品',
    productImage:
      'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&q=80&w=600',
    itemCount: 2,
    lineItems: ORDER_LINE_ITEMS['oc-402'],
  },
  {
    id: 'oc-403',
    orderNo: 'JS-20260405-003',
    contractNo: 'HT-20260405-403',
    orderTime: '2026/04/05 15:10',
    signedTime: '2026/04/28 10:20',
    status: '已评价',
    orderAmount: 720.0,
    serviceAddress: '北京市西城区德胜门外大街83号',
    productTitle: 'Kallax 储物架',
    productImage:
      'https://images.unsplash.com/photo-1594620302200-9a762244a156?auto=format&fit=crop&q=80&w=600',
    itemCount: 1,
    lineItems: ORDER_LINE_ITEMS['oc-403'],
  },
];

export const ALL_ORDER_SAMPLES: OrderCenterItem[] = [
  ...SIGNED_ORDER_SAMPLES,
  ...IN_SERVICE_ORDER_SAMPLES,
  ...COMPLETED_ORDER_SAMPLES,
  ...CANCELLED_ORDER_SAMPLES,
  ...EVALUATED_ORDER_SAMPLES,
];
