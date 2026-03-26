<script setup lang="ts">
import { computed, ref } from 'vue';
import { ChevronLeft, MoreHorizontal, Search, Filter, Download } from 'lucide-vue-next';

interface OrderItem {
  id: number;
  orderNo: string;
  orderAmount: number;
  orderTime: string;
  serviceAddress: string;
  status: string;
}

const props = defineProps<{
  data: OrderItem[];
}>();

const emit = defineEmits(['back']);

const searchQuery = ref('');
const currentPage = ref(1);
const itemsPerPage = 6;

const filteredData = computed(() => {
  if (!searchQuery.value) return props.data;
  const q = searchQuery.value.toLowerCase();
  return props.data.filter(item =>
    item.orderNo.toLowerCase().includes(q) ||
    item.serviceAddress.toLowerCase().includes(q)
  );
});

const totalPages = computed(() => Math.max(1, Math.ceil(filteredData.value.length / itemsPerPage)));

const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  return filteredData.value.slice(start, start + itemsPerPage);
});

const formatCost = (val: number) => {
  return val.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};
</script>

<template>
  <div class="p-8 space-y-6 max-w-[1600px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
    <!-- Header -->
    <header class="flex justify-between items-center mb-8">
      <div class="flex items-center space-x-4">
        <button
          @click="emit('back')"
          class="p-2 bg-white/50 backdrop-blur-md rounded-xl border border-white/20 hover:bg-white/80 transition-all active:scale-95"
        >
          <ChevronLeft :size="20" class="text-gray-600" />
        </button>
        <div>
          <h1 class="text-3xl font-bold text-gray-800">订单管理</h1>
          <p class="text-gray-500 mt-1">查看与管理所有订单信息</p>
        </div>
      </div>

      <div class="flex items-center space-x-3">
        <div class="relative">
          <Search :size="18" class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="搜索订单编号/服务地址..."
            class="pl-10 pr-4 py-2 bg-white/50 backdrop-blur-md border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#A1D573] w-64 transition-all"
          />
        </div>
        <button class="p-2 bg-white/50 backdrop-blur-md rounded-xl border border-white/20 hover:bg-white/80 transition-all">
          <Filter :size="20" class="text-gray-600" />
        </button>
        <button class="p-2 bg-white/50 backdrop-blur-md rounded-xl border border-white/20 hover:bg-white/80 transition-all">
          <Download :size="20" class="text-gray-600" />
        </button>
      </div>
    </header>

    <!-- Table Container -->
    <div class="bg-white/40 backdrop-blur-xl rounded-[32px] border border-white/30 shadow-xl overflow-hidden">
      <div class="p-6 border-b border-white/20 flex items-center space-x-3">
        <div class="w-1.5 h-6 bg-[#A1D573] rounded-full"></div>
        <h2 class="text-xl font-bold text-gray-800">订单列表</h2>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="text-gray-500 text-sm font-medium border-b border-white/10">
              <th class="py-5 px-6">订单编号</th>
              <th class="py-5 px-6">订单金额</th>
              <th class="py-5 px-6">下单时间</th>
              <th class="py-5 px-6">服务地址</th>
              <th class="py-5 px-6">订单状态</th>
              <th class="py-5 px-6 w-16"></th>
            </tr>
          </thead>
          <tbody class="divide-y divide-white/10">
            <tr
              v-for="item in paginatedData"
              :key="item.id"
              class="group hover:bg-white/30 transition-colors"
            >
              <td class="py-5 px-6 font-medium text-gray-800 font-mono">{{ item.orderNo }}</td>
              <td class="py-5 px-6 text-gray-700 font-mono">{{ formatCost(item.orderAmount) }}</td>
              <td class="py-5 px-6 text-gray-600">{{ item.orderTime }}</td>
              <td class="py-5 px-6 text-gray-500 max-w-md truncate" :title="item.serviceAddress">{{ item.serviceAddress }}</td>
              <td class="py-5 px-6">
                <span
                  class="px-3 py-1 rounded-full text-xs font-bold"
                  :class="{
                    'bg-[#A1D573]/20 text-[#163300]': item.status === '已完成',
                    'bg-orange-500/20 text-orange-600': item.status === '待确认',
                    'bg-sky-500/20 text-sky-600': item.status === '已发出',
                    'bg-purple-500/20 text-purple-600': item.status === '待发货',
                    'bg-red-500/20 text-red-600': item.status === '已取消',
                  }"
                >{{ item.status }}</span>
              </td>
              <td class="py-5 px-6">
                <button class="p-2 text-gray-400 hover:text-[#A1D573] hover:bg-white/50 rounded-lg transition-all">
                  <MoreHorizontal :size="20" />
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="p-6 border-t border-white/10 flex justify-between items-center text-sm text-gray-500">
        <p>共 {{ filteredData.length }} 条，每页 {{ itemsPerPage }} 条</p>
        <div class="flex space-x-2">
          <button @click="currentPage > 1 && currentPage--" :disabled="currentPage <= 1" class="px-3 py-1 bg-white/50 rounded-lg border border-white/20 hover:bg-white/80 disabled:opacity-50 transition-colors">上一页</button>
          <button
            v-for="page in totalPages" :key="page"
            @click="currentPage = page"
            :class="['px-3 py-1 rounded-lg border shadow-sm transition-colors', currentPage === page ? 'bg-[#A1D573] text-white border-[#A1D573]' : 'bg-white/50 border-white/20 hover:bg-white/80']"
          >{{ page }}</button>
          <button @click="currentPage < totalPages && currentPage++" :disabled="currentPage >= totalPages" class="px-3 py-1 bg-white/50 rounded-lg border border-white/20 hover:bg-white/80 disabled:opacity-50 transition-colors">下一页</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
table {
  border-spacing: 0;
}
</style>
