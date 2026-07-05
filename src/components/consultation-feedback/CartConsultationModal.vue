<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { X } from 'lucide-vue-next';
import type { CartItem } from '../../types';
import type {
  ConsultationRecord,
  ConsultationCartLineSnapshot,
  ConsultationInquiryMessage,
} from '../../data/consultations';
import {
  prependDynamicConsultation,
  appendDynamicInquiryMessages,
} from '../../data/consultations';
import { useAppStore } from '../../stores/appStore';
import AfterSalesSuccess from '../engineering/AfterSalesSuccess.vue';

const appStore = useAppStore();
const contactName = computed(() => appStore.customerName);
const contactPhone = '138-0013-8000';

const props = defineProps<{
  modelValue: boolean;
  cartItems: CartItem[];
  /** 年框产品表格模式时为 true */
  showAsList?: boolean;
}>();

const emit = defineEmits<{
  'update:modelValue': [open: boolean];
}>();

const serviceAddress = ref('');
const shortExchangeContent = ref('');
const shortExchangeFileInputRef = ref<HTMLInputElement | null>(null);
const shortExchangeFileName = ref('');
const step = ref<'form' | 'success'>('form');

const LIST_TABLE_COLUMNS = [
  '专业',
  '科目编号',
  '科目名称',
  '系列/型号',
  '数量',
  '综合含税单价',
] as const;

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

function formatConsultationTime(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function formatInquirySentAt(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function buildConsultationNo() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const r = String(Math.floor(Math.random() * 900) + 100);
  return `ZX-${y}-${m}${day}-${r}`;
}

function resetDraft() {
  step.value = 'form';
  serviceAddress.value = '';
  shortExchangeContent.value = '';
  shortExchangeFileName.value = '';
  const input = shortExchangeFileInputRef.value;
  if (input) input.value = '';
}

function closeModal() {
  emit('update:modelValue', false);
  resetDraft();
}

watch(
  () => props.modelValue,
  (open) => {
    if (open) resetDraft();
  },
);

watch(
  () => props.cartItems.length,
  (n) => {
    if (n === 0 && props.modelValue) closeModal();
  },
);

function triggerFilePick() {
  shortExchangeFileInputRef.value?.click();
}

function onFileChange(e: Event) {
  const input = e.target as HTMLInputElement;
  const file = input.files?.[0];
  shortExchangeFileName.value = file?.name ?? '';
}

function submitCartConsultation() {
  const address = serviceAddress.value.trim();
  const text = shortExchangeContent.value.trim();
  if (!address || !text || props.cartItems.length === 0) return;

  const now = new Date();
  const id = `cart-${now.getTime()}`;
  const lines: ConsultationCartLineSnapshot[] = props.cartItems.map((i) => ({
    id: i.id,
    name: i.name,
    category: i.category,
    price: i.price,
    quantity: i.quantity,
    image: i.image,
  }));

  const record: ConsultationRecord = {
    id,
    no: buildConsultationNo(),
    title: '购物车商品咨询',
    time: formatConsultationTime(now),
    requirement: text,
    category: '商店采购',
    contact: contactName.value,
    contactPhone,
    status: '待回复',
    cartLineItems: lines,
    quoteStatus: '暂无报价',
    serviceAddress: address,
    needQuote: '是',
    quoteTime: '待确认',
    relatedMaterials: '暂无上传',
  };

  prependDynamicConsultation(record);

  const inquiry: ConsultationInquiryMessage = {
    id: `${id}-inquiry-1`,
    senderName: contactName.value,
    sentAt: formatInquirySentAt(now),
    content: text,
    attachmentFileName: shortExchangeFileName.value.trim() || undefined,
  };
  appendDynamicInquiryMessages(id, [inquiry]);

  step.value = 'success';
}

function onSuccessReturn() {
  closeModal();
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="modelValue"
      class="fixed inset-0 z-[120] flex items-center justify-center p-4 sm:p-6 bg-black/40 backdrop-blur-md animate-in fade-in duration-300"
      role="dialog"
      aria-modal="true"
      @click.self="closeModal"
    >
      <div
        class="flex h-[min(88vh,860px)] w-full max-w-5xl flex-col overflow-hidden rounded-[40px] border border-white/20 bg-white/10 shadow-2xl backdrop-blur-2xl"
        @click.stop
      >
        <div class="flex flex-shrink-0 items-center justify-between border-b border-white/10 px-6 py-6 sm:px-10 sm:py-7">
          <div class="flex min-w-0 items-center gap-3">
            <div class="h-6 w-1.5 shrink-0 rounded-full bg-[#FFE600] shadow-[0_0_15px_rgba(255,230,0,0.5)]" />
            <h2 class="truncate text-lg font-bold tracking-tight text-white sm:text-2xl">咨询</h2>
          </div>
          <button
            type="button"
            class="rounded-full p-2 text-white/70 transition-all hover:bg-white/10 hover:text-white"
            aria-label="关闭"
            @click="closeModal"
          >
            <X :size="22" />
          </button>
        </div>

        <div class="custom-scrollbar min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-6 py-8 sm:px-10 sm:py-10">
          <Transition name="cart-consult" mode="out-in">
            <div v-if="step === 'form'" key="form" class="text-left text-white/90">
              <div class="mb-8 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2">
                <h3 class="shrink-0 text-lg font-bold tracking-tight text-white">短交流</h3>
                <p class="text-xs text-white/45 sm:text-sm">批量咨询可将多个商品加入购物车中咨询</p>
              </div>
              <div class="space-y-8">
                <div class="flex flex-col gap-3 sm:grid sm:grid-cols-[6.5rem_minmax(0,1fr)] sm:items-center sm:gap-6">
                  <label
                    class="shrink-0 text-sm font-medium text-white/85 sm:text-right"
                    for="cart-consult-address"
                  >
                    <span class="text-red-400">*</span>服务地址
                  </label>
                  <input
                    id="cart-consult-address"
                    v-model="serviceAddress"
                    type="text"
                    class="h-10 w-full rounded-xl border border-white/15 bg-white/[0.07] px-3 text-sm text-white placeholder:text-white/35 focus:border-[#FFE600]/60 focus:outline-none focus:ring-2 focus:ring-[#FFE600]/25"
                    placeholder="请输入服务地址"
                  />
                </div>
                <div class="flex flex-col gap-3 sm:grid sm:grid-cols-[6.5rem_minmax(0,1fr)] sm:items-start sm:gap-6">
                  <label
                    class="shrink-0 pt-2 text-sm font-medium text-white/85 sm:text-right"
                    for="cart-consult-content"
                  >
                    <span class="text-red-400">*</span>交流内容
                  </label>
                  <textarea
                    id="cart-consult-content"
                    v-model="shortExchangeContent"
                    rows="8"
                    class="min-h-[10rem] w-full resize-y rounded-xl border border-white/15 bg-white/[0.07] px-3 py-2.5 text-sm text-white placeholder:text-white/35 focus:border-[#FFE600]/60 focus:outline-none focus:ring-2 focus:ring-[#FFE600]/25"
                    placeholder="请输入交流内容"
                  />
                </div>
                <div class="flex flex-col gap-3 sm:grid sm:grid-cols-[6.5rem_minmax(0,1fr)] sm:items-center sm:gap-6">
                  <span class="sr-only">联系信息</span>
                  <div class="flex flex-wrap items-center gap-x-12 gap-y-2 sm:col-start-2">
                    <div class="flex items-center gap-3 text-sm">
                      <span class="font-medium text-white/85">联系人</span>
                      <span class="text-white">{{ contactName }}</span>
                    </div>
                    <div class="flex items-center gap-3 text-sm">
                      <span class="font-medium text-white/85">联系电话</span>
                      <span class="font-mono text-white">{{ contactPhone }}</span>
                    </div>
                  </div>
                </div>
                <div class="flex flex-col gap-3 sm:grid sm:grid-cols-[6.5rem_minmax(0,1fr)] sm:items-center sm:gap-6">
                  <span class="shrink-0 text-sm font-medium text-white/85 sm:text-right">交流附件</span>
                  <div class="flex min-w-0 flex-wrap items-center gap-3">
                    <input
                      ref="shortExchangeFileInputRef"
                      type="file"
                      class="sr-only"
                      tabindex="-1"
                      @change="onFileChange"
                    />
                    <button
                      type="button"
                      class="inline-flex shrink-0 items-center rounded-full border border-[#E6CF00] bg-[#FFE600] px-5 py-2 text-sm font-bold text-[#260A2F] shadow-sm transition-all hover:bg-[#fff04d]"
                      @click="triggerFilePick"
                    >
                      选取文件
                    </button>
                    <span
                      v-if="shortExchangeFileName"
                      class="min-w-0 truncate text-sm text-white/55"
                      :title="shortExchangeFileName"
                    >
                      {{ shortExchangeFileName }}
                    </span>
                  </div>
                </div>

                <div
                  v-if="cartItems.length"
                  class="flex flex-col gap-3 sm:grid sm:grid-cols-[6.5rem_minmax(0,1fr)] sm:items-start sm:gap-6"
                >
                  <span class="shrink-0 pt-2 text-sm font-medium text-white/85 sm:text-right">咨询商品</span>
                  <div
                    class="custom-scrollbar min-w-0 max-h-[min(32vh,280px)] overflow-y-auto overflow-x-hidden"
                  >
                    <div
                      v-if="showAsList"
                      class="overflow-x-auto rounded-xl border border-white/15 bg-white/[0.07]"
                    >
                      <table class="w-full min-w-[640px] border-collapse text-left text-sm">
                        <thead>
                          <tr class="border-b border-white/10 text-white/55">
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
                              'h-11 text-white/85',
                              index < cartListRows.length - 1 ? 'border-b border-white/10' : '',
                            ]"
                          >
                            <td class="px-4 align-middle">{{ row.major }}</td>
                            <td class="px-4 align-middle">{{ row.subjectCode }}</td>
                            <td class="px-4 align-middle font-medium text-white">{{ row.subjectName }}</td>
                            <td class="px-4 align-middle">{{ row.model }}</td>
                            <td class="px-4 align-middle tabular-nums">{{ row.quantity }}</td>
                            <td class="whitespace-nowrap px-4 align-middle font-medium text-[#FFE600]">
                              ¥{{ row.lineTotal.toFixed(2) }}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    <div v-else class="space-y-3">
                      <article
                        v-for="item in cartItems"
                        :key="`${item.productKind}-${item.id}`"
                        class="flex items-center rounded-xl border border-white/15 bg-white/[0.07] p-3 sm:p-4"
                      >
                        <div class="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white/5 sm:h-20 sm:w-20">
                          <img
                            :src="item.image"
                            :alt="item.name"
                            class="h-full w-full object-cover opacity-90 mix-blend-multiply"
                            referrerpolicy="no-referrer"
                          />
                        </div>
                        <div class="ml-4 flex min-w-0 flex-1 flex-col justify-center">
                          <h4 class="truncate text-sm font-bold text-white sm:text-base">{{ item.name }}</h4>
                          <p class="mt-0.5 truncate text-xs text-white/50">{{ item.category }} / 标准规格</p>
                          <div class="mt-2 flex items-end justify-between gap-3">
                            <span class="text-sm font-bold text-[#FFE600] sm:text-base">
                              ¥{{ item.price.toFixed(2) }}
                            </span>
                            <span class="shrink-0 text-xs text-white/55 sm:text-sm">×{{ item.quantity }}</span>
                          </div>
                        </div>
                      </article>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div v-else key="success" class="-mx-2 sm:-mx-4">
              <AfterSalesSuccess
                title="已完成提交"
                message="您的购物车咨询已成功提交，可在「咨询与反馈」—「全部咨询」中查看"
                @return="onSuccessReturn"
              />
            </div>
          </Transition>
        </div>

        <div
          v-if="step === 'form'"
          class="flex shrink-0 justify-end border-t border-white/10 px-6 py-5 sm:px-10 sm:py-6"
        >
          <button
            type="button"
            class="rounded-xl bg-[#FFE600] px-10 py-2.5 text-sm font-bold text-[#260A2F] shadow-[0_0_15px_rgba(255,230,0,0.25)] transition-all hover:bg-[#fff04d] disabled:cursor-not-allowed disabled:opacity-45"
            :disabled="!serviceAddress.trim() || !shortExchangeContent.trim()"
            @click="submitCartConsultation"
          >
            确定
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
.custom-scrollbar::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.12);
  border-radius: 10px;
}

.cart-consult-enter-active,
.cart-consult-leave-active {
  transition:
    opacity 0.38s cubic-bezier(0.16, 1, 0.3, 1),
    transform 0.42s cubic-bezier(0.16, 1, 0.3, 1);
}
.cart-consult-enter-from {
  opacity: 0;
  transform: translateX(0.85rem);
}
.cart-consult-leave-to {
  opacity: 0;
  transform: translateX(-0.55rem);
}
</style>
