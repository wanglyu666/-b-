export type OrderCenterStatus = '已签约' | '服务中' | '已完工' | '已取消' | '已评价';

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
  },
];
