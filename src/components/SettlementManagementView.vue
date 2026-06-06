<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ChevronLeft, MoreHorizontal, Search, X } from 'lucide-vue-next';
import checkMarkImg from '../../image asset/check mark.png';
import { settlementData } from '../data';
import type { SettlementRecord, SettlementStatus } from '../types';

const emit = defineEmits<{
  back: [];
}>();

const route = useRoute();
const router = useRouter();

const settlementTab = ref<SettlementStatus>('pending_apply');
const searchQuery = ref('');
const currentPage = ref(1);
const itemsPerPage = 6;

const selectedSettlement = ref<SettlementRecord | null>(null);
const settlementModalView = ref<'detail' | 'success'>('detail');
type SettlementSuccessKind = 'approval' | 'upload';
const settlementSuccessKind = ref<SettlementSuccessKind>('approval');
type ApprovalDecision = 'pass' | 'fail';
const approvalDecision = ref<ApprovalDecision>('pass');
const rejectReason = ref('');
/** 已提交审核后，详情页表单只读展示 */
const approvalSubmitted = ref(false);
/** 已回传签字结算单后，待上传详情页按钮只读展示 */
const uploadSubmitted = ref(false);
/** 提交后短暂禁止点击遮罩关闭，避免 morph 缩小瞬间误触 backdrop */
const overlayCloseBlockedUntil = ref(0);
const signedSettlementInputRef = ref<HTMLInputElement | null>(null);

/** 详情 ↔ 成功：与 MaintenanceProjectsView `.modal-morph` 相同，scoped v-bind 驱动宽高过渡 */
const settlementModalDimensions = computed(() => {
  if (settlementModalView.value === 'success') {
    return { width: '800px', height: '560px', radius: '32px', scale: 1 };
  }
  return { width: '920px', height: '840px', radius: '40px', scale: 1 };
});

const settlementModalSurface = computed(() =>
  settlementModalView.value === 'detail'
    ? 'rgba(255, 255, 255, 0.1)'
    : 'rgba(255, 255, 255, 0.15)',
);

const settlementModalTitle = computed(() => {
  if (settlementModalView.value !== 'success') return '结算详情';
  return settlementSuccessKind.value === 'upload' ? '结算详情' : '结算审核';
});

const settlementSuccessSubtitle = computed(() =>
  settlementSuccessKind.value === 'upload'
    ? '您的签字结算单已成功回传至系统中'
    : '您的结算审核已成功记录到系统中',
);

const TAB_LABELS: Record<SettlementStatus, string> = {
  pending_apply: '待申请',
  under_review: '结算审核中',
  pending_upload: '待上传结算单',
  settled: '已结算',
};

const LIST_TITLE: Record<SettlementStatus, string> = {
  pending_apply: '待申请结算',
  under_review: '结算审核中',
  pending_upload: '待上传结算单',
  settled: '已结算',
};

const APPROVAL_OPTIONS = [
  { id: 'pass' as const, label: '通过' },
  { id: 'fail' as const, label: '不通过' },
];

const canSubmitApproval = computed(() => {
  if (approvalDecision.value === 'pass') return true;
  return rejectReason.value.trim().length > 0;
});

const filteredData = computed(() => {
  const list = settlementData.filter((r) => r.status === settlementTab.value);
  const q = searchQuery.value.trim().toLowerCase();
  if (!q) return list;
  return list.filter((row) => {
    const blob = [
      row.no,
      row.projectNo,
      row.name,
      row.contractAmount,
      row.settlementAmount,
      row.paidAmount,
    ]
      .join('\n')
      .toLowerCase();
    return blob.includes(q);
  });
});

const totalPages = computed(() =>
  Math.max(1, Math.ceil(filteredData.value.length / itemsPerPage)),
);

const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  return filteredData.value.slice(start, start + itemsPerPage);
});

watch([settlementTab, searchQuery], () => {
  currentPage.value = 1;
});

function parseSettlementStatusFromQuery(): SettlementStatus | null {
  const raw = route.query.status;
  const value = Array.isArray(raw) ? raw[0] : raw;
  if (
    value === 'pending_apply' ||
    value === 'under_review' ||
    value === 'pending_upload' ||
    value === 'settled'
  ) {
    return value;
  }
  return null;
}

function applySettlementStatusFromRoute() {
  const status = parseSettlementStatusFromQuery();
  if (status) settlementTab.value = status;
}

function setSettlementTab(status: SettlementStatus) {
  settlementTab.value = status;
  router.replace({ name: 'settlement-management', query: { status } });
}

function openSettlementDetail(row: SettlementRecord) {
  selectedSettlement.value = row;
  settlementModalView.value = 'detail';
  settlementSuccessKind.value = 'approval';
  approvalDecision.value = 'pass';
  rejectReason.value = '';
  approvalSubmitted.value = false;
  uploadSubmitted.value = false;
}

function closeSettlementDetail() {
  selectedSettlement.value = null;
  settlementModalView.value = 'detail';
  settlementSuccessKind.value = 'approval';
  approvalDecision.value = 'pass';
  rejectReason.value = '';
  approvalSubmitted.value = false;
  uploadSubmitted.value = false;
  overlayCloseBlockedUntil.value = 0;
}

function handleOverlayClick() {
  if (settlementModalView.value === 'success') return;
  if (Date.now() < overlayCloseBlockedUntil.value) return;
  closeSettlementDetail();
}

function backFromSettlementSuccess() {
  settlementModalView.value = 'detail';
}

function downloadSettlementDoc() {
  // 演示：实际对接下载接口
}

function triggerSignedSettlementUpload() {
  if (uploadSubmitted.value) return;
  signedSettlementInputRef.value?.click();
}

function onSignedSettlementSelected(e: Event) {
  const input = e.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file || uploadSubmitted.value) {
    input.value = '';
    return;
  }
  uploadSubmitted.value = true;
  settlementSuccessKind.value = 'upload';
  overlayCloseBlockedUntil.value = Date.now() + 1500;
  settlementModalView.value = 'success';
  input.value = '';
}

function setApprovalDecision(decision: ApprovalDecision) {
  if (approvalSubmitted.value) return;
  approvalDecision.value = decision;
  if (decision === 'pass') rejectReason.value = '';
}

function submitApproval(event?: MouseEvent) {
  event?.preventDefault();
  event?.stopPropagation();
  if (!canSubmitApproval.value || approvalSubmitted.value) return;
  approvalSubmitted.value = true;
  settlementSuccessKind.value = 'approval';
  overlayCloseBlockedUntil.value = Date.now() + 1500;
  settlementModalView.value = 'success';
}

function onSettlementDetailKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape' && selectedSettlement.value) {
    e.preventDefault();
    closeSettlementDetail();
  }
}

onMounted(() => {
  applySettlementStatusFromRoute();
  window.addEventListener('keydown', onSettlementDetailKeydown);
});

onUnmounted(() => {
  window.removeEventListener('keydown', onSettlementDetailKeydown);
});

watch(
  () => route.query.status,
  () => {
    applySettlementStatusFromRoute();
  },
);
</script>

<template>
  <div
    class="mx-auto max-w-[1600px] space-y-6 p-8 animate-in fade-in slide-in-from-bottom-4 duration-700"
  >
    <header
      class="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
    >
      <div class="flex items-center space-x-4">
        <button
          type="button"
          class="rounded-xl border border-white/20 bg-white/50 p-2 backdrop-blur-md transition-all hover:bg-white/80 active:scale-95"
          aria-label="返回"
          @click="emit('back')"
        >
          <ChevronLeft :size="20" class="text-gray-600" />
        </button>
        <div>
          <h1 class="text-3xl font-bold text-gray-800">结算管理</h1>
          <p class="mt-1 text-gray-500">按状态查看结算台账，支持搜索与分页</p>
        </div>
      </div>

      <div class="flex w-full flex-shrink-0 items-center justify-end gap-3 sm:w-auto">
        <div class="relative min-w-0 flex-1 sm:min-w-[16rem] sm:flex-initial">
          <Search
            :size="18"
            class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            v-model="searchQuery"
            type="search"
            placeholder="搜索订单编号、项目编号、项目名称、金额…"
            class="w-full rounded-xl border border-white/20 bg-white/50 py-2 pl-10 pr-4 backdrop-blur-md transition-all focus:border-white/20 focus:outline-none focus:ring-0 focus-visible:ring-0 sm:w-96"
          />
        </div>
      </div>
    </header>

    <div class="flex space-x-3 overflow-x-auto pb-2 scrollbar-hide">
      <button
        v-for="tab in (['pending_apply', 'under_review', 'pending_upload', 'settled'] as SettlementStatus[])"
        :key="tab"
        type="button"
        :class="[
          'rounded-full px-6 py-2.5 text-sm font-bold whitespace-nowrap shadow-sm transition-all',
          settlementTab === tab
            ? 'bg-[#FFE600] text-[#260A2F]'
            : 'border border-gray-100 bg-white text-gray-500 hover:border-gray-300 hover:text-gray-800',
        ]"
        @click="setSettlementTab(tab)"
      >
        {{ TAB_LABELS[tab] }}
      </button>
    </div>

    <div
      class="overflow-hidden rounded-[32px] border border-white/30 bg-white/40 shadow-xl backdrop-blur-xl"
    >
      <div class="flex items-center space-x-3 border-b border-white/20 p-6">
        <div class="h-6 w-1.5 rounded-full bg-[#FFEB69]" />
        <h2 class="text-xl font-bold text-gray-800">
          {{ LIST_TITLE[settlementTab] }}
        </h2>
      </div>

      <div class="w-full overflow-x-auto">
        <table class="w-full min-w-[1000px] table-fixed border-collapse text-left">
          <thead>
            <tr class="border-b border-white/10 text-sm font-medium text-gray-500">
              <th class="w-[15%] whitespace-nowrap px-4 py-4">订单编号</th>
              <th class="w-[12%] whitespace-nowrap px-4 py-4">项目编号</th>
              <th class="w-[22%] whitespace-nowrap px-4 py-4">项目名称</th>
              <th class="w-[14%] whitespace-nowrap px-4 py-4 text-right">合同金额</th>
              <th class="w-[14%] whitespace-nowrap px-4 py-4 text-right">结算金额</th>
              <th class="w-[14%] whitespace-nowrap px-4 py-4 text-right">已支付金额</th>
              <th class="w-[9%] px-4 py-4" />
            </tr>
          </thead>
          <tbody class="divide-y divide-white/10">
            <tr
              v-for="row in paginatedData"
              :key="row.id"
              class="group transition-colors hover:bg-white/30"
            >
              <td class="align-middle whitespace-nowrap px-4 py-4 font-medium text-gray-800">
                {{ row.no }}
              </td>
              <td class="align-middle whitespace-nowrap px-4 py-4 text-gray-700">
                {{ row.projectNo }}
              </td>
              <td class="align-middle px-4 py-4 font-bold text-gray-900">
                <span class="block truncate" :title="row.name">{{ row.name }}</span>
              </td>
              <td class="align-middle whitespace-nowrap px-4 py-4 text-right tabular-nums text-gray-800">
                {{ row.contractAmount }}
              </td>
              <td class="align-middle whitespace-nowrap px-4 py-4 text-right tabular-nums text-gray-800">
                {{ row.settlementAmount }}
              </td>
              <td class="align-middle whitespace-nowrap px-4 py-4 text-right tabular-nums text-gray-800">
                {{ row.paidAmount }}
              </td>
              <td class="align-middle px-4 py-4">
                <button
                  type="button"
                  class="rounded-lg p-2 text-gray-400 transition-all hover:bg-white/50 hover:text-[#E2943A]"
                  aria-label="查看结算详情"
                  @click.stop="openSettlementDetail(row)"
                >
                  <MoreHorizontal :size="20" />
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div
        class="flex flex-col gap-4 border-t border-white/10 p-6 text-sm text-gray-500 sm:flex-row sm:items-center sm:justify-between"
      >
        <p>
          显示 {{ (currentPage - 1) * itemsPerPage + 1 }} 到
          {{ Math.min(currentPage * itemsPerPage, filteredData.length) }}
          条，共 {{ filteredData.length }} 条记录
        </p>
        <div class="flex flex-wrap gap-2">
          <button
            type="button"
            class="rounded-lg border border-white/20 bg-white/50 px-3 py-1 transition-colors hover:bg-white/80 disabled:opacity-50"
            :disabled="currentPage <= 1"
            @click="currentPage > 1 && currentPage--"
          >
            上一页
          </button>
          <button
            v-for="page in totalPages"
            :key="page"
            type="button"
            :class="[
              'rounded-lg border px-3 py-1 shadow-sm transition-colors tabular-nums',
              currentPage === page
                ? 'border-[#FFEB69] bg-[#FFEB69] text-[#3A341C]'
                : 'border-white/20 bg-white/50 text-[#3A341C] hover:bg-white/80',
            ]"
            @click="currentPage = page"
          >
            {{ page }}
          </button>
          <button
            type="button"
            class="rounded-lg border border-white/20 bg-white/50 px-3 py-1 transition-colors hover:bg-white/80 disabled:opacity-50"
            :disabled="currentPage >= totalPages"
            @click="currentPage < totalPages && currentPage++"
          >
            下一页
          </button>
        </div>
      </div>
    </div>
  </div>

  <Teleport to="body">
    <div
      v-if="selectedSettlement"
      class="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4 backdrop-blur-md animate-in fade-in duration-300 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="settlement-detail-title"
      @click.self="handleOverlayClick"
    >
      <div
        class="settlement-modal-morph flex flex-col overflow-hidden border border-white/20 shadow-2xl backdrop-blur-2xl"
        @click.stop
      >
        <div class="flex h-full min-h-0 w-full flex-col">
        <div
          class="flex shrink-0 items-center justify-between border-b border-white/10 px-6 py-5 sm:px-8 sm:py-6"
        >
          <div class="flex min-w-0 items-center gap-2 sm:gap-3">
            <div
              class="h-6 w-1.5 shrink-0 rounded-full bg-[#FFE600] shadow-[0_0_15px_rgba(255,230,0,0.45)]"
            />
            <h2
              id="settlement-detail-title"
              class="truncate text-xl font-bold tracking-tight text-white sm:text-2xl"
            >
              {{ settlementModalTitle }}
            </h2>
          </div>
          <div class="flex items-center gap-3">
            <button
              type="button"
              class="rounded-full p-2 text-white/70 transition-all hover:bg-white/10 hover:text-white"
              aria-label="关闭"
              @click="closeSettlementDetail"
            >
              <X :size="24" />
            </button>
          </div>
        </div>

        <div class="flex min-h-0 flex-1 flex-col overflow-hidden">
            <div
              v-if="settlementModalView === 'detail'"
              key="detail"
              class="flex min-h-0 flex-1 flex-col"
            >
        <div
          class="custom-scrollbar min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-6 py-6 sm:px-8 sm:py-8"
        >
          <div
            class="rounded-[28px] border border-white/10 bg-white/5 p-6 shadow-inner backdrop-blur-xl sm:p-8"
          >
            <div class="grid grid-cols-1 gap-x-10 gap-y-6 sm:grid-cols-2">
              <div>
                <p class="mb-2 text-xs font-bold uppercase tracking-widest text-white/40">订单编号</p>
                <p class="font-mono text-lg font-bold text-white tabular-nums sm:text-xl">
                  {{ selectedSettlement.no }}
                </p>
              </div>
              <div>
                <p class="mb-2 text-xs font-bold uppercase tracking-widest text-white/40">项目名称</p>
                <p class="text-lg font-bold text-white sm:text-xl">{{ selectedSettlement.name }}</p>
              </div>
              <div>
                <p class="mb-2 text-xs font-bold uppercase tracking-widest text-white/40">项目编号</p>
                <p class="font-mono text-lg font-bold text-white tabular-nums sm:text-xl">
                  {{ selectedSettlement.projectNo }}
                </p>
              </div>
              <div>
                <p class="mb-2 text-xs font-bold uppercase tracking-widest text-white/40">竣工日期</p>
                <p class="text-lg font-bold text-white tabular-nums sm:text-xl">
                  {{ selectedSettlement.completionDate }}
                </p>
              </div>
              <div class="sm:col-span-2">
                <p class="mb-2 text-xs font-bold uppercase tracking-widest text-white/40">项目地址</p>
                <p class="text-lg font-bold leading-relaxed text-white sm:text-xl">
                  {{ selectedSettlement.projectAddress }}
                </p>
              </div>
              <div>
                <p class="mb-2 text-xs font-bold uppercase tracking-widest text-white/40">开工日期</p>
                <p class="text-lg font-bold text-white tabular-nums sm:text-xl">
                  {{ selectedSettlement.startDate }}
                </p>
              </div>
              <div>
                <p class="mb-2 text-xs font-bold uppercase tracking-widest text-white/40">结算金额</p>
                <p class="text-lg font-bold text-white tabular-nums sm:text-xl">
                  {{ selectedSettlement.settlementAmount }}
                </p>
              </div>
            </div>
          </div>

          <div class="mt-6">
            <p class="mb-3 text-sm font-bold text-white/80">结算明细：</p>
            <div class="overflow-hidden rounded-2xl border border-white/10">
              <table class="w-full border-collapse text-left text-sm">
                <thead>
                  <tr class="bg-white/10 text-white/70">
                    <th class="w-14 px-4 py-3 font-medium">序号</th>
                    <th class="px-4 py-3 font-medium">费用类别</th>
                    <th class="px-4 py-3 font-medium text-right">金额(元)</th>
                    <th class="px-4 py-3 font-medium">备注</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-white/10 text-white">
                  <tr
                    v-for="(item, idx) in selectedSettlement.settlementItems"
                    :key="item.category"
                  >
                    <td class="px-4 py-3 tabular-nums">{{ idx + 1 }}</td>
                    <td class="px-4 py-3">{{ item.category }}</td>
                    <td class="px-4 py-3 text-right tabular-nums">{{ item.amount }}</td>
                    <td class="px-4 py-3 text-white/70">{{ item.remark ?? '—' }}</td>
                  </tr>
                  <tr class="bg-white/[0.03]">
                    <td colspan="2" class="px-4 py-3 font-bold">结算总价</td>
                    <td class="px-4 py-3 text-right font-bold tabular-nums">
                      {{ selectedSettlement.totalSettlementPrice }}
                    </td>
                    <td class="px-4 py-3" />
                  </tr>
                  <tr class="bg-white/[0.03]">
                    <td colspan="2" class="px-4 py-3 font-bold">已支付进度款</td>
                    <td class="px-4 py-3 text-right font-bold tabular-nums">
                      {{ selectedSettlement.paidProgressAmount }}
                    </td>
                    <td class="px-4 py-3" />
                  </tr>
                  <tr class="bg-white/[0.03]">
                    <td colspan="2" class="px-4 py-3 font-bold">质保金</td>
                    <td class="px-4 py-3 text-right font-bold tabular-nums">
                      {{ selectedSettlement.retentionMoney }}
                    </td>
                    <td class="px-4 py-3" />
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div class="mt-6">
            <p class="mb-3 text-sm font-bold text-white/80">变更明细：</p>
            <div class="overflow-hidden rounded-2xl border border-white/10">
              <table class="w-full border-collapse text-left text-sm">
                <thead>
                  <tr class="bg-white/10 text-white/70">
                    <th class="w-14 px-4 py-3 font-medium">序号</th>
                    <th class="px-4 py-3 font-medium">变更订单编号</th>
                    <th class="px-4 py-3 font-medium text-right">金额</th>
                    <th class="px-4 py-3 font-medium">备注</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-white/10 text-white">
                  <tr
                    v-for="(item, idx) in selectedSettlement.changeItems"
                    :key="item.orderNo"
                  >
                    <td class="px-4 py-3 tabular-nums">{{ idx + 1 }}</td>
                    <td class="px-4 py-3 font-mono">{{ item.orderNo }}</td>
                    <td class="px-4 py-3 text-right tabular-nums">{{ item.amount }}</td>
                    <td class="px-4 py-3 text-white/70">{{ item.remark ?? '—' }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <button
              type="button"
              class="mt-3 rounded-lg border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-white/15"
            >
              附件
            </button>
          </div>

          <div class="mt-6">
            <p class="mb-3 text-sm font-bold text-white/80">减项明细：</p>
            <div class="overflow-hidden rounded-2xl border border-white/10">
              <table class="w-full border-collapse text-left text-sm">
                <thead>
                  <tr class="bg-white/10 text-white/70">
                    <th class="w-14 px-4 py-3 font-medium">序号</th>
                    <th class="px-4 py-3 font-medium">减项内容</th>
                    <th class="px-4 py-3 font-medium text-right">金额</th>
                    <th class="px-4 py-3 font-medium">备注</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-white/10 text-white">
                  <tr
                    v-for="(item, idx) in selectedSettlement.deductionItems"
                    :key="item.content"
                  >
                    <td class="px-4 py-3 tabular-nums">{{ idx + 1 }}</td>
                    <td class="px-4 py-3">{{ item.content }}</td>
                    <td class="px-4 py-3 text-right tabular-nums">{{ item.amount }}</td>
                    <td class="px-4 py-3 text-white/70">{{ item.remark ?? '—' }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <button
              type="button"
              class="mt-3 rounded-lg border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-white/15"
            >
              附件
            </button>
          </div>
        </div>

        <!-- 底部：待上传结算单 -->
        <div
          v-if="selectedSettlement.status === 'pending_upload'"
          class="shrink-0 border-t border-white/5 bg-black/10 px-6 py-6 backdrop-blur-md sm:px-8 sm:py-8"
        >
          <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p
              :class="[
                'text-xl font-bold tracking-tight',
                uploadSubmitted ? 'text-white/40' : 'text-white',
              ]"
            >
              结算日期：
              <span class="tabular-nums">{{ selectedSettlement.settlementDate ?? '—' }}</span>
            </p>
            <div class="flex flex-wrap items-center gap-3">
              <button
                type="button"
                class="rounded-xl bg-[#FFE600] px-6 py-2.5 text-base font-bold text-[#260A2F] shadow-[0_6px_24px_rgba(255,230,0,0.32)] transition-all hover:bg-[#e6cf00] active:scale-[0.95]"
                @click="downloadSettlementDoc"
              >
                下载结算单
              </button>
              <button
                type="button"
                :disabled="uploadSubmitted"
                :class="[
                  'rounded-xl px-6 py-2.5 text-base font-bold transition-all',
                  uploadSubmitted
                    ? 'cursor-not-allowed border border-white/10 bg-white/[0.03] text-white/40'
                    : 'border border-white/15 bg-white/10 text-white hover:bg-white/15 active:scale-[0.95]',
                ]"
                @click="triggerSignedSettlementUpload"
              >
                签字结算单回传
              </button>
              <input
                ref="signedSettlementInputRef"
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                class="hidden"
                @change="onSignedSettlementSelected"
              />
            </div>
          </div>
        </div>

        <!-- 底部审核区：结算审核中 -->
        <div
          v-else-if="selectedSettlement.status === 'under_review'"
          class="shrink-0 border-t border-white/5 bg-black/10 px-6 py-6 backdrop-blur-md sm:px-8 sm:py-8"
        >
          <div v-if="approvalDecision === 'fail'" class="mb-6">
            <textarea
              v-model="rejectReason"
              rows="4"
              placeholder="请填写不通过原因…"
              :readonly="approvalSubmitted"
              :disabled="approvalSubmitted"
              :class="[
                'w-full resize-none rounded-2xl border px-4 py-3 text-base text-white placeholder:text-white/35 outline-none backdrop-blur-sm',
                approvalSubmitted
                  ? 'cursor-not-allowed border-white/10 bg-white/[0.03] text-white/50'
                  : 'border-white/15 bg-white/5 focus:border-white/25',
              ]"
            />
          </div>

          <div class="grid grid-cols-1 items-center gap-8 lg:grid-cols-12 lg:gap-12">
            <div class="flex flex-wrap items-center gap-8 sm:gap-10 lg:col-span-7">
              <span
                :class="[
                  'whitespace-nowrap text-xl font-bold tracking-tight',
                  approvalSubmitted ? 'text-white/40' : 'text-white',
                ]"
              >
                审核意见
              </span>
              <div class="flex items-center gap-12">
                <button
                  v-for="opt in APPROVAL_OPTIONS"
                  :key="opt.id"
                  type="button"
                  :disabled="approvalSubmitted"
                  :class="[
                    'group flex items-center gap-4',
                    approvalSubmitted ? 'cursor-not-allowed' : 'cursor-pointer',
                  ]"
                  @click="setApprovalDecision(opt.id)"
                >
                  <div
                    :class="[
                      'flex h-7 w-7 items-center justify-center rounded-full border-2 transition-all duration-300',
                      approvalSubmitted
                        ? approvalDecision === opt.id
                          ? 'border-[#FFE600]/40 bg-[#FFE600]/5'
                          : 'border-white/10'
                        : approvalDecision === opt.id
                          ? 'border-[#FFE600] bg-[#FFE600]/10'
                          : 'border-white/20 group-hover:border-white/40',
                    ]"
                  >
                    <div
                      v-if="approvalDecision === opt.id"
                      :class="[
                        'h-3 w-3 rounded-full',
                        approvalSubmitted
                          ? 'bg-[#FFE600]/40 shadow-none'
                          : 'bg-[#FFE600] shadow-[0_0_12px_rgba(255,230,0,0.8)]',
                      ]"
                    />
                  </div>
                  <span
                    :class="[
                      'text-xl font-bold transition-colors',
                      approvalSubmitted
                        ? approvalDecision === opt.id
                          ? 'text-white/50'
                          : 'text-white/25'
                        : approvalDecision === opt.id
                          ? 'text-white'
                          : 'text-white/40 group-hover:text-white/60',
                    ]"
                  >
                    {{ opt.label }}
                  </span>
                </button>
              </div>
            </div>

            <div class="flex items-center justify-end lg:col-span-5">
              <button
                type="button"
                :disabled="!canSubmitApproval || approvalSubmitted"
                :class="[
                  'rounded-xl px-8 py-2.5 text-base font-bold transition-all',
                  approvalSubmitted
                    ? 'cursor-not-allowed bg-[#FFE600]/25 text-[#260A2F]/45 shadow-none'
                    : canSubmitApproval
                      ? 'bg-[#FFE600] text-[#260A2F] shadow-[0_6px_24px_rgba(255,230,0,0.32)] hover:bg-[#e6cf00] active:scale-[0.95]'
                      : 'cursor-not-allowed border border-white/5 bg-white/5 text-white/20 shadow-none',
                ]"
                @click.stop.prevent="submitApproval"
              >
                提交
              </button>
            </div>
          </div>
        </div>

        <!-- 底部：已结算 -->
        <div
          v-else-if="selectedSettlement.status === 'settled'"
          class="shrink-0 border-t border-white/5 bg-black/10 px-6 py-6 backdrop-blur-md sm:px-8 sm:py-8"
        >
          <div class="flex justify-end">
            <button
              type="button"
              class="rounded-xl bg-[#FFE600] px-6 py-2.5 text-base font-bold text-[#260A2F] shadow-[0_6px_24px_rgba(255,230,0,0.32)] transition-all hover:bg-[#e6cf00] active:scale-[0.95]"
              @click="downloadSettlementDoc"
            >
              下载结算单
            </button>
          </div>
        </div>
            </div>

            <div
              v-else
              key="success"
              class="flex min-h-0 flex-1 flex-col items-center justify-center px-6 py-8 sm:px-8"
            >
              <img
                :src="checkMarkImg"
                alt=""
                class="mb-6 h-36 w-56 object-contain"
              />
              <h2 class="mb-4 text-3xl font-bold tracking-tight text-white">
                已完成提交
              </h2>
              <p class="mb-12 max-w-md text-center text-white/60">
                {{ settlementSuccessSubtitle }}
              </p>
              <button
                type="button"
                class="rounded-xl border border-white/10 bg-white/10 px-8 py-3 font-bold text-white transition-colors hover:bg-white/20"
                @click="backFromSettlementSuccess"
              >
                返回上级页面
              </button>
            </div>
        </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.settlement-modal-morph {
  width: v-bind('settlementModalDimensions.width') !important;
  height: v-bind('settlementModalDimensions.height') !important;
  border-radius: v-bind('settlementModalDimensions.radius');
  background-color: v-bind('settlementModalSurface');
  transition:
    width 0.8s cubic-bezier(0.16, 1, 0.3, 1),
    height 0.8s cubic-bezier(0.16, 1, 0.3, 1),
    transform 0.8s cubic-bezier(0.16, 1, 0.3, 1),
    border-radius 0.8s cubic-bezier(0.16, 1, 0.3, 1),
    background-color 0.8s ease;
  will-change: width, height, transform, border-radius;
  transform: translateZ(0) scale(v-bind('settlementModalDimensions.scale'));
  backface-visibility: hidden;
}

.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.12);
  border-radius: 999px;
}
</style>
