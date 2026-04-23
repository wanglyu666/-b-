<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { MoreHorizontal } from 'lucide-vue-next';
import alertIcon from '../../image asset/alert.png';
import TopBarActions from './TopBarActions.vue';
import { contractArchiveList, contractSigningList, billData } from '../data';
import type { ContractArchive } from '../types';

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

function goContractSigning() {
  router.push({ name: 'contract-signing' });
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

      <div class="lg:col-span-4 flex flex-col gap-6 h-[380px]">
          <div
              role="button"
              tabindex="0"
              class="flex-1 flex cursor-pointer flex-col justify-center rounded-3xl border border-gray-100 bg-white/50 p-6 shadow-sm backdrop-blur-sm transition-shadow hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-[#9FE870]/50"
              @click="goContractSigning"
              @keydown.enter.prevent="goContractSigning"
              @keydown.space.prevent="goContractSigning"
          >
              <div class="flex justify-between items-center mb-4">
                  <div class="flex items-center space-x-2">
                      <div class="w-1 h-5 bg-[#FFEB69] rounded-full"></div>
                      <h3 class="font-bold text-lg text-gray-800">合同签约管理</h3>
                  </div>
                  <div class="text-gray-400" @click.stop="goContractSigning">
                      <MoreHorizontal :size="18" class="cursor-pointer hover:text-gray-800 transition-colors" />
                  </div>
              </div>
              <div class="flex-1 flex flex-col justify-center gap-4">
                  <div class="flex justify-between items-center px-2">
                      <span class="text-gray-600 font-medium text-base">待签约</span>
                      <span class="text-3xl font-bold text-[#9BC07C]">{{ contractSigningPendingCount }}</span>
                  </div>
                  <div class="flex justify-between items-center px-2">
                      <span class="text-gray-600 font-medium text-base">已签约</span>
                      <span class="text-3xl font-bold text-[#519B61]">{{ contractSigningSignedCount }}</span>
                  </div>
              </div>
          </div>

          <div class="flex-1 bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col justify-center">
              <div class="flex justify-between items-center mb-4">
                  <div class="flex items-center space-x-2">
                      <div class="w-1 h-5 bg-[#FFEB69] rounded-full"></div>
                      <h3 class="font-bold text-lg text-gray-800">结算管理</h3>
                  </div>
                  <MoreHorizontal :size="18" class="text-gray-400 cursor-pointer" />
              </div>
              <div class="flex-1 flex flex-col justify-center gap-4">
                  <div class="flex justify-between items-center px-2">
                      <span class="text-gray-600 font-medium text-base">待结算</span>
                      <span class="text-3xl font-bold text-[#D2D47B]">8</span>
                  </div>
                  <div class="flex justify-between items-center px-2">
                      <span class="text-gray-600 font-medium text-base">已结算</span>
                      <span class="text-3xl font-bold text-[#B0D4C5]">234</span>
                  </div>
              </div>
          </div>
      </div>

      <div class="lg:col-span-4 bg-white rounded-3xl p-6 shadow-sm border border-gray-100 h-[350px] flex flex-col">
          <div class="flex justify-between items-center mb-6">
              <div class="flex items-center space-x-2">
                  <div class="w-1 h-5 bg-[#FFEB69] rounded-full"></div>
                  <h3 class="font-bold text-lg text-gray-800">违约账单</h3>
              </div>
              <MoreHorizontal :size="18" class="text-gray-400 cursor-pointer" />
          </div>
          <div class="flex-1 flex flex-col items-center justify-between py-1">
              <div class="w-full h-[118px] flex items-center justify-center overflow-visible">
                <img
                  :src="alertIcon"
                  alt=""
                  class="h-68 w-68 object-contain shrink-0 -translate-y-4"
                />
              </div>
              <div class="flex flex-col items-center">
                <span class="text-6xl font-black text-red-500 tracking-tight mb-2">3</span>
                <span class="text-gray-500 font-medium text-lg">当前违约记录</span>
              </div>
          </div>
      </div>

      <div class="lg:col-span-8 bg-white/50 rounded-3xl p-8 shadow-sm border border-gray-100 h-[350px] flex flex-col backdrop-blur-sm">
          <div class="flex justify-between items-center mb-6">
              <div class="flex items-center space-x-2">
                  <div class="w-1 h-5 bg-[#FFEB69] rounded-full"></div>
                  <h3 class="font-bold text-xl text-gray-800">账单管理</h3>
              </div>
              <div class="flex items-center gap-4">
                  <div class="flex space-x-2 text-xs font-bold">
                      <button 
                          @click="activeBillStatus = 'confirm'"
                          :class="['px-4 py-1.5 rounded-full transition-colors flex items-center', activeBillStatus === 'confirm' ? 'border border-transparent bg-gray-100 text-gray-900' : 'border border-gray-200 text-gray-500 hover:text-gray-900 hover:bg-gray-50']"
                      >
                          待确认 <span :class="[activeBillStatus === 'confirm' ? 'text-gray-900' : '', 'ml-1']">5</span>
                      </button>
                      <button 
                          @click="activeBillStatus = 'pay'"
                          :class="['px-4 py-1.5 rounded-full transition-colors flex items-center', activeBillStatus === 'pay' ? 'border border-transparent bg-gray-100 text-gray-900' : 'border border-gray-200 text-gray-500 hover:text-gray-900 hover:bg-gray-50']"
                      >
                          待支付 <span :class="[activeBillStatus === 'pay' ? 'text-gray-900' : '', 'ml-1']">3</span>
                      </button>
                      <button 
                          @click="activeBillStatus = 'paid'"
                          :class="['px-4 py-1.5 rounded-full transition-colors flex items-center', activeBillStatus === 'paid' ? 'border border-transparent bg-gray-100 text-gray-900' : 'border border-gray-200 text-gray-500 hover:text-gray-900 hover:bg-gray-50']"
                      >
                          已支付 <span :class="[activeBillStatus === 'paid' ? 'text-gray-900' : '', 'ml-1']">128</span>
                      </button>
                  </div>
                  <MoreHorizontal :size="18" class="text-gray-400 cursor-pointer hover:text-gray-800 transition-colors" />
              </div>
          </div>
          <div class="flex-1 w-full">
              <table class="w-full text-left">
                  <thead>
                      <tr class="text-gray-400 font-medium text-sm border-b border-gray-100">
                          <th class="pb-3 font-medium pl-2 whitespace-nowrap">订单编号</th>
                          <th class="pb-3 font-medium whitespace-nowrap">项目编号</th>
                          <th class="pb-3 font-medium whitespace-nowrap">项目名称</th>
                          <th class="pb-3 font-medium text-right pr-6 whitespace-nowrap">合同金额</th>
                          <th class="pb-3 font-medium w-12"></th>
                      </tr>
                  </thead>
                  <tbody>
                      <tr v-for="item in filteredBills" :key="item.id" class="group h-1/3 hover:bg-gray-50/70 transition-colors border-b border-gray-50/80 last:border-0 text-sm">
                          <td class="py-4 pl-2 text-gray-600 font-medium whitespace-nowrap">{{ item.no }}</td>
                          <td class="py-4 text-gray-500 whitespace-nowrap">{{ item.prjNo }}</td>
                          <td class="py-4 text-gray-800 font-bold whitespace-nowrap">{{ item.name }}</td>
                          <td class="py-4 text-right pr-6 font-bold text-gray-900 whitespace-nowrap">{{ item.amount }}</td>
                          <td class="py-4 text-right pr-2">
                              <button class="p-1.5 bg-white border border-gray-200 rounded-md shadow-sm opacity-0 group-hover:opacity-100 transition-opacity text-gray-500 hover:text-[#A1D573]">
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
