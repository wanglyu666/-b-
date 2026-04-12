import { computed, ref } from 'vue';
import { defineStore } from 'pinia';
import type { CartItem, EngineeringProject, MaintenanceProject, Product } from '../types';
import type { ConsultationSheetStatus } from '../data/consultations';
import type { MaintenanceRepairItem, OrderItem, TodoNotification } from '../types/app-domain';
import { fetchProducts } from '../api/commerceApi';
import { fetchTodoNotifications } from '../api/notificationApi';
import { fetchMaintenanceRepairOrders, fetchOrders } from '../api/operationApi';
import { fetchEngineeringProjects, fetchMaintenanceProjects } from '../api/projectApi';

export const useAppStore = defineStore('app', () => {
  const selectedProduct = ref<Product | null>(null);
  const cart = ref<CartItem[]>([]);
  const wishlist = ref<Product[]>([]);
  const shopPage = ref(1);
  const shopScrollTop = ref(0);

  const products = ref<Product[]>([]);
  const todoNotifications = ref<TodoNotification[]>([]);
  const maintenanceRepairData = ref<MaintenanceRepairItem[]>([]);
  const orderData = ref<OrderItem[]>([]);
  const engineeringProjects = ref<EngineeringProject[]>([]);
  const maintenanceProjects = ref<MaintenanceProject[]>([]);

  const loadingGlobalModules = ref(false);
  const globalModulesLoaded = ref(false);
  const globalLoadError = ref<string | null>(null);

  const activeProjectStatus = ref('施工中');
  const activeMaintenanceProjectStatus = ref('待开工');
  const autoOpenProjectId = ref<string | null>(null);
  const autoOpenViewMode = ref<string | null>(null);

  const activeConsultationStatus = ref<ConsultationSheetStatus>('待回复');
  const pendingOpenConsultationId = ref<string | null>(null);
  const pendingOpenFeedbackConsultationId = ref<string | null>(null);

  const messageCount = computed(() =>
    todoNotifications.value.filter((item) => item.unread !== false).length,
  );
  const repairOrderCount = computed(() => maintenanceRepairData.value.length);
  const orderTotalCount = computed(() => orderData.value.length);

  async function loadGlobalModules(force = false) {
    if (globalModulesLoaded.value && !force) return;
    loadingGlobalModules.value = true;
    globalLoadError.value = null;
    try {
      const [
        productList,
        notificationList,
        repairList,
        orders,
        engineeringList,
        maintenanceList,
      ] = await Promise.all([
        fetchProducts(),
        fetchTodoNotifications(),
        fetchMaintenanceRepairOrders(),
        fetchOrders(),
        fetchEngineeringProjects(),
        fetchMaintenanceProjects(),
      ]);
      products.value = productList;
      todoNotifications.value = notificationList;
      maintenanceRepairData.value = repairList;
      orderData.value = orders;
      engineeringProjects.value = engineeringList;
      maintenanceProjects.value = maintenanceList;
      globalModulesLoaded.value = true;
    } catch (e) {
      globalLoadError.value = e instanceof Error ? e.message : '全局模块加载失败';
    } finally {
      loadingGlobalModules.value = false;
    }
  }

  function addToCart(product: Product, count = 1) {
    const existingItem = cart.value.find((item) => item.id === product.id);
    if (existingItem) existingItem.quantity += count;
    else cart.value.push({ ...product, quantity: count });
  }

  function removeFromCart(productId: number) {
    cart.value = cart.value.filter((item) => item.id !== productId);
  }

  function updateCartQuantity(productId: number, delta: number) {
    const item = cart.value.find((x) => x.id === productId);
    if (item) item.quantity = Math.max(1, item.quantity + delta);
  }

  function toggleWishlist(product: Product) {
    const idx = wishlist.value.findIndex((item) => item.id === product.id);
    if (idx !== -1) wishlist.value.splice(idx, 1);
    else wishlist.value.push(product);
  }

  function removeFromWishlist(productId: number) {
    wishlist.value = wishlist.value.filter((item) => item.id !== productId);
  }

  function setSelectedProduct(product: Product | null) {
    selectedProduct.value = product;
  }

  function setShopPage(page: number) {
    shopPage.value = page;
  }

  function setShopScrollTop(scrollTop: number) {
    shopScrollTop.value = Math.max(0, scrollTop);
  }

  function setEngineeringProjectEntry(payload: {
    projectStatus: string;
    projectId?: string | null;
    viewMode?: string | null;
  }) {
    activeProjectStatus.value = payload.projectStatus;
    autoOpenProjectId.value = payload.projectId ?? null;
    autoOpenViewMode.value = payload.viewMode ?? null;
  }

  function consumeEngineeringAutoOpen() {
    autoOpenProjectId.value = null;
    autoOpenViewMode.value = null;
  }

  function setMaintenanceProjectStatus(status: string) {
    activeMaintenanceProjectStatus.value = status;
  }

  function setConsultationOpenPayload(payload: {
    status: ConsultationSheetStatus;
    openConsultationId?: string | null;
  }) {
    activeConsultationStatus.value = payload.status;
    pendingOpenConsultationId.value = payload.openConsultationId ?? null;
  }

  function clearPendingConsultationOpen() {
    pendingOpenConsultationId.value = null;
  }

  function setPendingFeedbackOpenId(id?: string | null) {
    pendingOpenFeedbackConsultationId.value = id ?? null;
  }

  function clearPendingFeedbackOpen() {
    pendingOpenFeedbackConsultationId.value = null;
  }

  function resetConsultationEntry() {
    pendingOpenConsultationId.value = null;
    pendingOpenFeedbackConsultationId.value = null;
  }

  function addRepairReport(reportData: any) {
    const now = new Date();
    const ts =
      now.getFullYear().toString() +
      (now.getMonth() + 1).toString().padStart(2, '0') +
      now.getDate().toString().padStart(2, '0') +
      now.getHours().toString().padStart(2, '0') +
      now.getMinutes().toString().padStart(2, '0') +
      now.getSeconds().toString().padStart(2, '0');
    const project = reportData.project;
    const newItem: MaintenanceRepairItem = {
      id: maintenanceRepairData.value.length + 1,
      no: `WB${ts}${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
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
      images: [],
    };
    maintenanceRepairData.value.unshift(newItem);
  }

  return {
    selectedProduct,
    cart,
    wishlist,
    shopPage,
    shopScrollTop,
    products,
    todoNotifications,
    maintenanceRepairData,
    orderData,
    engineeringProjects,
    maintenanceProjects,
    loadingGlobalModules,
    globalModulesLoaded,
    globalLoadError,
    activeProjectStatus,
    activeMaintenanceProjectStatus,
    autoOpenProjectId,
    autoOpenViewMode,
    activeConsultationStatus,
    pendingOpenConsultationId,
    pendingOpenFeedbackConsultationId,
    messageCount,
    repairOrderCount,
    orderTotalCount,
    loadGlobalModules,
    addToCart,
    removeFromCart,
    updateCartQuantity,
    toggleWishlist,
    removeFromWishlist,
    setSelectedProduct,
    setShopPage,
    setShopScrollTop,
    setEngineeringProjectEntry,
    consumeEngineeringAutoOpen,
    setMaintenanceProjectStatus,
    setConsultationOpenPayload,
    clearPendingConsultationOpen,
    setPendingFeedbackOpenId,
    clearPendingFeedbackOpen,
    resetConsultationEntry,
    addRepairReport,
  };
});
