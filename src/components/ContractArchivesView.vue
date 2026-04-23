<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import {
  ChevronLeft,
  Eye,
  MoreHorizontal,
  Search,
  X,
} from 'lucide-vue-next';
import { contractArchiveList } from '../data';
import type { ContractArchive } from '../types';

const emit = defineEmits<{
  back: [];
}>();

const route = useRoute();
const router = useRouter();

const searchQuery = ref('');
const currentPage = ref(1);
const itemsPerPage = 6;

const selectedContract = ref<ContractArchive | null>(null);

function stripContractQuery() {
  if (!('contract' in route.query)) return;
  router.replace({ name: 'contract-archives' });
}

/** 从首页等带 ?contract=id 进入时打开对应详情并翻到所在页 */
function tryOpenContractFromRoute() {
  const raw = route.query.contract;
  if (raw === undefined || raw === null || raw === '') return;
  const id = String(Array.isArray(raw) ? raw[0] : raw);
  const idx = contractArchiveList.findIndex((c) => c.id === id);
  const row = idx >= 0 ? contractArchiveList[idx] : undefined;
  if (row) {
    searchQuery.value = '';
    selectedContract.value = row;
    currentPage.value = Math.floor(idx / itemsPerPage) + 1;
  }
  stripContractQuery();
}

onMounted(() => {
  tryOpenContractFromRoute();
});

watch(
  () => route.query.contract,
  () => {
    tryOpenContractFromRoute();
  },
);

/**
 * 普通合同 · 合同详情弹窗尺寸（仅改普通合同时编辑下方对象）
 * 变量含义见 src/styles/modal-morph.css
 */
const ORDINARY_CONTRACT_MODAL_CSS_VARS: Record<string, string> = {
  '--jp-modal-w': '768px',
  '--jp-modal-w-max': '768px',
  '--jp-modal-h': 'min(70vh, 680px)',
  '--jp-modal-max-h': 'min(94vh, 900px)',
  '--jp-modal-radius': '40px',
  '--jp-modal-scale': '1',
  '--jp-modal-bg': 'rgba(255, 255, 255, 0.1)',
};

/**
 * 年框合同 · 合同详情弹窗尺寸（仅改年框合同时编辑下方对象）
 * 与普通合同互不影响。
 */
const FRAMEWORK_CONTRACT_MODAL_CSS_VARS: Record<string, string> = {
  '--jp-modal-w': '768px',
  '--jp-modal-w-max': '768px',
  '--jp-modal-h': 'min(80vh, 800px)',
  '--jp-modal-max-h': 'min(94vh, 920px)',
  '--jp-modal-radius': '40px',
  '--jp-modal-scale': '1',
  '--jp-modal-bg': 'rgba(255, 255, 255, 0.1)',
};

const contractDetailModalStyle = computed(() => {
  const c = selectedContract.value;
  if (c?.contractType === '年框合同') {
    return { ...FRAMEWORK_CONTRACT_MODAL_CSS_VARS };
  }
  return { ...ORDINARY_CONTRACT_MODAL_CSS_VARS };
});

const filteredData = computed(() => {
  const list = contractArchiveList;
  const q = searchQuery.value.trim().toLowerCase();
  if (!q) return list;
  return list.filter((row) => {
    const blob = [
      row.no,
      row.contractType,
      row.contactName,
      row.phone,
      row.contractTitle,
      row.projectName,
      row.projectAddress,
      row.amount,
      row.signedDate,
      row.contractStartDate,
      row.contractEndDate,
    ]
      .filter(Boolean)
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

watch(searchQuery, () => {
  currentPage.value = 1;
});

function openContractDetail(row: ContractArchive) {
  selectedContract.value = row;
}

function closeContractDetail() {
  selectedContract.value = null;
}

function onPreviewClick() {
  /* 预览：可对接 PDF/附件 */
}
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
          <h1 class="text-3xl font-bold text-gray-800">合同档案</h1>
          <p class="mt-1 text-gray-500">合同编号、类型、签约方及工程信息台账</p>
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
            placeholder="搜索编号、类型、姓名、电话、合同/工程名称…"
            class="w-full rounded-xl border border-white/20 bg-white/50 py-2 pl-10 pr-4 backdrop-blur-md transition-all focus:border-white/20 focus:outline-none focus:ring-0 focus-visible:ring-0 sm:w-80"
          />
        </div>
      </div>
    </header>

    <div
      class="overflow-hidden rounded-[32px] border border-white/30 bg-white/40 shadow-xl backdrop-blur-xl"
    >
      <div class="flex items-center space-x-3 border-b border-white/20 p-6">
        <div class="h-6 w-1.5 rounded-full bg-[#FFEB69]" />
        <h2 class="text-xl font-bold text-gray-800">合同档案列表</h2>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full min-w-[960px] border-collapse text-left">
          <thead>
            <tr
              class="border-b border-white/10 text-sm font-medium text-gray-500"
            >
              <th class="whitespace-nowrap px-6 py-5">合同编号</th>
              <th class="whitespace-nowrap px-6 py-5">合同类型</th>
              <th class="min-w-[140px] px-6 py-5">合同名称</th>
              <th class="min-w-[140px] px-6 py-5">工程名称</th>
              <th class="whitespace-nowrap px-6 py-5">姓名</th>
              <th class="whitespace-nowrap px-6 py-5">电话</th>
              <th class="whitespace-nowrap px-6 py-5 text-right">合同金额</th>
              <th class="whitespace-nowrap px-6 py-5">合同签订日期</th>
              <th class="w-20 px-6 py-5" />
            </tr>
          </thead>
          <tbody class="divide-y divide-white/10">
            <tr
              v-for="row in paginatedData"
              :key="row.id"
              class="group transition-colors hover:bg-white/30"
            >
              <td class="whitespace-nowrap px-6 py-5 font-medium text-gray-800">
                {{ row.no }}
              </td>
              <td class="whitespace-nowrap px-6 py-5 text-gray-700">
                {{ row.contractType }}
              </td>
              <td class="max-w-xs px-6 py-5 text-gray-700" :title="row.contractTitle">
                <span class="line-clamp-2">{{ row.contractTitle }}</span>
              </td>
              <td class="max-w-xs px-6 py-5 text-gray-600" :title="row.projectName">
                <span class="line-clamp-2">{{ row.projectName }}</span>
              </td>
              <td class="whitespace-nowrap px-6 py-5 text-gray-700">
                {{ row.contactName }}
              </td>
              <td
                class="whitespace-nowrap px-6 py-5 tabular-nums text-gray-600"
              >
                {{ row.phone }}
              </td>
              <td
                class="whitespace-nowrap px-6 py-5 text-right tabular-nums text-gray-800"
              >
                {{ row.amount }}
              </td>
              <td
                class="whitespace-nowrap px-6 py-5 tabular-nums text-gray-600"
              >
                {{ row.signedDate }}
              </td>
              <td class="px-6 py-5">
                <button
                  type="button"
                  class="rounded-lg p-2 text-gray-400 transition-all hover:bg-white/50 hover:text-[#E2943A]"
                  aria-label="更多操作"
                  @click.stop="openContractDetail(row)"
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
      v-if="selectedContract"
      class="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4 backdrop-blur-md animate-in fade-in duration-300 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="contract-detail-title"
      @click.self="closeContractDetail"
    >
      <div
        class="jp-modal-morph flex w-full flex-col overflow-hidden border border-white/20 shadow-2xl backdrop-blur-2xl"
        :style="contractDetailModalStyle"
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
              id="contract-detail-title"
              class="truncate text-xl font-bold tracking-tight text-white sm:text-2xl"
            >
              合同详情
            </h2>
          </div>
          <button
            type="button"
            class="rounded-full p-2 text-white/70 transition-all hover:bg-white/10 hover:text-white"
            aria-label="关闭"
            @click="closeContractDetail"
          >
            <X :size="24" />
          </button>
        </div>

        <div
          class="custom-scrollbar min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-6 py-6 sm:px-8 sm:py-8"
        >
          <div
            class="rounded-[28px] border border-white/10 bg-white/5 p-6 shadow-inner backdrop-blur-xl sm:p-8"
          >
            <!-- 年框合同：图一 9 项（无工程名称/地址） -->
            <div
              v-if="selectedContract.contractType === '年框合同'"
              class="grid grid-cols-1 gap-x-10 gap-y-7 sm:grid-cols-2"
            >
              <div>
                <p
                  class="mb-2 text-xs font-bold uppercase tracking-widest text-white/40"
                >
                  合同类型
                </p>
                <p class="text-lg font-bold tracking-tight text-white sm:text-xl">
                  {{ selectedContract.contractType }}
                </p>
              </div>
              <div>
                <p
                  class="mb-2 text-xs font-bold uppercase tracking-widest text-white/40"
                >
                  合同编号
                </p>
                <p
                  class="font-mono text-lg font-bold tracking-tight text-white tabular-nums sm:text-xl"
                >
                  {{ selectedContract.no }}
                </p>
              </div>
              <div class="sm:col-span-2">
                <p
                  class="mb-2 text-xs font-bold uppercase tracking-widest text-white/40"
                >
                  合同名称
                </p>
                <p class="text-lg font-bold leading-relaxed text-white sm:text-xl">
                  {{ selectedContract.contractTitle }}
                </p>
              </div>
              <div>
                <p
                  class="mb-2 text-xs font-bold uppercase tracking-widest text-white/40"
                >
                  联系人
                </p>
                <p class="text-lg font-bold tracking-tight text-white sm:text-xl">
                  {{ selectedContract.contactName }}
                </p>
              </div>
              <div>
                <p
                  class="mb-2 text-xs font-bold uppercase tracking-widest text-white/40"
                >
                  联系电话
                </p>
                <p
                  class="font-mono text-lg font-bold tracking-tight text-white tabular-nums sm:text-xl"
                >
                  {{ selectedContract.phone }}
                </p>
              </div>
              <div>
                <p
                  class="mb-2 text-xs font-bold uppercase tracking-widest text-white/40"
                >
                  合同金额
                </p>
                <p
                  class="text-lg font-bold tracking-tight text-white tabular-nums sm:text-xl"
                >
                  {{ selectedContract.amount }}
                </p>
              </div>
              <div>
                <p
                  class="mb-2 text-xs font-bold uppercase tracking-widest text-white/40"
                >
                  合同开始日期
                </p>
                <p
                  class="font-mono text-lg font-bold tracking-tight text-white tabular-nums sm:text-xl"
                >
                  {{ selectedContract.contractStartDate ?? '—' }}
                </p>
              </div>
              <div>
                <p
                  class="mb-2 text-xs font-bold uppercase tracking-widest text-white/40"
                >
                  合同结束日期
                </p>
                <p
                  class="font-mono text-lg font-bold tracking-tight text-white tabular-nums sm:text-xl"
                >
                  {{ selectedContract.contractEndDate ?? '—' }}
                </p>
              </div>
              <div>
                <p
                  class="mb-2 text-xs font-bold uppercase tracking-widest text-white/40"
                >
                  签订日期
                </p>
                <p
                  class="font-mono text-lg font-bold tracking-tight text-white tabular-nums sm:text-xl"
                >
                  {{ selectedContract.signedDate }}
                </p>
              </div>
            </div>

            <!-- 普通合同：工程名称 + 工程地址等 8 项 -->
            <div
              v-else
              class="grid grid-cols-1 gap-x-10 gap-y-7 sm:grid-cols-2"
            >
              <div>
                <p
                  class="mb-2 text-xs font-bold uppercase tracking-widest text-white/40"
                >
                  合同类型
                </p>
                <p class="text-lg font-bold tracking-tight text-white sm:text-xl">
                  {{ selectedContract.contractType }}
                </p>
              </div>
              <div>
                <p
                  class="mb-2 text-xs font-bold uppercase tracking-widest text-white/40"
                >
                  合同编号
                </p>
                <p
                  class="font-mono text-lg font-bold tracking-tight text-white tabular-nums sm:text-xl"
                >
                  {{ selectedContract.no }}
                </p>
              </div>
              <div>
                <p
                  class="mb-2 text-xs font-bold uppercase tracking-widest text-white/40"
                >
                  工程名称
                </p>
                <p class="text-lg font-bold tracking-tight text-white sm:text-xl">
                  {{ selectedContract.projectName }}
                </p>
              </div>
              <div>
                <p
                  class="mb-2 text-xs font-bold uppercase tracking-widest text-white/40"
                >
                  工程地址
                </p>
                <p
                  class="text-base font-bold leading-relaxed text-white/95 sm:text-lg"
                >
                  {{ selectedContract.projectAddress }}
                </p>
              </div>
              <div>
                <p
                  class="mb-2 text-xs font-bold uppercase tracking-widest text-white/40"
                >
                  联系人
                </p>
                <p class="text-lg font-bold tracking-tight text-white sm:text-xl">
                  {{ selectedContract.contactName }}
                </p>
              </div>
              <div>
                <p
                  class="mb-2 text-xs font-bold uppercase tracking-widest text-white/40"
                >
                  联系电话
                </p>
                <p
                  class="font-mono text-lg font-bold tracking-tight text-white tabular-nums sm:text-xl"
                >
                  {{ selectedContract.phone }}
                </p>
              </div>
              <div>
                <p
                  class="mb-2 text-xs font-bold uppercase tracking-widest text-white/40"
                >
                  合同金额
                </p>
                <p
                  class="text-lg font-bold tracking-tight text-white tabular-nums sm:text-xl"
                >
                  {{ selectedContract.amount }}
                </p>
              </div>
              <div>
                <p
                  class="mb-2 text-xs font-bold uppercase tracking-widest text-white/40"
                >
                  签订日期
                </p>
                <p
                  class="font-mono text-lg font-bold tracking-tight text-white tabular-nums sm:text-xl"
                >
                  {{ selectedContract.signedDate }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div class="shrink-0 px-6 pb-6 pt-2 sm:px-8 sm:pb-7 sm:pt-3">
          <button
            type="button"
            class="flex w-full items-center justify-center gap-2 rounded-full border border-white/25 bg-white/[0.07] py-2.5 text-sm font-bold tracking-[0.2em] text-white/90 shadow-inner transition hover:bg-white/12 hover:text-white"
            @click="onPreviewClick"
          >
            <Eye
              :size="18"
              class="shrink-0 text-[#9FE870] drop-shadow-[0_0_10px_rgba(159,232,112,0.55)]"
              stroke-width="2.25"
              aria-hidden="true"
            />
            预览
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.12);
  border-radius: 999px;
}
</style>
