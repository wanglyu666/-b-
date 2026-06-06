<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ChevronLeft, Eye, MoreHorizontal, Search, X } from 'lucide-vue-next';
import { billData } from '../data';
import type { Bill } from '../types';
import checkMarkImg from '../../image asset/check mark.png';

type BillTab = Bill['status'];

const emit = defineEmits<{
  back: [];
}>();

const route = useRoute();
const router = useRouter();

const billTab = ref<BillTab>('confirm');
const searchQuery = ref('');
const currentPage = ref(1);
const itemsPerPage = 6;

const selectedBill = ref<Bill | null>(null);
const modalView = ref<'detail' | 'success'>('detail');

const filteredData = computed(() => {
  const list = billData.filter((r) => r.status === billTab.value);
  const q = searchQuery.value.trim().toLowerCase();
  if (!q) return list;
  return list.filter((row) => {
    const blob = [
      row.no,
      row.name,
      row.contractNo,
      row.contractAmount,
      row.paidAmount,
      row.payRatio,
      row.payToAmount,
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

watch([billTab, searchQuery], () => {
  currentPage.value = 1;
});

type BillStatus = Bill['status'];

function parseBillStatusFromQuery(): BillStatus | null {
  const raw = route.query.status;
  const value = Array.isArray(raw) ? raw[0] : raw;
  if (value === 'confirm' || value === 'pay' || value === 'paid') return value;
  return null;
}

function applyBillStatusFromRoute() {
  const status = parseBillStatusFromQuery();
  if (status) billTab.value = status;
}

function setBillTab(status: BillStatus) {
  billTab.value = status;
  router.replace({ name: 'bill-management', query: { status } });
}

function stripBillQuery() {
  if (!('bill' in route.query)) return;
  const status = parseBillStatusFromQuery();
  router.replace({
    name: 'bill-management',
    query: status ? { status } : undefined,
  });
}

/** 从首页等带 ?bill=id 进入时打开对应详情并翻到所在页 */
function tryOpenBillFromRoute() {
  const raw = route.query.bill;
  if (raw === undefined || raw === null || raw === '') return;
  const id = Number(String(Array.isArray(raw) ? raw[0] : raw));
  if (!Number.isFinite(id)) return;
  const row = billData.find((b) => b.id === id);
  if (!row) return;

  billTab.value = row.status;
  searchQuery.value = '';
  const list = billData.filter((r) => r.status === row.status);
  const idx = list.findIndex((b) => b.id === id);
  if (idx >= 0) {
    currentPage.value = Math.floor(idx / itemsPerPage) + 1;
  }
  selectedBill.value = row;
  modalView.value = 'detail';
  stripBillQuery();
}

onMounted(() => {
  applyBillStatusFromRoute();
  tryOpenBillFromRoute();
});

watch(
  () => [route.query.bill, route.query.status],
  () => {
    applyBillStatusFromRoute();
    tryOpenBillFromRoute();
  },
);

function openBillDetail(row: Bill) {
  selectedBill.value = row;
  modalView.value = 'detail';
}

function closeBillDetail() {
  selectedBill.value = null;
  modalView.value = 'detail';
}

const billDetailModalStyle: Record<string, string> = {
  '--jp-modal-w': '768px',
  '--jp-modal-w-max': '768px',
  '--jp-modal-h': 'min(72vh, 740px)',
  '--jp-modal-max-h': 'min(94vh, 900px)',
  '--jp-modal-radius': '40px',
  '--jp-modal-scale': '1',
  '--jp-modal-bg': 'rgba(255, 255, 255, 0.1)',
};

function parseCurrencyToNumber(value: string): number {
  const n = Number(String(value).replace(/[^\d.-]/g, ''));
  return Number.isFinite(n) ? n : 0;
}

function formatCurrency(n: number): string {
  return `¥${n.toLocaleString('zh-CN', { maximumFractionDigits: 0 })}`;
}

const unpaidAmountLabel = computed(() => {
  const b = selectedBill.value;
  if (!b) return '—';
  const contract = parseCurrencyToNumber(b.contractAmount);
  const paid = parseCurrencyToNumber(b.paidAmount);
  const unpaid = Math.max(0, contract - paid);
  return formatCurrency(unpaid);
});

function onPreviewClick() {
  // 预览：可对接文件/URL
}

function onConfirmClick() {
  // 确认：可对接接口
  modalView.value = 'success';
}

function backToBillDetailFromSuccess() {
  modalView.value = 'detail';
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
          <h1 class="text-3xl font-bold text-gray-800">账单管理</h1>
          <p class="mt-1 text-gray-500">按状态查看账单台账，支持搜索与分页</p>
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
            placeholder="搜索订单编号、项目名称、合同编号、金额、时间…"
            class="w-full rounded-xl border border-white/20 bg-white/50 py-2 pl-10 pr-4 backdrop-blur-md transition-all focus:border-white/20 focus:outline-none focus:ring-0 focus-visible:ring-0 sm:w-96"
          />
        </div>
      </div>
    </header>

    <div class="flex space-x-3 overflow-x-auto pb-2 scrollbar-hide">
      <button
        type="button"
        :class="[
          'rounded-full px-6 py-2.5 text-sm font-bold whitespace-nowrap shadow-sm transition-all',
          billTab === 'confirm'
            ? 'bg-[#FFE600] text-[#260A2F]'
            : 'border border-gray-100 bg-white text-gray-500 hover:border-gray-300 hover:text-gray-800',
        ]"
        @click="setBillTab('confirm')"
      >
        待确认
      </button>
      <button
        type="button"
        :class="[
          'rounded-full px-6 py-2.5 text-sm font-bold whitespace-nowrap shadow-sm transition-all',
          billTab === 'pay'
            ? 'bg-[#FFE600] text-[#260A2F]'
            : 'border border-gray-100 bg-white text-gray-500 hover:border-gray-300 hover:text-gray-800',
        ]"
        @click="setBillTab('pay')"
      >
        待支付
      </button>
      <button
        type="button"
        :class="[
          'rounded-full px-6 py-2.5 text-sm font-bold whitespace-nowrap shadow-sm transition-all',
          billTab === 'paid'
            ? 'bg-[#FFE600] text-[#260A2F]'
            : 'border border-gray-100 bg-white text-gray-500 hover:border-gray-300 hover:text-gray-800',
        ]"
        @click="setBillTab('paid')"
      >
        已支付
      </button>
    </div>

    <div
      class="overflow-hidden rounded-[32px] border border-white/30 bg-white/40 shadow-xl backdrop-blur-xl"
    >
      <div class="flex items-center space-x-3 border-b border-white/20 p-6">
        <div class="h-6 w-1.5 rounded-full bg-[#FFEB69]" />
        <h2 class="text-xl font-bold text-gray-800">
          {{
            billTab === 'confirm'
              ? '待确认账单'
              : billTab === 'pay'
                ? '待支付账单'
                : '已支付账单'
          }}
        </h2>
      </div>

      <div class="w-full">
        <table class="w-full table-fixed border-collapse text-left">
          <thead>
            <tr class="border-b border-white/10 text-sm font-medium text-gray-500">
              <th class="w-[14%] whitespace-nowrap px-4 py-4">订单编号</th>
              <th class="w-[18%] whitespace-nowrap px-4 py-4">项目名称</th>
              <th class="w-[14%] whitespace-nowrap px-4 py-4">合同编号</th>
              <th class="w-[13%] whitespace-nowrap px-4 py-4 text-right">合同金额</th>
              <th class="w-[13%] whitespace-nowrap px-4 py-4 text-right">已付金额</th>
              <th class="w-[10%] whitespace-nowrap px-4 py-4 text-right">付款比例</th>
              <th class="w-[13%] whitespace-nowrap px-4 py-4 text-right">付致金额</th>
              <th class="w-[5%] px-4 py-4" />
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
              <td class="align-middle px-4 py-4 font-bold text-gray-900">
                <span class="block truncate" :title="row.name">{{ row.name }}</span>
              </td>
              <td class="align-middle whitespace-nowrap px-4 py-4 text-gray-700">
                {{ row.contractNo }}
              </td>
              <td class="align-middle whitespace-nowrap px-4 py-4 text-right tabular-nums text-gray-800">
                {{ row.contractAmount }}
              </td>
              <td class="align-middle whitespace-nowrap px-4 py-4 text-right tabular-nums text-gray-800">
                {{ row.paidAmount }}
              </td>
              <td class="align-middle whitespace-nowrap px-4 py-4 text-right tabular-nums text-gray-700">
                {{ row.payRatio }}
              </td>
              <td class="align-middle whitespace-nowrap px-4 py-4 text-right tabular-nums text-gray-800">
                {{ row.payToAmount }}
              </td>
              <td class="align-middle px-4 py-4">
                <button
                  type="button"
                  class="rounded-lg p-2 text-gray-400 transition-all hover:bg-white/50 hover:text-[#E2943A]"
                  aria-label="更多操作"
                  @click.stop="openBillDetail(row)"
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
      v-if="selectedBill"
      class="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4 backdrop-blur-md animate-in fade-in duration-300 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="bill-detail-title"
      @click.self="closeBillDetail"
    >
      <div
        class="jp-modal-morph flex w-full flex-col overflow-hidden border border-white/20 shadow-2xl backdrop-blur-2xl"
        :style="billDetailModalStyle"
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
              id="bill-detail-title"
              class="truncate text-xl font-bold tracking-tight text-white sm:text-2xl"
            >
              请款详情
            </h2>
          </div>
          <button
            type="button"
            class="rounded-full p-2 text-white/70 transition-all hover:bg-white/10 hover:text-white"
            aria-label="关闭"
            @click="closeBillDetail"
          >
            <X :size="24" />
          </button>
        </div>

        <div
          class="custom-scrollbar min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-6 py-6 sm:px-8 sm:py-8"
        >
          <Transition name="modal-slide" mode="out-in">
            <div v-if="modalView === 'detail'" key="detail">
              <div
                class="rounded-[28px] border border-white/10 bg-white/5 p-6 shadow-inner backdrop-blur-xl sm:p-8"
              >
                <div class="grid grid-cols-1 gap-x-10 gap-y-7 sm:grid-cols-2">
                  <div>
                    <p class="mb-2 text-xs font-bold uppercase tracking-widest text-white/40">
                      订单编号
                    </p>
                    <p class="font-mono text-lg font-bold tracking-tight text-white tabular-nums sm:text-xl">
                      {{ selectedBill.no }}
                    </p>
                  </div>
                  <div>
                    <p class="mb-2 text-xs font-bold uppercase tracking-widest text-white/40">
                      合同编号
                    </p>
                    <p class="font-mono text-lg font-bold tracking-tight text-white tabular-nums sm:text-xl">
                      {{ selectedBill.contractNo }}
                    </p>
                  </div>

                  <div>
                    <p class="mb-2 text-xs font-bold uppercase tracking-widest text-white/40">
                      合同金额
                    </p>
                    <p class="text-lg font-bold tracking-tight text-white tabular-nums sm:text-xl">
                      {{ selectedBill.contractAmount }}
                    </p>
                  </div>
                  <div>
                    <p class="mb-2 text-xs font-bold uppercase tracking-widest text-white/40">
                      已付金额
                    </p>
                    <p class="text-lg font-bold tracking-tight text-white tabular-nums sm:text-xl">
                      {{ selectedBill.paidAmount }}
                    </p>
                  </div>

                  <div>
                    <p class="mb-2 text-xs font-bold uppercase tracking-widest text-white/40">
                      未付金额
                    </p>
                    <p class="text-lg font-bold tracking-tight text-white tabular-nums sm:text-xl">
                      {{ unpaidAmountLabel }}
                    </p>
                  </div>
                  <div>
                    <p class="mb-2 text-xs font-bold uppercase tracking-widest text-white/40">
                      项目编号
                    </p>
                    <p class="font-mono text-lg font-bold tracking-tight text-white tabular-nums sm:text-xl">
                      {{ selectedBill.prjNo }}
                    </p>
                  </div>

                  <div>
                    <p class="mb-2 text-xs font-bold uppercase tracking-widest text-white/40">
                      付款批次
                    </p>
                    <p class="text-lg font-bold tracking-tight text-white sm:text-xl">
                      {{ selectedBill.paymentBatch }}
                    </p>
                  </div>
                  <div>
                    <p class="mb-2 text-xs font-bold uppercase tracking-widest text-white/40">
                      申请时间
                    </p>
                    <p class="font-mono text-lg font-bold tracking-tight text-white tabular-nums sm:text-xl">
                      {{ selectedBill.appliedAt }}
                    </p>
                  </div>

                  <div>
                    <p class="mb-2 text-xs font-bold uppercase tracking-widest text-white/40">
                      本次支付批次
                    </p>
                    <p class="text-lg font-bold tracking-tight text-white sm:text-xl">
                      {{ selectedBill.currentPaymentBatch }}
                    </p>
                  </div>
                  <div>
                    <p class="mb-2 text-xs font-bold uppercase tracking-widest text-white/40">
                      本次比例
                    </p>
                    <p class="text-lg font-bold tracking-tight text-white tabular-nums sm:text-xl">
                      {{ selectedBill.currentRatio }}
                    </p>
                  </div>

                  <div class="sm:col-span-2">
                    <p class="mb-2 text-xs font-bold uppercase tracking-widest text-white/40">
                      本次支付说明
                    </p>
                    <p class="text-base font-bold leading-relaxed text-white/95 sm:text-lg">
                      {{ selectedBill.currentPayNote }}
                    </p>
                  </div>
                </div>
              </div>

              <div
                v-if="selectedBill.status === 'pay'"
                class="mt-6 rounded-[28px] border border-white/10 bg-white/5 p-6 shadow-inner backdrop-blur-xl sm:mt-8 sm:p-8"
              >
                <div class="mb-5 flex items-center gap-3">
                  <div class="h-5 w-1.5 rounded-full bg-[#FFEB69]" />
                  <h3 class="text-lg font-bold tracking-tight text-white">
                    发票信息
                  </h3>
                </div>
                <div class="grid grid-cols-1 gap-x-10 gap-y-7 sm:grid-cols-2">
                  <div>
                    <p class="mb-2 text-xs font-bold uppercase tracking-widest text-white/40">
                      发票类型
                    </p>
                    <p class="text-lg font-bold tracking-tight text-white sm:text-xl">
                      {{ selectedBill.invoiceType ?? '—' }}
                    </p>
                  </div>
                  <div>
                    <p class="mb-2 text-xs font-bold uppercase tracking-widest text-white/40">
                      发票编号
                    </p>
                    <p class="font-mono text-lg font-bold tracking-tight text-white tabular-nums sm:text-xl">
                      {{ selectedBill.invoiceNo ?? '—' }}
                    </p>
                  </div>

                  <div>
                    <p class="mb-2 text-xs font-bold uppercase tracking-widest text-white/40">
                      开票日期
                    </p>
                    <p class="font-mono text-lg font-bold tracking-tight text-white tabular-nums sm:text-xl">
                      {{ selectedBill.invoiceDate ?? '—' }}
                    </p>
                  </div>
                  <div>
                    <p class="mb-2 text-xs font-bold uppercase tracking-widest text-white/40">
                      支付日期
                    </p>
                    <p class="font-mono text-lg font-bold tracking-tight text-white tabular-nums sm:text-xl">
                      {{ selectedBill.paymentDate ?? '—' }}
                    </p>
                  </div>

                  <div>
                    <p class="mb-2 text-xs font-bold uppercase tracking-widest text-white/40">
                      不含税金额
                    </p>
                    <p class="text-lg font-bold tracking-tight text-white tabular-nums sm:text-xl">
                      {{ selectedBill.amountExTax ?? '—' }}
                    </p>
                  </div>
                  <div>
                    <p class="mb-2 text-xs font-bold uppercase tracking-widest text-white/40">
                      含税金额
                    </p>
                    <p class="text-lg font-bold tracking-tight text-white tabular-nums sm:text-xl">
                      {{ selectedBill.amountIncTax ?? '—' }}
                    </p>
                  </div>

                  <div class="sm:col-span-2">
                    <p class="mb-2 text-xs font-bold uppercase tracking-widest text-white/40">
                      备注
                    </p>
                    <p class="text-base font-bold leading-relaxed text-white/95 sm:text-lg">
                      {{ selectedBill.invoiceRemark ?? '—' }}
                    </p>
                  </div>
                </div>
              </div>

              <div class="mt-6 sm:mt-8">
                <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <button
                    type="button"
                    class="flex w-full items-center justify-center gap-2 rounded-full border border-white/25 bg-white/[0.07] py-2.5 text-sm font-bold tracking-[0.2em] text-white/90 shadow-inner transition hover:bg-white/12 hover:text-white sm:w-auto sm:flex-1"
                    @click="onPreviewClick"
                  >
                    <Eye
                      :size="18"
                      class="shrink-0 text-[#9FE870] drop-shadow-[0_0_10px_rgba(159,232,112,0.55)]"
                      stroke-width="2.25"
                      aria-hidden="true"
                    />
                    查看请款文件
                  </button>

                  <button
                    type="button"
                    class="flex w-full items-center justify-center rounded-full bg-[#FFE600] py-2.5 text-sm font-black tracking-[0.2em] text-[#260A2F] shadow-[0_12px_30px_rgba(255,230,0,0.22)] transition hover:bg-[#FFEB69] active:scale-[0.99] sm:w-auto sm:px-10"
                    @click="onConfirmClick"
                  >
                    确认
                  </button>
                </div>
              </div>
            </div>

            <div
              v-else
              key="success"
              class="animate-in zoom-in-95 duration-500 flex min-h-[min(420px,52vh)] flex-col items-center justify-center py-6"
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
                请款信息已成功提交至系统中
              </p>
              <button
                type="button"
                class="rounded-xl border border-white/10 bg-white/10 px-8 py-3 font-bold text-white transition-colors hover:bg-white/20"
                @click="backToBillDetailFromSuccess"
              >
                返回上级页面
              </button>
            </div>
          </Transition>
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

.modal-slide-enter-active,
.modal-slide-leave-active {
  transition:
    opacity 0.22s ease,
    transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
.modal-slide-enter-from {
  opacity: 0;
  transform: translateX(1.25rem);
}
.modal-slide-leave-to {
  opacity: 0;
  transform: translateX(-0.75rem);
}
</style>

