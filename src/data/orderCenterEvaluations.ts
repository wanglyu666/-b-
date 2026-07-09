import { ref } from 'vue';

export interface OrderEvaluationRecord {
  orderId: string;
  rating: number;
  feedback: string;
  submittedAt: string;
}

export const SAMPLE_ORDER_EVALUATIONS: Record<string, OrderEvaluationRecord> = {
  'oc-401': {
    orderId: 'oc-401',
    rating: 5,
    feedback: '安装师傅很专业，家具质量也很好，整体服务非常满意。',
    submittedAt: '2026/05/21 09:15',
  },
  'oc-402': {
    orderId: 'oc-402',
    rating: 4,
    feedback: '沙发和脚凳都按时送达，安装过程顺利，希望后续售后也能保持这个水准。',
    submittedAt: '2026/05/11 18:40',
  },
  'oc-403': {
    orderId: 'oc-403',
    rating: 5,
    feedback: '储物架组装牢固，师傅还帮忙做了墙面固定，非常贴心。',
    submittedAt: '2026/04/29 11:05',
  },
};

export const orderEvaluationRecords = ref<Record<string, OrderEvaluationRecord>>({
  ...SAMPLE_ORDER_EVALUATIONS,
});

export function hasOrderEvaluation(orderId: string) {
  return Boolean(orderEvaluationRecords.value[orderId]);
}

export function getOrderEvaluation(orderId: string) {
  return orderEvaluationRecords.value[orderId] ?? null;
}

function formatSubmittedAt(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const h = String(date.getHours()).padStart(2, '0');
  const min = String(date.getMinutes()).padStart(2, '0');
  return `${y}/${m}/${day} ${h}:${min}`;
}

export function saveOrderEvaluation(orderId: string, rating: number, feedback: string) {
  const record: OrderEvaluationRecord = {
    orderId,
    rating,
    feedback,
    submittedAt: formatSubmittedAt(),
  };
  orderEvaluationRecords.value = {
    ...orderEvaluationRecords.value,
    [orderId]: record,
  };
  return record;
}
