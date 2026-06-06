<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { MoreHorizontal } from 'lucide-vue-next';
import penImg from '../../image asset/pen.png';
import noteImg from '../../image asset/note.png';
import TopBarActions from './TopBarActions.vue';
import { contractArchiveList, contractSigningList, billData, settlementData } from '../data';
import type { Bill, ContractArchive, ContractSigningStatus, SettlementStatus } from '../types';

const router = useRouter();

/** 合同档案卡片：按签订日期最新 4 条（与档案页同源数据） */
const contractHomePreview = computed(() =>
  [...contractArchiveList]
    .sort((a, b) => b.signedDate.localeCompare(a.signedDate))
    .slice(0, 4),
);

function formatAmountPreview(amount: string): string {
  const t = amount.trim();
  if (t.startsWith('¥')) return t;
  const n = Number(t.replace(/,/g, ''));
  if (!Number.isFinite(n)) return amount;
  return `¥${n.toLocaleString('zh-CN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

function goContractArchives() {
  router.push({ name: 'contract-archives' });
}

function goContractArchivesWithDetail(row: ContractArchive) {
  router.push({
    name: 'contract-archives',
    query: { contract: row.id },
  });
}

function goContractSigning(status: ContractSigningStatus = 'pending') {
  router.push({ name: 'contract-signing', query: { status } });
}

function goBillManagement(status?: Bill['status']) {
  router.push({
    name: 'bill-management',
    query: status ? { status } : undefined,
  });
}

function goBillManagementWithBill(bill: Bill) {
  router.push({
    name: 'bill-management',
    query: { bill: String(bill.id), status: bill.status },
  });
}

function goSettlementManagement(status: SettlementStatus = 'pending_apply') {
  router.push({ name: 'settlement-management', query: { status } });
}

const contractSigningPendingCount = computed(
  () => contractSigningList.filter((r) => r.status === 'pending').length,
);
const contractSigningSignedCount = computed(
  () => contractSigningList.filter((r) => r.status === 'signed').length,
);

const activeBillStatus = ref<'confirm' | 'pay' | 'paid'>('confirm');

const filteredBills = computed(() => {
  return billData.filter(bill => bill.status === activeBillStatus.value).slice(0, 3);
});

function getBillBatchLabel(id: number): string {
  return `第${id}批`;
}

/** 结算管理首页统计（与结算管理页同源数据） */
const settlementPendingApplyCount = computed(
  () => settlementData.filter((r) => r.status === 'pending_apply').length,
);
const settlementUnderReviewCount = computed(
  () => settlementData.filter((r) => r.status === 'under_review').length,
);
const settlementPendingUploadCount = computed(
  () => settlementData.filter((r) => r.status === 'pending_upload').length,
);
const settlementSettledCount = computed(
  () => settlementData.filter((r) => r.status === 'settled').length,
);
</script>

<template>
  <div class="min-h-screen bg-transparent relative overflow-x-hidden">
    <!-- Content Area -->
    <div class="relative z-10 p-8 space-y-6 max-w-[1600px] mx-auto animate-in fade-in duration-500">
      <header class="flex justify-between items-center mb-8">
      <div>
        <h1 class="text-3xl font-bold text-gray-800">合同与结算</h1>
        <p class="text-gray-500 mt-1">管理所有合同文档及相关账单结算</p>
      </div>
      <TopBarActions :isShop="false" />
    </header>

    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <div
          role="button"
          tabindex="0"
          class="lg:col-span-8 flex h-[380px] cursor-pointer flex-col rounded-3xl border border-gray-100 bg-white/50 p-8 shadow-sm backdrop-blur-sm transition-shadow hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-[#9FE870]/50"
          @click="goContractArchives"
          @keydown.enter.prevent="goContractArchives"
          @keydown.space.prevent="goContractArchives"
      >
          <div class="flex justify-between items-center mb-6">
              <div class="flex items-center space-x-2">
                  <div class="w-1 h-5 bg-[#FFEB69] rounded-full"></div>
                  <h3 class="font-bold text-xl text-gray-800">合同档案</h3>
              </div>
              <div class="text-gray-400" @click.stop="goContractArchives">
                  <MoreHorizontal :size="18" class="cursor-pointer hover:text-gray-800 transition-colors" />
              </div>
          </div>
          <div class="flex-1 w-full min-h-0">
              <table class="w-full h-full text-left">
                  <thead>
                      <tr class="text-gray-400 font-medium text-sm border-b border-gray-100">
                          <th class="pb-4 font-medium pl-2 whitespace-nowrap">合同编号</th>
                          <th class="pb-4 font-medium whitespace-nowrap">合同类型</th>
                          <th class="pb-4 font-medium whitespace-nowrap">合同金额</th>
                          <th class="pb-4 font-medium whitespace-nowrap">签订日期</th>
                          <th class="pb-4 font-medium w-12"></th>
                      </tr>
                  </thead>
                  <tbody>
                      <tr v-for="item in contractHomePreview" :key="item.id" class="group hover:bg-gray-50/70 transition-colors border-b border-gray-50/80 last:border-0 text-sm">
                          <td class="py-4 pl-2 text-gray-600 font-medium whitespace-nowrap">{{ item.no }}</td>
                          <td class="py-4 text-gray-900 font-bold whitespace-nowrap">
                              {{ item.contractType }}
                          </td>
                          <td class="py-4 text-gray-500 whitespace-nowrap tabular-nums">
                              {{ formatAmountPreview(item.amount) }}
                          </td>
                          <td class="py-4 text-gray-500 whitespace-nowrap">{{ item.signedDate }}</td>
                          <td class="py-4 text-right pr-2">
                              <button
                                  type="button"
                                  class="p-1.5 bg-white border border-gray-200 rounded-md shadow-sm opacity-0 group-hover:opacity-100 transition-opacity text-gray-500 hover:text-[#A1D573]"
                                  @click.stop="goContractArchivesWithDetail(item)"
                              >
                                  <MoreHorizontal :size="16" />
                              </button>
                          </td>
                      </tr>
                  </tbody>
              </table>
          </div>
      </div>

      <div class="lg:col-span-4 h-[380px]">
          <div
              role="button"
              tabindex="0"
              class="flex h-full cursor-pointer flex-col rounded-3xl border border-gray-100 bg-white p-6 shadow-sm transition-shadow hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-[#9FE870]/50"
              @click="goContractSigning"
              @keydown.enter.prevent="goContractSigning"
              @keydown.space.prevent="goContractSigning"
          >
              <div class="flex shrink-0 justify-between items-center">
                  <div class="flex items-center space-x-2">
                      <div class="w-1 h-5 bg-[#FFEB69] rounded-full"></div>
                      <h3 class="font-bold text-lg text-gray-800">合同签约管理</h3>
                  </div>
                  <div class="text-gray-400" @click.stop="goContractSigning">
                      <MoreHorizontal :size="18" class="cursor-pointer hover:text-gray-800 transition-colors" />
                  </div>
              </div>
              <div class="mt-3 min-h-0 flex-1 flex items-center justify-center overflow-visible">
                  <img
                      :src="penImg"
                      alt=""
                      class="max-h-full max-w-full h-auto w-auto scale-125 object-contain"
                  />
              </div>
              <div class="mt-4 shrink-0 flex flex-col justify-end gap-4 border-t border-gray-100/80 pt-4">
                  <div
                      role="button"
                      tabindex="0"
                      class="flex cursor-pointer items-center justify-between rounded-xl px-2 py-1 transition-colors hover:bg-gray-50"
                      @click.stop="goContractSigning('pending')"
                      @keydown.enter.prevent="goContractSigning('pending')"
                      @keydown.space.prevent="goContractSigning('pending')"
                  >
                      <span class="text-gray-600 font-medium text-base">待签约</span>
                      <span class="text-3xl font-bold text-[#9BC07C]">{{ contractSigningPendingCount }}</span>
                  </div>
                  <div
                      role="button"
                      tabindex="0"
                      class="flex cursor-pointer items-center justify-between rounded-xl px-2 py-1 transition-colors hover:bg-gray-50"
                      @click.stop="goContractSigning('signed')"
                      @keydown.enter.prevent="goContractSigning('signed')"
                      @keydown.space.prevent="goContractSigning('signed')"
                  >
                      <span class="text-gray-600 font-medium text-base">已签约</span>
                      <span class="text-3xl font-bold text-[#519B61]">{{ contractSigningSignedCount }}</span>
                  </div>
              </div>
          </div>
      </div>

      <div class="lg:col-span-4 flex h-[350px] flex-col rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
          <div class="flex shrink-0 justify-between items-center">
              <div class="flex items-center space-x-2">
                  <div class="w-1 h-5 bg-[#FFEB69] rounded-full"></div>
                  <h3 class="font-bold text-lg text-gray-800">结算管理</h3>
              </div>
              <button
                  type="button"
                  class="text-gray-400 transition-colors hover:text-gray-800"
                  aria-label="进入结算管理"
                  @click="goSettlementManagement()"
              >
                  <MoreHorizontal :size="18" />
              </button>
          </div>
          <div class="mt-3 min-h-0 flex-1 flex items-center justify-center overflow-visible">
              <img
                  :src="noteImg"
                  alt=""
                  class="max-h-full max-w-full h-auto w-auto scale-125 object-contain"
              />
          </div>
          <div class="relative mt-4 shrink-0 border-t border-gray-100/80 pt-4">
              <div
                  class="pointer-events-none absolute bottom-0 left-1/2 top-3 w-px -translate-x-1/2 bg-gray-100/80"
                  aria-hidden="true"
              />
              <div class="grid grid-cols-2 gap-x-4 gap-y-3">
              <div
                  role="button"
                  tabindex="0"
                  class="flex cursor-pointer items-center justify-between gap-1 rounded-xl pr-2 pl-1 py-0.5 transition-colors hover:bg-gray-50"
                  @click="goSettlementManagement('pending_apply')"
                  @keydown.enter.prevent="goSettlementManagement('pending_apply')"
                  @keydown.space.prevent="goSettlementManagement('pending_apply')"
              >
                  <span class="text-base font-medium text-gray-600">待申请</span>
                  <span class="text-3xl font-bold tabular-nums text-[#D2D47B]">{{ settlementPendingApplyCount }}</span>
              </div>
              <div
                  role="button"
                  tabindex="0"
                  class="flex cursor-pointer items-center justify-between gap-1 rounded-xl pl-2 pr-1 py-0.5 transition-colors hover:bg-gray-50"
                  @click="goSettlementManagement('under_review')"
                  @keydown.enter.prevent="goSettlementManagement('under_review')"
                  @keydown.space.prevent="goSettlementManagement('under_review')"
              >
                  <span class="text-base font-medium text-gray-600">结算审核中</span>
                  <span class="text-3xl font-bold tabular-nums text-[#C4B86A]">{{ settlementUnderReviewCount }}</span>
              </div>
              <div
                  role="button"
                  tabindex="0"
                  class="flex cursor-pointer items-center justify-between gap-1 rounded-xl pr-2 pl-1 py-0.5 transition-colors hover:bg-gray-50"
                  @click="goSettlementManagement('pending_upload')"
                  @keydown.enter.prevent="goSettlementManagement('pending_upload')"
                  @keydown.space.prevent="goSettlementManagement('pending_upload')"
              >
                  <span class="text-base font-medium text-gray-600">待上传结算单</span>
                  <span class="text-3xl font-bold tabular-nums text-[#9BC07C]">{{ settlementPendingUploadCount }}</span>
              </div>
              <div
                  role="button"
                  tabindex="0"
                  class="flex cursor-pointer items-center justify-between gap-1 rounded-xl pl-2 pr-1 py-0.5 transition-colors hover:bg-gray-50"
                  @click="goSettlementManagement('settled')"
                  @keydown.enter.prevent="goSettlementManagement('settled')"
                  @keydown.space.prevent="goSettlementManagement('settled')"
              >
                  <span class="text-base font-medium text-gray-600">已结算</span>
                  <span class="text-3xl font-bold tabular-nums text-[#B0D4C5]">{{ settlementSettledCount }}</span>
              </div>
              </div>
          </div>
      </div>

      <div
          role="button"
          tabindex="0"
          class="lg:col-span-8 bg-white/50 rounded-3xl p-8 shadow-sm border border-gray-100 h-[350px] flex flex-col backdrop-blur-sm cursor-pointer transition-shadow hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-[#9FE870]/50"
          @click="goBillManagement"
          @keydown.enter.prevent="goBillManagement"
          @keydown.space.prevent="goBillManagement"
      >
          <div class="flex justify-between items-center mb-6">
              <div class="flex items-center space-x-2">
                  <div class="w-1 h-5 bg-[#FFEB69] rounded-full"></div>
                  <h3 class="font-bold text-xl text-gray-800">账单管理</h3>
              </div>
              <div class="flex items-center gap-4">
                  <div class="flex space-x-2 text-xs font-bold">
                      <button 
                          :class="['px-4 py-1.5 rounded-full transition-colors flex items-center', activeBillStatus === 'confirm' ? 'border border-transparent bg-gray-100 text-gray-900' : 'border border-gray-200 text-gray-500 hover:text-gray-900 hover:bg-gray-50']"
                          @click.stop="activeBillStatus = 'confirm'"
                      >
                          待确认 <span :class="[activeBillStatus === 'confirm' ? 'text-gray-900' : '', 'ml-1']">5</span>
                      </button>
                      <button 
                          @click="activeBillStatus = 'pay'"
                          :class="['px-4 py-1.5 rounded-full transition-colors flex items-center', activeBillStatus === 'pay' ? 'border border-transparent bg-gray-100 text-gray-900' : 'border border-gray-200 text-gray-500 hover:text-gray-900 hover:bg-gray-50']"
                          @click.stop
                      >
                          待支付 <span :class="[activeBillStatus === 'pay' ? 'text-gray-900' : '', 'ml-1']">3</span>
                      </button>
                      <button 
                          @click="activeBillStatus = 'paid'"
                          :class="['px-4 py-1.5 rounded-full transition-colors flex items-center', activeBillStatus === 'paid' ? 'border border-transparent bg-gray-100 text-gray-900' : 'border border-gray-200 text-gray-500 hover:text-gray-900 hover:bg-gray-50']"
                          @click.stop
                      >
                          已支付 <span :class="[activeBillStatus === 'paid' ? 'text-gray-900' : '', 'ml-1']">128</span>
                      </button>
                  </div>
                  <MoreHorizontal :size="18" class="text-gray-400 cursor-pointer hover:text-gray-800 transition-colors" @click.stop />
              </div>
          </div>
          <div class="flex-1 w-full">
              <table class="w-full text-left">
                  <thead>
                      <tr class="text-gray-400 font-medium text-sm border-b border-gray-100">
                          <th class="pb-3 font-medium pl-2 whitespace-nowrap w-[24%]">订单编号</th>
                          <th class="pb-3 font-medium whitespace-nowrap w-[34%]">项目名称</th>
                          <th class="pb-3 font-medium whitespace-nowrap w-[18%]">账单批次</th>
                          <th class="pb-3 font-medium text-right pr-6 whitespace-nowrap w-[18%]">账单金额</th>
                          <th class="pb-3 font-medium w-12"></th>
                      </tr>
                  </thead>
                  <tbody>
                      <tr v-for="item in filteredBills" :key="item.id" class="group h-1/3 hover:bg-gray-50/70 transition-colors border-b border-gray-50/80 last:border-0 text-sm">
                          <td class="py-4 pl-2 text-gray-500 whitespace-nowrap">{{ item.no }}</td>
                          <td class="py-4 text-gray-800 font-bold whitespace-nowrap">{{ item.name }}</td>
                          <td class="py-4 text-gray-500 whitespace-nowrap">{{ getBillBatchLabel(item.id) }}</td>
                          <td class="py-4 text-right pr-6 font-bold text-gray-900 whitespace-nowrap tabular-nums">{{ item.amount }}</td>
                          <td class="py-4 text-right pr-2">
                              <button
                                  type="button"
                                  class="p-1.5 bg-white border border-gray-200 rounded-md shadow-sm opacity-0 group-hover:opacity-100 transition-opacity text-gray-500 hover:text-[#A1D573]"
                                  aria-label="查看账单详情"
                                  @click.stop="goBillManagementWithBill(item)"
                              >
                                  <MoreHorizontal :size="16" />
                              </button>
                          </td>
                      </tr>
                  </tbody>
              </table>
          </div>
      </div>

    </div>
  </div>
</div>
</template>
