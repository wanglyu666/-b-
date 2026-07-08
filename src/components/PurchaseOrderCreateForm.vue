<script setup lang="ts">
import { computed, ref } from 'vue';
import { Calendar } from 'lucide-vue-next';
import type { PurchaseOrderDraft } from './CartCheckoutForm.vue';
import ServiceProviderAddressPicker from './ServiceProviderAddressPicker.vue';

const props = defineProps<{
  draft: PurchaseOrderDraft;
}>();

const emit = defineEmits<{
  preview: [];
  confirm: [];
}>();

const PAYMENT_TERM_OPTIONS = ['7', '15', '30'] as const;

const SUPPLIER_COMPANY = '都这么便利科技（北京）有限公司';
const SUPPLIER_ADDRESS = '北京市朝阳区望京街10号望京SOHO T3';
const SUPPLIER_CONTACT = '王海龙';
const SUPPLIER_PHONE = '18201357101';

const TABLE_COLUMNS = ['产品名称', '品牌', '型号', '颜色', '单价', '数量', '总价'] as const;

const confirmNo = ref('');
const orderNo = ref('');
const orderAmount = ref('');
const paymentTerm = ref('');
const serviceTime = ref('');
const estimatedDuration = ref('');
const serviceProviderAddress = ref('');
const contactPhone = ref('');
const contactName = ref('');

const purchaserCompany = ref('');
const purchaserAddress = ref('');
const purchaserContact = ref('');
const purchaserPhone = ref('');

const otherRemarks = ref('');

const serviceTimePickerRef = ref<HTMLInputElement | null>(null);

function formatDateSlash(isoDate: string) {
  if (!isoDate?.trim()) return '';
  const m = isoDate.trim().match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!m) return isoDate;
  return `${m[1]}/${m[2]}/${m[3]}`;
}

function openServiceTimePicker() {
  const el = serviceTimePickerRef.value;
  if (!el) return;
  try {
    el.showPicker?.();
  } catch {
    /* 部分浏览器不支持 showPicker */
  }
  el.focus();
}

const productRows = computed(() =>
  props.draft.cartItems.map((item) => ({
    id: item.id,
    name: item.name,
    brand: item.category,
    model: '/',
    color: '无',
    unitPrice: item.price,
    quantity: item.quantity,
    total: item.price * item.quantity,
  })),
);

const inputClass =
  'h-10 w-full min-w-0 flex-1 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-800 placeholder:text-gray-400 focus:border-[#FFEB69] focus:outline-none focus:ring-2 focus:ring-[#FFEB69]/30';

const readonlyClass =
  'h-10 w-full min-w-0 flex-1 cursor-default rounded-lg border border-gray-200 bg-gray-50 px-3 text-sm text-gray-800 focus:outline-none';
</script>

<template>
  <div class="flex min-h-0 flex-1 flex-col">
    <div class="custom-scrollbar flex-1 overflow-y-auto px-6 py-8 sm:px-10 sm:py-10">
      <h1 class="mb-8 text-center text-xl font-bold tracking-tight text-gray-800 sm:text-2xl">
        产品采购单
      </h1>

      <section class="mb-8">
        <h2 class="mb-4 text-base font-bold text-gray-900">产品服务信息</h2>
        <div class="grid grid-cols-1 gap-x-12 gap-y-5 lg:grid-cols-2">
          <div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-5">
            <label class="shrink-0 text-sm font-medium text-gray-700 sm:w-28 sm:text-right" for="po-confirm-no">
              确认单编号
            </label>
            <input id="po-confirm-no" v-model="confirmNo" type="text" readonly :class="readonlyClass" />
          </div>
          <div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-5">
            <label class="shrink-0 text-sm font-medium text-gray-700 sm:w-28 sm:text-right" for="po-order-no">
              订单编号
            </label>
            <input id="po-order-no" v-model="orderNo" type="text" readonly :class="readonlyClass" />
          </div>
          <div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-5">
            <label class="shrink-0 text-sm font-medium text-gray-700 sm:w-28 sm:text-right" for="po-order-amount">
              订单金额
            </label>
            <input id="po-order-amount" v-model="orderAmount" type="text" readonly :class="readonlyClass" />
          </div>
          <div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-5">
            <label class="shrink-0 text-sm font-medium text-gray-700 sm:w-28 sm:text-right" for="po-payment-term">
              支付期限
            </label>
            <select id="po-payment-term" v-model="paymentTerm" :class="inputClass">
              <option value="" disabled hidden>请选择</option>
              <option v-for="term in PAYMENT_TERM_OPTIONS" :key="term" :value="term">
                {{ term }}
              </option>
            </select>
          </div>
          <div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-5">
            <label class="shrink-0 text-sm font-medium text-gray-700 sm:w-28 sm:text-right" for="po-service-time">
              开始履约时间
            </label>
            <div class="relative min-w-0 flex-1">
              <input
                id="po-service-time"
                ref="serviceTimePickerRef"
                v-model="serviceTime"
                type="date"
                tabindex="-1"
                aria-hidden="true"
                class="absolute m-0 h-px w-px overflow-hidden border-0 p-0 opacity-0"
              />
              <Calendar
                :size="16"
                class="pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                readonly
                :value="formatDateSlash(serviceTime)"
                placeholder=""
                class="relative z-[1] h-10 w-full cursor-pointer rounded-lg border border-gray-200 bg-white py-2 pl-10 pr-4 text-sm text-gray-700 placeholder:text-gray-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#FFEB69] transition-all"
                @click="openServiceTimePicker"
              />
            </div>
          </div>
          <div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-5">
            <label class="shrink-0 text-sm font-medium text-gray-700 sm:w-28 sm:text-right" for="po-duration">
              预估工期
            </label>
            <input id="po-duration" v-model="estimatedDuration" type="text" :class="inputClass" />
          </div>
          <div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-5 lg:col-span-2">
            <label class="shrink-0 text-sm font-medium text-gray-700 sm:w-28 sm:text-right" for="po-service-address">
              服务方地址
            </label>
            <ServiceProviderAddressPicker
              v-model="serviceProviderAddress"
              input-id="po-service-address"
            />
          </div>
          <div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-5">
            <label class="shrink-0 text-sm font-medium text-gray-700 sm:w-28 sm:text-right" for="po-contact-phone">
              联系电话
            </label>
            <input id="po-contact-phone" v-model="contactPhone" type="tel" inputmode="tel" :class="inputClass" />
          </div>
          <div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-5">
            <label class="shrink-0 text-sm font-medium text-gray-700 sm:w-28 sm:text-right" for="po-contact-name">
              联系人
            </label>
            <input id="po-contact-name" v-model="contactName" type="text" :class="inputClass" />
          </div>
        </div>
      </section>

      <section class="mb-8">
        <h2 class="mb-4 text-base font-bold text-gray-900">采购方信息</h2>
        <div class="grid grid-cols-1 gap-x-12 gap-y-5 lg:grid-cols-2">
          <div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-5">
            <label class="shrink-0 text-sm font-medium text-gray-700 sm:w-28 sm:text-right" for="po-purchaser-company">
              公司名称
            </label>
            <input id="po-purchaser-company" v-model="purchaserCompany" type="text" :class="inputClass" />
          </div>
          <div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-5">
            <label class="shrink-0 text-sm font-medium text-gray-700 sm:w-28 sm:text-right" for="po-purchaser-address">
              注册地址
            </label>
            <input id="po-purchaser-address" v-model="purchaserAddress" type="text" :class="inputClass" />
          </div>
          <div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-5">
            <label class="shrink-0 text-sm font-medium text-gray-700 sm:w-28 sm:text-right" for="po-purchaser-contact">
              联系人
            </label>
            <input id="po-purchaser-contact" v-model="purchaserContact" type="text" :class="inputClass" />
          </div>
          <div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-5">
            <label class="shrink-0 text-sm font-medium text-gray-700 sm:w-28 sm:text-right" for="po-purchaser-phone">
              联系电话
            </label>
            <input id="po-purchaser-phone" v-model="purchaserPhone" type="tel" inputmode="tel" :class="inputClass" />
          </div>
        </div>
      </section>

      <section class="mb-8">
        <h2 class="mb-4 text-base font-bold text-gray-900">供应商信息</h2>
        <div class="grid grid-cols-1 gap-x-12 gap-y-5 lg:grid-cols-2">
          <div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-5">
            <span class="shrink-0 text-sm font-medium text-gray-700 sm:w-28 sm:text-right">公司名称</span>
            <input type="text" readonly :value="SUPPLIER_COMPANY" :class="readonlyClass" />
          </div>
          <div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-5">
            <span class="shrink-0 text-sm font-medium text-gray-700 sm:w-28 sm:text-right">注册地址</span>
            <input type="text" readonly :value="SUPPLIER_ADDRESS" :class="readonlyClass" />
          </div>
          <div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-5">
            <span class="shrink-0 text-sm font-medium text-gray-700 sm:w-28 sm:text-right">联系人</span>
            <input type="text" readonly :value="SUPPLIER_CONTACT" :class="readonlyClass" />
          </div>
          <div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-5">
            <span class="shrink-0 text-sm font-medium text-gray-700 sm:w-28 sm:text-right">联系电话</span>
            <input type="text" readonly :value="SUPPLIER_PHONE" :class="readonlyClass" />
          </div>
        </div>
      </section>

      <section class="mb-8">
        <h2 class="mb-4 text-base font-bold text-gray-900">其他事宜</h2>
        <textarea
          v-model="otherRemarks"
          rows="4"
          class="min-h-[6.5rem] w-full resize-y rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:border-[#FFEB69] focus:outline-none focus:ring-2 focus:ring-[#FFEB69]/30"
        />
      </section>

      <section>
        <div class="overflow-x-auto rounded-lg border border-gray-200 bg-white">
          <table class="w-full min-w-[720px] border-collapse text-left text-sm">
            <thead>
              <tr class="border-b border-gray-200 bg-gray-50/80 text-gray-500">
                <th
                  v-for="column in TABLE_COLUMNS"
                  :key="column"
                  class="h-11 whitespace-nowrap px-4 align-middle font-medium"
                >
                  {{ column }}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(row, index) in productRows"
                :key="row.id"
                :class="[
                  'h-11 text-gray-700',
                  index < productRows.length - 1 ? 'border-b border-gray-100' : '',
                ]"
              >
                <td class="px-4 align-middle font-medium text-gray-900">{{ row.name }}</td>
                <td class="px-4 align-middle">{{ row.brand }}</td>
                <td class="px-4 align-middle">{{ row.model }}</td>
                <td class="px-4 align-middle">{{ row.color }}</td>
                <td class="whitespace-nowrap px-4 align-middle tabular-nums">{{ row.unitPrice.toFixed(2) }}</td>
                <td class="px-4 align-middle tabular-nums">{{ row.quantity }}</td>
                <td class="whitespace-nowrap px-4 align-middle font-medium tabular-nums text-gray-900">
                  {{ row.total.toFixed(2) }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>

    <footer
      class="shrink-0 border-t border-gray-200/60 bg-white/85 px-6 py-4 sm:px-10 sm:py-5"
    >
      <div class="flex justify-end gap-3 sm:gap-4">
        <button type="button" class="po-action-btn po-action-btn--secondary" @click="emit('preview')">
          预览
        </button>
        <button type="button" class="po-action-btn po-action-btn--primary" @click="emit('confirm')">
          确认并下单
        </button>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.po-action-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 9999px;
  padding: 0.75rem 1.75rem;
  font-size: 0.9375rem;
  font-weight: 700;
  transition:
    filter 0.15s ease,
    transform 0.15s ease,
    background-color 0.15s ease,
    border-color 0.15s ease;
}

.po-action-btn--secondary {
  border: 1px solid #e5e7eb;
  background-color: #fff;
  color: #374151;
}

.po-action-btn--secondary:hover {
  background-color: #f9fafb;
  border-color: #d1d5db;
}

.po-action-btn--primary {
  border: 1px solid rgba(159, 232, 112, 0.4);
  background-color: #9fe870;
  color: #163300;
}

.po-action-btn--primary:hover {
  filter: brightness(0.97);
}

.po-action-btn:active {
  transform: scale(0.98);
}

.po-action-btn:focus,
.po-action-btn:focus-visible {
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
