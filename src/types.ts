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
