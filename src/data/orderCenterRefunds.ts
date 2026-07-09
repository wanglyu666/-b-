import { ref } from 'vue';
import type { OrderCenterLineItem, RefundReason } from './orderCenterSample';

export type RefundProgressStatus = 'completed' | 'current' | 'pending';

export interface RefundProgressStep {
  id: string;
  label: string;
  time?: string;
  status: RefundProgressStatus;
}

export interface RefundCustomerInfoRow {
  label: string;
  value: string;
}

export interface OrderRefundSubmitPayload {
  orderId: string;
  orderNo: string;
  selectedLineItemIds: number[];
  reason: RefundReason;
  remarks: string;
  attachmentNames: string[];
  refundAmount: number;
}

export interface OrderRefundRecord extends OrderRefundSubmitPayload {
  refundNo: string;
  submittedAt: string;
  progressSteps: RefundProgressStep[];
  customerInfo: RefundCustomerInfoRow[];
  selectedLineItems: OrderCenterLineItem[];
}

export const orderRefundRecords = ref<Record<string, OrderRefundRecord>>({});

function buildRefundNo() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const r = String(Math.floor(Math.random() * 900) + 100);
  return `TK-${y}${m}${day}-${r}`;
}

function formatSubmittedAt(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const h = String(date.getHours()).padStart(2, '0');
  const min = String(date.getMinutes()).padStart(2, '0');
  return `${y}/${m}/${day} ${h}:${min}`;
}

export function hasOrderRefund(orderId: string) {
  return Boolean(orderRefundRecords.value[orderId]);
}

export function getOrderRefund(orderId: string) {
  return orderRefundRecords.value[orderId] ?? null;
}

export function saveOrderRefund(
  payload: OrderRefundSubmitPayload,
  selectedLineItems: OrderCenterLineItem[],
  customerName: string,
  contactPhone: string,
  serviceAddress: string,
) {
  const submittedAt = formatSubmittedAt();
  const refundNo = buildRefundNo();
  const record: OrderRefundRecord = {
    ...payload,
    refundNo,
    submittedAt,
    selectedLineItems: selectedLineItems.map((item) => ({ ...item })),
    progressSteps: [
      { id: 'submit', label: '提交申请', time: submittedAt, status: 'completed' },
      { id: 'review', label: '平台审核', status: 'current' },
      { id: 'processing', label: '退款处理', status: 'pending' },
      { id: 'done', label: '退款完成', status: 'pending' },
    ],
    customerInfo: [
      { label: '退款编号', value: refundNo },
      { label: '订单编号', value: payload.orderNo },
      { label: '联系人', value: customerName },
      { label: '联系电话', value: contactPhone },
      { label: '服务地址', value: serviceAddress },
      { label: '退款原因', value: payload.reason },
      { label: '备注', value: payload.remarks.trim() || '—' },
      { label: '退款金额', value: `¥${payload.refundAmount.toFixed(2)}` },
      { label: '申请时间', value: submittedAt },
      {
        label: '附件',
        value: payload.attachmentNames.length ? payload.attachmentNames.join('、') : '—',
      },
    ],
  };
  orderRefundRecords.value = {
    ...orderRefundRecords.value,
    [payload.orderId]: record,
  };
  return record;
}
