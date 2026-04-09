<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { Settings } from 'lucide-vue-next';
import Sidebar from './components/Sidebar.vue';
import DashboardHome from './components/DashboardHome.vue';
import ShopView from './components/ShopView.vue';
import ManagementHaloBackground from './components/ManagementHaloBackground.vue';
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
import ConsultationFeedbackView from './components/consultation-feedback/ConsultationFeedbackView.vue';
import AllConsultationsView from './components/consultation-feedback/AllConsultationsView.vue';
import FeedbackRecordsView from './components/consultation-feedback/FeedbackRecordsView.vue';
import OrganizationArchitectureView from './components/OrganizationArchitectureView.vue';
import MemberManagementView from './components/MemberManagementView.vue';
import TeamManagementView from './components/TeamManagementView.vue';
import { members } from './data';
import type { Product, CartItem } from './types';

type TodoNotification = {
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

const activeTab = ref('home');
const selectedProduct = ref<Product | null>(null);

const cart = ref<CartItem[]>([]);
const wishlist = ref<Product[]>([]);
const todoNotifications = ref<TodoNotification[]>([
  {
    id: 1,
    title: '新周报已提交',
    content: '项目经理王建国提交了本周施工周报',
    projectName: '星海湾一号别墅全屋定制',
    projectId: '1',
    projectStatus: '施工中',
    viewMode: 'reports',
    time: '10分钟前',
    kind: 'report',
    unread: true,
  },
  {
    id: 2,
    title: '竣工资料待审核',
    content: '已上传竣工验收报告，等待审核确认',
    projectName: '万科城3期精装房改造',
    projectId: '3',
    projectStatus: '已完工',
    viewMode: 'completion',
    time: '30分钟前',
    kind: 'completion',
    unread: true,
  },
  {
    id: 3,
    title: '可预约过程验收',
    content: '基础工程节点已完成，可预约验收时间',
    projectName: '国际会展中心展厅搭建',
    projectId: '11',
    projectStatus: '施工中',
    viewMode: 'acceptance',
    time: '1小时前',
    kind: 'acceptance',
    unread: true,
  },
  {
    id: 4,
    title: '新日报已提交',
    content: '今日施工进度报告已更新',
    projectName: '滨海商业街外立面改造',
    projectId: '12',
    projectStatus: '施工中',
    viewMode: 'reports',
    time: '2小时前',
    kind: 'report',
    unread: true,
  },
  {
    id: 5,
    title: '待评价',
    content: '项目已完成关键节点，请进行阶段评价',
    projectName: '金融中心VIP接待室升级',
    projectId: '7',
    projectStatus: '施工中',
    viewMode: 'evaluation',
    time: '3小时前',
    kind: 'evaluation',
    unread: true,
  },
  {
    id: 6,
    title: '施工标准已更新',
    content: '环境管控标准新增扬尘控制细则',
    projectName: '未来科技城研发中心装修',
    projectId: '21',
    projectStatus: '施工中',
    viewMode: 'standards',
    time: '5小时前',
    kind: 'standards',
    unread: true,
  },
]);
const messageCount = computed(() => todoNotifications.value.filter(item => item.unread !== false).length);

const shopPage = ref(1);
const shopScrollTop = ref(0);

const activeProjectStatus = ref('施工中');
const activeMaintenanceProjectStatus = ref('待开工');
const autoOpenProjectId = ref<string | null>(null);
const autoOpenViewMode = ref<string | null>(null);


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
  autoOpenProjectId.value = null;
  autoOpenViewMode.value = null;
  activeProjectStatus.value = status;
  activeTab.value = 'engineering-projects';
};

const handleOpenProjectView = (payload: { projectId: string; projectStatus: string; viewMode: string }) => {
  activeProjectStatus.value = payload.projectStatus;
  autoOpenProjectId.value = payload.projectId;
  autoOpenViewMode.value = payload.viewMode;
  activeTab.value = 'engineering-projects';
};

const handleViewMaintenance = () => {
  activeTab.value = 'maintenance-repair';
};

const handleViewMaintenanceProjects = (status: string) => {
  activeMaintenanceProjectStatus.value = status;
  activeTab.value = 'maintenance-projects';
};

const activeConsultationStatus = ref<'待回复' | '进行中' | '已结束'>('待回复');
/** 从咨询与反馈首页点某条咨询进入全部咨询时，打开对应详情弹窗（消费后清空） */
const pendingOpenConsultationId = ref<string | null>(null);
/** 从咨询首页意见反馈表「⋯」进入反馈记录页时，自动打开对应详情（消费后清空） */
const pendingOpenFeedbackConsultationId = ref<string | null>(null);

const handleOpenAllConsultations = (payload: {
  status: '待回复' | '进行中' | '已结束';
  openConsultationId?: string;
}) => {
  activeConsultationStatus.value = payload.status;
  pendingOpenConsultationId.value = payload.openConsultationId ?? null;
  activeTab.value = 'all-consultations';
};

const handleBackToConsultationFeedback = () => {
  pendingOpenConsultationId.value = null;
  pendingOpenFeedbackConsultationId.value = null;
  activeTab.value = 'consultation-feedback';
};

const handleOpenFeedbackRecords = (payload?: { openConsultationId?: string }) => {
  pendingOpenFeedbackConsultationId.value = payload?.openConsultationId ?? null;
  activeTab.value = 'feedback-records';
};

function onFeedbackRecordsOpenedInitialDetail() {
  pendingOpenFeedbackConsultationId.value = null;
}

function onAllConsultationsOpenedInitial() {
  pendingOpenConsultationId.value = null;
}

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

/** 与 ManagementHaloBackground 底部柔化一致，全站统一底色 */
const rootBgColor = 'bg-[#f1f3f0]';

watch(activeTab, () => {
  const mainEl = document.getElementById('main-content');
  if (mainEl) mainEl.scrollTop = 0;
  requestAnimationFrame(() => {
    if (mainEl) mainEl.scrollTop = 0;
  });
});
</script>

<template>
  <div :class="['flex h-screen font-sans text-gray-900 selection:bg-[#A1D573] selection:text-white relative overflow-hidden transition-colors duration-300 ease-out', rootBgColor]">
    <!-- 全站：绿 + 黄光晕（原管理中心背景，应用于所有页面） -->
    <div class="absolute inset-0 overflow-hidden pointer-events-none z-0">
      <ManagementHaloBackground />
    </div>

    <Sidebar :activeTab="activeTab" @update:activeTab="activeTab = $event" class="relative z-10" />

    <main id="main-content" class="main-scroll flex-1 overflow-y-auto h-full relative z-10 min-w-0">
      <Transition name="page-transition" mode="out-in">
      <div :key="activeTab" class="page-transition-root w-full min-h-0">
      <DashboardHome 
        v-if="activeTab === 'home'"
        :cartCount="cart.length" 
        @cartClick="handleGoToCart" 
        @wishlistClick="handleGoToWishlist" 
        :wishlistCount="wishlist.length" 
        @messageClick="handleGoToMessages" 
        :messageCount="messageCount"
        :todoItems="todoNotifications"
        @openProjectView="handleOpenProjectView"
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

      <OrganizationArchitectureView
        v-if="activeTab === 'org-architecture'"
        @open-member-management="activeTab = 'member-management'"
        @open-team-management="activeTab = 'team-management'"
      />

      <MemberManagementView
        v-if="activeTab === 'member-management'"
        :members="members"
        @back="activeTab = 'org-architecture'"
      />

      <TeamManagementView
        v-if="activeTab === 'team-management'"
        @back="activeTab = 'org-architecture'"
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
        :autoOpenProjectId="autoOpenProjectId"
        :autoOpenViewMode="autoOpenViewMode"
        @back="handleBackToManagement"
        @autoOpenConsumed="autoOpenProjectId = null; autoOpenViewMode = null"
      />

      <ContractAndSettlementView v-if="activeTab === 'contracts'" />

      <ConsultationFeedbackView
        v-if="activeTab === 'consultation-feedback'"
        @openAllConsultations="handleOpenAllConsultations"
        @openFeedbackRecords="handleOpenFeedbackRecords"
      />

      <FeedbackRecordsView
        v-if="activeTab === 'feedback-records'"
        :initial-open-consultation-id="pendingOpenFeedbackConsultationId"
        @back="handleBackToConsultationFeedback"
        @opened-initial-feedback-detail="onFeedbackRecordsOpenedInitialDetail"
      />

      <AllConsultationsView
        v-if="activeTab === 'all-consultations'"
        :initialStatus="activeConsultationStatus"
        :initialOpenConsultationId="pendingOpenConsultationId"
        @back="handleBackToConsultationFeedback"
        @opened-initial-consultation="onAllConsultationsOpenedInitial"
        @addToCart="addToCart"
      />

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
      />

      <WishlistView
        v-if="activeTab === 'wishlist'"
        :wishlistItems="wishlist"
        @removeItem="removeFromWishlist"
        @back="handleBackToShop"
        @addToCart="addToCart"
      />

      <MessageView
        v-if="activeTab === 'messages'"
        :todoItems="todoNotifications"
        @openProjectView="handleOpenProjectView"
        @back="handleBack"
      />
      </div>
      </Transition>
    </main>
    
    <div class="md:hidden fixed bottom-6 right-6 bg-black text-white p-4 rounded-full shadow-xl z-50">
      <Settings :size="24" />
    </div>
  </div>
</template>

<style>
/* 避免滚动条显隐导致主内容区相对侧栏横向跳动；与 transform 过渡叠加时也会更稳 */
.main-scroll {
  scrollbar-gutter: stable;
}

/*
 * 页面切换仅用 opacity，避免对主内容做 transform/scale。
 * transform 会单独升层，与侧栏、全屏背景不同步时易出现「偏一下再对齐」和掉帧。
 */
.page-transition-enter-active {
  transition: opacity 0.28s cubic-bezier(0.4, 0, 0.2, 1);
}
.page-transition-leave-active {
  transition: opacity 0.18s cubic-bezier(0.4, 0, 0.2, 1);
}
.page-transition-enter-from,
.page-transition-leave-to {
  opacity: 0;
}
</style>
