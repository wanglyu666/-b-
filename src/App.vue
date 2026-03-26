<script setup lang="ts">
import { ref, computed } from 'vue';
import { Settings } from 'lucide-vue-next';
import Sidebar from './components/Sidebar.vue';
import DashboardHome from './components/DashboardHome.vue';
import ShopView from './components/ShopView.vue';
import Grainient from './components/Grainient.vue';
import ProductDetailView from './components/ProductDetailView.vue';
import CartView from './components/CartView.vue';
import WishlistView from './components/WishlistView.vue';
import MessageView from './components/MessageView.vue';
import ManagementView from './components/ManagementView.vue';
import ContractAndSettlementView from './components/ContractAndSettlementView.vue';
import EngineeringProjectsView from './components/EngineeringProjectsView.vue';
import MaintenanceRepairView from './components/MaintenanceRepairView.vue';
import MaintenanceProjectsView from './components/MaintenanceProjectsView.vue';
import OrderManagementView from './components/OrderManagementView.vue';
import type { Product, CartItem } from './types';

const activeTab = ref('home');
const selectedProduct = ref<Product | null>(null);

const cart = ref<CartItem[]>([]);
const wishlist = ref<Product[]>([]);
const messageCount = ref(2);

const shopPage = ref(1);
const shopScrollTop = ref(0);

const activeProjectStatus = ref('施工中');
const activeMaintenanceProjectStatus = ref('待开工');


const repairMedia = [
  { type: 'image' as const, url: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=600&h=450&fit=crop' },
  { type: 'image' as const, url: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&h=450&fit=crop' },
  { type: 'video' as const, url: 'https://www.w3schools.com/html/mov_bbb.mp4', thumb: 'https://images.unsplash.com/photo-1590479773265-7464e5d48118?w=600&h=450&fit=crop' },
  { type: 'image' as const, url: 'https://images.unsplash.com/photo-1590479773265-7464e5d48118?w=600&h=450&fit=crop' },
];

const maintenanceRepairData = ref([
  { id: 1, no: 'WB202603241401488', projectName: '星巴克上海臻选烘焙工坊', address: '上海市静安区南京西路789号', managerName: '张伟', managerPhone: '13812345678', status: '维保中', teamInfo: '张伟 (13812345678)', startDate: '2025-06-01', completionDate: '2025-12-15', warrantyPeriod: '1年', reportType: '普通', visitTime: '2026-03-24 14:00', reason: '空调系统制冷效果下降，需要检修', images: [] as string[], media: repairMedia.slice(0, 3) },
  { id: 2, no: 'WB202603241348443', projectName: '喜茶深圳欢乐海岸店', address: '深圳市南山区滨海大道2008号', managerName: '李芳', managerPhone: '13987654321', status: '维保中', teamInfo: '李芳 (13987654321)', startDate: '2025-03-10', completionDate: '2025-09-30', warrantyPeriod: '1年', reportType: '紧急', visitTime: '2026-03-25 09:30', reason: '门店水管漏水，影响正常营业', images: [] as string[], media: repairMedia },
  { id: 3, no: 'WB202603241348302', projectName: '奈雪的茶北京三里屯店', address: '北京市朝阳区三里屯路19号', managerName: '王强', managerPhone: '13700001111', status: '待处理', teamInfo: '王强 (13700001111)', startDate: '2025-08-20', completionDate: '2026-02-28', warrantyPeriod: '1年', reportType: '普通', visitTime: '2026-03-26 10:00', reason: '电路偶发跳闸，需排查原因', images: [] as string[], media: [] },
  { id: 4, no: 'WB202603241348139', projectName: '乐乐茶杭州湖滨银泰店', address: '杭州市上城区延安路258号', managerName: '赵敏', managerPhone: '13622223333', status: '已完成', teamInfo: '赵敏 (13622223333)', startDate: '2025-01-15', completionDate: '2025-07-20', warrantyPeriod: '1年', reportType: '普通', visitTime: '2026-03-20 14:30', reason: '地面瓷砖空鼓修补', images: [] as string[], media: repairMedia.slice(0, 2) },
  { id: 5, no: 'WB202603241348001', projectName: '瑞幸咖啡广州天河城店', address: '广州市天河区天河路208号', managerName: '刘洋', managerPhone: '13544445555', status: '维保中', teamInfo: '刘洋 (13544445555)', startDate: '2025-05-01', completionDate: '2025-11-30', warrantyPeriod: '1年', reportType: '紧急', visitTime: '2026-03-25 16:00', reason: '消防喷淋系统误报警', images: [] as string[], media: [repairMedia[2], repairMedia[0]] },
  { id: 6, no: 'WB202603241347998', projectName: 'Manner Coffee上海静安寺店', address: '上海市静安区南京西路1618号', managerName: '陈晨', managerPhone: '13466667777', status: '维保中', teamInfo: '陈晨 (13466667777)', startDate: '2025-04-10', completionDate: '2025-10-20', warrantyPeriod: '1年', reportType: '普通', visitTime: '2026-03-27 11:00', reason: '店内灯具部分损坏需更换', images: [] as string[], media: [] },
]);

const handleAddRepair = (reportData: any) => {
  const now = new Date();
  const ts = now.getFullYear().toString() +
    (now.getMonth() + 1).toString().padStart(2, '0') +
    now.getDate().toString().padStart(2, '0') +
    now.getHours().toString().padStart(2, '0') +
    now.getMinutes().toString().padStart(2, '0') +
    now.getSeconds().toString().padStart(2, '0');
  const project = reportData.project;
  const newItem = {
    id: maintenanceRepairData.value.length + 1,
    no: 'WB' + ts + Math.floor(Math.random() * 1000).toString().padStart(3, '0'),
    projectName: project?.name || reportData.projectName || '新增项目',
    address: project?.address || '',
    managerName: project?.manager || '',
    managerPhone: project?.contact || '',
    status: '维保中',
    teamInfo: project ? `${project.manager} (${project.contact})` : '',
    startDate: project?.startDate || '',
    completionDate: project?.endDate || '',
    warrantyPeriod: '1年',
    reportType: reportData.reportType === 'urgent' ? '紧急' : '普通',
    visitTime: reportData.visitTime || '',
    reason: reportData.reason || '',
    images: [] as string[],
  };
  maintenanceRepairData.value.unshift(newItem);
};

const orderData = ref([
  { id: 1, orderNo: '20250115145532B', orderAmount: 113.38, orderTime: '2025-01-19 14:55:33', serviceAddress: '上海市静安区南京西路789号', status: '已发出' },
  { id: 2, orderNo: '20250107171736A', orderAmount: 2431.93, orderTime: '2025-01-07 17:17:36', serviceAddress: '深圳市南山区滨海大道2008号', status: '已完成' },
  { id: 3, orderNo: '20250731123553S', orderAmount: 11338.00, orderTime: '2025-07-31 12:33:33', serviceAddress: '北京市朝阳区三里屯路19号', status: '待确认' },
  { id: 4, orderNo: '20250731133240T', orderAmount: 23609.90, orderTime: '2025-07-31 13:37:41', serviceAddress: '杭州市上城区延安路258号', status: '待确认' },
  { id: 5, orderNo: '20250731123152S', orderAmount: 11338.00, orderTime: '2025-07-31 12:31:53', serviceAddress: '广州市天河区天河路208号', status: '已发出' },
  { id: 6, orderNo: '20250731133742G', orderAmount: 14739.40, orderTime: '2025-07-31 13:37:43', serviceAddress: '上海市静安区南京西路1618号', status: '已完成' },
  { id: 7, orderNo: '20250731122013H', orderAmount: 14738.40, orderTime: '2025-07-31 12:20:13', serviceAddress: '成都市锦江区春熙路188号', status: '已完成' },
  { id: 8, orderNo: '20250730185628K', orderAmount: 1012.05, orderTime: '2025-07-30 18:56:29', serviceAddress: '武汉市江汉区解放大道686号', status: '已完成' },
  { id: 9, orderNo: '20250730184414L', orderAmount: 1116.77, orderTime: '2025-07-30 18:44:14', serviceAddress: '南京市鼓楼区中山北路30号', status: '已完成' },
  { id: 10, orderNo: '20250730184522M', orderAmount: 1012.05, orderTime: '2025-07-30 18:45:22', serviceAddress: '重庆市渝中区解放碑步行街52号', status: '已完成' },
]);

const handleViewOrders = () => {
  activeTab.value = 'order-management';
};

const addToCart = (product: Product, count = 1) => {
  const existingItem = cart.value.find(item => item.id === product.id);
  if (existingItem) {
    existingItem.quantity += count;
  } else {
    cart.value.push({ ...product, quantity: count });
  }
};

const removeFromCart = (productId: number) => {
  cart.value = cart.value.filter(item => item.id !== productId);
};

const updateCartQuantity = (productId: number, delta: number) => {
  const item = cart.value.find(item => item.id === productId);
  if (item) {
    item.quantity = Math.max(1, item.quantity + delta);
  }
};

const toggleWishlist = (product: Product) => {
  const index = wishlist.value.findIndex(item => item.id === product.id);
  if (index !== -1) {
    wishlist.value.splice(index, 1);
  } else {
    wishlist.value.push(product);
  }
};

const removeFromWishlist = (productId: number) => {
  wishlist.value = wishlist.value.filter(item => item.id !== productId);
};

const handleProductClick = (product: Product) => {
  const mainEl = document.getElementById('main-content');
  if (mainEl) {
    shopScrollTop.value = mainEl.scrollTop;
  }
  selectedProduct.value = product;
  activeTab.value = 'product-detail';
};

const handleBackToShop = () => {
  selectedProduct.value = null;
  activeTab.value = 'shop';
};

const handleGoToCart = () => {
  activeTab.value = 'cart';
};

const handleGoToWishlist = () => {
  activeTab.value = 'wishlist';
};

const handleGoToMessages = () => {
  activeTab.value = 'messages';
};

const handleViewProjects = (status: string) => {
  activeProjectStatus.value = status;
  activeTab.value = 'engineering-projects';
};

const handleViewMaintenance = () => {
  activeTab.value = 'maintenance-repair';
};

const handleViewMaintenanceProjects = (status: string) => {
  activeMaintenanceProjectStatus.value = status;
  activeTab.value = 'maintenance-projects';
};

const handleBackToManagement = () => {
  activeTab.value = 'management';
};

const handleBack = () => {
  if (activeTab.value === 'messages' || activeTab.value === 'contracts') {
    activeTab.value = 'home';
  } else {
    handleBackToShop();
  }
};

const backgroundConfig = computed(() => {
  const shopTabs = ['home', 'shop', 'wishlist', 'cart', 'messages', 'product-detail'];
  const managementTabs = ['management', 'engineering-projects', 'contracts', 'maintenance-repair', 'maintenance-projects', 'order-management'];

  if (shopTabs.includes(activeTab.value)) {
    return {
      color1: '#A1D573',
      color2: '#ff9ffc',
      color3: '#b19eef',
      timeSpeed: 0.8
    };
  }
  if (managementTabs.includes(activeTab.value)) {
    return {
      color1: '#FFEB69',
      color2: '#E2943A',
      color3: '#DDBDDF',
      timeSpeed: 0.8
    };
  }
  return null;
});

const showBackground = computed(() => !!backgroundConfig.value);

const rootBgColor = computed(() => {
  if (['management', 'engineering-projects', 'contracts', 'maintenance-repair', 'maintenance-projects', 'order-management'].includes(activeTab.value)) {
    return 'bg-[#f1f3f0]';
  }
  return 'bg-[#f8fafc]';
});
</script>

<template>
  <div :class="['flex h-screen font-sans text-gray-900 selection:bg-[#A1D573] selection:text-white relative overflow-hidden', rootBgColor]">
    <!-- Persistent Background Layer -->
    <div 
      v-if="showBackground"
      class="absolute top-0 left-0 w-full h-[70vh] overflow-hidden pointer-events-none z-0"
      style="mask-image: linear-gradient(to bottom, black 0%, black 20%, transparent 100%); -webkit-mask-image: linear-gradient(to bottom, black 0%, black 20%, transparent 100%);"
    >
      <Grainient 
        v-bind="backgroundConfig"
        :zoom="0.8"
        :noiseScale="1.5"
      />
      <!-- Frosted Glass Overlay -->
      <div class="absolute inset-0 backdrop-blur-[40px] bg-white/10"></div>
    </div>

    <Sidebar :activeTab="activeTab" @update:activeTab="activeTab = $event" class="relative z-10" />

    <main id="main-content" class="flex-1 overflow-y-auto h-full relative z-10">
      <DashboardHome 
        v-if="activeTab === 'home'"
        :cartCount="cart.length" 
        @cartClick="handleGoToCart" 
        @wishlistClick="handleGoToWishlist" 
        :wishlistCount="wishlist.length" 
        @messageClick="handleGoToMessages" 
        :messageCount="messageCount" 
      />
      
      <ManagementView 
        v-if="activeTab === 'management'" 
        :repair-order-count="maintenanceRepairData.length"
        :order-total-count="orderData.length"
        @viewProjects="handleViewProjects"
        @viewMaintenance="handleViewMaintenance"
        @viewMaintenanceProjects="handleViewMaintenanceProjects"
        @addRepair="handleAddRepair"
        @viewOrders="handleViewOrders"
      />

      <MaintenanceRepairView 
        v-if="activeTab === 'maintenance-repair'"
        :data="maintenanceRepairData"
        @back="handleBackToManagement"
      />

      <MaintenanceProjectsView
        v-if="activeTab === 'maintenance-projects'"
        :initialStatus="activeMaintenanceProjectStatus"
        @back="handleBackToManagement"
      />

      <OrderManagementView
        v-if="activeTab === 'order-management'"
        :data="orderData"
        @back="handleBackToManagement"
      />

      <EngineeringProjectsView 
        v-if="activeTab === 'engineering-projects'"
        :initialStatus="activeProjectStatus"
        @back="handleBackToManagement"
      />

      <ContractAndSettlementView v-if="activeTab === 'contracts'" />

      <ShopView 
        v-if="activeTab === 'shop'"
        @productClick="handleProductClick" 
        v-model:currentPage="shopPage"
        :initialScrollTop="shopScrollTop"
        @addToCart="addToCart"
        :cartCount="cart.length"
        @cartClick="handleGoToCart"
        @wishlistClick="handleGoToWishlist"
        :wishlistCount="wishlist.length"
        @toggleWishlist="toggleWishlist"
        :wishlistItems="wishlist"
        @messageClick="handleGoToMessages"
        :messageCount="messageCount"
      />
      
      <ProductDetailView 
        v-if="activeTab === 'product-detail' && selectedProduct"
        :product="selectedProduct" 
        @back="handleBackToShop" 
        @addToCart="addToCart"
        :cartCount="cart.length"
        @cartClick="handleGoToCart"
        @toggleWishlist="toggleWishlist"
        :isInWishlist="wishlist.some(item => item.id === selectedProduct!.id)"
        @wishlistClick="handleGoToWishlist"
        :wishlistCount="wishlist.length"
        @messageClick="handleGoToMessages"
        :messageCount="messageCount"
      />

      <CartView 
        v-if="activeTab === 'cart'"
        :cartItems="cart"
        @updateQuantity="updateCartQuantity"
        @removeItem="removeFromCart"
        @back="handleBackToShop"
        @cartClick="() => {}" 
        :cartCount="cart.length"
        @wishlistClick="handleGoToWishlist"
        :wishlistCount="wishlist.length"
        @messageClick="handleGoToMessages"
        :messageCount="messageCount"
      />

      <WishlistView
        v-if="activeTab === 'wishlist'"
        :wishlistItems="wishlist"
        @removeItem="removeFromWishlist"
        @back="handleBackToShop"
        @cartClick="handleGoToCart"
        :cartCount="cart.length"
        @wishlistClick="() => {}"
        :wishlistCount="wishlist.length"
        @addToCart="addToCart"
        @messageClick="handleGoToMessages"
        :messageCount="messageCount"
      />

      <MessageView v-if="activeTab === 'messages'" @back="handleBack" />
    </main>
    
    <div class="md:hidden fixed bottom-6 right-6 bg-black text-white p-4 rounded-full shadow-xl z-50">
      <Settings :size="24" />
    </div>
  </div>
</template>

<style>
/* 可以在这里添加全局样式 */
</style>
