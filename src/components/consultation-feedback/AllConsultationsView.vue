<script setup lang="ts">
import { ref, computed, watch, nextTick, watchEffect } from 'vue';
import { ArrowLeft, Search, ChevronLeft, ChevronRight, X, Download } from 'lucide-vue-next';
import {
  CONSULTATION_STATUSES,
  type ConsultationSheetStatus,
  type ConsultationRecord,
  type ConsultationRelatedMaterialFile,
  type ConsultationQuoteLineItem,
  type ConsultationInquiryMessage,
  consultationsInStatus,
  findConsultationById,
  inquiryMessagesFor,
  markConsultationEnded,
} from '../../data/consultations';
import { products } from '../../data';
import type { Product } from '../../types';
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
  addToCart: [product: Product, count?: number];
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

/** 咨询单详情弹窗（风格对齐工程项目「施工报告」玻璃态弹窗；单页纵向滚动展示各区块） */
const selectedConsultation = ref<ConsultationRecord | null>(null);

/** 询价区块：是否显示「短交流」流程（表单 / 成功页与卡片列表互斥） */
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

/** 清单「加入购物车」已执行（按咨询单 id，会话内保留） */
const quoteSheetAddedToCartByConsultationId = ref<Record<string, boolean>>({});

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
  selectedConsultation.value = findConsultationById(item.id) ?? item;
  shortExchangeFormOpen.value = false;
  resetShortExchangeDraft();
}

const shortExchangeEnabled = computed(() => selectedConsultation.value?.status !== '已结束');

function endConsultation() {
  const c = selectedConsultation.value;
  if (!c || c.status === '已结束') return;
  markConsultationEnded(c.id);
  const next = findConsultationById(c.id);
  if (next) selectedConsultation.value = next;
  shortExchangeFormOpen.value = false;
  resetShortExchangeDraft();
  activeStatus.value = '已结束';
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
  if (selectedConsultation.value?.status === '已结束') return;
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
  if (!c || c.status === '已结束') return;

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

function formatQuoteNumber(n: number): string {
  return Number.isInteger(n) ? String(n) : n.toFixed(2);
}

function productForQuoteLine(line: ConsultationQuoteLineItem): Product | null {
  const id = line.productId;
  if (id == null || Number.isNaN(Number(id))) return null;
  return products.find((p) => p.id === id) ?? null;
}

const canAddQuoteLinesToCart = computed(() => {
  const lines = selectedConsultation.value?.quoteSheet?.lines;
  if (!lines?.length) return false;
  return lines.some((line) => productForQuoteLine(line) != null);
});

const quoteSheetAddedToCartForSelected = computed(() => {
  const id = selectedConsultation.value?.id;
  if (!id) return false;
  return !!quoteSheetAddedToCartByConsultationId.value[id];
});

function addQuoteSheetLinesToCart() {
  const c = selectedConsultation.value;
  const sheet = c?.quoteSheet;
  if (!c || !sheet?.lines.length) return;
  let any = false;
  for (const line of sheet.lines) {
    const product = productForQuoteLine(line);
    if (!product) continue;
    const qty = Math.max(1, Math.floor(Number(line.quantity)) || 1);
    emit('addToCart', product, qty);
    any = true;
  }
  if (any) {
    quoteSheetAddedToCartByConsultationId.value = {
      ...quoteSheetAddedToCartByConsultationId.value,
      [c.id]: true,
    };
  }
}

function formatConsultationField(s: string | undefined) {
  return s?.trim() ? s.trim() : '—';
}

function durationDaysDisplay(c: ConsultationRecord) {
  if (c.durationDays == null || Number.isNaN(c.durationDays)) return '—';
  return String(c.durationDays);
}

/** 相关资料：全屏预览当前选中的图片/视频 */
const mediaPreview = ref<ConsultationRelatedMaterialFile | null>(null);

function openMediaPreview(f: ConsultationRelatedMaterialFile) {
  mediaPreview.value = f;
}

function closeMediaPreview() {
  mediaPreview.value = null;
}

watchEffect((onCleanup) => {
  if (!mediaPreview.value) return;
  const prevOverflow = document.body.style.overflow;
  document.body.style.overflow = 'hidden';
  const onKey = (e: KeyboardEvent) => {
    if (e.key === 'Escape') closeMediaPreview();
  };
  window.addEventListener('keydown', onKey);
  onCleanup(() => {
    document.body.style.overflow = prevOverflow;
    window.removeEventListener('keydown', onKey);
  });
});
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
            class="custom-scrollbar min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-6 py-8 sm:px-10 sm:py-10"
          >
            <Transition name="short-exchange-shell" mode="out-in">
            <div
              v-if="!shortExchangeFormOpen"
              key="consultation-detail-merged"
              class="space-y-10 pb-2"
            >
              <section class="scroll-mt-6 space-y-4">
                <div class="flex items-center gap-2.5">
                  <div
                    class="h-6 w-1.5 shrink-0 rounded-full bg-[#FFE600] shadow-[0_0_12px_rgba(255,230,0,0.35)]"
                  />
                  <h3 class="text-base font-bold tracking-tight text-white sm:text-lg">基本信息</h3>
                </div>
                <div class="space-y-8">
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
                          <template
                            v-if="selectedConsultation.relatedMaterialFiles?.length"
                          >
                            <div class="flex flex-wrap gap-2">
                              <button
                                v-for="(f, idx) in selectedConsultation.relatedMaterialFiles"
                                :key="`${f.fileName}-${idx}`"
                                type="button"
                                class="inline-flex max-w-full min-w-0 items-center gap-2 rounded-lg border border-white/18 bg-white/[0.14] px-3 py-2 text-left text-sm font-medium text-white/90 shadow-sm backdrop-blur-sm transition hover:border-white/28 hover:bg-white/[0.2] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FFE600]/50"
                                @click="openMediaPreview(f)"
                              >
                                <span class="min-w-0 truncate">{{ f.fileName }}</span>
                                <X
                                  class="h-3.5 w-3.5 shrink-0 text-white/40 pointer-events-none"
                                  aria-hidden="true"
                                />
                              </button>
                            </div>
                          </template>
                          <template v-else>
                            {{ selectedConsultation.relatedMaterials?.trim() || '暂无上传' }}
                          </template>
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
              </section>

              <section
                v-if="selectedConsultation.cartLineItems?.length"
                class="scroll-mt-6 space-y-4"
              >
                <div class="flex items-center gap-2.5">
                  <div
                    class="h-6 w-1.5 shrink-0 rounded-full bg-[#FFE600] shadow-[0_0_12px_rgba(255,230,0,0.35)]"
                  />
                  <h3 class="text-base font-bold tracking-tight text-white sm:text-lg">产品信息</h3>
                </div>
                <div class="space-y-6 text-white/90">
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
              </section>

              <section class="scroll-mt-6 space-y-4">
                <div class="flex flex-wrap items-center justify-between gap-3">
                  <div class="flex items-center gap-2.5">
                    <div
                      class="h-6 w-1.5 shrink-0 rounded-full bg-[#FFE600] shadow-[0_0_12px_rgba(255,230,0,0.35)]"
                    />
                    <h3 class="text-base font-bold tracking-tight text-white sm:text-lg">询价</h3>
                  </div>
                  <button
                    v-if="shortExchangeEnabled"
                    type="button"
                    class="rounded-full border border-[#FFE600]/45 bg-[#FFE600]/12 px-3.5 py-1.5 text-xs font-bold text-[#FFE600] shadow-[0_0_14px_rgba(255,230,0,0.18)] transition-all hover:border-[#FFE600]/70 hover:bg-[#FFE600]/20"
                    @click.stop="openShortExchangeForm"
                  >
                    短交流
                  </button>
                  <span
                    v-else
                    class="rounded-full border border-white/10 bg-white/[0.06] px-3.5 py-1.5 text-xs font-medium text-white/40"
                  >
                    短交流已关闭
                  </span>
                </div>
                <div class="min-h-0 space-y-4 overflow-x-hidden text-white/90">
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
              </section>

              <section class="scroll-mt-6 space-y-4">
                <div class="flex items-center gap-2.5">
                  <div
                    class="h-6 w-1.5 shrink-0 rounded-full bg-[#FFE600] shadow-[0_0_12px_rgba(255,230,0,0.35)]"
                  />
                  <h3 class="text-base font-bold tracking-tight text-white sm:text-lg">清单</h3>
                </div>
                <div class="space-y-6 text-white/90">
              <template v-if="selectedConsultation.quoteSheet">
                <div
                  class="overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl"
                >
                  <div class="overflow-x-auto">
                    <table class="w-full min-w-[320px] border-collapse text-sm">
                      <tbody>
                        <tr class="border-b border-white/10">
                          <th
                            class="w-[18%] min-w-[5rem] whitespace-nowrap bg-white/[0.06] px-4 py-3 font-medium text-white/55"
                            scope="row"
                          >
                            报价人
                          </th>
                          <td class="border-r border-white/10 px-4 py-3 text-white">
                            {{ selectedConsultation.quoteSheet.quoter?.trim() || '—' }}
                          </td>
                          <th
                            class="w-[18%] min-w-[5rem] whitespace-nowrap bg-white/[0.06] px-4 py-3 font-medium text-white/55"
                            scope="row"
                          >
                            联系方式
                          </th>
                          <td class="px-4 py-3 text-white">
                            {{ selectedConsultation.quoteSheet.contact?.trim() || '—' }}
                          </td>
                        </tr>
                        <tr class="border-b border-white/10">
                          <th
                            class="bg-white/[0.06] px-4 py-3 font-medium text-white/55"
                            scope="row"
                          >
                            报价时间
                          </th>
                          <td class="border-r border-white/10 px-4 py-3 tabular-nums text-white" colspan="3">
                            {{ selectedConsultation.quoteSheet.quoteTime }}
                          </td>
                        </tr>
                        <tr>
                          <th
                            class="align-top bg-white/[0.06] px-4 py-3 font-medium text-white/55"
                            scope="row"
                          >
                            备注
                          </th>
                          <td class="px-4 py-3 leading-relaxed text-white/85" colspan="3">
                            {{ selectedConsultation.quoteSheet.remarks?.trim() || '—' }}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <div class="flex flex-wrap items-center justify-end gap-2 px-0.5 py-3 sm:py-4">
                  <button
                    type="button"
                    class="rounded-full border px-3.5 py-1.5 text-xs font-bold transition-all"
                    :class="
                      quoteSheetAddedToCartForSelected
                        ? 'cursor-not-allowed border-white/12 bg-white/[0.05] text-white/38 opacity-70'
                        : 'border-[#FFE600]/45 bg-[#FFE600]/12 text-[#FFE600] shadow-[0_0_14px_rgba(255,230,0,0.18)] hover:border-[#FFE600]/70 hover:bg-[#FFE600]/20 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-[#FFE600]/45 disabled:hover:bg-[#FFE600]/12'
                    "
                    :disabled="!canAddQuoteLinesToCart || quoteSheetAddedToCartForSelected"
                    :title="
                      quoteSheetAddedToCartForSelected
                        ? '已从本清单加入购物车'
                        : '将表格中已关联商店商品的行按数量加入购物车'
                    "
                    @click="addQuoteSheetLinesToCart"
                  >
                    {{ quoteSheetAddedToCartForSelected ? '已添加' : '加入购物车' }}
                  </button>
                </div>

                <div
                  class="overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl"
                >
                  <div class="overflow-x-hidden">
                    <table
                      class="w-full table-fixed border-collapse text-left text-[11px] leading-snug sm:text-xs sm:leading-normal"
                    >
                      <thead>
                        <tr class="border-b border-white/10 bg-white/[0.06]">
                          <th class="px-1.5 py-2.5 font-semibold text-white/75 sm:px-2 sm:py-3">专业</th>
                          <th class="px-1.5 py-2.5 font-semibold text-white/75 sm:px-2 sm:py-3">科目编号</th>
                          <th class="px-1.5 py-2.5 font-semibold text-white/75 sm:px-2 sm:py-3">科目名称</th>
                          <th class="px-1.5 py-2.5 font-semibold text-white/75 sm:px-2 sm:py-3">品牌</th>
                          <th class="px-1.5 py-2.5 font-semibold text-white/75 sm:px-2 sm:py-3">系列/型号</th>
                          <th class="px-1.5 py-2.5 font-semibold text-white/75 sm:px-2 sm:py-3">数量</th>
                          <th class="px-1.5 py-2.5 font-semibold text-white/75 sm:px-2 sm:py-3">材料费</th>
                          <th class="px-1.5 py-2.5 font-semibold text-white/75 sm:px-2 sm:py-3">安装费</th>
                          <th class="px-1.5 py-2.5 font-semibold text-white/75 sm:px-2 sm:py-3">综合单价</th>
                          <th class="px-1.5 py-2.5 font-semibold text-white/75 sm:px-2 sm:py-3">总价</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr
                          v-for="(row, ri) in selectedConsultation.quoteSheet.lines"
                          :key="ri"
                          class="border-b border-white/10 last:border-b-0"
                        >
                          <td class="break-words px-1.5 py-2.5 text-white sm:px-2 sm:py-3">{{ row.specialty }}</td>
                          <td class="break-words px-1.5 py-2.5 tabular-nums text-white sm:px-2 sm:py-3">
                            {{ row.itemCode }}
                          </td>
                          <td class="break-words px-1.5 py-2.5 text-white sm:px-2 sm:py-3">{{ row.itemName }}</td>
                          <td class="break-words px-1.5 py-2.5 text-white sm:px-2 sm:py-3">{{ row.brand }}</td>
                          <td class="break-words px-1.5 py-2.5 text-white sm:px-2 sm:py-3">{{ row.seriesModel }}</td>
                          <td class="break-words px-1.5 py-2.5 tabular-nums text-white sm:px-2 sm:py-3">
                            {{ formatQuoteNumber(row.quantity) }}
                          </td>
                          <td class="break-words px-1.5 py-2.5 tabular-nums text-white sm:px-2 sm:py-3">
                            {{ formatQuoteNumber(row.materialCost) }}
                          </td>
                          <td class="break-words px-1.5 py-2.5 tabular-nums text-white sm:px-2 sm:py-3">
                            {{ formatQuoteNumber(row.installFee) }}
                          </td>
                          <td class="break-words px-1.5 py-2.5 tabular-nums text-white sm:px-2 sm:py-3">
                            {{ formatQuoteNumber(row.unitPrice) }}
                          </td>
                          <td class="break-words px-1.5 py-2.5 tabular-nums text-white sm:px-2 sm:py-3">
                            {{ formatQuoteNumber(row.totalPrice) }}
                          </td>
                        </tr>
                        <tr
                          v-for="(s, si) in selectedConsultation.quoteSheet.summary"
                          :key="`summary-${si}`"
                          :class="[
                            'border-b border-white/10 bg-white/[0.04]',
                            si === 0 ? 'border-t border-white/15' : '',
                          ]"
                        >
                          <th
                            class="bg-white/[0.06] px-3 py-3 font-medium text-white/55"
                            scope="row"
                            colspan="2"
                          >
                            专业
                          </th>
                          <td class="border-r border-white/10 px-3 py-3 text-white" colspan="3">
                            {{ s.specialty }}
                          </td>
                          <th
                            class="bg-white/[0.06] px-3 py-3 font-medium text-white/55"
                            scope="row"
                            colspan="2"
                          >
                            价格
                          </th>
                          <td class="px-3 py-3 tabular-nums text-white" colspan="3">
                            {{ formatQuoteNumber(s.price) }}
                          </td>
                        </tr>
                        <tr
                          :class="[
                            'border-b border-white/10',
                            !selectedConsultation.quoteSheet.summary?.length
                              ? 'border-t border-white/15'
                              : '',
                          ]"
                        >
                          <th
                            class="w-1/2 bg-white/[0.06] px-3 py-3 font-medium text-white/55"
                            scope="row"
                            colspan="2"
                          >
                            税率%
                          </th>
                          <td class="border-r border-white/10 px-3 py-3 tabular-nums text-white" colspan="3">
                            {{ formatQuoteNumber(selectedConsultation.quoteSheet.taxRatePercent) }}
                          </td>
                          <th
                            class="w-1/2 bg-white/[0.06] px-3 py-3 font-medium text-white/55"
                            scope="row"
                            colspan="2"
                          >
                            税金
                          </th>
                          <td class="px-3 py-3 tabular-nums text-white" colspan="3">
                            {{ formatQuoteNumber(selectedConsultation.quoteSheet.taxAmount) }}
                          </td>
                        </tr>
                        <tr>
                          <th class="bg-white/[0.06] px-3 py-3 font-medium text-white/55" scope="row" colspan="2">
                            合计价格
                          </th>
                          <td class="border-r border-white/10 px-3 py-3 tabular-nums text-white" colspan="3">
                            {{ formatQuoteNumber(selectedConsultation.quoteSheet.subtotalExclTax) }}
                          </td>
                          <th class="bg-white/[0.06] px-3 py-3 font-medium text-white/55" scope="row" colspan="2">
                            含税价格
                          </th>
                          <td class="px-3 py-3 tabular-nums text-[#FFE600]" colspan="3">
                            {{ formatQuoteNumber(selectedConsultation.quoteSheet.totalInclTax) }}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <div class="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl sm:p-5">
                  <p class="text-base font-bold text-white">附件</p>
                  <div
                    v-if="selectedConsultation.quoteSheet.attachmentFiles?.length"
                    class="mt-3 flex flex-wrap gap-2"
                  >
                    <button
                      v-for="(f, ai) in selectedConsultation.quoteSheet.attachmentFiles"
                      :key="`${f.fileName}-${ai}`"
                      type="button"
                      class="inline-flex max-w-full min-w-0 items-center gap-2 rounded-lg border border-white/18 bg-white/[0.14] px-3 py-2 text-left text-sm font-medium text-white/90 shadow-sm backdrop-blur-sm transition hover:border-white/28 hover:bg-white/[0.2] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FFE600]/50"
                      @click="openMediaPreview(f)"
                    >
                      <span class="min-w-0 truncate">{{ f.fileName }}</span>
                      <X class="h-3.5 w-3.5 shrink-0 text-white/40 pointer-events-none" aria-hidden="true" />
                    </button>
                  </div>
                  <p v-else class="mt-2 text-sm text-white/45">暂无附件</p>
                </div>
              </template>
              <div
                v-else
                class="rounded-2xl border border-dashed border-white/15 bg-white/[0.03] py-16 text-center text-sm text-white/45"
              >
                暂无报价清单
              </div>
                </div>
              </section>

              <div class="flex justify-end border-t border-white/10 pt-5 sm:pt-6">
                <button
                  v-if="selectedConsultation.status !== '已结束'"
                  type="button"
                  class="rounded-xl border border-red-500/55 bg-red-600 px-6 py-2.5 text-sm font-bold text-white shadow-[0_0_18px_rgba(220,38,38,0.4)] transition hover:border-red-400/80 hover:bg-red-500 hover:shadow-[0_0_22px_rgba(220,38,38,0.5)] active:scale-[0.98]"
                  @click="endConsultation"
                >
                  结束咨询
                </button>
                <span
                  v-else
                  class="rounded-xl border border-white/12 bg-white/[0.06] px-6 py-2.5 text-sm font-medium text-white/45"
                >
                  咨询已结束
                </span>
              </div>
            </div>
            <div v-else key="short-exchange-panel" class="min-h-0">
              <Transition name="short-exchange" mode="out-in">
                <div
                  v-if="shortExchangeSubmitSuccess"
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

    <Teleport to="body">
      <div
        v-if="mediaPreview"
        class="fixed inset-0 z-[200] bg-black"
        role="dialog"
        aria-modal="true"
        aria-label="媒体全屏预览"
      >
        <button
          type="button"
          class="absolute top-4 right-4 z-20 rounded-full border border-white/25 bg-white/10 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/20"
          @click="closeMediaPreview"
        >
          退出全览
        </button>
        <div
          class="absolute inset-0 flex items-center justify-center p-4 sm:p-8"
          @click.self="closeMediaPreview"
        >
          <img
            v-if="mediaPreview.kind === 'image'"
            :src="mediaPreview.url"
            :alt="mediaPreview.fileName"
            class="max-h-full max-w-full object-contain"
            @click.stop
          />
          <video
            v-else
            :src="mediaPreview.url"
            controls
            playsinline
            class="max-h-full max-w-full object-contain"
            @click.stop
          />
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

/* 合并详情页 ↔ 短交流全屏：淡入淡出 + 轻微位移（进入/返回同一套动效） */
.short-exchange-shell-enter-active,
.short-exchange-shell-leave-active {
  transition:
    opacity 0.42s cubic-bezier(0.16, 1, 0.3, 1),
    transform 0.48s cubic-bezier(0.16, 1, 0.3, 1);
}
.short-exchange-shell-enter-from {
  opacity: 0;
  transform: translateY(0.6rem) scale(0.985);
}
.short-exchange-shell-leave-to {
  opacity: 0;
  transform: translateY(-0.45rem) scale(0.985);
}

/* 短交流内：成功页 ↔ 表单 */
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

</style>
