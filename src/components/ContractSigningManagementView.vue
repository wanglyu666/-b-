<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ChevronLeft, MoreHorizontal, Search, X } from 'lucide-vue-next';
import penImg from '../../image asset/pen.png';
import checkMarkImg from '../../image asset/check mark.png';
import { contractSigningList } from '../data';
import type { ContractSigningRecord, ContractSigningStatus } from '../types';

const emit = defineEmits<{
  back: [];
}>();

const route = useRoute();
const router = useRouter();

const signingTab = ref<ContractSigningStatus>('pending');
const searchQuery = ref('');
const currentPage = ref(1);
const itemsPerPage = 6;

const filteredData = computed(() => {
  const list = contractSigningList.filter((r) => r.status === signingTab.value);
  const q = searchQuery.value.trim().toLowerCase();
  if (!q) return list;
  return list.filter((row) => {
    const blob = [
      row.no,
      row.signingType,
      row.contactName,
      row.phone,
      row.amount,
      row.submittedAt,
      row.projectAddress,
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

watch([signingTab, searchQuery], () => {
  currentPage.value = 1;
});

function parseSigningStatusFromQuery(): ContractSigningStatus | null {
  const raw = route.query.status;
  const value = Array.isArray(raw) ? raw[0] : raw;
  if (value === 'pending' || value === 'signed') return value;
  return null;
}

function applySigningStatusFromRoute() {
  const status = parseSigningStatusFromQuery();
  if (status) signingTab.value = status;
}

function setSigningTab(status: ContractSigningStatus) {
  signingTab.value = status;
  router.replace({ name: 'contract-signing', query: { status } });
}

onMounted(() => {
  applySigningStatusFromRoute();
  window.addEventListener('keydown', onSigningDetailKeydown);
});

watch(
  () => route.query.status,
  () => {
    applySigningStatusFromRoute();
  },
);

function formatAmount(amount: string): string {
  const n = Number(String(amount).replace(/,/g, ''));
  if (!Number.isFinite(n)) return amount;
  return n.toLocaleString('zh-CN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/** 与合同档案「合同详情」弹窗同一套：jp-modal-morph + 半透明壳 + backdrop-blur（图二毛玻璃） */
const SIGNING_DETAIL_MODAL_CSS_VARS: Record<string, string> = {
  '--jp-modal-w': '448px',
  '--jp-modal-w-max': '448px',
  '--jp-modal-h': 'min(480px, 86vh)',
  '--jp-modal-max-h': 'min(90vh, 520px)',
  '--jp-modal-radius': '32px',
  '--jp-modal-scale': '1',
  '--jp-modal-bg': 'rgba(255, 255, 255, 0.1)',
};

/** 三个点：合同详情弹窗 */
const signingDetailRow = ref<ContractSigningRecord | null>(null);

function openSigningDetail(row: ContractSigningRecord) {
  signingDetailRow.value = row;
}

function closeSigningDetail() {
  signingDetailRow.value = null;
}

function handleGoSign() {
  closeSigningDetail();
}

const isSignedDetail = computed(
  () => signingDetailRow.value?.status === 'signed',
);

const signingDetailHeroImg = computed(() =>
  isSignedDetail.value ? checkMarkImg : penImg,
);

const signingDetailActionLabel = computed(() =>
  isSignedDetail.value ? '查看已签约文件' : '点击前往签署',
);

function onSigningDetailKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape' && signingDetailRow.value) {
    e.preventDefault();
    closeSigningDetail();
  }
}

onUnmounted(() => {
  window.removeEventListener('keydown', onSigningDetailKeydown);
});
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
          <h1 class="text-3xl font-bold text-gray-800">合同签约管理</h1>
          <p class="mt-1 text-gray-500">待签约与已签约订单台账，支持按状态切换</p>
        </div>
      </div>

      <div
        class="flex w-full flex-shrink-0 items-center justify-end gap-3 sm:w-auto"
      >
        <div class="relative min-w-0 flex-1 sm:min-w-[16rem] sm:flex-initial">
          <Search
            :size="18"
            class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            v-model="searchQuery"
            type="search"
            placeholder="搜索编号、签约类型、联系人、电话、地址…"
            class="w-full rounded-xl border border-white/20 bg-white/50 py-2 pl-10 pr-4 backdrop-blur-md transition-all focus:border-white/20 focus:outline-none focus:ring-0 focus-visible:ring-0 sm:w-80"
          />
        </div>
      </div>
    </header>

    <!-- 状态胶囊：与维保项目页（MaintenanceProjectsView）一致 -->
    <div class="flex space-x-3 overflow-x-auto pb-2 scrollbar-hide">
      <button
        type="button"
        :class="[
          'rounded-full px-6 py-2.5 text-sm font-bold whitespace-nowrap shadow-sm transition-all',
          signingTab === 'pending'
            ? 'bg-[#FFE600] text-[#260A2F]'
            : 'border border-gray-100 bg-white text-gray-500 hover:border-gray-300 hover:text-gray-800',
        ]"
        @click="setSigningTab('pending')"
      >
        待签约
      </button>
      <button
        type="button"
        :class="[
          'rounded-full px-6 py-2.5 text-sm font-bold whitespace-nowrap shadow-sm transition-all',
          signingTab === 'signed'
            ? 'bg-[#FFE600] text-[#260A2F]'
            : 'border border-gray-100 bg-white text-gray-500 hover:border-gray-300 hover:text-gray-800',
        ]"
        @click="setSigningTab('signed')"
      >
        已签约
      </button>
    </div>

    <div
      class="overflow-hidden rounded-[32px] border border-white/30 bg-white/40 shadow-xl backdrop-blur-xl"
    >
      <div class="flex items-center space-x-3 border-b border-white/20 p-6">
        <div class="h-6 w-1.5 rounded-full bg-[#FFEB69]" />
        <h2 class="text-xl font-bold text-gray-800">
          {{ signingTab === 'pending' ? '待签约列表' : '已签约列表' }}
        </h2>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full min-w-[1100px] border-collapse text-left">
          <thead>
            <tr
              class="border-b border-white/10 text-sm font-medium text-gray-500"
            >
              <th class="whitespace-nowrap px-6 py-5">订单编号</th>
              <th class="whitespace-nowrap px-6 py-5">签约类型</th>
              <th class="whitespace-nowrap px-6 py-5">联系人</th>
              <th class="whitespace-nowrap px-6 py-5">联系方式</th>
              <th class="whitespace-nowrap px-6 py-5 text-right">订单金额</th>
              <th class="whitespace-nowrap px-6 py-5">下单时间</th>
              <th class="min-w-[200px] px-6 py-5">项目地址</th>
              <th class="w-20 px-6 py-5" />
            </tr>
          </thead>
          <tbody class="divide-y divide-white/10">
            <tr
              v-for="row in paginatedData"
              :key="row.id"
              class="group transition-colors hover:bg-white/30"
            >
              <td class="align-middle whitespace-nowrap px-6 py-5 font-medium text-gray-800">
                {{ row.no }}
              </td>
              <td class="align-middle whitespace-nowrap px-6 py-5 font-bold text-gray-900">
                {{ row.signingType }}
              </td>
              <td class="align-middle whitespace-nowrap px-6 py-5 text-gray-700">
                {{ row.contactName }}
              </td>
              <td
                class="align-middle whitespace-nowrap px-6 py-5 tabular-nums text-gray-600"
              >
                {{ row.phone }}
              </td>
              <td
                class="align-middle whitespace-nowrap px-6 py-5 text-right tabular-nums text-gray-800"
              >
                {{ formatAmount(row.amount) }}
              </td>
              <td
                class="align-middle whitespace-nowrap px-6 py-5 tabular-nums text-gray-600"
              >
                {{ row.submittedAt }}
              </td>
              <td class="max-w-[220px] px-6 py-5 align-middle text-gray-600" :title="row.projectAddress">
                <span class="block truncate">{{ row.projectAddress }}</span>
              </td>
              <td class="align-middle px-6 py-5">
                <button
                  type="button"
                  class="rounded-lg p-2 text-gray-400 transition-all hover:bg-white/50 hover:text-[#E2943A]"
                  aria-label="更多操作"
                  @click.stop="openSigningDetail(row)"
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
      v-if="signingDetailRow"
      class="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4 backdrop-blur-md animate-in fade-in duration-300 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="signing-detail-title"
      @click.self="closeSigningDetail"
    >
      <div
        class="jp-modal-morph flex w-full flex-col overflow-hidden border border-white/20 shadow-2xl backdrop-blur-2xl"
        :style="SIGNING_DETAIL_MODAL_CSS_VARS"
        @click.stop
      >
        <div
          class="flex shrink-0 items-center justify-between border-b border-white/10 px-6 py-5 sm:px-8 sm:py-6"
        >
          <div class="flex min-w-0 items-center gap-2 sm:gap-3">
            <div
              class="h-6 w-1.5 shrink-0 rounded-full bg-[#FFE600] shadow-[0_0_15px_rgba(255,230,0,0.45)]"
            />
            <h2
              id="signing-detail-title"
              class="truncate text-xl font-bold tracking-tight text-white sm:text-2xl"
            >
              合同详情
            </h2>
          </div>
          <button
            type="button"
            class="rounded-full p-2 text-white/70 transition-all hover:bg-white/10 hover:text-white"
            aria-label="关闭"
            @click="closeSigningDetail"
          >
            <X :size="24" />
          </button>
        </div>

        <div
          class="custom-scrollbar flex min-h-0 flex-1 flex-col overflow-y-auto overflow-x-hidden px-6 py-6 sm:px-8 sm:py-8"
        >
          <p class="sr-only">订单 {{ signingDetailRow.no }}</p>
          <div
            class="flex min-h-[220px] flex-1 items-center justify-center overflow-hidden rounded-[28px] border border-white/10 bg-white/5 p-4 shadow-inner backdrop-blur-xl"
          >
            <img
              :src="signingDetailHeroImg"
              alt=""
              :class="[
                'object-contain',
                isSignedDetail
                  ? 'h-36 w-56 max-w-full'
                  : 'max-h-full max-w-full h-auto w-auto',
              ]"
            />
          </div>
          <button
            type="button"
            class="mt-6 w-full rounded-lg border border-white/20 bg-white/10 py-3.5 text-center text-base font-bold text-white shadow-inner backdrop-blur-sm transition-colors hover:bg-white/15"
            @click="handleGoSign"
          >
            {{ signingDetailActionLabel }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>
