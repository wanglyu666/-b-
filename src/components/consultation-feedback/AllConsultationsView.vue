<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue';
import { ArrowLeft, Search, ChevronLeft, ChevronRight, X, Download } from 'lucide-vue-next';
import {
  CONSULTATION_STATUSES,
  type ConsultationSheetStatus,
  type ConsultationRecord,
  type ConsultationInquiryMessage,
  consultationsInStatus,
  findConsultationById,
  inquiryMessagesFor,
} from '../../data/consultations';
import { truncateWithEllipsis } from '../../utils/string';
import AfterSalesSuccess from '../engineering/AfterSalesSuccess.vue';

const REQUIREMENT_MAX_LEN = 50;
/** 询价卡片「交流内容」展示上限（超出用 …） */
const INQUIRY_CONTENT_MAX = 50;

const props = defineProps<{
  initialStatus?: ConsultationSheetStatus;
  /** 进入页面后自动打开该 id 的详情弹窗（如从首页咨询单卡片跳入） */
  initialOpenConsultationId?: string | null;
}>();

const emit = defineEmits<{
  back: [];
  'opened-initial-consultation': [];
}>();

const statuses = CONSULTATION_STATUSES;
const activeStatus = ref<ConsultationSheetStatus>(props.initialStatus ?? '待回复');
const searchQuery = ref('');

watch(
  () => props.initialStatus,
  (s) => {
    if (s) activeStatus.value = s;
  },
);

const currentPage = ref(1);
const itemsPerPage = 9;

const filteredList = computed(() => {
  let list = consultationsInStatus(activeStatus.value);
  const q = searchQuery.value.trim().toLowerCase();
  if (q) {
    list = list.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.no.toLowerCase().includes(q) ||
        c.contact.toLowerCase().includes(q) ||
        c.requirement.toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q) ||
        c.contactPhone.includes(q),
    );
  }
  return list;
});

const totalPages = computed(() => Math.ceil(filteredList.value.length / itemsPerPage) || 1);

const paginatedItems = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  return filteredList.value.slice(start, start + itemsPerPage);
});

watch([activeStatus, searchQuery], () => {
  currentPage.value = 1;
});

function requirementPreview(text: string) {
  return truncateWithEllipsis(text, REQUIREMENT_MAX_LEN);
}

/** 咨询单详情弹窗（风格对齐工程项目「施工报告」玻璃态弹窗） */
const selectedConsultation = ref<ConsultationRecord | null>(null);
const detailTab = ref<'basic' | 'product' | 'quote'>('basic');

const detailTabs = [
  { id: 'basic' as const, label: '基本信息' },
  { id: 'product' as const, label: '产品信息' },
  { id: 'quote' as const, label: '询价' },
];

/** 仅「购物车咨询」单含 cartLineItems 时展示「产品信息」Tab */
const visibleDetailTabs = computed(() => {
  const c = selectedConsultation.value;
  if (c?.cartLineItems?.length) return detailTabs;
  return detailTabs.filter((t) => t.id !== 'product');
});

/** 询价 Tab 内：是否显示「短交流」流程（表单 / 成功页与卡片列表互斥） */
const shortExchangeFormOpen = ref(false);
/** 短交流表单提交后的成功页 */
const shortExchangeSubmitSuccess = ref(false);
const shortExchangeContent = ref('');
const shortExchangeFileInputRef = ref<HTMLInputElement | null>(null);
const shortExchangeFileName = ref('');

/** 短交流提交后追加到询价卡片的记录（按咨询单 id，会话内保留） */
const localInquiryMessagesByConsultationId = ref<Record<string, ConsultationInquiryMessage[]>>({});

/** 会话内「确认报价」点击状态（按咨询单 id） */
const quoteConfirmedByConsultationId = ref<Record<string, boolean>>({});

const showConfirmQuoteButton = computed(() => {
  const c = selectedConsultation.value;
  if (!c) return false;
  return c.status === '进行中' && c.needQuote === '是';
});

const quoteConfirmedForSelected = computed(() => {
  const id = selectedConsultation.value?.id;
  if (!id) return false;
  return !!quoteConfirmedByConsultationId.value[id];
});

function onConfirmQuote() {
  const id = selectedConsultation.value?.id;
  if (!id || quoteConfirmedForSelected.value) return;
  quoteConfirmedByConsultationId.value = { ...quoteConfirmedByConsultationId.value, [id]: true };
}

function formatInquirySentAt(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

const inquiryMessages = computed((): ConsultationInquiryMessage[] => {
  const c = selectedConsultation.value;
  if (!c) return [];
  const base = inquiryMessagesFor(c.id);
  const extra = localInquiryMessagesByConsultationId.value[c.id] ?? [];
  return [...base, ...extra];
});

watch(detailTab, (t) => {
  if (t !== 'quote') {
    shortExchangeFormOpen.value = false;
    shortExchangeSubmitSuccess.value = false;
  }
});

watch(
  () => selectedConsultation.value,
  (c) => {
    if (detailTab.value === 'product' && !c?.cartLineItems?.length) {
      detailTab.value = 'basic';
    }
  },
);

function inquiryContentPreview(text: string) {
  return truncateWithEllipsis(text, INQUIRY_CONTENT_MAX);
}

function downloadInquiryAttachment(msg: ConsultationInquiryMessage) {
  const name = msg.attachmentFileName?.trim();
  if (!name) return;
  const blob = new Blob([`【演示】${name}\n\n实际接入后端后此处为真实文件流。`], {
    type: 'text/plain;charset=utf-8',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name.endsWith('.txt') ? name : `${name}.txt`;
  a.click();
  URL.revokeObjectURL(url);
}

function resetShortExchangeDraft() {
  shortExchangeSubmitSuccess.value = false;
  shortExchangeContent.value = '';
  shortExchangeFileName.value = '';
  const input = shortExchangeFileInputRef.value;
  if (input) input.value = '';
}

function openConsultationDetail(item: ConsultationRecord) {
  selectedConsultation.value = item;
  detailTab.value = 'basic';
  shortExchangeFormOpen.value = false;
  resetShortExchangeDraft();
}

watch(
  () => props.initialOpenConsultationId,
  async (id) => {
    if (!id) return;
    await nextTick();
    const record = findConsultationById(id);
    if (!record) {
      emit('opened-initial-consultation');
      return;
    }
    activeStatus.value = record.status;
    await nextTick();
    const list = consultationsInStatus(record.status);
    const idx = list.findIndex((c) => c.id === id);
    if (idx >= 0) {
      currentPage.value = Math.floor(idx / itemsPerPage) + 1;
    }
    openConsultationDetail(record);
    emit('opened-initial-consultation');
  },
  { immediate: true },
);

function closeConsultationDetail() {
  shortExchangeFormOpen.value = false;
  resetShortExchangeDraft();
  selectedConsultation.value = null;
}

function openShortExchangeForm() {
  shortExchangeFormOpen.value = true;
  shortExchangeSubmitSuccess.value = false;
}

function closeShortExchangeForm() {
  shortExchangeFormOpen.value = false;
  resetShortExchangeDraft();
}

function submitShortExchange() {
  const text = shortExchangeContent.value.trim();
  if (!text) return;
  const c = selectedConsultation.value;
  if (!c) return;

  const msg: ConsultationInquiryMessage = {
    id: `sx-${c.id}-${Date.now()}`,
    senderName: c.contact?.trim() || '我',
    sentAt: formatInquirySentAt(new Date()),
    content: text,
    attachmentFileName: shortExchangeFileName.value.trim() || undefined,
  };

  const id = c.id;
  const prev = localInquiryMessagesByConsultationId.value[id] ?? [];
  localInquiryMessagesByConsultationId.value = {
    ...localInquiryMessagesByConsultationId.value,
    [id]: [...prev, msg],
  };

  shortExchangeSubmitSuccess.value = true;
}

/** 成功页「返回上级页面」与顶部返回：回到询价卡片列表 */
function onShortExchangeSuccessReturn() {
  closeShortExchangeForm();
}

/** 顶部「返回」（仅短交流二级流程显示）：退回询价列表或关闭成功页 */
function onConsultationDetailBack() {
  if (shortExchangeFormOpen.value) {
    closeShortExchangeForm();
    return;
  }
  closeConsultationDetail();
}

function triggerShortExchangeFilePick() {
  shortExchangeFileInputRef.value?.click();
}

function onShortExchangeFileChange(e: Event) {
  const input = e.target as HTMLInputElement;
  const file = input.files?.[0];
  shortExchangeFileName.value = file?.name ?? '';
}

/** 三个 Tab 共用固定弹窗高度（以基本信息内容为基准），仅内容区滚动 */
function selectDetailTab(tab: 'basic' | 'product' | 'quote') {
  if (detailTab.value === tab) return;
  detailTab.value = tab;
}

function formatConsultationField(s: string | undefined) {
  return s?.trim() ? s.trim() : '—';
}

function durationDaysDisplay(c: ConsultationRecord) {
  if (c.durationDays == null || Number.isNaN(c.durationDays)) return '—';
  return String(c.durationDays);
}
</script>

<template>
  <div class="min-h-screen bg-transparent relative overflow-x-hidden">
    <div class="relative z-10 p-8 max-w-[1600px] mx-auto animate-in fade-in duration-500">
      <header class="flex justify-between items-center flex-shrink-0 gap-4 flex-wrap">
        <div class="flex items-center space-x-4 min-w-0">
          <button
            type="button"
            @click="emit('back')"
            class="p-2 shrink-0 bg-white/50 backdrop-blur-md rounded-xl border border-white/20 hover:bg-white/80 transition-all active:scale-95"
            aria-label="返回"
          >
            <ArrowLeft :size="20" class="text-gray-600" />
          </button>
          <div class="min-w-0">
            <h1 class="text-3xl font-bold text-gray-800">全部咨询</h1>
            <p class="text-gray-500 mt-1">查看与筛选当前状态下的所有咨询单</p>
          </div>
        </div>

        <div class="relative shrink-0 w-full sm:w-auto">
          <Search :size="18" class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input
            v-model="searchQuery"
            type="search"
            placeholder="全局搜索咨询..."
            class="pl-10 pr-4 py-2 w-full sm:w-64 bg-white/50 backdrop-blur-md border border-white/20 rounded-xl transition-all focus:outline-none focus:ring-0 focus:border-white/20 focus-visible:ring-0"
          />
        </div>
      </header>

      <div class="mt-8 md:mt-12 flex space-x-3 overflow-x-auto pb-2 scrollbar-hide mb-6">
        <button
          v-for="status in statuses"
          :key="status"
          type="button"
          @click="
            activeStatus = status;
            searchQuery = '';
          "
          :class="[
            'px-6 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all shadow-sm border',
            activeStatus === status && !searchQuery.trim()
              ? 'bg-[#9FE870] text-[#163300] border-[#9FE870]/40'
              : 'bg-white/45 text-[#163300]/85 border-white/35 backdrop-blur-md hover:bg-white/55',
          ]"
        >
          {{ status }}
        </button>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <button
          v-for="item in paginatedItems"
          :key="item.id"
          type="button"
          class="flex h-[220px] w-full shrink-0 flex-col overflow-hidden rounded-2xl border border-gray-100 bg-gray-50/90 p-5 text-left shadow-sm ring-1 ring-gray-100/80 transition-all hover:border-[#9FE870]/50 hover:bg-white hover:shadow-md"
          @click="openConsultationDetail(item)"
        >
          <h3 class="mb-4 line-clamp-2 shrink-0 text-base font-bold leading-snug text-gray-900">
            {{ item.title }}
          </h3>
          <div class="mb-4 shrink-0">
            <p class="text-[10px] font-bold uppercase tracking-wider text-gray-400">咨询时间</p>
            <p class="mt-1.5 font-mono text-sm font-semibold tabular-nums text-gray-800">
              {{ item.time }}
            </p>
          </div>
          <div class="flex min-h-0 flex-1 flex-col overflow-hidden">
            <p class="shrink-0 text-[10px] font-bold uppercase tracking-wider text-gray-400">
              需求
            </p>
            <p
              class="mt-2 min-h-0 flex-1 text-left text-sm leading-[1.75] text-gray-600"
              :title="item.requirement.length > REQUIREMENT_MAX_LEN ? item.requirement : undefined"
            >
              {{ requirementPreview(item.requirement) }}
            </p>
          </div>
        </button>

        <div
          v-if="paginatedItems.length === 0"
          class="col-span-full py-20 flex flex-col items-center justify-center text-gray-500 bg-white/30 backdrop-blur-md rounded-3xl border border-dashed border-white/40"
        >
          <p class="text-lg font-medium text-gray-600">
            {{ searchQuery.trim() ? '没有找到匹配的咨询单' : '该状态下暂无咨询单' }}
          </p>
        </div>
      </div>

      <div v-if="totalPages > 1" class="flex justify-center items-center space-x-4 mt-12 pb-8">
        <button
          type="button"
          @click="currentPage > 1 && currentPage--"
          :disabled="currentPage === 1"
          class="p-2 rounded-full bg-white border border-gray-200 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
        >
          <ChevronLeft :size="20" />
        </button>

        <div class="flex items-center space-x-2">
          <button
            v-for="page in totalPages"
            :key="page"
            type="button"
            @click="currentPage = page"
            :class="[
              'w-10 h-10 rounded-full text-sm font-bold transition-all',
              currentPage === page
                ? 'bg-[#FFE600] text-[#260A2F] shadow-sm'
                : 'bg-white text-gray-500 border border-gray-100 hover:border-gray-300',
            ]"
          >
            {{ page }}
          </button>
        </div>

        <button
          type="button"
          @click="currentPage < totalPages && currentPage++"
          :disabled="currentPage === totalPages"
          class="p-2 rounded-full bg-white border border-gray-200 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
        >
          <ChevronRight :size="20" />
        </button>
      </div>
    </div>

    <!-- 咨询单详情（玻璃态弹窗；产品信息 Tab 仅购物车来源咨询单显示） -->
    <Teleport to="body">
      <div
        v-if="selectedConsultation"
        class="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/40 backdrop-blur-md animate-in fade-in duration-300"
        role="dialog"
        aria-modal="true"
        aria-labelledby="consultation-detail-title"
        @click.self="closeConsultationDetail"
      >
        <div
          class="flex h-[min(88vh,860px)] w-full max-w-5xl flex-col overflow-hidden rounded-[40px] border border-white/20 bg-white/10 shadow-2xl backdrop-blur-2xl"
          @click.stop
        >
          <div class="flex flex-shrink-0 items-center justify-between border-b border-white/10 px-6 py-6 sm:px-10 sm:py-7">
            <div class="flex min-w-0 items-center gap-3">
              <div
                class="h-6 w-1.5 shrink-0 rounded-full bg-[#FFE600] shadow-[0_0_15px_rgba(255,230,0,0.5)]"
              />
              <div class="min-w-0">
                <h2
                  id="consultation-detail-title"
                  class="truncate text-lg font-bold tracking-tight text-white sm:text-2xl"
                >
                  {{ selectedConsultation.title }}
                </h2>
                <p class="mt-1 font-mono text-xs text-white/50 sm:text-sm">
                  {{ selectedConsultation.no }}
                </p>
              </div>
            </div>
            <div class="flex shrink-0 items-center gap-2 sm:gap-4">
              <button
                v-if="shortExchangeFormOpen"
                type="button"
                class="text-sm font-bold text-white/60 transition-colors hover:text-white"
                @click="onConsultationDetailBack"
              >
                返回
              </button>
              <button
                type="button"
                class="rounded-full p-2 text-white/70 transition-all hover:bg-white/10 hover:text-white"
                aria-label="关闭"
                @click="closeConsultationDetail"
              >
                <X :size="22" />
              </button>
            </div>
          </div>

          <div
            v-if="!shortExchangeFormOpen"
            class="flex flex-shrink-0 flex-wrap items-center gap-3 px-6 pb-5 pt-1 sm:px-10 sm:pb-6 sm:pt-2"
          >
            <div class="flex min-w-0 flex-1 flex-wrap gap-3">
              <button
                v-for="tab in visibleDetailTabs"
                :key="tab.id"
                type="button"
                class="rounded-full border px-6 py-2 text-sm font-bold transition-all duration-300 sm:px-8"
                :class="
                  detailTab === tab.id
                    ? 'border-[#FFE600] bg-[#FFE600] text-[#260A2F] shadow-[0_0_15px_rgba(255,230,0,0.3)]'
                    : 'border-white/10 bg-white/5 text-gray-400 hover:border-white/20 hover:bg-white/10'
                "
                @click="selectDetailTab(tab.id)"
              >
                {{ tab.label }}
              </button>
            </div>
            <div
              v-if="detailTab === 'quote'"
              class="relative shrink-0 sm:ml-auto"
            >
              <button
                type="button"
                class="rounded-full border border-[#FFE600]/45 bg-[#FFE600]/12 px-3.5 py-1.5 text-xs font-bold text-[#FFE600] shadow-[0_0_14px_rgba(255,230,0,0.18)] transition-all hover:border-[#FFE600]/70 hover:bg-[#FFE600]/20"
                @click.stop="openShortExchangeForm"
              >
                短交流
              </button>
            </div>
          </div>

          <div
            class="custom-scrollbar min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-6 py-8 sm:px-10 sm:py-10"
          >
            <Transition name="detail-tab" mode="out-in">
              <div v-if="detailTab === 'basic'" key="detail-basic" class="space-y-8">
              <!-- 与工单详情一致：半透明玻璃卡片 -->
              <div
                class="overflow-hidden rounded-2xl border border-white/10 bg-white/5 shadow-none backdrop-blur-xl"
              >
                <div class="overflow-x-auto">
                  <table class="w-full min-w-[560px] border-collapse text-left text-sm">
                    <tbody>
                      <tr class="border-b border-white/10">
                        <th
                          class="w-[18%] min-w-[7rem] whitespace-nowrap bg-white/[0.06] px-4 py-3.5 font-medium text-white/55 sm:py-4"
                          scope="row"
                        >
                          期望勘查时间
                        </th>
                        <td
                          class="w-[32%] border-r border-white/10 px-4 py-3.5 tabular-nums text-white sm:py-4"
                        >
                          {{ formatConsultationField(selectedConsultation.surveyDate) }}
                        </td>
                        <th
                          class="w-[18%] min-w-[7rem] whitespace-nowrap bg-white/[0.06] px-4 py-3.5 font-medium text-white/55 sm:py-4"
                          scope="row"
                        >
                          期望服务开始时间
                        </th>
                        <td class="px-4 py-3.5 tabular-nums text-white sm:py-4">
                          {{ formatConsultationField(selectedConsultation.serviceStartDate) }}
                        </td>
                      </tr>
                      <tr class="border-b border-white/10">
                        <th class="bg-white/[0.06] px-4 py-3.5 font-medium text-white/55 sm:py-4" scope="row">
                          工期
                        </th>
                        <td class="border-r border-white/10 px-4 py-3.5 text-white sm:py-4">
                          <template v-if="durationDaysDisplay(selectedConsultation) !== '—'">
                            {{ durationDaysDisplay(selectedConsultation) }} 天
                          </template>
                          <template v-else>—</template>
                        </td>
                        <th class="bg-white/[0.06] px-4 py-3.5 font-medium text-white/55 sm:py-4" scope="row">
                          报价
                        </th>
                        <td class="px-4 py-3.5 text-white sm:py-4">
                          {{ selectedConsultation.quoteStatus?.trim() || '暂无报价' }}
                        </td>
                      </tr>
                      <tr class="border-b border-white/10">
                        <th
                          class="align-top bg-white/[0.06] px-4 py-3.5 font-medium text-white/55 sm:py-4"
                          scope="row"
                        >
                          服务地址
                        </th>
                        <td class="px-4 py-3.5 leading-relaxed text-white/90" colspan="3">
                          {{ formatConsultationField(selectedConsultation.serviceAddress) }}
                        </td>
                      </tr>
                      <tr class="border-b border-white/10">
                        <th
                          class="align-top bg-white/[0.06] px-4 py-3.5 font-medium text-white/55 sm:py-4"
                          scope="row"
                        >
                          需求
                        </th>
                        <td class="px-4 py-3.5 leading-relaxed text-white/85" colspan="3">
                          {{ selectedConsultation.requirement }}
                        </td>
                      </tr>
                      <tr>
                        <th
                          class="align-top bg-white/[0.06] px-4 py-3.5 font-medium text-white/55 sm:py-4"
                          scope="row"
                        >
                          相关资料
                        </th>
                        <td class="px-4 py-3.5 leading-relaxed text-white/85" colspan="3">
                          {{ selectedConsultation.relatedMaterials?.trim() || '暂无上传' }}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div
                class="overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl"
              >
                <div
                  class="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 bg-white/[0.06] px-4 py-3.5 sm:px-5 sm:py-4"
                >
                  <span class="text-sm font-semibold text-white">报价时间的确认</span>
                  <button
                    v-if="showConfirmQuoteButton"
                    type="button"
                    class="shrink-0 rounded-full border border-[#FFE600]/45 bg-[#FFE600]/12 px-3.5 py-1.5 text-xs font-bold text-[#FFE600] shadow-[0_0_14px_rgba(255,230,0,0.18)] transition-all hover:border-[#FFE600]/70 hover:bg-[#FFE600]/20 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:border-[#FFE600]/45 disabled:hover:bg-[#FFE600]/12"
                    :disabled="quoteConfirmedForSelected"
                    @click="onConfirmQuote"
                  >
                    {{ quoteConfirmedForSelected ? '已确认' : '确认报价' }}
                  </button>
                </div>
                <div class="overflow-x-auto">
                  <table class="w-full min-w-[560px] border-collapse text-sm">
                    <tbody>
                      <tr>
                        <th
                          class="w-[18%] min-w-[7rem] whitespace-nowrap bg-white/[0.06] px-4 py-3.5 font-medium text-white/55 sm:py-4"
                          scope="row"
                        >
                          是否需要报价
                        </th>
                        <td
                          class="w-[32%] border-r border-white/10 px-4 py-3.5 text-white sm:py-4"
                        >
                          {{ selectedConsultation.needQuote ?? '—' }}
                        </td>
                        <th
                          class="w-[18%] min-w-[7rem] whitespace-nowrap bg-white/[0.06] px-4 py-3.5 font-medium text-white/55 sm:py-4"
                          scope="row"
                        >
                          报价时间
                        </th>
                        <td class="px-4 py-3.5 tabular-nums text-white sm:py-4">
                          {{ formatConsultationField(selectedConsultation.quoteTime) }}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div
              v-else-if="detailTab === 'product' && selectedConsultation.cartLineItems?.length"
              key="detail-product"
              class="space-y-6 text-white/90"
            >
              <p class="text-xs text-white/50">
                以下为您在购物车页提交咨询时，购物车内所包含的商品。
              </p>
              <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <article
                  v-for="line in selectedConsultation.cartLineItems"
                  :key="line.id"
                  class="flex min-h-0 flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-4 shadow-sm backdrop-blur-xl"
                >
                  <div class="aspect-square w-full overflow-hidden rounded-xl bg-white/5">
                    <img
                      :src="line.image"
                      :alt="line.name"
                      class="h-full w-full object-cover mix-blend-multiply opacity-95"
                      referrerpolicy="no-referrer"
                    />
                  </div>
                  <div class="mt-3 min-w-0">
                    <p class="truncate text-sm font-semibold text-white" :title="line.name">{{ line.name }}</p>
                    <p class="mt-1 text-[10px] text-white/45">{{ line.category }} / 标准规格</p>
                    <div class="mt-2 flex items-end justify-between gap-2">
                      <span class="font-mono text-sm font-bold tabular-nums text-[#FFE600]">
                        ¥{{ line.price.toFixed(2) }}
                      </span>
                      <span class="text-xs text-white/55">× {{ line.quantity }}</span>
                    </div>
                  </div>
                </article>
              </div>
            </div>

            <div
              v-else-if="detailTab === 'quote'"
              key="detail-quote"
              class="min-h-0 flex-1 overflow-x-hidden"
            >
              <Transition name="short-exchange" mode="out-in">
                <div
                  v-if="!shortExchangeFormOpen"
                  key="inquiry-list"
                  class="space-y-4 text-white/90"
                >
                  <div v-if="inquiryMessages.length === 0" class="rounded-2xl border border-dashed border-white/15 bg-white/[0.03] py-16 text-center text-sm text-white/45">
                    暂无询价交流记录
                  </div>
                  <div
                    v-else
                    class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
                  >
                    <article
                      v-for="msg in inquiryMessages"
                      :key="msg.id"
                      class="flex min-h-0 flex-col rounded-2xl border border-white/10 bg-white/5 p-4 shadow-sm backdrop-blur-xl"
                    >
                      <div class="min-w-0 border-b border-white/10 pb-3">
                        <p class="text-[9px] font-bold uppercase tracking-wider text-white/40">发送人</p>
                        <p class="mt-1 truncate text-sm font-semibold text-white" :title="msg.senderName">
                          {{ msg.senderName }}
                        </p>
                        <p class="mt-2 text-[9px] font-bold uppercase tracking-wider text-white/40">发送时间</p>
                        <p class="mt-0.5 font-mono text-[11px] leading-snug tabular-nums text-white/75">
                          {{ msg.sentAt }}
                        </p>
                      </div>
                      <div class="mt-3 min-h-0 flex-1">
                        <p class="text-[9px] font-bold uppercase tracking-wider text-[#FFE600]/90">交流内容</p>
                        <p
                          class="mt-1.5 text-xs leading-relaxed text-white/85"
                          :title="msg.content.length > INQUIRY_CONTENT_MAX ? msg.content : undefined"
                        >
                          {{ inquiryContentPreview(msg.content) }}
                        </p>
                      </div>
                      <div class="mt-3 space-y-2 border-t border-white/10 pt-3">
                        <button
                          type="button"
                          class="inline-flex w-full items-center justify-center gap-1.5 rounded-full border border-[#FFE600]/50 bg-[#FFE600]/15 px-3 py-2 text-[11px] font-bold text-[#FFE600] transition-all hover:bg-[#FFE600]/25 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-[#FFE600]/15"
                          :disabled="!msg.attachmentFileName?.trim()"
                          :title="msg.attachmentFileName?.trim() ? `下载 ${msg.attachmentFileName}` : '无附件'"
                          @click="downloadInquiryAttachment(msg)"
                        >
                          <Download :size="13" class="shrink-0" />
                          下载附件
                        </button>
                        <p
                          v-if="msg.attachmentFileName?.trim()"
                          class="truncate text-center text-[10px] text-white/40"
                          :title="msg.attachmentFileName"
                        >
                          {{ msg.attachmentFileName }}
                        </p>
                      </div>
                    </article>
                  </div>
                </div>
                <div
                  v-else-if="shortExchangeSubmitSuccess"
                  key="short-exchange-success"
                  class="-mx-2 sm:-mx-4"
                >
                  <AfterSalesSuccess
                    title="已完成提交"
                    message="您的短交流内容已成功提交"
                    @return="onShortExchangeSuccessReturn"
                  />
                </div>
                <div
                  v-else
                  key="short-exchange-form"
                  class="flex min-h-[min(52vh,520px)] flex-col text-left text-white/90"
                >
                  <h3 class="mb-8 shrink-0 text-lg font-bold tracking-tight text-white">短交流</h3>
                  <div class="min-h-0 flex-1 space-y-8">
                    <div class="flex flex-col gap-3 sm:grid sm:grid-cols-[6.5rem_minmax(0,1fr)] sm:items-start sm:gap-6">
                      <label
                        class="shrink-0 pt-2 text-sm font-medium text-white/85 sm:text-right"
                        for="short-exchange-content"
                      >
                        <span class="text-red-400">*</span>交流内容
                      </label>
                      <textarea
                        id="short-exchange-content"
                        v-model="shortExchangeContent"
                        rows="8"
                        class="min-h-[10rem] w-full resize-y rounded-xl border border-white/15 bg-white/[0.07] px-3 py-2.5 text-sm text-white placeholder:text-white/35 focus:border-[#FFE600]/60 focus:outline-none focus:ring-2 focus:ring-[#FFE600]/25"
                        placeholder="请输入交流内容"
                      />
                    </div>
                    <div class="flex flex-col gap-3 sm:grid sm:grid-cols-[6.5rem_minmax(0,1fr)] sm:items-center sm:gap-6">
                      <span class="shrink-0 text-sm font-medium text-white/85 sm:text-right">交流附件</span>
                      <div class="flex min-w-0 flex-wrap items-center gap-3">
                        <input
                          ref="shortExchangeFileInputRef"
                          type="file"
                          class="sr-only"
                          tabindex="-1"
                          @change="onShortExchangeFileChange"
                        />
                        <button
                          type="button"
                          class="inline-flex shrink-0 items-center rounded-full border border-[#E6CF00] bg-[#FFE600] px-5 py-2 text-sm font-bold text-[#260A2F] shadow-sm transition-all hover:bg-[#fff04d]"
                          @click="triggerShortExchangeFilePick"
                        >
                          选取文件
                        </button>
                        <span
                          v-if="shortExchangeFileName"
                          class="min-w-0 truncate text-sm text-white/55"
                          :title="shortExchangeFileName"
                        >
                          {{ shortExchangeFileName }}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div class="mt-10 flex shrink-0 justify-end pt-2">
                    <button
                      type="button"
                      class="rounded-xl bg-[#FFE600] px-10 py-2.5 text-sm font-bold text-[#260A2F] shadow-[0_0_15px_rgba(255,230,0,0.25)] transition-all hover:bg-[#fff04d] disabled:cursor-not-allowed disabled:opacity-45"
                      :disabled="!shortExchangeContent.trim()"
                      @click="submitShortExchange"
                    >
                      确定
                    </button>
                  </div>
                </div>
              </Transition>
            </div>
            </Transition>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}

.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.12);
  border-radius: 10px;
}

/* 询价列表 ↔ 短交流表单：先出后进，横向轻移 + 淡入淡出 */
.short-exchange-enter-active,
.short-exchange-leave-active {
  transition:
    opacity 0.4s cubic-bezier(0.16, 1, 0.3, 1),
    transform 0.45s cubic-bezier(0.16, 1, 0.3, 1);
}
.short-exchange-enter-from {
  opacity: 0;
  transform: translateX(1.125rem);
}
.short-exchange-leave-to {
  opacity: 0;
  transform: translateX(-0.75rem);
}

/* 基本信息 / 产品信息 / 询价 Tab 内容切换 */
.detail-tab-enter-active,
.detail-tab-leave-active {
  transition:
    opacity 0.38s cubic-bezier(0.16, 1, 0.3, 1),
    transform 0.42s cubic-bezier(0.16, 1, 0.3, 1);
}
.detail-tab-enter-from {
  opacity: 0;
  transform: translateX(0.85rem);
}
.detail-tab-leave-to {
  opacity: 0;
  transform: translateX(-0.55rem);
}
</style>
