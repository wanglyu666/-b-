<script setup lang="ts">
import { computed, ref } from 'vue';
import { ChevronLeft, MoreHorizontal, Search, Filter, Download, X } from 'lucide-vue-next';

interface OrderItem {
  id: number;
  orderNo: string;
  orderAmount: number;
  orderTime: string;
  serviceAddress: string;
  status: string;
}

interface OrderLineItem {
  productName: string;
  brand: string;
  model: string;
  quantity: number;
  materialCost: number;
  installCost: number;
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

const selectedOrder = ref<OrderItem | null>(null);

const openOrderDetail = (order: OrderItem) => {
  selectedOrder.value = order;
};

const closeOrderDetail = () => {
  selectedOrder.value = null;
};

const currentOrderLines = computed<OrderLineItem[]>(() => {
  if (!selectedOrder.value) return [];
  const pool: OrderLineItem[][] = [
    [
      { productName: '风机盘管', brand: '格力', model: 'FP-51', quantity: 2, materialCost: 980, installCost: 220 },
      { productName: '温控器', brand: '西门子', model: 'RDF310', quantity: 2, materialCost: 280, installCost: 80 },
      { productName: '保温棉', brand: '欧文斯科宁', model: '25mm', quantity: 10, materialCost: 35, installCost: 12 },
    ],
    [
      { productName: '铜管', brand: '金龙', model: 'TP2-19', quantity: 18, materialCost: 68, installCost: 15 },
      { productName: '冷凝水管', brand: '联塑', model: 'PVC-32', quantity: 24, materialCost: 16, installCost: 6 },
      { productName: '截止阀', brand: '埃美柯', model: 'DN20', quantity: 4, materialCost: 58, installCost: 20 },
    ],
    [
      { productName: '检修口', brand: '龙牌', model: '400x400', quantity: 3, materialCost: 120, installCost: 40 },
      { productName: '接线端子', brand: '德力西', model: 'UK2.5', quantity: 30, materialCost: 6, installCost: 2 },
      { productName: '线管', brand: '中财', model: '20mm', quantity: 40, materialCost: 9, installCost: 3 },
    ],
  ];
  return pool[selectedOrder.value.id % pool.length];
});

const orderSummary = computed(() => {
  const lines = currentOrderLines.value;
  const subtotal = lines.reduce((sum, line) => sum + (line.materialCost + line.installCost) * line.quantity, 0);
  const measureFee = Math.round(subtotal * 0.06 * 100) / 100;
  const taxRate = 0.09;
  const taxAmount = Math.round((subtotal + measureFee) * taxRate * 100) / 100;
  const grandTotal = Math.round((subtotal + measureFee + taxAmount) * 100) / 100;
  return { measureFee, taxRate, taxAmount, grandTotal };
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
        <div class="w-1.5 h-6 bg-[#FFEB69] rounded-full"></div>
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
                <button @click="openOrderDetail(item)" class="p-2 text-gray-400 hover:text-[#A1D573] hover:bg-white/50 rounded-lg transition-all">
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
            :class="['px-3 py-1 rounded-lg border shadow-sm transition-colors tabular-nums', currentPage === page ? 'bg-[#FFEB69] text-[#3A341C] border-[#FFEB69]' : 'bg-white/50 border-white/20 hover:bg-white/80 text-[#3A341C]']"
          >{{ page }}</button>
          <button @click="currentPage < totalPages && currentPage++" :disabled="currentPage >= totalPages" class="px-3 py-1 bg-white/50 rounded-lg border border-white/20 hover:bg-white/80 disabled:opacity-50 transition-colors">下一页</button>
        </div>
      </div>
    </div>

    <!-- 订单详情弹窗 -->
    <Teleport to="body">
      <div
        v-if="selectedOrder"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/40 backdrop-blur-md animate-in fade-in duration-300"
        @click.self="closeOrderDetail"
      >
        <div class="w-full max-w-[1200px] max-h-[90vh] shadow-2xl bg-white/10 backdrop-blur-2xl border border-white/20 rounded-[40px] overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
          <div class="px-8 py-6 border-b border-white/10 flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="w-1.5 h-6 bg-[#FFEB69] rounded-full"></div>
              <h3 class="text-2xl font-bold text-white">查看订单详情</h3>
            </div>
            <button @click="closeOrderDetail" class="p-2 hover:bg-white/10 rounded-full text-white/70 hover:text-white transition-colors">
              <X :size="22" />
            </button>
          </div>

          <div class="p-6 overflow-y-auto space-y-4">
            <div class="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p class="text-xs text-white/40 uppercase tracking-wider mb-1">订单编号</p>
                <p class="text-white font-bold font-mono">{{ selectedOrder.orderNo }}</p>
              </div>
              <div>
                <p class="text-xs text-white/40 uppercase tracking-wider mb-1">订单状态</p>
                <p class="text-white font-bold">{{ selectedOrder.status }}</p>
              </div>
              <div>
                <p class="text-xs text-white/40 uppercase tracking-wider mb-1">下单时间</p>
                <p class="text-white font-bold">{{ selectedOrder.orderTime }}</p>
              </div>
            </div>

            <div class="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5">
              <h4 class="text-white font-bold mb-3">客户信息</h4>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-8 text-sm">
                <p class="text-white/80">企业名称：<span class="text-white">mii</span></p>
                <p class="text-white/80">联系人：<span class="text-white">冷一一</span></p>
                <p class="text-white/80">联系电话：<span class="text-white">18513204939</span></p>
                <p class="text-white/80">公司电话：<span class="text-white">010-65221996</span></p>
                <p class="text-white/80">公司邮箱：<span class="text-white">cole.zhang@sapcem.group</span></p>
                <p class="text-white/80">地址：<span class="text-white">北京市朝阳区</span></p>
              </div>
            </div>

            <div class="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5">
              <h4 class="text-white font-bold mb-3">地址信息</h4>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-8 text-sm mb-4">
                <p class="text-white/80">联系人：<span class="text-white">贺玲</span></p>
                <p class="text-white/80">联系电话：<span class="text-white">18513204939</span></p>
                <p class="text-white/80">所在地区：<span class="text-white">上海市/上海市/静安区</span></p>
                <p class="text-white/80">详细地址：<span class="text-white">{{ selectedOrder.serviceAddress }}</span></p>
              </div>

              <div class="rounded-xl border border-white/15 overflow-hidden">
                <table class="w-full text-sm">
                  <thead class="bg-white/10">
                    <tr class="text-white/80">
                      <th class="px-3 py-2 text-left">序号</th>
                      <th class="px-3 py-2 text-left">产品名称</th>
                      <th class="px-3 py-2 text-left">品牌</th>
                      <th class="px-3 py-2 text-left">型号</th>
                      <th class="px-3 py-2 text-right">数量</th>
                      <th class="px-3 py-2 text-right">材料费</th>
                      <th class="px-3 py-2 text-right">安装费</th>
                      <th class="px-3 py-2 text-right">综合单价</th>
                      <th class="px-3 py-2 text-right">总价</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-white/10">
                    <tr v-for="(line, idx) in currentOrderLines" :key="idx" class="text-white/90">
                      <td class="px-3 py-2">{{ idx + 1 }}</td>
                      <td class="px-3 py-2">{{ line.productName }}</td>
                      <td class="px-3 py-2">{{ line.brand }}</td>
                      <td class="px-3 py-2">{{ line.model }}</td>
                      <td class="px-3 py-2 text-right">{{ line.quantity }}</td>
                      <td class="px-3 py-2 text-right">{{ formatCost(line.materialCost) }}</td>
                      <td class="px-3 py-2 text-right">{{ formatCost(line.installCost) }}</td>
                      <td class="px-3 py-2 text-right">{{ formatCost(line.materialCost + line.installCost) }}</td>
                      <td class="px-3 py-2 text-right">{{ formatCost((line.materialCost + line.installCost) * line.quantity) }}</td>
                    </tr>
                    <tr class="bg-white/5 text-white font-medium">
                      <td class="px-3 py-2" colspan="2">措施费</td>
                      <td class="px-3 py-2 text-right" colspan="2">{{ formatCost(orderSummary.measureFee) }}</td>
                      <td class="px-3 py-2" colspan="2">税率</td>
                      <td class="px-3 py-2 text-right" colspan="1">{{ (orderSummary.taxRate * 100).toFixed(0) }}%</td>
                      <td class="px-3 py-2 text-right" colspan="1">税金 {{ formatCost(orderSummary.taxAmount) }}</td>
                      <td class="px-3 py-2 text-right">合计 {{ formatCost(orderSummary.grandTotal) }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
table {
  border-spacing: 0;
}
</style>
