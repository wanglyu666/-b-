import { ref } from 'vue';

export interface ServiceProviderAddress {
  id: string;
  address: string;
  contact: string;
  phone: string;
  region: string;
}

export const INITIAL_SERVICE_PROVIDER_ADDRESSES: ServiceProviderAddress[] = [
  {
    id: 'hl',
    address: '北京市海淀区中关村大街1号海龙大厦3层',
    contact: '王海龙',
    phone: '18201357101',
    region: '北京市海淀区',
  },
  {
    id: 'rj',
    address: '北京市海淀区中关村软件园二期A座',
    contact: '李工',
    phone: '18201357102',
    region: '北京市海淀区',
  },
  {
    id: 'wj',
    address: '北京市朝阳区望京街10号望京SOHO T3',
    contact: '张经理',
    phone: '18201357103',
    region: '北京市朝阳区',
  },
  {
    id: 'jr',
    address: '北京市西城区金融大街35号国际企业大厦',
    contact: '赵工',
    phone: '18201357104',
    region: '北京市西城区',
  },
  {
    id: 'ft',
    address: '北京市丰台区南四环西路188号总部基地17区',
    contact: '刘工',
    phone: '18201357105',
    region: '北京市丰台区',
  },
];

export const serviceProviderAddressList = ref<ServiceProviderAddress[]>(
  INITIAL_SERVICE_PROVIDER_ADDRESSES.map((item) => ({ ...item })),
);
