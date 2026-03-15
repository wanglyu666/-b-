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

export interface Member {
  id: number;
  name: string;
  role: string;
  initial: string;
  bgColor: string;
  online: boolean;
}
