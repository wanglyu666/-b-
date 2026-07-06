<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { Calendar } from 'lucide-vue-next';
import type { CartItem } from '../types';
import { useAppStore } from '../stores/appStore';
import alipayImg from '../../image asset/alipay.png';
import unionPayImg from '../../image asset/union pay.png';
import wechatPayImg from '../../image asset/wechat pay.png';

type CheckoutStep = 'form' | 'payment';
type PaymentChannel = 'alipay' | 'unionpay' | 'wechat';

const props = defineProps<{
  orderAmount: number;
  cartItems: CartItem[];
  /** 年框产品表格模式时为 true */
  showAsList?: boolean;
}>();

const emit = defineEmits<{
  pay: [];
}>();

const appStore = useAppStore();

const SERVICE_PROVIDER_ADDRESSES = [
  '北京市海淀区中关村大街1号海龙大厦3层',
  '北京市海淀区中关村软件园二期A座',
  '北京市朝阳区望京街10号望京SOHO T3',
  '北京市西城区金融大街35号国际企业大厦',
  '北京市丰台区南四环西路188号总部基地17区',
] as const;

const PAYMENT_TERM_OPTIONS = ['7', '15', '30'] as const;

const PAYMENT_METHOD = '线上立即支付';
const DURATION_DAYS = '1';

const confirmNo = ref('');
const purchaser = ref('');
const contactName = ref('');
const contactPhone = ref('138-0013-8000');
const serviceProviderAddress = ref<string>(SERVICE_PROVIDER_ADDRESSES[0]);
const paymentTerm = ref<string>(PAYMENT_TERM_OPTIONS[0]);
const serviceTime = ref('');
const remarks = ref('');
const termsAccepted = ref(false);
const termsModalOpen = ref(false);
const checkoutStep = ref<CheckoutStep>('form');
const selectedPaymentMethod = ref<PaymentChannel | null>(null);

const PAYMENT_OPTIONS = [
  { id: 'alipay' as const, label: '支付宝', image: alipayImg },
  { id: 'wechat' as const, label: '微信支付', image: wechatPayImg },
  { id: 'unionpay' as const, label: '银联支付', image: unionPayImg },
];

const serviceTimePickerRef = ref<HTMLInputElement | null>(null);

function buildConfirmNo() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const r = String(Math.floor(Math.random() * 900) + 100);
  return `JS-${y}${m}${day}-${r}`;
}

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

function openTermsModal() {
  termsModalOpen.value = true;
}

function closeTermsModal() {
  termsModalOpen.value = false;
}

function handleFooterAction() {
  if (checkoutStep.value === 'form') {
    if (!termsAccepted.value) return;
    checkoutStep.value = 'payment';
    return;
  }
  if (!selectedPaymentMethod.value) return;
  emit('pay');
}

const footerActionDisabled = computed(() =>
  checkoutStep.value === 'form' ? !termsAccepted.value : !selectedPaymentMethod.value,
);

const footerActionLabel = computed(() =>
  checkoutStep.value === 'form' ? '下一步' : '支付',
);

onMounted(() => {
  confirmNo.value = buildConfirmNo();
  purchaser.value = appStore.customerName;
  contactName.value = appStore.customerName;
});

const formattedAmount = computed(() => props.orderAmount.toFixed(2));

const LIST_TABLE_COLUMNS = [
  '专业',
  '科目编号',
  '科目名称',
  '系列/型号',
  '数量',
  '综合含税单价',
] as const;

const CARD_TABLE_COLUMNS = ['商品名称', '分类', '数量', '单价', '小计'] as const;

const cartListRows = computed(() =>
  props.cartItems.map((item) => ({
    id: item.id,
    item,
    major: '装饰',
    subjectCode: `KM-${String(item.id).padStart(4, '0')}`,
    subjectName: item.name,
    model: item.name.split(' ')[0] ?? item.name,
    quantity: item.quantity,
    lineTotal: item.price * item.quantity,
  })),
);
</script>

<template>
  <div class="flex min-h-0 flex-1 flex-col">
    <div class="custom-scrollbar flex-1 overflow-y-auto px-6 py-8 sm:px-10 sm:py-10">
      <Transition name="checkout-step" mode="out-in">
        <div v-if="checkoutStep === 'form'" key="form">
    <h1 class="mb-8 text-center text-xl font-bold tracking-tight text-gray-800 sm:text-2xl">
      产品与服务确认单
    </h1>

    <div class="grid grid-cols-1 gap-x-12 gap-y-5 lg:grid-cols-2">
      <div class="space-y-5">
        <div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-5">
          <span class="shrink-0 text-sm font-medium text-gray-700 sm:w-24 sm:text-right">确认编号</span>
          <div
            class="flex h-10 w-full min-w-0 flex-1 items-center rounded-lg border border-gray-200 bg-gray-50 px-3 font-mono text-sm text-gray-800"
          >
            {{ confirmNo }}
          </div>
        </div>

        <div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-5">
          <label class="shrink-0 text-sm font-medium text-gray-700 sm:w-24 sm:text-right" for="checkout-purchaser">
            采购方
          </label>
          <input
            id="checkout-purchaser"
            v-model="purchaser"
            type="text"
            class="h-10 w-full min-w-0 flex-1 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-800 placeholder:text-gray-400 focus:border-[#FFEB69] focus:outline-none focus:ring-2 focus:ring-[#FFEB69]/30"
          />
        </div>

        <div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-5">
          <label class="shrink-0 text-sm font-medium text-gray-700 sm:w-24 sm:text-right" for="checkout-contact">
            联系人
          </label>
          <input
            id="checkout-contact"
            v-model="contactName"
            type="text"
            class="h-10 w-full min-w-0 flex-1 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-800 placeholder:text-gray-400 focus:border-[#FFEB69] focus:outline-none focus:ring-2 focus:ring-[#FFEB69]/30"
          />
        </div>

        <div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-5">
          <label class="shrink-0 text-sm font-medium text-gray-700 sm:w-24 sm:text-right" for="checkout-payment-method">
            支付方式
          </label>
          <input
            id="checkout-payment-method"
            type="text"
            readonly
            :value="PAYMENT_METHOD"
            class="h-10 w-full min-w-0 flex-1 cursor-default rounded-lg border border-gray-200 bg-gray-50 px-3 text-sm text-gray-800 focus:outline-none"
          />
        </div>
      </div>

      <div class="space-y-5">
        <div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-5">
          <label class="shrink-0 text-sm font-medium text-gray-700 sm:w-28 sm:text-right" for="checkout-service-time">
            选择服务时间
          </label>
          <div class="relative min-w-0 flex-1">
            <input
              id="checkout-service-time"
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
              placeholder="yyyy/mm/dd"
              class="relative z-[1] h-10 w-full cursor-pointer rounded-lg border border-gray-200 bg-white py-2 pl-10 pr-4 text-sm text-gray-700 placeholder:text-gray-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#FFEB69] transition-all"
              @click="openServiceTimePicker"
            />
          </div>
        </div>

        <div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-5">
          <label class="shrink-0 text-sm font-medium text-gray-700 sm:w-28 sm:text-right" for="checkout-provider-address">
            服务方地址
          </label>
          <select
            id="checkout-provider-address"
            v-model="serviceProviderAddress"
            class="h-10 w-full min-w-0 flex-1 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-800 focus:border-[#FFEB69] focus:outline-none focus:ring-2 focus:ring-[#FFEB69]/30"
          >
            <option v-for="address in SERVICE_PROVIDER_ADDRESSES" :key="address" :value="address">
              {{ address }}
            </option>
          </select>
        </div>

        <div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-5">
          <label class="shrink-0 text-sm font-medium text-gray-700 sm:w-28 sm:text-right" for="checkout-phone">
            联系电话
          </label>
          <input
            id="checkout-phone"
            v-model="contactPhone"
            type="tel"
            inputmode="tel"
            class="h-10 w-full min-w-0 flex-1 rounded-lg border border-gray-200 bg-white px-3 font-mono text-sm text-gray-800 placeholder:text-gray-400 focus:border-[#FFEB69] focus:outline-none focus:ring-2 focus:ring-[#FFEB69]/30"
          />
        </div>

        <div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-5">
          <label class="shrink-0 text-sm font-medium text-gray-700 sm:w-28 sm:text-right" for="checkout-payment-term">
            支付期限
          </label>
          <select
            id="checkout-payment-term"
            v-model="paymentTerm"
            class="h-10 w-full min-w-0 flex-1 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-800 focus:border-[#FFEB69] focus:outline-none focus:ring-2 focus:ring-[#FFEB69]/30"
          >
            <option v-for="term in PAYMENT_TERM_OPTIONS" :key="term" :value="term">
              {{ term }}
            </option>
          </select>
        </div>

        <div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-5">
          <label class="shrink-0 text-sm font-medium text-gray-700 sm:w-28 sm:text-right" for="checkout-duration">
            工期
          </label>
          <input
            id="checkout-duration"
            type="text"
            readonly
            :value="DURATION_DAYS"
            class="h-10 w-full min-w-0 flex-1 cursor-default rounded-lg border border-gray-200 bg-gray-50 px-3 text-sm text-gray-800 focus:outline-none"
          />
        </div>
      </div>

      <div class="flex flex-col gap-2 sm:flex-row sm:items-start sm:gap-5 lg:col-span-2">
        <label class="shrink-0 pt-2 text-sm font-medium text-gray-700 sm:w-24 sm:text-right" for="checkout-remarks">
          其他说明
        </label>
        <textarea
          id="checkout-remarks"
          v-model="remarks"
          rows="4"
          placeholder="请填写"
          class="min-h-[6.5rem] w-full min-w-0 flex-1 resize-y rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:border-[#FFEB69] focus:outline-none focus:ring-2 focus:ring-[#FFEB69]/30"
        />
      </div>

      <div
        v-if="cartItems.length"
        class="flex flex-col gap-2 sm:flex-row sm:items-start sm:gap-5 lg:col-span-2"
      >
        <span class="shrink-0 pt-2 text-sm font-medium text-gray-700 sm:w-24 sm:text-right">选购商品</span>
        <div
          class="custom-scrollbar min-w-0 flex-1 overflow-x-auto overflow-y-auto rounded-lg border border-gray-200 bg-white max-h-[min(40vh,320px)]"
        >
          <table
            v-if="showAsList"
            class="w-full min-w-[640px] border-collapse text-left text-sm"
          >
            <thead>
              <tr class="border-b border-gray-200 bg-gray-50/80 text-gray-500">
                <th
                  v-for="column in LIST_TABLE_COLUMNS"
                  :key="column"
                  class="h-11 whitespace-nowrap px-4 align-middle font-medium"
                >
                  {{ column }}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(row, index) in cartListRows"
                :key="`${row.item.productKind}-${row.id}`"
                :class="[
                  'h-11 text-gray-700',
                  index < cartListRows.length - 1 ? 'border-b border-gray-100' : '',
                ]"
              >
                <td class="px-4 align-middle">{{ row.major }}</td>
                <td class="px-4 align-middle">{{ row.subjectCode }}</td>
                <td class="px-4 align-middle font-medium text-gray-900">{{ row.subjectName }}</td>
                <td class="px-4 align-middle">{{ row.model }}</td>
                <td class="px-4 align-middle tabular-nums">{{ row.quantity }}</td>
                <td class="whitespace-nowrap px-4 align-middle font-medium text-gray-900">
                  ¥{{ row.lineTotal.toFixed(2) }}
                </td>
              </tr>
            </tbody>
          </table>
          <table v-else class="w-full min-w-[520px] border-collapse text-left text-sm">
            <thead>
              <tr class="border-b border-gray-200 bg-gray-50/80 text-gray-500">
                <th
                  v-for="column in CARD_TABLE_COLUMNS"
                  :key="column"
                  class="h-11 whitespace-nowrap px-4 align-middle font-medium"
                >
                  {{ column }}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(item, index) in cartItems"
                :key="`${item.productKind}-${item.id}`"
                :class="[
                  'h-11 text-gray-700',
                  index < cartItems.length - 1 ? 'border-b border-gray-100' : '',
                ]"
              >
                <td class="px-4 align-middle font-medium text-gray-900">{{ item.name }}</td>
                <td class="px-4 align-middle">{{ item.category }}</td>
                <td class="px-4 align-middle tabular-nums">{{ item.quantity }}</td>
                <td class="whitespace-nowrap px-4 align-middle tabular-nums">
                  ¥{{ item.price.toFixed(2) }}
                </td>
                <td class="whitespace-nowrap px-4 align-middle font-medium text-gray-900">
                  ¥{{ (item.price * item.quantity).toFixed(2) }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
        </div>

        <div
          v-else
          key="payment"
          class="flex min-h-[min(60vh,520px)] flex-col items-center justify-center py-6"
        >
          <h2 class="mb-10 text-center text-xl font-bold tracking-tight text-gray-800 sm:text-2xl">
            选择支付方式
          </h2>
          <div class="grid w-full max-w-3xl grid-cols-1 gap-5 sm:grid-cols-3">
            <button
              v-for="option in PAYMENT_OPTIONS"
              :key="option.id"
              type="button"
              class="payment-option-box"
              :class="{ 'payment-option-box--selected': selectedPaymentMethod === option.id }"
              :aria-pressed="selectedPaymentMethod === option.id"
              @click="selectedPaymentMethod = option.id"
            >
              <img
                :src="option.image"
                :alt="option.label"
                class="max-h-20 w-full max-w-[180px] object-contain"
              />
            </button>
          </div>
        </div>
      </Transition>
    </div>

    <footer
      class="checkout-footer shrink-0 border-t border-gray-200/60 bg-white/85 px-6 py-4 sm:px-10 sm:py-5"
    >
      <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <label class="flex min-w-0 cursor-pointer items-start gap-2.5 sm:max-w-[min(100%,28rem)]">
          <input
            v-model="termsAccepted"
            type="checkbox"
            class="checkout-terms-checkbox mt-0.5 shrink-0"
          />
          <span class="text-xs leading-relaxed text-gray-600">
            我已阅读并同意产品与服务确认单的
            <button
              type="button"
              class="checkout-terms-link"
              @click.stop.prevent="openTermsModal"
            >
              通用条款
            </button>
          </span>
        </label>

        <div class="flex shrink-0 items-center justify-end gap-4 sm:gap-6">
          <div class="flex min-w-0 items-baseline gap-2">
            <span class="shrink-0 text-sm font-medium text-[#9FE870]">应付金额</span>
            <span class="truncate text-2xl font-bold tabular-nums text-[#9FE870] sm:text-3xl">
              ¥{{ formattedAmount }}
            </span>
          </div>
          <button
            type="button"
            class="checkout-pay-btn shrink-0"
            :disabled="footerActionDisabled"
            @click="handleFooterAction"
          >
            {{ footerActionLabel }}
          </button>
        </div>
      </div>
    </footer>

    <Teleport to="body">
      <div
        v-if="termsModalOpen"
        class="fixed inset-0 z-[120] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
        role="dialog"
        aria-modal="true"
        aria-labelledby="checkout-terms-title"
        @click.self="closeTermsModal"
      >
        <div
          class="flex max-h-[min(80vh,560px)] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl"
          @click.stop
        >
          <div class="border-b border-gray-100 px-6 py-4">
            <h2 id="checkout-terms-title" class="text-lg font-bold text-gray-900">
              产品与服务确认单通用条款
            </h2>
          </div>
          <div class="custom-scrollbar flex-1 overflow-y-auto px-6 py-5 text-sm leading-relaxed text-gray-600">
            <p class="mb-3">
              本条款适用于通过本平台提交的产品与服务确认单。提交确认单即表示采购方已了解并同意以下约定：
            </p>
            <ol class="list-decimal space-y-2 pl-5">
              <li>确认单所列服务内容、数量、金额及服务时间以双方确认信息为准。</li>
              <li>采购方应保证所填联系信息真实有效，以便服务方沟通与履约。</li>
              <li>线上立即支付完成后，服务方将按确认单约定安排服务；如需变更，请提前与服务方协商。</li>
              <li>因采购方原因导致服务无法按时开展的，相关责任按平台规则及双方约定处理。</li>
              <li>其他未尽事宜，依照平台服务规范及相关法律法规执行。</li>
            </ol>
          </div>
          <div class="flex justify-end border-t border-gray-100 px-6 py-4">
            <button
              type="button"
              class="rounded-full border border-[#9FE870]/40 bg-[#9FE870] px-6 py-2 text-sm font-bold text-[#163300] transition hover:brightness-[0.97]"
              @click="closeTermsModal"
            >
              我知道了
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.checkout-terms-checkbox {
  height: 1rem;
  width: 1rem;
  cursor: pointer;
  border-radius: 0.25rem;
  border: 1px solid #d1d5db;
  accent-color: #9fe870;
}

.checkout-terms-checkbox:focus {
  outline: none;
}

.checkout-terms-checkbox:focus-visible {
  outline: none;
  box-shadow: 0 0 0 2px rgba(159, 232, 112, 0.45);
}

.checkout-terms-link {
  text-decoration: underline;
  text-underline-offset: 2px;
  color: #374151;
  transition: color 0.15s ease;
}

.checkout-terms-link:hover {
  color: #111827;
}

.checkout-pay-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 9999px;
  border: 1px solid rgba(159, 232, 112, 0.4);
  background-color: #9fe870;
  padding: 0.75rem 2rem;
  font-size: 1rem;
  font-weight: 700;
  color: #163300;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  transition:
    filter 0.15s ease,
    transform 0.15s ease;
}

.checkout-pay-btn:hover:not(:disabled) {
  filter: brightness(0.97);
}

.checkout-pay-btn:active:not(:disabled) {
  transform: scale(0.98);
}

.checkout-pay-btn:disabled {
  cursor: not-allowed;
  opacity: 0.45;
  filter: none;
}

.checkout-pay-btn:focus:not(:disabled),
.checkout-pay-btn:focus-visible:not(:disabled) {
  outline: none;
  box-shadow: 0 0 0 2px rgba(159, 232, 112, 0.45);
}

.payment-option-box {
  display: flex;
  min-height: 9rem;
  cursor: pointer;
  align-items: center;
  justify-content: center;
  border-radius: 1rem;
  border: 2px solid #e5e7eb;
  background-color: #fff;
  padding: 1.5rem 1rem;
  transition:
    border-color 0.15s ease,
    box-shadow 0.15s ease,
    background-color 0.15s ease;
}

.payment-option-box:hover {
  border-color: rgba(159, 232, 112, 0.55);
  background-color: rgba(159, 232, 112, 0.06);
}

.payment-option-box--selected {
  border-color: #9fe870;
  background-color: rgba(159, 232, 112, 0.12);
  box-shadow: 0 0 0 3px rgba(159, 232, 112, 0.25);
}

.payment-option-box:focus,
.payment-option-box:focus-visible {
  outline: none;
}

.payment-option-box:focus-visible {
  box-shadow: 0 0 0 3px rgba(159, 232, 112, 0.35);
}

.checkout-step-enter-active,
.checkout-step-leave-active {
  transition:
    opacity 0.25s ease,
    transform 0.25s ease;
}

.checkout-step-enter-from,
.checkout-step-leave-to {
  opacity: 0;
  transform: translateY(8px);
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
