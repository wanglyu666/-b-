import { createRouter, createWebHistory } from 'vue-router';
import ContractAndSettlementView from '../components/ContractAndSettlementView.vue';
import HomePage from '../pages/HomePage.vue';
import ShopPage from '../pages/ShopPage.vue';
import ProductDetailPage from '../pages/ProductDetailPage.vue';
import CartPage from '../pages/CartPage.vue';
import WishlistPage from '../pages/WishlistPage.vue';
import MessagePage from '../pages/MessagePage.vue';
import ManagementPage from '../pages/ManagementPage.vue';
import MaintenanceRepairPage from '../pages/MaintenanceRepairPage.vue';
import MaintenanceProjectsPage from '../pages/MaintenanceProjectsPage.vue';
import OrderManagementPage from '../pages/OrderManagementPage.vue';
import EngineeringProjectsPage from '../pages/EngineeringProjectsPage.vue';
import OrganizationArchitecturePage from '../pages/OrganizationArchitecturePage.vue';
import MemberManagementPage from '../pages/MemberManagementPage.vue';
import TeamManagementPage from '../pages/TeamManagementPage.vue';
import SpaceManagementPage from '../pages/SpaceManagementPage.vue';
import ApprovalConfigurationPage from '../pages/ApprovalConfigurationPage.vue';
import ConsultationFeedbackPage from '../pages/ConsultationFeedbackPage.vue';
import AllConsultationsPage from '../pages/AllConsultationsPage.vue';
import FeedbackRecordsPage from '../pages/FeedbackRecordsPage.vue';

const routes = [
  { path: '/', redirect: '/home' },
  { path: '/home', name: 'home', component: HomePage, meta: { activeTab: 'home' } },
  { path: '/messages', name: 'messages', component: MessagePage, meta: { activeTab: 'home' } },
  { path: '/shop', name: 'shop', component: ShopPage, meta: { activeTab: 'shop' } },
  { path: '/shop/product', name: 'product-detail', component: ProductDetailPage, meta: { activeTab: 'shop' } },
  { path: '/shop/cart', name: 'cart', component: CartPage, meta: { activeTab: 'shop' } },
  { path: '/shop/wishlist', name: 'wishlist', component: WishlistPage, meta: { activeTab: 'shop' } },

  { path: '/management', name: 'management', component: ManagementPage, meta: { activeTab: 'management' } },
  { path: '/management/maintenance-repair', name: 'maintenance-repair', component: MaintenanceRepairPage, meta: { activeTab: 'management' } },
  { path: '/management/maintenance-projects', name: 'maintenance-projects', component: MaintenanceProjectsPage, meta: { activeTab: 'management' } },
  { path: '/management/order-management', name: 'order-management', component: OrderManagementPage, meta: { activeTab: 'management' } },
  { path: '/management/engineering-projects', name: 'engineering-projects', component: EngineeringProjectsPage, meta: { activeTab: 'management' } },

  { path: '/org', name: 'org-architecture', component: OrganizationArchitecturePage, meta: { activeTab: 'org-architecture' } },
  { path: '/org/members', name: 'member-management', component: MemberManagementPage, meta: { activeTab: 'org-architecture' } },
  { path: '/org/teams', name: 'team-management', component: TeamManagementPage, meta: { activeTab: 'org-architecture' } },
  { path: '/org/spaces', name: 'space-management', component: SpaceManagementPage, meta: { activeTab: 'org-architecture' } },
  { path: '/org/approvals', name: 'approval-configuration', component: ApprovalConfigurationPage, meta: { activeTab: 'org-architecture' } },

  { path: '/contracts', name: 'contracts', component: ContractAndSettlementView, meta: { activeTab: 'contracts' } },
  { path: '/consultation-feedback', name: 'consultation-feedback', component: ConsultationFeedbackPage, meta: { activeTab: 'consultation-feedback' } },
  { path: '/consultation-feedback/all', name: 'all-consultations', component: AllConsultationsPage, meta: { activeTab: 'consultation-feedback' } },
  { path: '/consultation-feedback/records', name: 'feedback-records', component: FeedbackRecordsPage, meta: { activeTab: 'consultation-feedback' } },
];

export const router = createRouter({
  history: createWebHistory(),
  routes,
});
