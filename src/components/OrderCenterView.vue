<script setup lang="ts">
import { computed, ref } from 'vue';
import { ArrowLeft, ClipboardList } from 'lucide-vue-next';
import { SIGNED_ORDER_SAMPLES, type OrderCenterItem } from '../data/orderCenterSample';

const ORDER_FILTERS = ['全部订单', '已签约', '服务中', '已完工', '已取消', '已评价'] as const;
type OrderFilter = (typeof ORDER_FILTERS)[number];

defineEmits<{
  back: [];
}>();

const activeFilter = ref<OrderFilter>('已签约');

const visibleOrders = computed(() => {
  if (activeFilter.value === '全部订单' || activeFilter.value === '已签约') {
    return SIGNED_ORDER_SAMPLES;
  }
  return [];
});

const hasOrders = computed(() => visibleOrders.value.length > 0);

function formatAmount(amount: number) {
  return amount.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function handleContractDetail(order: OrderCenterItem) {
  console.info('查看签约详情', order.contractNo);
}

function handleRefundRequest(order: OrderCenterItem) {
  console.info('申请退款', order.orderNo);
}
</script>

<template>
  <div class="relative min-h-screen w-full overflow-x-hidden bg-transparent">
    <div
      class="relative z-10 mx-auto flex min-h-screen w-full max-w-[1600px] animate-in flex-col px-4 py-8 duration-500 fade-in slide-in-from-bottom-4 sm:px-6 md:px-8"
    >
      <header class="flex flex-shrink-0 items-center gap-4">
        <button
          type="button"
          class="rounded-full border border-gray-200 bg-white p-2 transition-colors hover:bg-gray-50"
          @click="$emit('back')"
        >
          <ArrowLeft :size="20" />
        </button>
        <h1 class="text-2xl font-bold text-gray-900">订单中心</h1>
      </header>

      <div
        class="mt-6 flex min-h-[calc(100vh-10rem)] flex-1 flex-col overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm"
      >
        <div class="border-b border-gray-100 px-6 py-5 sm:px-8">
          <div class="flex flex-wrap gap-3">
            <button
              v-for="filter in ORDER_FILTERS"
              :key="filter"
              type="button"
              class="rounded-xl px-6 py-2 text-sm font-medium whitespace-nowrap transition-colors"
              :class="
                activeFilter === filter
                  ? 'bg-[#B0D4C5] text-white'
                  : 'border border-gray-100 bg-white text-gray-500 hover:border-gray-300'
              "
              @click="activeFilter = filter"
            >
              {{ filter }}
            </button>
          </div>
        </div>

        <div
          v-if="hasOrders"
          class="custom-scrollbar flex-1 space-y-4 overflow-y-auto px-6 py-5 sm:px-8 sm:py-6"
        >
          <article
            v-for="order in visibleOrders"
            :key="order.id"
            class="order-center-card"
          >
            <div class="order-center-card__header">
              <div class="flex min-w-0 flex-wrap items-center gap-x-4 gap-y-1">
                <p class="text-sm font-medium text-gray-500">
                  订单编号
                  <span class="ml-1 font-mono text-gray-800">{{ order.orderNo }}</span>
                </p>
                <p class="text-sm font-medium text-gray-500">
                  合同编号
                  <span class="ml-1 font-mono text-gray-800">{{ order.contractNo }}</span>
                </p>
              </div>
              <div class="flex shrink-0 items-center gap-3">
                <span class="order-center-status-badge">{{ order.status }}</span>
                <span class="text-sm text-gray-400">{{ order.signedTime }}</span>
              </div>
            </div>

            <div class="order-center-card__body">
              <div class="flex min-w-0 flex-1 items-center gap-4">
                <div class="order-center-card__thumb shrink-0">
                  <img
                    :src="order.productImage"
                    :alt="order.productTitle"
                    class="h-full w-full object-cover"
                    referrerpolicy="no-referrer"
                  />
                </div>
                <div class="min-w-0 flex-1">
                  <p class="truncate text-base font-bold text-gray-900">{{ order.productTitle }}</p>
                  <p class="mt-1 text-sm text-gray-500">
                    共 {{ order.itemCount }} 件商品 · 下单时间 {{ order.orderTime }}
                  </p>
                  <p class="mt-2 truncate text-sm text-gray-600" :title="order.serviceAddress">
                    服务地址：{{ order.serviceAddress }}
                  </p>
                </div>
                <div class="hidden shrink-0 text-right sm:block">
                  <p class="text-xs text-gray-400">订单金额</p>
                  <p class="mt-1 text-xl font-bold tabular-nums text-[#A1D573]">
                    ¥{{ formatAmount(order.orderAmount) }}
                  </p>
                </div>
              </div>

              <div class="order-center-card__footer">
                <p class="text-lg font-bold tabular-nums text-[#A1D573] sm:hidden">
                  ¥{{ formatAmount(order.orderAmount) }}
                </p>
                <div class="order-center-card__actions">
                  <button
                    type="button"
                    class="order-center-action-btn order-center-action-btn--primary"
                    @click="handleContractDetail(order)"
                  >
                    签约详情
                  </button>
                  <button
                    type="button"
                    class="order-center-action-btn order-center-action-btn--secondary"
                    @click="handleRefundRequest(order)"
                  >
                    申请退款
                  </button>
                </div>
              </div>
            </div>
          </article>
        </div>

        <div v-else class="flex flex-1 flex-col items-center justify-center px-6 py-16 text-gray-400">
          <ClipboardList :size="64" :stroke-width="1" class="mb-4 text-gray-300" />
          <p class="text-lg font-medium text-gray-500">
            暂无{{ activeFilter === '全部订单' ? '' : activeFilter }}订单
          </p>
          <p class="mt-2 text-sm text-gray-400">下单后可在此查看订单进度</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.order-center-card {
  overflow: hidden;
  border-radius: 1rem;
  border: 1px solid #e5e7eb;
  background-color: #fff;
  transition:
    border-color 0.15s ease,
    box-shadow 0.15s ease;
}

.order-center-card:hover {
  border-color: rgba(176, 212, 197, 0.8);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);
}

.order-center-card__header {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  border-bottom: 1px solid #f3f4f6;
  background-color: #fafafa;
  padding: 0.875rem 1.25rem;
}

.order-center-card__body {
  padding: 1.25rem;
}

.order-center-card__thumb {
  width: 5.5rem;
  height: 5.5rem;
  overflow: hidden;
  border-radius: 0.75rem;
  border: 1px solid #f3f4f6;
  background-color: #f9fafb;
}

.order-center-status-badge {
  border-radius: 9999px;
  background-color: rgba(161, 213, 115, 0.18);
  padding: 0.25rem 0.75rem;
  font-size: 0.75rem;
  font-weight: 700;
  color: #163300;
}

.order-center-card__footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #f3f4f6;
}

.order-center-card__actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 0.75rem;
}

.order-center-action-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 6.5rem;
  border-radius: 9999px;
  padding: 0.5rem 1.25rem;
  font-size: 0.875rem;
  font-weight: 700;
  transition:
    background-color 0.15s ease,
    border-color 0.15s ease,
    color 0.15s ease;
}

.order-center-action-btn--primary {
  border: 1px solid rgba(159, 232, 112, 0.45);
  background-color: #9fe870;
  color: #163300;
}

.order-center-action-btn--primary:hover {
  filter: brightness(0.97);
}

.order-center-action-btn--secondary {
  border: 1px solid #e5e7eb;
  background-color: #fff;
  color: #374151;
}

.order-center-action-btn--secondary:hover {
  background-color: #f9fafb;
  border-color: #d1d5db;
}

.order-center-action-btn:focus,
.order-center-action-btn:focus-visible {
  outline: none;
  box-shadow: 0 0 0 2px rgba(159, 232, 112, 0.45);
}

.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.04);
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.12);
  border-radius: 10px;
}
</style>
