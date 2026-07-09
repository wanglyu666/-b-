<script setup lang="ts">
import { computed, ref } from 'vue';
import { ArrowLeft, Paperclip, X } from 'lucide-vue-next';
import checkMarkImg from '../../image asset/check mark.png';
import {
  REFUND_REASON_OPTIONS,
  type OrderCenterItem,
  type RefundReason,
} from '../data/orderCenterSample';
import type { OrderRefundSubmitPayload } from '../data/orderCenterRefunds';

const LIST_TABLE_COLUMNS = [
  '专业',
  '科目编号',
  '科目名称',
  '计算规则',
  '品牌',
  '系列/型号',
  '规格',
  '工作内容及特征描述',
  '单位',
  '综合含税单价',
] as const;

const DESCRIPTION_MAX_LEN = 10;

const props = defineProps<{
  order: OrderCenterItem;
}>();

const emit = defineEmits<{
  back: [];
  submit: [payload: OrderRefundSubmitPayload];
}>();

type RefundStep = 'form' | 'success';

const step = ref<RefundStep>('form');
const submitPayload = ref<OrderRefundSubmitPayload | null>(null);

const selectedRowIds = ref<Set<number>>(new Set());
const refundReason = ref<RefundReason | ''>('');
const remarks = ref('');
const attachments = ref<File[]>([]);
const fileInputRef = ref<HTMLInputElement | null>(null);
const hoveredDescTooltip = ref<{ description: string; x: number; y: number } | null>(null);

const lineItems = computed(() => props.order.lineItems);

const hasSelection = computed(() => selectedRowIds.value.size > 0);

const canSubmit = computed(
  () => hasSelection.value && refundReason.value !== '',
);

const selectedRefundAmount = computed(() =>
  lineItems.value
    .filter((item) => selectedRowIds.value.has(item.id))
    .reduce((sum, item) => sum + item.taxIncludedPrice, 0),
);

function isRowSelected(id: number) {
  return selectedRowIds.value.has(id);
}

function toggleRowSelection(id: number) {
  const next = new Set(selectedRowIds.value);
  if (next.has(id)) {
    next.delete(id);
  } else {
    next.add(id);
  }
  selectedRowIds.value = next;
}

function truncateDescription(text: string, max = DESCRIPTION_MAX_LEN) {
  if (text.length <= max) return text;
  return `${text.slice(0, max)}…`;
}

function isDescriptionTruncated(text: string, max = DESCRIPTION_MAX_LEN) {
  return text.length > max;
}

function showDescTooltip(description: string, e: MouseEvent) {
  if (!isDescriptionTruncated(description)) return;
  const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
  hoveredDescTooltip.value = {
    description,
    x: rect.left,
    y: rect.top,
  };
}

function hideDescTooltip() {
  hoveredDescTooltip.value = null;
}

function openFilePicker() {
  fileInputRef.value?.click();
}

function handleFileChange(event: Event) {
  const input = event.target as HTMLInputElement;
  const files = input.files;
  if (!files?.length) return;

  const next = [...attachments.value];
  for (const file of Array.from(files)) {
    if (next.length >= 5) break;
    next.push(file);
  }
  attachments.value = next;
  input.value = '';
}

function removeAttachment(index: number) {
  attachments.value = attachments.value.filter((_, i) => i !== index);
}

function buildSubmitPayload(): OrderRefundSubmitPayload {
  return {
    orderId: props.order.id,
    orderNo: props.order.orderNo,
    selectedLineItemIds: [...selectedRowIds.value],
    reason: refundReason.value as RefundReason,
    remarks: remarks.value,
    attachmentNames: attachments.value.map((file) => file.name),
    refundAmount: selectedRefundAmount.value,
  };
}

function handleSubmit() {
  if (!canSubmit.value) return;
  submitPayload.value = buildSubmitPayload();
  step.value = 'success';
}

function handleSuccessReturn() {
  if (submitPayload.value) {
    emit('submit', submitPayload.value);
  }
}

function handleBack() {
  if (step.value === 'success') {
    if (submitPayload.value) {
      emit('submit', submitPayload.value);
    }
    return;
  }
  emit('back');
}

const inputClass =
  'h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-800 placeholder:text-gray-400 focus:border-[#FFEB69] focus:outline-none focus:ring-2 focus:ring-[#FFEB69]/30';
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
          @click="handleBack"
        >
          <ArrowLeft :size="20" />
        </button>
        <Transition name="refund-header-fade" mode="out-in">
          <div v-if="step === 'success'" key="success-header">
            <h1 class="text-2xl font-bold text-gray-900">提交成功</h1>
          </div>
          <div v-else key="form-header">
            <h1 class="text-2xl font-bold text-gray-900">申请退款</h1>
            <p class="mt-1 text-sm text-gray-500">
              订单编号 <span class="font-mono text-gray-700">{{ order.orderNo }}</span>
            </p>
          </div>
        </Transition>
      </header>

      <div
        class="mt-6 flex min-h-[calc(100vh-10rem)] flex-1 flex-col overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm"
      >
        <div class="refund-step-shell min-h-0 flex-1 overflow-hidden">
          <Transition name="refund-step-fade" mode="out-in">
            <div
              v-if="step === 'success'"
              key="success"
              class="flex h-full min-h-[calc(100vh-14rem)] flex-col items-center justify-center px-8 py-12"
            >
              <img :src="checkMarkImg" alt="" class="mb-6 h-36 w-56 object-contain" />
              <h2 class="mb-4 text-3xl font-bold tracking-tight text-gray-800">已完成提交</h2>
              <p class="mb-12 text-center text-gray-500">您的退款申请已成功提交，平台将在审核后处理</p>
              <button
                type="button"
                class="rounded-xl border border-gray-200 bg-white px-8 py-3 font-bold text-[#3A341C] shadow-sm transition-colors hover:bg-gray-50"
                @click="handleSuccessReturn"
              >
                返回上级页面
              </button>
            </div>

            <div v-else key="form" class="flex h-full min-h-0 flex-col">
        <div class="custom-scrollbar flex-1 overflow-y-auto px-6 py-6 sm:px-8 sm:py-8">
          <section class="mb-8">
            <h2 class="mb-4 text-base font-bold text-gray-900">选择退款商品</h2>
            <p class="mb-4 text-sm text-gray-500">点击表格行选择需要退款的商品，可多选</p>

            <div class="overflow-hidden rounded-2xl border border-gray-200 bg-white">
              <div class="overflow-x-auto">
                <table class="refund-list-table w-full min-w-[960px] border-collapse text-left">
                  <thead>
                    <tr class="border-b border-gray-100 bg-gray-50/80 text-sm font-medium text-gray-500">
                      <th
                        v-for="column in LIST_TABLE_COLUMNS"
                        :key="column"
                        :class="[
                          'h-[3.75rem] px-6 align-middle whitespace-nowrap',
                          column === '工作内容及特征描述' ? 'min-w-[8rem]' : '',
                        ]"
                      >
                        {{ column }}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      v-for="(row, index) in lineItems"
                      :key="row.id"
                      :class="[
                        'refund-list-data-row h-[3.75rem] cursor-pointer transition-colors',
                        isRowSelected(row.id) ? 'bg-[#9FE870]/60' : 'hover:bg-gray-50',
                        index < lineItems.length - 1 ? 'border-b border-gray-100' : '',
                      ]"
                      @click="toggleRowSelection(row.id)"
                    >
                      <td class="h-[3.75rem] px-6 align-middle text-gray-600">{{ row.major }}</td>
                      <td class="h-[3.75rem] px-6 align-middle text-gray-600">{{ row.subjectCode }}</td>
                      <td class="h-[3.75rem] px-6 align-middle font-medium text-gray-800">
                        {{ row.subjectName }}
                      </td>
                      <td class="h-[3.75rem] px-6 align-middle text-gray-600">{{ row.calcRule }}</td>
                      <td class="h-[3.75rem] px-6 align-middle text-gray-600">{{ row.brand }}</td>
                      <td class="h-[3.75rem] px-6 align-middle text-gray-600">{{ row.model }}</td>
                      <td class="h-[3.75rem] px-6 align-middle text-gray-600">{{ row.spec }}</td>
                      <td class="h-[3.75rem] px-6 align-middle text-gray-500">
                        <span
                          class="inline-block"
                          @mouseenter="showDescTooltip(row.description, $event)"
                          @mouseleave="hideDescTooltip"
                        >
                          {{ truncateDescription(row.description) }}
                        </span>
                      </td>
                      <td class="h-[3.75rem] px-6 align-middle text-gray-600">{{ row.unit }}</td>
                      <td class="h-[3.75rem] whitespace-nowrap px-6 align-middle font-medium text-gray-800">
                        ¥{{ row.taxIncludedPrice.toFixed(2) }}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <p v-if="hasSelection" class="mt-3 text-sm text-gray-600">
              已选 {{ selectedRowIds.size }} 件商品，退款金额
              <span class="font-bold tabular-nums text-[#A1D573]">
                ¥{{ selectedRefundAmount.toFixed(2) }}
              </span>
            </p>
          </section>

          <section class="space-y-5 border-t border-gray-100 pt-8">
            <div class="grid grid-cols-1 gap-5 lg:grid-cols-2">
              <div>
                <label class="mb-2 block text-sm font-medium text-gray-700" for="refund-reason">
                  退款原因
                </label>
                <select
                  id="refund-reason"
                  v-model="refundReason"
                  :class="inputClass"
                >
                  <option value="" disabled hidden>请选择退款原因</option>
                  <option v-for="reason in REFUND_REASON_OPTIONS" :key="reason" :value="reason">
                    {{ reason }}
                  </option>
                </select>
              </div>
            </div>

            <div>
              <label class="mb-2 block text-sm font-medium text-gray-700" for="refund-remarks">
                备注
              </label>
              <textarea
                id="refund-remarks"
                v-model="remarks"
                rows="4"
                placeholder="请补充退款说明（选填）"
                class="min-h-[6.5rem] w-full resize-y rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:border-[#FFEB69] focus:outline-none focus:ring-2 focus:ring-[#FFEB69]/30"
              />
            </div>

            <div>
              <label class="mb-2 block text-sm font-medium text-gray-700">附件上传</label>
              <div class="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  class="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                  :disabled="attachments.length >= 5"
                  @click="openFilePicker"
                >
                  <Paperclip :size="16" />
                  选取文件
                </button>
                <span class="text-xs text-gray-400">最多 5 个文件，支持图片与文档</span>
              </div>
              <input
                ref="fileInputRef"
                type="file"
                class="hidden"
                multiple
                accept="image/*,.pdf,.doc,.docx"
                @change="handleFileChange"
              />
              <ul v-if="attachments.length" class="mt-3 space-y-2">
                <li
                  v-for="(file, index) in attachments"
                  :key="`${file.name}-${index}`"
                  class="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50 px-3 py-2 text-sm text-gray-700"
                >
                  <span class="min-w-0 truncate">{{ file.name }}</span>
                  <button
                    type="button"
                    class="ml-3 shrink-0 rounded-full p-1 text-gray-400 transition-colors hover:bg-white hover:text-red-500"
                    aria-label="移除附件"
                    @click="removeAttachment(index)"
                  >
                    <X :size="14" />
                  </button>
                </li>
              </ul>
            </div>
          </section>
        </div>

        <div class="flex justify-end border-t border-gray-100 px-6 py-4 sm:px-8">
          <button
            type="button"
            class="order-refund-submit-btn"
            :disabled="!canSubmit"
            @click="handleSubmit"
          >
            提交
          </button>
        </div>
            </div>
          </Transition>
        </div>
      </div>
    </div>

    <Teleport to="body">
      <div
        v-if="hoveredDescTooltip"
        class="pointer-events-none fixed z-[200] max-w-[22rem] rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm leading-relaxed text-gray-700 shadow-xl"
        :style="{
          left: `${hoveredDescTooltip.x}px`,
          top: `${hoveredDescTooltip.y - 10}px`,
          transform: 'translateY(-100%)',
        }"
      >
        {{ hoveredDescTooltip.description }}
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.refund-step-shell {
  position: relative;
}

.refund-step-fade-enter-active,
.refund-step-fade-leave-active {
  transition: opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.refund-step-fade-leave-active {
  position: absolute;
  inset: 0;
  width: 100%;
}

.refund-step-fade-enter-from,
.refund-step-fade-leave-to {
  opacity: 0;
}

.refund-step-fade-enter-to,
.refund-step-fade-leave-from {
  opacity: 1;
}

.refund-header-fade-enter-active,
.refund-header-fade-leave-active {
  transition: opacity 0.24s cubic-bezier(0.4, 0, 0.2, 1);
}

.refund-header-fade-enter-from,
.refund-header-fade-leave-to {
  opacity: 0;
}

.refund-header-fade-enter-to,
.refund-header-fade-leave-from {
  opacity: 1;
}

.order-refund-submit-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 7rem;
  border-radius: 9999px;
  border: 1px solid rgba(159, 232, 112, 0.45);
  background-color: #9fe870;
  padding: 0.625rem 2rem;
  font-size: 0.9375rem;
  font-weight: 700;
  color: #163300;
  transition:
    filter 0.15s ease,
    opacity 0.15s ease;
}

.order-refund-submit-btn:hover:not(:disabled) {
  filter: brightness(0.97);
}

.order-refund-submit-btn:disabled {
  cursor: not-allowed;
  opacity: 0.45;
}

.order-refund-submit-btn:focus,
.order-refund-submit-btn:focus-visible {
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
