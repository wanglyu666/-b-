<script setup lang="ts">
import { computed, ref, onMounted, watch } from 'vue';
import { ChevronLeft, MoreHorizontal, Search, X } from 'lucide-vue-next';
import { fetchOrders, fetchOrderDetail, type OrderDetail } from '../api/operationApi';
import type { OrderItem } from '../types/app-domain';

interface OrderLineItem {
  productName: string;
  brand: string;
  model: string;
  quantity: number;
  salePrice: number;
  payPrice: number;
}

const emit = defineEmits(['back']);

const searchQuery = ref('');
const currentPage = ref(1);
const itemsPerPage = 6;
const totalItems = ref(0);
const isLoading = ref(false);

/** 订单列表数据 */
const orderData = ref<OrderItem[]>([]);

/** 加载订单列表 */
async function loadOrders() {
  isLoading.value = true;
  try {
    const result = await fetchOrders(
      currentPage.value,
      itemsPerPage,
      searchQuery.value || undefined
    );
    orderData.value = result.list;
    totalItems.value = result.total;
  } catch (error) {
    console.error('加载订单列表失败:', error);
  } finally {
    isLoading.value = false;
  }
}

onMounted(() => {
  loadOrders();
});

watch(currentPage, () => {
  loadOrders();
});

/** 搜索防抖 */
let searchTimer: ReturnType<typeof setTimeout> | null = null;
watch(searchQuery, () => {
  if (searchTimer) clearTimeout(searchTimer);
  searchTimer = setTimeout(() => {
    currentPage.value = 1;
    loadOrders();
  }, 300);
});

const paginatedData = computed(() => orderData.value);

const totalPages = computed(() => Math.max(1, Math.ceil(totalItems.value / itemsPerPage)));

const selectedOrder = ref<OrderItem | null>(null);
const orderDetail = ref<OrderDetail | null>(null);
const detailLoading = ref(false);

const openOrderDetail = async (order: OrderItem) => {
  selectedOrder.value = order;
  detailLoading.value = true;
  try {
    orderDetail.value = await fetchOrderDetail(order.id);
  } catch (error) {
    console.error('获取订单详情失败:', error);
  } finally {
    detailLoading.value = false;
  }
};

const closeOrderDetail = () => {
  selectedOrder.value = null;
  orderDetail.value = null;
};

const currentOrderLines = computed<OrderLineItem[]>(() => {
  return orderDetail.value?.opOrderSubDetailList || [];
});

const orderSummary = computed(() => {
  const lines = currentOrderLines.value;
  const subtotal = lines.reduce((sum, line) => sum + line.payPrice, 0);
  const measureFee = Math.round(subtotal * 0.06 * 100) / 100;
  const taxRate = 0.09;
  const taxAmount = Math.round((subtotal + measureFee) * taxRate * 100) / 100;
  const grandTotal = Math.round((subtotal + measureFee + taxAmount) * 100) / 100;
  return { measureFee, taxRate, taxAmount, grandTotal };
});

const formatCost = (val: number) => {
  return val.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const exportOrderDetail = () => {
  if (!selectedOrder.value) return;
  // 预留导出逻辑
};
</script>

<template>
  <div class="p-8 max-w-[1600px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
    <!-- Header -->
    <header class="flex justify-between items-center flex-shrink-0">
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

      <div class="relative">
        <Search :size="18" class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="搜索订单编号/服务地址..."
          class="pl-10 pr-4 py-2 bg-white/50 backdrop-blur-md border border-white/20 rounded-xl w-64 transition-all focus:outline-none focus:ring-0 focus:border-white/20 focus-visible:ring-0"
        />
      </div>
    </header>

    <!-- Table Container -->
    <div class="mt-8 md:mt-12 bg-white/40 backdrop-blur-xl rounded-[32px] border border-white/30 shadow-xl overflow-hidden">
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
                    'bg-orange-500/20 text-orange-600': item.status === '待确认',
                    'bg-sky-500/20 text-sky-600': item.status === '待支付',
                    'bg-purple-500/20 text-purple-600': item.status === '待签约',
                    'bg-blue-500/20 text-blue-600': item.status === '已支付',
                    'bg-[#A1D573]/20 text-[#163300]': item.status === '已签约',
                    'bg-emerald-500/20 text-emerald-600': item.status === '服务中',
                    'bg-teal-500/20 text-teal-600': item.status === '已完工',
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
        <p>共 {{ totalItems }} 条，每页 {{ itemsPerPage }} 条</p>
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
        <div class="flex w-full max-w-[1200px] min-h-[780px] flex-col overflow-hidden rounded-[40px] border border-white/20 bg-white/10 shadow-2xl backdrop-blur-2xl animate-in zoom-in-95 duration-300">
          <div class="flex shrink-0 items-center justify-between border-b border-white/10 px-8 py-6">
            <div class="flex items-center gap-3">
              <div class="h-6 w-1.5 rounded-full bg-[#FFEB69]"></div>
              <h3 class="text-2xl font-bold text-white">查看订单详情</h3>
            </div>
            <button @click="closeOrderDetail" class="rounded-full p-2 text-white/70 transition-colors hover:bg-white/10 hover:text-white">
              <X :size="22" />
            </button>
          </div>

          <div class="flex-1 space-y-4 p-6">
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
              <div v-if="detailLoading" class="text-white/50 text-sm">加载中...</div>
              <div v-else-if="orderDetail" class="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-8 text-sm">
                <p class="text-white/80">企业名称：<span class="text-white">{{ orderDetail.busCustomer?.companyName || orderDetail.customerName || '-' }}</span></p>
                <p class="text-white/80">联系人：<span class="text-white">{{ orderDetail.busCustomer?.baileeName || orderDetail.customerContactsName || '-' }}</span></p>
                <p class="text-white/80">联系电话：<span class="text-white">{{ orderDetail.busCustomer?.baileePhone || orderDetail.customerContactsPhone || '-' }}</span></p>
                <p class="text-white/80">公司电话：<span class="text-white">{{ orderDetail.busCustomer?.registerPhone || '-' }}</span></p>
                <p class="text-white/80">公司邮箱：<span class="text-white">{{ orderDetail.busCustomer?.contactsEmail || '-' }}</span></p>
                <p class="text-white/80">地址：<span class="text-white">{{ orderDetail.busCustomer?.registerAddress || orderDetail.customerAddress || '-' }}</span></p>
              </div>
              <div v-else class="text-white/50 text-sm">暂无客户信息</div>
            </div>

            <div class="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5">
              <h4 class="text-white font-bold mb-3">地址信息</h4>
              <div v-if="detailLoading" class="text-white/50 text-sm">加载中...</div>
              <div v-else-if="orderDetail" class="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-8 text-sm mb-4">
                <p class="text-white/80">联系人：<span class="text-white">{{ orderDetail.customerContactsName || '-' }}</span></p>
                <p class="text-white/80">联系电话：<span class="text-white">{{ orderDetail.customerContactsPhone || '-' }}</span></p>
                <p class="text-white/80">所在地区：<span class="text-white">-</span></p>
                <p class="text-white/80">详细地址：<span class="text-white">{{ orderDetail.customerAddress || selectedOrder?.serviceAddress || '-' }}</span></p>
              </div>
              <div v-else class="text-white/50 text-sm">暂无地址信息</div>

              <div class="rounded-xl border border-white/15 overflow-hidden">
                <table class="w-full text-sm">
                  <thead class="bg-white/10">
                    <tr class="text-white/80">
                      <th class="px-3 py-2 text-left">序号</th>
                      <th class="px-3 py-2 text-left">产品名称</th>
                      <th class="px-3 py-2 text-left">品牌</th>
                      <th class="px-3 py-2 text-left">型号</th>
                      <th class="px-3 py-2 text-right">数量</th>
                      <th class="px-3 py-2 text-right">单价</th>
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
                      <td class="px-3 py-2 text-right">{{ formatCost(line.salePrice) }}</td>
                      <td class="px-3 py-2 text-right">{{ formatCost(line.payPrice) }}</td>
                    </tr>
                    <tr v-if="currentOrderLines.length > 0" class="bg-white/5 text-white font-medium">
                      <td class="px-3 py-2" colspan="2">措施费</td>
                      <td class="px-3 py-2 text-right" colspan="2">{{ formatCost(orderSummary.measureFee) }}</td>
                      <td class="px-3 py-2" colspan="2">税率</td>
                      <td class="px-3 py-2 text-right">{{ (orderSummary.taxRate * 100).toFixed(0) }}%</td>
                    </tr>
                    <tr v-if="currentOrderLines.length > 0" class="bg-white/5 text-white font-medium">
                      <td class="px-3 py-2" colspan="5">税金</td>
                      <td class="px-3 py-2 text-right" colspan="2">{{ formatCost(orderSummary.taxAmount) }}</td>
                    </tr>
                    <tr v-if="currentOrderLines.length > 0" class="bg-white/10 text-white font-bold">
                      <td class="px-3 py-2" colspan="5">合计</td>
                      <td class="px-3 py-2 text-right" colspan="2">{{ formatCost(orderSummary.grandTotal) }}</td>
                    </tr>
                    <tr v-if="!detailLoading && currentOrderLines.length === 0" class="text-white/50">
                      <td class="px-3 py-2 text-center" colspan="7">暂无订单行项目</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div class="flex shrink-0 justify-end px-8 pb-8 pt-4">
            <button
              type="button"
              class="rounded-full border border-[#FFE600]/30 bg-[#FFE600] px-10 py-2.5 text-sm font-bold text-[#260A2F] shadow-[0_8px_24px_rgba(255,230,0,0.25)] transition hover:bg-[#FFEB69] active:scale-[0.98]"
              @click="exportOrderDetail"
            >
              导出
            </button>
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
