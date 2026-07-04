import { computed, ref } from 'vue';
import { defineStore } from 'pinia';
import type {
  CartItem,
  EngineeringProject,
  MaintenanceProject,
  Product,
  AddToCartOptions,
  CartDisplayMode,
  ToggleWishlistOptions,
  WishlistDisplayMode,
} from '../types';
import type { ConsultationSheetStatus } from '../data/consultations';
import type { MaintenanceRepairItem, OrderItem, TodoNotification } from '../types/app-domain';
import { fetchProducts } from '../api/commerceApi';
import { fetchTodoNotifications } from '../api/notificationApi';
import { fetchMaintenanceRepairOrders, fetchOrders } from '../api/operationApi';
import { fetchEngineeringProjects, fetchMaintenanceProjects, fetchUserInfo } from '../api/projectApi';

export type ShopAnnualRegion = 'north' | 'west' | 'south' | 'east';
export type ShopCategory = '全部商品' | '椅子' | '桌子' | '沙发' | '脚凳' | '办公';

export interface ShopUiState {
  isAnnualMode: boolean;
  shelfCycleIndex: number;
  selectedAnnualRegion: ShopAnnualRegion;
  activeCategory: ShopCategory;
  activeSubCategory: string | null;
  selectedListRowIds: number[];
}

const defaultShopUiState = (): ShopUiState => ({
  isAnnualMode: false,
  shelfCycleIndex: 0,
  selectedAnnualRegion: 'north',
  activeCategory: '全部商品',
  activeSubCategory: null,
  selectedListRowIds: [],
});

export const useAppStore = defineStore('app', () => {
  const selectedProduct = ref<Product | null>(null);
  const cart = ref<CartItem[]>([]);
  const cartAnnualDisplayMode = ref<CartDisplayMode>('card');
  const wishlist = ref<Product[]>([]);
  const wishlistAnnualDisplayMode = ref<WishlistDisplayMode>('card');
  const shopPage = ref(1);
  const shopScrollTop = ref(0);
  const shopUiState = ref<ShopUiState>(defaultShopUiState());

  const normalProducts = ref<Product[]>([]);
  const annualProducts = ref<Product[]>([]);
  const products = computed(() => [...normalProducts.value, ...annualProducts.value]);
  const todoNotifications = ref<TodoNotification[]>([]);
  const maintenanceRepairData = ref<MaintenanceRepairItem[]>([]);
  const orderData = ref<OrderItem[]>([]);
  const engineeringProjects = ref<EngineeringProject[]>([]);
  const maintenanceProjects = ref<MaintenanceProject[]>([]);

  const customerName = ref('管理员');
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
  const repairOrderCount = ref(0);
  const orderTotalCount = ref(0);

  async function loadGlobalModules(force = false) {
    if (globalModulesLoaded.value && !force) return;
    loadingGlobalModules.value = true;
    globalLoadError.value = null;
    try {
      const [
        productCatalog,
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
      normalProducts.value = productCatalog.normal;
      annualProducts.value = productCatalog.annual;
      todoNotifications.value = notificationList;
      maintenanceRepairData.value = repairList.list || repairList;
      repairOrderCount.value = repairList.total || 0;
      orderData.value = orders.list || orders;
      orderTotalCount.value = orders.total || 0;
      engineeringProjects.value = engineeringList.list;
      maintenanceProjects.value = maintenanceList.list || maintenanceList;
      
      // 拉取用户信息（非关键路径，独立 try）
      try {
        customerName.value = await fetchUserInfo();
      } catch {
        // 用户信息获取失败不阻塞，保持默认值
      }
      
      globalModulesLoaded.value = true;
    } catch (e) {
      globalLoadError.value = e instanceof Error ? e.message : '全局模块加载失败';
    } finally {
      loadingGlobalModules.value = false;
    }
  }

  function addToCart(product: Product, count = 1, options?: AddToCartOptions) {
    if (product.productKind === 'annual' && options?.fromListView) {
      cartAnnualDisplayMode.value = 'list';
    }
    const existingItem = cart.value.find(
      (item) => item.id === product.id && item.productKind === product.productKind,
    );
    if (existingItem) existingItem.quantity += count;
    else cart.value.push({ ...product, quantity: count });
  }

  function removeFromCart(productId: number, productKind?: Product['productKind']) {
    cart.value = cart.value.filter(
      (item) =>
        !(item.id === productId && (productKind === undefined || item.productKind === productKind)),
    );
  }

  function updateCartQuantity(
    productId: number,
    delta: number,
    productKind?: Product['productKind'],
  ) {
    const item = cart.value.find(
      (x) => x.id === productId && (productKind === undefined || x.productKind === productKind),
    );
    if (item) item.quantity = Math.max(1, item.quantity + delta);
  }

  function toggleWishlist(product: Product, options?: ToggleWishlistOptions) {
    const idx = wishlist.value.findIndex(
      (item) => item.id === product.id && item.productKind === product.productKind,
    );
    if (idx !== -1) {
      wishlist.value.splice(idx, 1);
      return;
    }

    if (product.productKind === 'annual' && options?.fromListView) {
      wishlistAnnualDisplayMode.value = 'list';
    }
    wishlist.value.push(product);
  }

  function removeFromWishlist(productId: number, productKind?: Product['productKind']) {
    wishlist.value = wishlist.value.filter(
      (item) =>
        !(item.id === productId && (productKind === undefined || item.productKind === productKind)),
    );
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

  function persistShopScroll() {
    const mainEl = document.getElementById('main-content');
    setShopScrollTop(mainEl?.scrollTop ?? 0);
  }

  function patchShopUiState(patch: Partial<ShopUiState>) {
    shopUiState.value = { ...shopUiState.value, ...patch };
  }

  function setShopSelectedListRowIds(ids: number[]) {
    shopUiState.value.selectedListRowIds = ids;
  }

  function resetShopUiState() {
    shopUiState.value = defaultShopUiState();
  }

  function resetAnnualCommerceDisplayMode() {
    cartAnnualDisplayMode.value = 'card';
    wishlistAnnualDisplayMode.value = 'card';
  }

  function setAnnualCommerceListDisplayMode() {
    cartAnnualDisplayMode.value = 'list';
    wishlistAnnualDisplayMode.value = 'list';
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
    cartAnnualDisplayMode,
    wishlist,
    wishlistAnnualDisplayMode,
    shopPage,
    shopScrollTop,
    shopUiState,
    normalProducts,
    annualProducts,
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
    customerName,
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
    persistShopScroll,
    patchShopUiState,
    setShopSelectedListRowIds,
    resetShopUiState,
    setAnnualCommerceListDisplayMode,
    resetAnnualCommerceDisplayMode,
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
