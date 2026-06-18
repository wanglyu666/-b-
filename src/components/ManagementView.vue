<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted } from 'vue';
import { HardHat, Clock, Wrench, CheckCircle, Banknote, Shield, ShieldAlert, AlertCircle, ClipboardList, ShoppingCart, X } from 'lucide-vue-next';
import TopBarActions from './TopBarActions.vue';
import { useAppStore } from '../stores/appStore';
import type { EngineeringProject, MaintenanceProject, Member } from '../types';
import { fetchProjectCounts, fetchMaintenanceProjectCounts } from '../api/projectApi';
import { fetchEndProjects, fetchOrders, fetchOrderDetail, addMaintenanceRepair, addMaintenanceRepair2, uploadFile } from '../api/operationApi';
import type { EndProjectOption, OrderDetail } from '../api/operationApi';
import orderMgmtIllustration from '../../image asset/shopping cart icon.png';
import checkMarkImg from '../../image asset/check mark.png';
import engProjectWrenchImg from '../../image asset/wrench.png';

const props = withDefaults(
  defineProps<{
    /** 维保报修工单条数（与维保报修列表一致） */
    repairOrderCount: number;
    /** 订单管理总订单数（订单模块未接入前为占位，接入后改为真实值） */
    orderTotalCount: number;
    members: Member[];
    engineeringProjects: EngineeringProject[];
    maintenanceProjects: MaintenanceProject[];
  }>(),
  {
    repairOrderCount: 0,
    orderTotalCount: 0,
    members: () => [],
    engineeringProjects: () => [],
    maintenanceProjects: () => [],
  }
);

const emit = defineEmits(['viewProjects', 'viewMaintenance', 'viewMaintenanceProjects', 'viewOrders']);

const appStore = useAppStore();

/** 维保项目：各状态数量（从 API 获取） */
const maintenancePendingCount = ref(0);
const maintenanceInProgressCount = ref(0);
const maintenanceCompletedCount = ref(0);

/** 工程项目：各状态数量（从 API 获取 total） */
const engPendingCount = ref(0);
const engInProgressCount = ref(0);
const engCompletedCount = ref(0);
const engSettledCount = ref(0);
const engWarrantyInCount = ref(0);
const engWarrantyOutCount = ref(0);

const engCountsLoading = ref(false);

async function loadProjectCounts() {
  engCountsLoading.value = true;
  try {
    const [engCounts, maintenanceCounts] = await Promise.all([
      fetchProjectCounts(),
      fetchMaintenanceProjectCounts(),
    ]);
    engPendingCount.value = engCounts['待开工'];
    engInProgressCount.value = engCounts['施工中'];
    engCompletedCount.value = engCounts['已完工'];
    engSettledCount.value = engCounts['已结算'];
    engWarrantyInCount.value = engCounts['保修中'];
    engWarrantyOutCount.value = engCounts['保修外'];
    maintenancePendingCount.value = maintenanceCounts['待开工'] || 0;
    maintenanceInProgressCount.value = maintenanceCounts['施工中'] || 0;
    maintenanceCompletedCount.value = maintenanceCounts['已完工'] || 0;
  } catch (error) {
    console.error('获取项目统计失败:', error);
  } finally {
    engCountsLoading.value = false;
  }
}

onMounted(() => {
  loadProjectCounts();
});

const showAddModal = ref(false);
const modalStep = ref<'form' | 'success'>('form');

/** 已完工项目下拉选项（从 API 获取） */
const endProjectsOptions = ref<EndProjectOption[]>([]);
/** 下拉加载中 */
const projectOptionsLoading = ref(false);
/** 选中的项目详情 */
const selectedProject = ref<EndProjectOption | null>(null);
/** 关联订单详情 */
const orderForm = ref<OrderDetail | null>(null);
/** showType: '0' 仅项目信息 '1' 含订单子项 */
const showType = ref('0');
/** 选中的产品 ID 列表 */
const orderCheckList = ref<number[]>([]);
/** 订单详情加载中 */
const orderDetailLoading = ref(false);
/** 提交中 */
const submitLoading = ref(false);

const newReport = ref({
  projectId: '',
  teamInfo: '',
  startDate: '',
  completionDate: '',
  warrantyPeriod: '',
  reportType: 'normal',
  visitTime: '',
  reason: '',
  files: [] as string[]  // 上传后的 URL 列表
});

// 项目下拉变更 → 获取关联订单详情
async function onProjectChange(projectId: string) {
  orderForm.value = null;
  showType.value = '0';
  orderCheckList.value = [];
  if (!projectId) {
    selectedProject.value = null;
    newReport.value.teamInfo = '';
    newReport.value.startDate = '';
    newReport.value.completionDate = '';
    newReport.value.warrantyPeriod = '';
    return;
  }
  const proj = endProjectsOptions.value.find(p => p.projectId === projectId);
  if (!proj) return;
  selectedProject.value = proj;
  newReport.value.teamInfo = `${proj.projectDirectorName} (${proj.projectDirectorPhone})`;
  newReport.value.startDate = proj.startTime || '';
  newReport.value.completionDate = proj.endTime || '';
  newReport.value.warrantyPeriod = proj.warrantyPeriod ? `${proj.warrantyPeriod}个月` : '';

  // 如果有订单编号，拉取订单详情
  if (proj.orderCode) {
    orderDetailLoading.value = true;
    try {
      const orderRes = await fetchOrders(1, 1, proj.orderCode);
      if (orderRes.list.length > 0) {
        const detail = await fetchOrderDetail(orderRes.list[0].id);
        if (detail) {
          orderForm.value = detail;
          showType.value = '1';
          // 默认全选全部产品（使用原始嵌套数据中的 item.id）
          const allIds: number[] = [];
          (detail.orderSubList || []).forEach(sub => {
            (sub.orderSubDetailList || []).forEach((item: any) => {
              if (item.id) allIds.push(item.id);
            });
          });
          orderCheckList.value = allIds;
        }
      }
    } catch (e) {
      console.error('获取关联订单失败:', e);
    } finally {
      orderDetailLoading.value = false;
    }
  }
}

// Watch for project selection to trigger change handler
watch(() => newReport.value.projectId, onProjectChange);

/** 文件上传中 */
const uploadingFiles = ref(false);

const handleFileChange = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (!target.files || target.files.length === 0) return;

  const selectedFiles = Array.from(target.files);
  const currentCount = newReport.value.files.length;

  if (currentCount + selectedFiles.length > 5) {
    alert('最多只能上传5个文件');
    target.value = '';
    return;
  }

  // 逐个上传文件到服务器
  uploadingFiles.value = true;
  const uploadedUrls: string[] = [];

  for (const file of selectedFiles) {
    const url = await uploadFile(file);
    if (url) {
      uploadedUrls.push(url);
    } else {
      alert(`文件 "${file.name}" 上传失败`);
    }
  }

  newReport.value.files = [...newReport.value.files, ...uploadedUrls];
  uploadingFiles.value = false;
  target.value = '';
};

const removeFile = (index: number) => {
  newReport.value.files.splice(index, 1);
};

/** 从 URL 中提取文件名 */
function getFileNameFromUrl(url: string): string {
  if (!url) return '';
  const lastSlash = url.lastIndexOf('/');
  if (lastSlash > -1) {
    return url.slice(lastSlash + 1);
  }
  return url;
}

/** YYYY-MM-DD → yyyy/mm/dd（用 text 占位，避免原生 date 显示 yyyy/mm/日） */
function formatDateSlash(isoDate: string): string {
  if (!isoDate?.trim()) return '';
  const m = isoDate.trim().match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!m) return isoDate;
  return `${m[1]}/${m[2]}/${m[3]}`;
}

/** datetime-local：YYYY-MM-DDTHH:mm → yyyy/mm/dd HH:mm */
function formatDateTimeSlashForDisplay(isoLocal: string): string {
  if (!isoLocal?.trim()) return '';
  const trimmed = isoLocal.trim();
  const [datePart, timePart] = trimmed.split('T');
  const slash = formatDateSlash(datePart);
  if (!slash) return '';
  if (!timePart || timePart.length < 4) return `${slash} --:--`;
  return `${slash} ${timePart.slice(0, 5)}`;
}

const visitTimePickerRef = ref<HTMLInputElement | null>(null);
const openVisitTimePicker = () => {
  const el = visitTimePickerRef.value;
  if (!el) return;
  try {
    el.showPicker?.();
  } catch {
    /* 部分浏览器不支持 showPicker */
  }
  el.focus();
};

const isFormValid = computed(() => {
  return newReport.value.projectId !== '' &&
    newReport.value.reportType !== '' &&
    newReport.value.visitTime !== '' &&
    newReport.value.reason.trim() !== '';
});

const addModalPanelRef = ref<HTMLElement | null>(null);

const morphAddModalStep = async (nextStep: 'form' | 'success') => {
  const panel = addModalPanelRef.value;
  if (!panel) {
    modalStep.value = nextStep;
    return;
  }

  const fromHeight = panel.getBoundingClientRect().height;
  modalStep.value = nextStep;
  await nextTick();
  const toHeight = panel.getBoundingClientRect().height;

  if (Math.round(fromHeight) === Math.round(toHeight)) return;

  panel.style.height = `${fromHeight}px`;
  panel.style.transition = 'height 0.8s cubic-bezier(0.16, 1, 0.3, 1)';
  panel.getBoundingClientRect();
  panel.style.height = `${toHeight}px`;

  const onDone = (event: TransitionEvent) => {
    if (event.propertyName !== 'height') return;
    panel.style.height = '';
    panel.style.transition = '';
    panel.removeEventListener('transitionend', onDone);
  };

  panel.addEventListener('transitionend', onDone);
};

const submitReport = async () => {
  if (!isFormValid.value || !selectedProject.value || submitLoading.value) return;
  submitLoading.value = true;

  const proj = selectedProject.value;
  const reportData: Record<string, any> = {
    projectId: proj.projectId,
    bxType: newReport.value.reportType === 'urgent' ? '2' : '1',
    doorTime: newReport.value.visitTime.replace('T', ' ') + ':00',
    bxReason: newReport.value.reason,
    projectName: proj.projectName,
    projectCode: proj.projectCode,
    directorId: proj.directorId,
    directorName: proj.projectDirectorName,
    projectDirectorName: proj.projectDirectorName,
    orderAddress: proj.address,
    orderCode: proj.orderCode,
  };

  // 有上传文件时，传 files 参数（逗号分隔的 URL 字符串）
  if (newReport.value.files.length > 0) {
    reportData.files = newReport.value.files.join(',');
  }

  try {
    if (showType.value === '1' && orderForm.value) {
      // 有订单子项 → 使用 addMaintenanceRepair（标准路径）
      if (orderCheckList.value.length === 0) {
        alert('请选择产品信息');
        submitLoading.value = false;
        return;
      }
      // 从原始嵌套数据中筛选选中的产品
      const selectedDetailItems: any[] = [];
      const firstSub = orderForm.value.orderSubList?.[0];
      if (firstSub?.orderSubDetailList) {
        for (const item of firstSub.orderSubDetailList) {
          if (orderCheckList.value.includes(item.id)) {
            selectedDetailItems.push(item);
          }
        }
      }
      // 复制 orderForm 并替换子项为选中项
      const zbData = { ...orderForm.value };
      if (zbData.orderSubList?.[0]) {
        zbData.orderSubList[0] = { ...zbData.orderSubList[0], orderSubDetailList: selectedDetailItems };
      }
      reportData.zbData2 = JSON.stringify(zbData);
      reportData.orderId = orderForm.value.id;
      reportData.orderName = orderForm.value.orderNo;
      reportData.authUserId = (orderForm.value as any).authUserId || '';
      reportData.directorName = firstSub?.directorName || '';
      reportData.directorId = firstSub?.directorId || '';
      await addMaintenanceRepair(reportData);
    } else {
      // 无订单子项 → 使用 addMaintenanceRepair2
      await addMaintenanceRepair2(reportData);
    }
    submitLoading.value = false;
    void morphAddModalStep('success');
  } catch (e) {
    console.error('新增维保报修失败:', e);
    submitLoading.value = false;
    alert('提交失败，请稍后重试');
  }
};

const openAddModal = async () => {
  showAddModal.value = true;
  modalStep.value = 'form';
  // 加载已完工项目下拉
  if (endProjectsOptions.value.length === 0) {
    projectOptionsLoading.value = true;
    try {
      endProjectsOptions.value = await fetchEndProjects();
    } catch (e) {
      console.error('加载已完工项目失败:', e);
    } finally {
      projectOptionsLoading.value = false;
    }
  }
};

const closeAddModal = () => {
  const panel = addModalPanelRef.value;
  if (panel) {
    panel.style.height = '';
    panel.style.transition = '';
  }
  showAddModal.value = false;
  modalStep.value = 'form';
  submitLoading.value = false;
  selectedProject.value = null;
  orderForm.value = null;
  showType.value = '0';
  orderCheckList.value = [];
  newReport.value = {
    projectId: '',
    teamInfo: '',
    startDate: '',
    completionDate: '',
    warrantyPeriod: '',
    reportType: 'normal',
    visitTime: '',
    reason: '',
    files: [] as string[]
  };
};
</script>

<template>
  <div class="min-h-screen bg-transparent relative overflow-x-hidden">
    <!-- Content Area -->
    <div class="relative z-10 p-8 space-y-6 max-w-[1600px] mx-auto animate-in fade-in duration-700">
      <header class="flex justify-between items-center mb-8">
      <div>
        <h1 class="text-3xl font-bold text-gray-800">管理中心</h1>
        <p class="text-gray-500 mt-1">全局项目与人员管控</p>
      </div>
      <TopBarActions :isShop="false" :userName="appStore.customerName" />
    </header>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      <!-- 左侧与中间列 (Span 2) -->
      <div class="lg:col-span-2 flex flex-col gap-6">
        <!-- 维保项目管理 (红色框) -->
        <div class="bg-white/40 backdrop-blur-md p-6 rounded-3xl shadow-sm border border-white/20 flex flex-col h-[280px]">
           <div class="flex justify-between items-center mb-6">
              <div class="flex items-center space-x-2">
                 <div class="w-1 h-5 bg-[#FFEB69] rounded-full"></div>
                 <h3 class="font-bold text-lg text-gray-800">维保项目管理</h3>
              </div>
              <Wrench :size="18" class="text-gray-400" />
           </div>
           <div class="flex-1 grid grid-cols-3 gap-6 pl-32 pr-6 py-4">
               <button @click="emit('viewMaintenanceProjects', '待开工')" class="relative rounded-3xl bg-[#9FE870] text-[#163300] shadow-none transition-all active:scale-95 border border-[#9FE870]/35 group min-h-[120px] overflow-visible">
                  <span class="absolute top-3 right-3 sm:right-5 text-5xl sm:text-6xl font-black opacity-90 leading-none tracking-tighter tabular-nums transition-all duration-700 group-hover:scale-110 group-hover:-translate-y-2 pointer-events-none">{{ maintenancePendingCount }}</span>
                  <span class="absolute bottom-5 left-5 text-2xl font-bold opacity-70 tracking-tight transition-all duration-700 group-hover:translate-y-1 group-hover:opacity-100">待开工</span>
               </button>
               <button @click="emit('viewMaintenanceProjects', '施工中')" class="relative rounded-3xl bg-slate-500/10 text-[#334455] shadow-none border-0 transition-all active:scale-95 group min-h-[120px] overflow-visible">
                  <span class="absolute top-3 right-3 sm:right-5 text-5xl sm:text-6xl font-black text-[#334455] leading-none tracking-tighter tabular-nums transition-all duration-700 group-hover:scale-110 group-hover:-translate-y-2 pointer-events-none">{{ maintenanceInProgressCount }}</span>
                  <span class="absolute bottom-5 left-5 text-2xl font-bold text-[#334455] tracking-tight transition-all duration-700 group-hover:translate-y-1">施工中</span>
               </button>
               <button @click="emit('viewMaintenanceProjects', '已完工')" class="relative rounded-3xl bg-slate-500/10 text-[#334455] shadow-none border-0 transition-all active:scale-95 group min-h-[120px] overflow-visible">
                  <span class="absolute top-3 right-3 sm:right-6 text-5xl sm:text-6xl font-black text-[#334455] leading-none tracking-tighter tabular-nums transition-all duration-700 group-hover:scale-110 group-hover:-translate-y-2 pointer-events-none">{{ maintenanceCompletedCount }}</span>
                  <span class="absolute bottom-6 left-6 text-2xl font-bold text-[#334455] tracking-tight transition-all duration-700 group-hover:translate-y-1">已完工</span>
               </button>
           </div>
        </div>

        <!-- 工程项目管理：整行拉满；左列为后三项，右列底部为前三项（原成员卡区域） -->
        <div class="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col h-[400px]">
          <div class="flex justify-between items-center mb-4 shrink-0">
            <div class="flex items-center space-x-2">
              <div class="w-1 h-5 bg-[#FFEB69] rounded-full"></div>
              <h3 class="font-bold text-lg text-gray-800">工程项目管理</h3>
            </div>
            <HardHat :size="18" class="text-gray-400" />
          </div>

          <div class="flex min-h-0 flex-1 flex-col gap-3">
            <!-- 与示意红框一致：卡片内容区上半部、全宽、扁长条插图 -->
            <div
              class="flex h-[100px] w-full shrink-0 items-center justify-center overflow-hidden px-2 sm:h-[118px]"
            >
              <img
                :src="engProjectWrenchImg"
                alt=""
                class="h-full w-full max-h-[92px] sm:max-h-[108px] object-contain object-center"
              />
            </div>

            <div class="flex min-h-0 flex-1 flex-col gap-4 sm:flex-row sm:gap-8">
            <div
              class="flex min-h-0 flex-1 flex-col justify-end gap-2 sm:max-w-[50%]"
            >
              <div
                @click="$emit('viewProjects', '已结算')"
                class="flex cursor-pointer items-center justify-between rounded-xl p-1.5 transition-colors hover:bg-gray-50"
              >
                <div class="flex items-center space-x-3">
                  <div class="rounded-full bg-[#f8c91c]/15 p-1.5 text-[#f8c91c]">
                    <Banknote :size="14" />
                  </div>
                  <span class="text-sm font-medium text-gray-600">已结算</span>
                </div>
                <span class="text-lg font-bold text-gray-900">{{ engSettledCount }}</span>
              </div>

              <div
                @click="$emit('viewProjects', '保修中')"
                class="flex cursor-pointer items-center justify-between rounded-xl p-1.5 transition-colors hover:bg-gray-50"
              >
                <div class="flex items-center space-x-3">
                  <div class="rounded-full bg-[#f8c91c]/15 p-1.5 text-[#f8c91c]">
                    <Shield :size="14" />
                  </div>
                  <span class="text-sm font-medium text-gray-600">保修中</span>
                </div>
                <span class="text-lg font-bold text-gray-900">{{ engWarrantyInCount }}</span>
              </div>

              <div
                @click="$emit('viewProjects', '保修外')"
                class="flex cursor-pointer items-center justify-between rounded-xl p-1.5 transition-colors hover:bg-gray-50"
              >
                <div class="flex items-center space-x-3">
                  <div class="rounded-full bg-[#f8c91c]/15 p-1.5 text-[#f8c91c]">
                    <ShieldAlert :size="14" />
                  </div>
                  <span class="text-sm font-medium text-gray-600">保修外</span>
                </div>
                <span class="text-lg font-bold text-gray-900">{{ engWarrantyOutCount }}</span>
              </div>
            </div>

            <div
              class="flex min-h-0 flex-1 flex-col justify-end gap-2 border-t border-gray-100 pt-4 sm:border-t-0 sm:pt-0"
            >
              <div
                @click="$emit('viewProjects', '待开工')"
                class="flex cursor-pointer items-center justify-between rounded-xl p-1.5 transition-colors hover:bg-gray-50"
              >
                <div class="flex items-center space-x-3">
                  <div class="rounded-full bg-[#f8c91c]/15 p-1.5 text-[#f8c91c]">
                    <Clock :size="14" />
                  </div>
                  <span class="text-sm font-medium text-gray-600">待开工</span>
                </div>
                <span class="text-lg font-bold text-gray-900">{{ engPendingCount }}</span>
              </div>

              <div
                @click="$emit('viewProjects', '施工中')"
                class="flex cursor-pointer items-center justify-between rounded-xl p-1.5 transition-colors hover:bg-gray-50"
              >
                <div class="flex items-center space-x-3">
                  <div class="rounded-full bg-[#f8c91c]/15 p-1.5 text-[#f8c91c]">
                    <Wrench :size="14" />
                  </div>
                  <span class="text-sm font-medium text-gray-600">施工中</span>
                </div>
                <span class="text-lg font-bold text-gray-900">{{ engInProgressCount }}</span>
              </div>

              <div
                @click="$emit('viewProjects', '已完工')"
                class="flex cursor-pointer items-center justify-between rounded-xl p-1.5 transition-colors hover:bg-gray-50"
              >
                <div class="flex items-center space-x-3">
                  <div class="rounded-full bg-[#f8c91c]/15 p-1.5 text-[#f8c91c]">
                    <CheckCircle :size="14" />
                  </div>
                  <span class="text-sm font-medium text-gray-600">已完工</span>
                </div>
                <span class="text-lg font-bold text-gray-900">{{ engCompletedCount }}</span>
              </div>
            </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧列 (独立堆叠) -->
      <div class="flex flex-col gap-6">
        <!-- 订单管理 (蓝色框) -->
        <div @click="emit('viewOrders')" class="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col h-[460px] cursor-pointer hover:shadow-lg hover:border-[#A1D573]/30 transition-all group">
           <div class="flex justify-between items-center mb-4">
              <div class="flex items-center space-x-2">
                 <div class="w-1 h-5 bg-[#FFEB69] rounded-full"></div>
                 <h3 class="font-bold text-lg text-gray-800">订单管理</h3>
              </div>
              <ShoppingCart :size="18" class="text-gray-400" />
           </div>
           
           <div class="flex-1 min-h-0 flex flex-col">
              <!-- 图片只在中间弹性区域内缩放；总订单数区域固定贴在卡片下半部 -->
              <div class="min-h-0 flex-1 flex items-center justify-center overflow-hidden py-2">
                 <img
                   :src="orderMgmtIllustration"
                   alt=""
                   class="max-h-full max-w-full w-auto h-auto object-contain"
                 />
              </div>
              <div class="flex-shrink-0 flex flex-col items-center pb-1">
                 <span class="text-gray-500 font-medium mb-1 text-sm">总订单数</span>
                 <span class="font-bold text-5xl text-gray-900">{{ props.orderTotalCount }}</span>
              </div>
           </div>
        </div>

        <!-- 维保报修管理 (黄色框) -->
        <div 
          @click="emit('viewMaintenance')"
          class="bg-white/50 backdrop-blur-md p-6 rounded-3xl shadow-sm border border-white/20 flex flex-col justify-between h-[220px] cursor-pointer hover:bg-white/70 transition-all group"
        >
           <div class="flex justify-between items-center mb-4">
              <div class="flex items-center space-x-2">
                 <div class="w-1 h-5 bg-[#FFEB69] rounded-full"></div>
                 <h3 class="font-bold text-lg text-gray-800">维保报修管理</h3>
              </div>
              <AlertCircle :size="18" class="text-gray-400 group-hover:text-[#A1D573] transition-colors" />
           </div>
           <div class="flex-1 flex flex-col justify-center space-y-3">
              <div class="flex items-center justify-between px-2">
                  <div class="flex items-center space-x-3 text-gray-600">
                     <ClipboardList :size="18" class="text-[#163300]" />
                     <span class="font-medium text-sm">项目数量</span>
                  </div>
                  <span class="font-bold text-3xl text-gray-900 tabular-nums">{{ props.repairOrderCount }}</span>
              </div>
              <button 
                @click.stop="openAddModal" 
                class="w-full py-2.5 bg-[#9FE870] text-[#163300] font-bold rounded-2xl shadow-sm hover:bg-[#8dd85f] transition-colors"
              >
                 新增
              </button>
           </div>
        </div>
      </div>

    </div>
  </div>
</div>

  <!-- 新增维保报修 Modal -->
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="showAddModal" class="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
        <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" @click="closeAddModal"></div>
        
        <div ref="addModalPanelRef" class="relative bg-white rounded-3xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">
          
          <!-- Header -->
          <div class="flex items-center justify-between p-6 border-b border-gray-100">
            <h2 class="text-xl font-bold text-gray-800">{{ modalStep === 'form' ? '新增维保报修' : '提交成功' }}</h2>
            <button @click="closeAddModal" class="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
              <X :size="20" />
            </button>
          </div>
          
          <!-- 表单内容 -->
          <template v-if="modalStep === 'form'">
            <div class="p-6 overflow-y-auto flex-1 space-y-6">
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div class="space-y-2">
                  <label class="block text-sm font-medium text-gray-700">项目 <span class="text-red-400">*</span></label>
                  <select
                    v-model="newReport.projectId"
                    class="add-report-project-select w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#FFEB69] focus:border-[#FFEB69] accent-[#FFEB69] transition-all"
                    :disabled="projectOptionsLoading"
                  >
                    <option value="" disabled>{{ projectOptionsLoading ? '加载中...' : '请选择项目' }}</option>
                    <option v-for="proj in endProjectsOptions" :key="proj.projectId" :value="proj.projectId">
                      {{ proj.projectName }}
                    </option>
                  </select>
                </div>
                <div class="space-y-2" v-if="selectedProject">
                  <label class="block text-sm font-medium text-gray-700">项目组信息</label>
                  <input type="text" v-model="selectedProject.projectDirectorName" readonly placeholder="自动获取" class="w-full px-4 py-2.5 bg-gray-100 border border-gray-200 rounded-xl text-gray-500 cursor-not-allowed focus:outline-none transition-all" />
                </div>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div class="space-y-2">
                  <label class="block text-sm font-medium text-gray-700">开工时间</label>
                  <input
                    type="text"
                    readonly
                    :value="formatDateSlash(newReport.startDate)"
                    placeholder="yyyy/mm/dd"
                    class="w-full px-4 py-2.5 bg-gray-100 border border-gray-200 rounded-xl text-gray-500 cursor-not-allowed focus:outline-none transition-all"
                  />
                </div>
                <div class="space-y-2">
                  <label class="block text-sm font-medium text-gray-700">竣工时间</label>
                  <input
                    type="text"
                    readonly
                    :value="formatDateSlash(newReport.completionDate)"
                    placeholder="yyyy/mm/dd"
                    class="w-full px-4 py-2.5 bg-gray-100 border border-gray-200 rounded-xl text-gray-500 cursor-not-allowed focus:outline-none transition-all"
                  />
                </div>
                <div class="space-y-2">
                  <label class="block text-sm font-medium text-gray-700">质保期</label>
                  <input type="text" v-model="newReport.warrantyPeriod" readonly placeholder="自动获取" class="w-full px-4 py-2.5 bg-gray-100 border border-gray-200 rounded-xl text-gray-500 cursor-not-allowed focus:outline-none transition-all" />
                </div>
              </div>

              <!-- 订单信息 / 客户信息 / 项目组信息（选择项目后显示） -->
              <template v-if="selectedProject">
                <!-- 订单信息 -->
                <div class="rounded-xl bg-gray-50 border border-gray-100 p-4">
                  <h4 class="text-sm font-bold text-gray-800 mb-3">订单信息</h4>
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                    <p class="text-gray-600">订单编号：<span class="text-gray-800">{{ selectedProject.orderCode || '-' }}</span></p>
                    <p class="text-gray-600">项目名称：<span class="text-gray-800">{{ selectedProject.projectName || '-' }}</span></p>
                    <p class="text-gray-600">项目编号：<span class="text-gray-800">{{ selectedProject.projectCode || '-' }}</span></p>
                    <p class="text-gray-600">开工日期：<span class="text-gray-800">{{ formatDateSlash(selectedProject.startTime) || '-' }}</span></p>
                    <p class="text-gray-600">竣工日期：<span class="text-gray-800">{{ formatDateSlash(selectedProject.endTime) || '-' }}</span></p>
                    <p class="text-gray-600">保修期限：<span class="text-gray-800">{{ selectedProject.warrantyPeriod ? selectedProject.warrantyPeriod + '个月' : '-' }}</span></p>
                  </div>
                </div>

                <!-- 客户信息 -->
                <div class="rounded-xl bg-gray-50 border border-gray-100 p-4">
                  <h4 class="text-sm font-bold text-gray-800 mb-3">客户信息</h4>
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                    <p class="text-gray-600">客户名称：<span class="text-gray-800">{{ selectedProject.contactsName || '-' }}</span></p>
                    <p class="text-gray-600">联系方式：<span class="text-gray-800">{{ selectedProject.contactsPhone || '-' }}</span></p>
                    <p class="text-gray-600">公司名称：<span class="text-gray-800">{{ selectedProject.companyName || '-' }}</span></p>
                    <p class="text-gray-600">公司地址：<span class="text-gray-800">{{ selectedProject.address || '-' }}</span></p>
                  </div>
                </div>

                <!-- 项目组信息 -->
                <div class="rounded-xl bg-gray-50 border border-gray-100 p-4">
                  <h4 class="text-sm font-bold text-gray-800 mb-3">项目组信息</h4>
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                    <p class="text-gray-600">项目主管：<span class="text-gray-800">{{ selectedProject.projectDirectorName || '-' }}</span></p>
                    <p class="text-gray-600">项目主管电话：<span class="text-gray-800">{{ selectedProject.projectDirectorPhone || '-' }}</span></p>
                  </div>
                </div>

                <!-- 地址信息 + 产品选择（showType == '1' 且有订单子项时显示） -->
                <template v-if="showType === '1'">
                  <div v-if="orderDetailLoading" class="text-center py-4 text-sm text-gray-400">加载订单详情...</div>
                  <template v-else-if="orderForm">
                    <div v-for="(sub, si) in (orderForm.orderSubList || [])" :key="si" class="rounded-xl bg-gray-50 border border-gray-100 p-4">
                      <h4 class="text-sm font-bold text-gray-800 mb-3">地址信息 {{ (orderForm.orderSubList || []).length > 1 ? si + 1 : '' }}</h4>
                      <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                        <p class="text-gray-600">联系人：<span class="text-gray-800">{{ sub.customerContactsName || '-' }}</span></p>
                        <p class="text-gray-600">联系电话：<span class="text-gray-800">{{ sub.customerContactsPhone || '-' }}</span></p>
                        <p class="text-gray-600">所在地区：<span class="text-gray-800">{{ [sub.customerProvinceName, sub.customerCityName, sub.customerAreaName].filter(Boolean).join('/') || '-' }}</span></p>
                        <p class="text-gray-600">详细地址：<span class="text-gray-800">{{ sub.customerAddress || '-' }}</span></p>
                      </div>

                      <!-- 产品选择（复选框） -->
                      <template v-if="(sub.orderSubDetailList || []).length > 0">
                        <h4 class="text-sm font-bold text-gray-800 mt-4 mb-2">产品信息（请勾选需要报修的产品）</h4>
                        <label
                          v-for="(item, ii) in sub.orderSubDetailList"
                          :key="item.id || ii"
                          class="flex items-start gap-3 p-3 mt-2 rounded-lg border cursor-pointer transition-colors"
                          :class="orderCheckList.includes(item.id) ? 'border-[#FFEB69] bg-[#FFEB69]/5' : 'border-gray-200 bg-white hover:border-gray-300'"
                        >
                          <input type="checkbox" :value="item.id" v-model="orderCheckList" class="mt-0.5 accent-[#FFEB69]" />
                          <div class="grid grid-cols-2 gap-1 text-xs flex-1">
                            <span class="text-gray-600">产品名称：<span class="text-gray-800">{{ item.productName || '-' }}</span></span>
                            <span class="text-gray-600">品牌：<span class="text-gray-800">{{ item.brand || '-' }}</span></span>
                            <span class="text-gray-600">型号：<span class="text-gray-800">{{ item.model || '-' }}</span></span>
                            <span class="text-gray-600">数量：<span class="text-gray-800">{{ item.quantity }}</span></span>
                          </div>
                        </label>
                      </template>
                    </div>
                  </template>
                </template>
              </template>

              <div class="border-t border-gray-100 pt-6 space-y-6">
                <div class="flex items-center gap-4">
                  <label class="text-sm font-medium text-gray-700 w-24">报修类型: <span class="text-red-400">*</span></label>
                  <div class="flex items-center gap-6">
                    <label class="flex items-center gap-2 cursor-pointer group">
                      <div class="w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors"
                           :class="newReport.reportType === 'normal' ? 'border-[#FFEB69]' : 'border-gray-300 group-hover:border-gray-400'">
                        <div v-if="newReport.reportType === 'normal'" class="w-2 h-2 rounded-full bg-[#FFEB69]"></div>
                      </div>
                      <span class="text-gray-600 font-medium" :class="newReport.reportType === 'normal' && 'text-[#3A341C]'">普通</span>
                      <input type="radio" value="normal" v-model="newReport.reportType" class="hidden" />
                    </label>
                    <label class="flex items-center gap-2 cursor-pointer group">
                      <div class="w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors"
                           :class="newReport.reportType === 'urgent' ? 'border-[#FFEB69]' : 'border-gray-300 group-hover:border-gray-400'">
                        <div v-if="newReport.reportType === 'urgent'" class="w-2 h-2 rounded-full bg-[#FFEB69]"></div>
                      </div>
                      <span class="text-gray-600 font-medium" :class="newReport.reportType === 'urgent' && 'text-[#3A341C]'">紧急</span>
                      <input type="radio" value="urgent" v-model="newReport.reportType" class="hidden" />
                    </label>
                  </div>
                </div>

                <div class="flex items-center gap-4">
                  <label class="text-sm font-medium text-gray-700 w-24">上门时间: <span class="text-red-400">*</span></label>
                  <div class="flex-1 max-w-xs">
                    <div class="relative">
                      <input
                        ref="visitTimePickerRef"
                        v-model="newReport.visitTime"
                        type="datetime-local"
                        tabindex="-1"
                        aria-hidden="true"
                        class="absolute m-0 h-px w-px overflow-hidden border-0 p-0 opacity-0"
                      />
                      <Clock :size="16" class="pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        readonly
                        :value="formatDateTimeSlashForDisplay(newReport.visitTime)"
                        placeholder="yyyy/mm/dd --:--"
                        class="w-full cursor-pointer rounded-lg border border-gray-200 bg-white py-2 pl-10 pr-4 text-gray-700 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#FFEB69] transition-all"
                        @click="openVisitTimePicker"
                      />
                    </div>
                  </div>
                </div>

                <div class="flex items-start gap-4">
                  <label class="text-sm font-medium text-gray-700 w-24 pt-2">报修原因: <span class="text-red-400">*</span></label>
                  <textarea 
                    v-model="newReport.reason"
                    placeholder="请输入报修原因..."
                    class="flex-1 h-32 px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#FFEB69] focus:border-transparent transition-all resize-none"
                  ></textarea>
                </div>

                <div class="flex items-start gap-4">
                  <label class="text-sm font-medium text-gray-700 w-24 pt-2">上传图片或视频:</label>
                  <div class="flex-1 flex flex-col gap-3">
                    <div class="flex items-center gap-3">
                      <label class="px-4 py-2 bg-[#FFEB69] hover:bg-[#f5e05a] text-[#3A341C] text-sm font-medium rounded-lg cursor-pointer transition-colors shadow-sm" :class="{ 'opacity-50 cursor-not-allowed': newReport.files.length >= 5 || uploadingFiles }">
                        {{ uploadingFiles ? '上传中...' : '选取文件' }}
                        <input type="file" @change="handleFileChange" class="hidden" accept="image/*,video/*" multiple :disabled="newReport.files.length >= 5 || uploadingFiles" />
                      </label>
                      <span class="text-sm text-gray-500">最多上传5个文件 ({{ newReport.files.length }}/5)</span>
                    </div>
                    <div v-if="newReport.files.length > 0" class="flex flex-wrap gap-2 mt-2">
                      <div v-for="(url, index) in newReport.files" :key="index" class="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 max-w-[260px]">
                        <span class="text-sm text-blue-600 truncate flex-1" :title="url">{{ getFileNameFromUrl(url) }}</span>
                        <button @click="removeFile(index)" class="text-gray-400 hover:text-red-500 transition-colors flex-shrink-0">
                          <X :size="14" />
                        </button>
                      </div>
                    </div>
                    <span class="text-sm text-gray-400" v-else>未选择任何文件</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
              <button
                @click="closeAddModal"
                class="px-6 py-2.5 font-medium rounded-xl border border-gray-200 bg-white text-gray-600 hover:bg-gray-100 transition-colors"
              >取消</button>
              <button 
                @click="submitReport"
                :disabled="!isFormValid || submitLoading"
                :class="[
                  'px-8 py-2.5 font-bold rounded-xl shadow-sm transition-colors',
                  isFormValid && !submitLoading
                    ? 'bg-[#FFEB69] hover:bg-[#f5e05a] text-[#3A341C]' 
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                ]"
              >
                {{ submitLoading ? '提交中...' : '确认' }}
              </button>
            </div>
          </template>

          <!-- 成功页面 -->
          <template v-else>
            <div class="flex-1 flex flex-col items-center justify-center p-12 min-h-[400px]">
              <img :src="checkMarkImg" alt="" class="mb-6 h-36 w-56 object-contain" />
              <h2 class="text-3xl font-bold text-gray-800 mb-4 tracking-tight">已完成提交</h2>
              <p class="text-gray-500 mb-12">维保报修工单已成功创建</p>
              <button 
                @click="closeAddModal"
                class="px-8 py-3 bg-white hover:bg-gray-50 text-[#3A341C] font-bold rounded-xl transition-colors border border-gray-200 shadow-sm"
              >
                返回上级页面
              </button>
            </div>
          </template>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
/* 项目下拉：焦点与选中项尽量使用 #FFEB69（原生 select 各浏览器表现略有差异） */
.add-report-project-select {
  accent-color: #ffeb69;
}
.add-report-project-select option:checked,
.add-report-project-select option:hover {
  background-color: #ffeb69;
  color: #3a341c;
}
</style>
