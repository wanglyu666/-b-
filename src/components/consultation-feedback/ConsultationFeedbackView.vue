<script setup lang="ts">
import { ref, computed, nextTick } from 'vue';
import {
  Calendar,
  MessageSquare,
  FilePlus,
  MessageCirclePlus,
  MessagesSquare,
  MoreHorizontal,
  X,
} from 'lucide-vue-next';
import TopBarActions from '../TopBarActions.vue';
import { engineeringProjects } from '../../data';
import {
  CONSULTATION_STATUSES,
  type ConsultationSheetStatus,
  type ConsultationRecord,
  latestConsultationsInStatus,
} from '../../data/consultations';
import { truncateWithEllipsis } from '../../utils/string';
import imgFeedbackNewConsultation from '../../../image asset/feedback.png';
import imgFeedbackNewOpinion from '../../../image asset/feedback_2.png';
import checkMarkImg from '../../../image asset/check mark.png';

const REQUIREMENT_MAX_LEN = 50;

/** 下方两处插图尺寸（像素），按需改数字即可 */
const imgNewConsultationSizePx = 260;
const imgNewOpinionSizePx = 260;

/** 插图水平偏移（像素）：正数向右，负数向左 */
const imgNewConsultationOffsetXPx = 0;
const imgNewOpinionOffsetXPx = 20;

/**
 * 咨询单弹窗：表单 + 底部「确定」区整体左移（像素）。
 * 正数 = 向左移（收紧左侧留白）；0 = 不移动；需要略向右移可填负数。
 * 仅改此数字即可手工微调。
 */
const CONSULTATION_MODAL_SHIFT_LEFT_PX = 24;

const emit = defineEmits<{
  openAllConsultations: [payload: { status: ConsultationSheetStatus; openConsultationId?: string }];
}>();

const consultationSheetStatus = ref<ConsultationSheetStatus>('待回复');
const statusOptions = CONSULTATION_STATUSES;

/** 当前选中状态下按时间倒序，展示该状态内最新 2 条 */
const currentConsultationCards = computed(() =>
  latestConsultationsInStatus(consultationSheetStatus.value, 2),
);

function goToAllConsultations() {
  emit('openAllConsultations', { status: consultationSheetStatus.value });
}

function goToAllConsultationsOpenDetail(item: ConsultationRecord) {
  emit('openAllConsultations', { status: item.status, openConsultationId: item.id });
}

/** 仅点击白底区域（标题栏、留白等）跳转；子卡片内点击由 @click.stop 拦截 */
function onConsultationSheetBackgroundClick() {
  goToAllConsultations();
}

function requirementPreview(text: string) {
  return truncateWithEllipsis(text, REQUIREMENT_MAX_LEN);
}

/** 意见反馈表格（最多 4 行，风格对齐维保工单列表） */
type FeedbackTableStatus = '待回复' | '进行中' | '已结束';

const feedbackTableRows: {
  id: string;
  projectName: string;
  time: string;
  status: FeedbackTableStatus;
}[] = [
  { id: 'fb1', projectName: '绿地中心 45 层办公区装修', time: '2026-03-28 09:30', status: '待回复' },
  { id: 'fb2', projectName: '星巴克上海臻选烘焙工坊', time: '2026-03-27 14:15', status: '进行中' },
  { id: 'fb3', projectName: '国际会展中心展厅搭建', time: '2026-03-26 11:00', status: '已结束' },
  { id: 'fb4', projectName: '万科城3期精装房改造', time: '2026-03-25 16:45', status: '待回复' },
];

function feedbackStatusClass(status: FeedbackTableStatus) {
  const map: Record<FeedbackTableStatus, string> = {
    待回复: 'bg-blue-500/20 text-blue-600',
    进行中: 'bg-orange-500/20 text-orange-600',
    已结束: 'bg-[#A1D573]/20 text-[#163300]',
  };
  return map[status];
}

/** 新增意见反馈弹窗（工程项目列表与 data 中工程项目管理一致） */
const showFeedbackModal = ref(false);
const feedbackModalStep = ref<'form' | 'success'>('form');
const feedbackModalPanelRef = ref<HTMLElement | null>(null);

/** 意见反馈：表单 → 成功页，与咨询单弹窗相同的高度过渡 */
const morphFeedbackModalStep = async (nextStep: 'form' | 'success') => {
  const panel = feedbackModalPanelRef.value;
  if (!panel) {
    feedbackModalStep.value = nextStep;
    return;
  }

  const fromHeight = panel.getBoundingClientRect().height;
  panel.style.overflow = 'hidden';
  panel.style.height = `${fromHeight}px`;
  panel.style.transition = 'none';

  feedbackModalStep.value = nextStep;
  await nextTick();

  panel.style.height = 'auto';
  const toHeight = panel.getBoundingClientRect().height;
  panel.style.height = `${fromHeight}px`;

  if (Math.round(fromHeight) === Math.round(toHeight)) {
    panel.style.height = '';
    panel.style.transition = '';
    panel.style.overflow = '';
    return;
  }

  panel.getBoundingClientRect();
  requestAnimationFrame(() => {
    panel.style.transition = 'height 0.8s cubic-bezier(0.16, 1, 0.3, 1)';
    panel.style.height = `${toHeight}px`;
  });

  const onDone = (event: TransitionEvent) => {
    if (event.propertyName !== 'height') return;
    panel.style.height = '';
    panel.style.transition = '';
    panel.style.overflow = '';
    panel.removeEventListener('transitionend', onDone);
  };

  panel.addEventListener('transitionend', onDone);
};

const feedbackForm = ref({
  projectId: '',
  content: '',
  files: [] as File[],
});

const isFeedbackFormValid = computed(
  () => Boolean(feedbackForm.value.projectId && feedbackForm.value.content.trim()),
);

function openFeedbackModal() {
  feedbackModalStep.value = 'form';
  showFeedbackModal.value = true;
}

function resetFeedbackForm() {
  feedbackForm.value = { projectId: '', content: '', files: [] };
}

function closeFeedbackModal() {
  const panel = feedbackModalPanelRef.value;
  if (panel) {
    panel.style.height = '';
    panel.style.transition = '';
    panel.style.overflow = '';
  }
  showFeedbackModal.value = false;
  feedbackModalStep.value = 'form';
  resetFeedbackForm();
}

function handleFeedbackFileChange(event: Event) {
  const target = event.target as HTMLInputElement;
  if (target.files) {
    const newFiles = Array.from(target.files);
    const total = feedbackForm.value.files.length + newFiles.length;
    if (total > 5) {
      alert('最多只能上传5个文件');
      const allowed = newFiles.slice(0, Math.max(0, 5 - feedbackForm.value.files.length));
      feedbackForm.value.files = [...feedbackForm.value.files, ...allowed];
    } else {
      feedbackForm.value.files = [...feedbackForm.value.files, ...newFiles];
    }
  }
  if (target) target.value = '';
}

function removeFeedbackFile(index: number) {
  feedbackForm.value.files.splice(index, 1);
}

function submitFeedbackForm() {
  if (!isFeedbackFormValid.value) return;
  void morphFeedbackModalStep('success');
}

/** 新增咨询单弹窗（服务与产品咨询单） */
const showConsultationModal = ref(false);
const consultationModalStep = ref<'form' | 'success'>('form');
const consultationModalPanelRef = ref<HTMLElement | null>(null);

/**
 * 咨询单弹窗：表单 → 成功页 高度过渡。
 * 先锁定当前高度再换内容，避免一帧内先变成「成功页矮高度」的闪烁；
 * 用 height:auto 同步测量目标高度后立即恢复起点，再开启动画（与维保逻辑同曲线，顺序更稳）。
 */
const morphConsultationModalStep = async (nextStep: 'form' | 'success') => {
  const panel = consultationModalPanelRef.value;
  if (!panel) {
    consultationModalStep.value = nextStep;
    return;
  }

  const fromHeight = panel.getBoundingClientRect().height;
  panel.style.overflow = 'hidden';
  panel.style.height = `${fromHeight}px`;
  panel.style.transition = 'none';

  consultationModalStep.value = nextStep;
  await nextTick();

  panel.style.height = 'auto';
  const toHeight = panel.getBoundingClientRect().height;
  panel.style.height = `${fromHeight}px`;

  if (Math.round(fromHeight) === Math.round(toHeight)) {
    panel.style.height = '';
    panel.style.transition = '';
    panel.style.overflow = '';
    return;
  }

  panel.getBoundingClientRect();
  requestAnimationFrame(() => {
    panel.style.transition = 'height 0.8s cubic-bezier(0.16, 1, 0.3, 1)';
    panel.style.height = `${toHeight}px`;
  });

  const onDone = (event: TransitionEvent) => {
    if (event.propertyName !== 'height') return;
    panel.style.height = '';
    panel.style.transition = '';
    panel.style.overflow = '';
    panel.removeEventListener('transitionend', onDone);
  };

  panel.addEventListener('transitionend', onDone);
};

const consultationForm = ref({
  serviceAddress: '',
  contactName: '',
  contactPhone: '',
  surveyDate: '',
  serviceStartDate: '',
  durationDays: 0,
  needQuote: '' as '' | '是' | '否',
  requirement: '',
  files: [] as File[],
});

const isConsultationFormValid = computed(
  () =>
    Boolean(
      consultationForm.value.serviceAddress.trim() &&
        consultationForm.value.serviceStartDate &&
        consultationForm.value.needQuote &&
        consultationForm.value.requirement.trim(),
    ),
);

function openConsultationModal() {
  consultationModalStep.value = 'form';
  showConsultationModal.value = true;
}

function resetConsultationForm() {
  consultationForm.value = {
    serviceAddress: '',
    contactName: '',
    contactPhone: '',
    surveyDate: '',
    serviceStartDate: '',
    durationDays: 0,
    needQuote: '',
    requirement: '',
    files: [],
  };
}

function closeConsultationModal() {
  const panel = consultationModalPanelRef.value;
  if (panel) {
    panel.style.height = '';
    panel.style.transition = '';
    panel.style.overflow = '';
  }
  showConsultationModal.value = false;
  consultationModalStep.value = 'form';
  resetConsultationForm();
}

function adjustDurationDays(delta: number) {
  const next = consultationForm.value.durationDays + delta;
  consultationForm.value.durationDays = Math.max(0, next);
}

/** YYYY-MM-DD → yyyy/mm/dd（与维保报修「上门时间」展示一致） */
function formatDateSlash(isoDate: string): string {
  if (!isoDate?.trim()) return '';
  const m = isoDate.trim().match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!m) return isoDate;
  return `${m[1]}/${m[2]}/${m[3]}`;
}

const surveyDatePickerRef = ref<HTMLInputElement | null>(null);
const serviceStartDatePickerRef = ref<HTMLInputElement | null>(null);

function openSurveyDatePicker() {
  const el = surveyDatePickerRef.value;
  if (!el) return;
  try {
    el.showPicker?.();
  } catch {
    /* 部分浏览器不支持 showPicker */
  }
  el.focus();
}

function openServiceStartDatePicker() {
  const el = serviceStartDatePickerRef.value;
  if (!el) return;
  try {
    el.showPicker?.();
  } catch {
    /* 部分浏览器不支持 showPicker */
  }
  el.focus();
}

function handleConsultationFileChange(event: Event) {
  const target = event.target as HTMLInputElement;
  if (target.files) {
    const newFiles = Array.from(target.files);
    const total = consultationForm.value.files.length + newFiles.length;
    if (total > 5) {
      alert('最多只能上传5个文件');
      const allowed = newFiles.slice(0, Math.max(0, 5 - consultationForm.value.files.length));
      consultationForm.value.files = [...consultationForm.value.files, ...allowed];
    } else {
      consultationForm.value.files = [...consultationForm.value.files, ...newFiles];
    }
  }
  if (target) target.value = '';
}

function removeConsultationFile(index: number) {
  consultationForm.value.files.splice(index, 1);
}

function submitConsultationForm() {
  if (!isConsultationFormValid.value) return;
  void morphConsultationModalStep('success');
}
</script>

<template>
  <div class="min-h-screen bg-transparent relative overflow-x-hidden">
    <div class="relative z-10 p-8 max-w-[1600px] mx-auto animate-in fade-in duration-700">
      <header class="flex justify-between items-center mb-8">
        <div>
          <h1 class="text-3xl font-bold text-gray-800">咨询与反馈</h1>
          <p class="text-gray-500 mt-1">咨询单与意见反馈入口</p>
        </div>
        <TopBarActions :isShop="false" />
      </header>

      <!-- 左约 1/3：咨询单全高；右约 2/3：上两格等宽 + 下通栏 -->
      <div
        class="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:grid-rows-[minmax(200px,1fr)_auto] lg:gap-6 lg:min-h-[min(720px,calc(100vh-12rem))]"
      >
        <!-- 咨询单：左侧整列（跨两行）— 上 100px 状态胶囊 + 下方卡片 -->
        <div
          class="order-1 flex min-h-[280px] flex-col gap-3 lg:order-none lg:col-span-4 lg:row-span-2 lg:row-start-1 lg:h-full lg:min-h-0"
        >
          <div
            class="flex h-[100px] w-full flex-shrink-0 items-center gap-3 sm:gap-4"
            role="tablist"
            aria-label="咨询单状态"
          >
            <button
              v-for="label in statusOptions"
              :key="label"
              type="button"
              role="tab"
              :aria-selected="consultationSheetStatus === label"
              @click="consultationSheetStatus = label"
              :class="[
                'flex min-h-[48px] min-w-0 flex-1 items-center justify-center rounded-full px-2 py-3.5 text-sm font-bold transition-all sm:min-h-[52px] sm:px-4 sm:text-base',
                consultationSheetStatus === label
                  ? 'bg-[#9FE870] text-[#163300] shadow-sm border border-[#9FE870]/40'
                  : 'border border-white/35 bg-white/45 text-[#163300]/85 backdrop-blur-md shadow-sm hover:bg-white/55',
              ]"
            >
              {{ label }}
            </button>
          </div>
          <section
            class="flex min-h-0 flex-1 cursor-pointer flex-col rounded-3xl border border-gray-100 bg-white p-6 shadow-sm"
            role="button"
            tabindex="0"
            aria-label="在咨询单卡片空白或标题区域点击可查看全部咨询"
            @click="onConsultationSheetBackgroundClick"
            @keydown.enter.prevent="onConsultationSheetBackgroundClick"
            @keydown.space.prevent="onConsultationSheetBackgroundClick"
          >
            <div class="mb-4 flex items-center justify-between">
              <div class="flex items-center gap-2">
                <div class="h-5 w-1 rounded-full bg-[#FFEB69]" />
                <h2 class="text-lg font-bold text-gray-800">咨询单</h2>
              </div>
              <MessageSquare :size="20" class="text-gray-400" />
            </div>
            <div
              class="flex min-h-0 flex-1 flex-col gap-4 overflow-hidden pr-0.5"
            >
              <article
                v-for="item in currentConsultationCards"
                :key="item.id"
                data-consultation-item
                role="button"
                tabindex="0"
                class="flex min-h-0 flex-1 basis-0 cursor-pointer flex-col rounded-2xl border border-gray-100 bg-gray-50/90 p-5 text-left shadow-sm ring-1 ring-gray-100/80 transition-all hover:border-[#9FE870]/50 hover:bg-white hover:shadow-md"
                @click.stop="goToAllConsultationsOpenDetail(item)"
                @keydown.enter.prevent="goToAllConsultationsOpenDetail(item)"
                @keydown.space.prevent="goToAllConsultationsOpenDetail(item)"
              >
                <h3 class="mb-4 line-clamp-2 text-base font-bold leading-snug text-gray-900">
                  {{ item.title }}
                </h3>
                <div class="mb-4 flex-shrink-0">
                  <p class="text-[10px] font-bold uppercase tracking-wider text-gray-400">咨询时间</p>
                  <p class="mt-1.5 font-mono text-sm font-semibold tabular-nums text-gray-800">
                    {{ item.time }}
                  </p>
                </div>
                <div class="flex min-h-0 flex-1 flex-col">
                  <p class="flex-shrink-0 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                    需求
                  </p>
                  <p
                    class="mt-2 min-h-0 flex-1 text-sm leading-[1.75] text-gray-600"
                    :title="item.requirement.length > REQUIREMENT_MAX_LEN ? item.requirement : undefined"
                  >
                    {{ requirementPreview(item.requirement) }}
                  </p>
                </div>
              </article>
            </div>
          </section>
        </div>

        <!-- 新增咨询单 -->
        <section
          class="order-2 flex min-h-[120px] flex-col rounded-3xl border border-white/20 bg-white/40 p-6 shadow-sm backdrop-blur-md lg:order-none lg:col-span-4 lg:row-start-1 lg:col-start-5 lg:min-h-[200px] lg:h-full"
        >
          <div class="mb-4 flex items-center justify-between">
            <div class="flex items-center gap-2">
              <div class="h-5 w-1 rounded-full bg-[#FFEB69]" />
              <h2 class="text-lg font-bold text-gray-800">新增咨询单</h2>
            </div>
            <FilePlus :size="20" class="text-gray-400" />
          </div>
          <div class="relative flex min-h-0 min-w-0 flex-1 items-center justify-start">
            <img
              :src="imgFeedbackNewConsultation"
              alt="新增咨询单"
              class="shrink-0 object-contain object-left"
              :style="{
                width: `${imgNewConsultationSizePx}px`,
                height: `${imgNewConsultationSizePx}px`,
                marginLeft: `${imgNewConsultationOffsetXPx}px`,
              }"
            />
            <button
              type="button"
              class="absolute bottom-4 right-4 shrink-0 rounded-full border border-[#9FE870]/40 bg-[#9FE870] px-8 py-3.5 text-base font-bold text-[#163300] shadow-sm transition hover:brightness-[0.97] active:scale-[0.98]"
              @click.stop="openConsultationModal"
            >
              新增咨询
            </button>
          </div>
        </section>

        <!-- 新增意见反馈 -->
        <section
          class="order-3 flex min-h-[120px] flex-col rounded-3xl border border-gray-100 bg-white p-6 shadow-sm lg:order-none lg:col-span-4 lg:row-start-1 lg:col-start-9 lg:min-h-[200px] lg:h-full"
        >
          <div class="mb-4 flex items-center justify-between">
            <div class="flex items-center gap-2">
              <div class="h-5 w-1 rounded-full bg-[#FFEB69]" />
              <h2 class="text-lg font-bold text-gray-800">新增意见反馈</h2>
            </div>
            <MessageCirclePlus :size="20" class="text-gray-400" />
          </div>
          <div class="relative flex min-h-0 min-w-0 flex-1 items-center justify-start">
            <img
              :src="imgFeedbackNewOpinion"
              alt="新增意见反馈"
              class="shrink-0 object-contain object-left"
              :style="{
                width: `${imgNewOpinionSizePx}px`,
                height: `${imgNewOpinionSizePx}px`,
                marginLeft: `${imgNewOpinionOffsetXPx}px`,
              }"
            />
            <button
              type="button"
              class="absolute bottom-4 right-4 shrink-0 rounded-full border border-[#9FE870]/40 bg-[#9FE870] px-8 py-3.5 text-base font-bold text-[#163300] shadow-sm transition hover:brightness-[0.97] active:scale-[0.98]"
              @click.stop="openFeedbackModal"
            >
              新增反馈
            </button>
          </div>
        </section>

        <!-- 意见反馈：底部通栏（与上两格总宽对齐） -->
        <section
          class="order-4 flex min-h-[300px] flex-col rounded-3xl border border-white/20 bg-white/40 p-6 shadow-sm backdrop-blur-md lg:order-none lg:col-span-8 lg:row-start-2 lg:col-start-5"
        >
          <div class="mb-4 flex shrink-0 items-center justify-between">
            <div class="flex items-center gap-2">
              <div class="h-5 w-1 rounded-full bg-[#FFEB69]" />
              <h2 class="text-lg font-bold text-gray-800">意见反馈</h2>
            </div>
            <MessagesSquare :size="20" class="text-gray-400" />
          </div>
          <div
            class="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-white/30 bg-white/40 shadow-inner backdrop-blur-sm"
          >
            <div
              class="min-h-0 flex-1 overflow-x-auto overflow-y-hidden px-3 pb-1 pt-0 sm:px-5 sm:pb-2"
            >
              <table class="w-full min-w-[560px] border-collapse text-left">
                <thead>
                  <tr class="border-b border-white/10 text-sm font-medium text-gray-500">
                    <th class="whitespace-nowrap px-1 py-3 pl-0 sm:px-2 sm:py-4">序号</th>
                    <th class="whitespace-nowrap px-2 py-3 sm:py-4">项目名称</th>
                    <th class="whitespace-nowrap px-2 py-3 sm:py-4">反馈时间</th>
                    <th class="whitespace-nowrap px-2 py-3 sm:py-4">状态</th>
                    <th class="w-12 min-w-[2.75rem] py-3 text-right sm:py-4" aria-hidden="true" />
                  </tr>
                </thead>
                <tbody class="divide-y divide-white/10">
                  <tr
                    v-for="(row, index) in feedbackTableRows"
                    :key="row.id"
                    class="group transition-colors hover:bg-white/30"
                  >
                    <td class="px-1 py-3 pl-0 text-sm text-gray-600 tabular-nums sm:px-2 sm:py-4">
                      {{ index + 1 }}
                    </td>
                    <td class="max-w-[12rem] truncate px-2 py-3 text-sm font-medium text-gray-800 sm:max-w-none sm:py-4" :title="row.projectName">
                      {{ row.projectName }}
                    </td>
                    <td class="whitespace-nowrap px-2 py-3 font-mono text-sm text-gray-600 sm:py-4">
                      {{ row.time }}
                    </td>
                    <td class="px-2 py-3 sm:py-4">
                      <span
                        class="inline-flex rounded-full px-3 py-1 text-xs font-bold"
                        :class="feedbackStatusClass(row.status)"
                      >
                        {{ row.status }}
                      </span>
                    </td>
                    <td class="py-3 text-right sm:py-4">
                      <button
                        type="button"
                        class="inline-flex rounded-md border border-gray-200 bg-white p-1.5 text-gray-500 opacity-0 shadow-sm transition-opacity group-hover:opacity-100 hover:text-[#A1D573] focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9FE870]/40"
                        aria-label="更多操作"
                        @click.stop
                      >
                        <MoreHorizontal :size="16" />
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>
    </div>
  </div>

  <Teleport to="body">
    <div
      v-if="showFeedbackModal"
      class="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      :aria-labelledby="feedbackModalStep === 'form' ? 'feedback-modal-title' : 'feedback-success-title'"
    >
      <div
        class="absolute inset-0 bg-black/40 backdrop-blur-md"
        @click="closeFeedbackModal"
      />
      <div
        ref="feedbackModalPanelRef"
        class="relative flex w-full max-w-xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl max-h-[min(640px,90vh)]"
        @click.stop
      >
        <div class="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <h2
            v-if="feedbackModalStep === 'form'"
            id="feedback-modal-title"
            class="text-lg font-bold text-gray-800 sm:text-xl"
          >
            意见反馈
          </h2>
          <h2
            v-else
            id="feedback-success-title"
            class="text-lg font-bold text-gray-800 sm:text-xl"
          >
            提交成功
          </h2>
          <button
            type="button"
            class="rounded-full p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
            aria-label="关闭"
            @click="closeFeedbackModal"
          >
            <X :size="20" />
          </button>
        </div>

        <template v-if="feedbackModalStep === 'form'">
          <div class="min-h-0 flex-1 space-y-6 overflow-y-auto px-6 py-5">
            <p class="text-sm leading-relaxed text-gray-600">
              尊敬的客户：您好！感谢您一直以来的信任与支持。为持续改进我们的服务与产品，诚邀您留下宝贵意见与建议，我们将认真对待每一条反馈。
            </p>

            <div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
              <label class="shrink-0 text-sm font-medium text-gray-700 sm:w-24">项目</label>
              <select
                v-model="feedbackForm.projectId"
                class="feedback-modal-project-select w-full min-w-0 rounded-lg border border-[#E8C84B] bg-white px-3 py-2.5 text-sm text-gray-800 shadow-sm focus:border-[#FFEB69] focus:outline-none focus:ring-2 focus:ring-[#FFEB69]/40"
              >
                <option value="" disabled>请选择</option>
                <option v-for="p in engineeringProjects" :key="p.id" :value="p.id">
                  {{ p.name }}（{{ p.no }}）
                </option>
              </select>
            </div>

            <div class="flex flex-col gap-2 sm:flex-row sm:items-start sm:gap-4">
              <label class="shrink-0 pt-1 text-sm font-medium text-gray-700 sm:w-24">
                <span class="text-red-500">*</span> 反馈信息
              </label>
              <textarea
                v-model="feedbackForm.content"
                rows="5"
                placeholder="请输入反馈信息"
                class="w-full min-w-0 resize-y rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:border-[#FFEB69] focus:outline-none focus:ring-2 focus:ring-[#FFEB69]/30"
              />
            </div>

            <div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:gap-4">
              <label class="shrink-0 pt-2 text-sm font-medium text-gray-700 sm:w-24">上传图片或视频</label>
              <div class="flex min-w-0 flex-1 flex-col gap-3">
                <div class="flex flex-wrap items-center gap-3">
                  <label
                    class="cursor-pointer rounded-lg bg-[#FFEB69] px-4 py-2 text-sm font-medium text-[#3A341C] shadow-sm transition-colors hover:bg-[#f5e05a]"
                    :class="{ 'cursor-not-allowed opacity-50': feedbackForm.files.length >= 5 }"
                  >
                    选取文件
                    <input
                      type="file"
                      class="hidden"
                      accept="image/*,video/*"
                      multiple
                      :disabled="feedbackForm.files.length >= 5"
                      @change="handleFeedbackFileChange"
                    />
                  </label>
                  <span class="text-sm text-gray-500">
                    最多上传5个文件 ({{ feedbackForm.files.length }}/5)
                  </span>
                </div>
                <div v-if="feedbackForm.files.length > 0" class="flex flex-wrap gap-2">
                  <div
                    v-for="(file, index) in feedbackForm.files"
                    :key="index + file.name"
                    class="flex max-w-[220px] items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5"
                  >
                    <span class="flex-1 truncate text-sm text-gray-600" :title="file.name">{{ file.name }}</span>
                    <button
                      type="button"
                      class="shrink-0 text-gray-400 transition-colors hover:text-red-500"
                      @click="removeFeedbackFile(index)"
                    >
                      <X :size="14" />
                    </button>
                  </div>
                </div>
                <span v-else class="text-sm text-gray-400">未选择任何文件</span>
              </div>
            </div>
          </div>

          <div class="flex justify-end border-t border-gray-100 bg-gray-50/80 px-6 py-4">
            <button
              type="button"
              class="rounded-full px-10 py-2.5 text-sm font-bold text-[#3A341C] shadow-sm transition-colors"
              :class="
                isFeedbackFormValid
                  ? 'bg-[#FFEB69] hover:bg-[#f5e05a]'
                  : 'cursor-not-allowed bg-gray-200 text-gray-400'
              "
              :disabled="!isFeedbackFormValid"
              @click="submitFeedbackForm"
            >
              确定
            </button>
          </div>
        </template>

        <div
          v-else
          class="flex min-h-[400px] flex-1 flex-col items-center justify-center px-8 py-12"
        >
          <img :src="checkMarkImg" alt="" class="mb-6 h-36 w-56 object-contain" />
          <h3 class="mb-4 text-3xl font-bold tracking-tight text-gray-800">已完成提交</h3>
          <p class="mb-12 text-center text-gray-500">您的意见反馈已成功提交</p>
          <button
            type="button"
            class="rounded-xl border border-gray-200 bg-white px-8 py-3 font-bold text-[#3A341C] shadow-sm transition-colors hover:bg-gray-50"
            @click="closeFeedbackModal"
          >
            返回上级页面
          </button>
        </div>
      </div>
    </div>
  </Teleport>

  <Teleport to="body">
    <div
      v-if="showConsultationModal"
      class="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      :aria-labelledby="
        consultationModalStep === 'form' ? 'consultation-modal-title' : 'consultation-success-title'
      "
    >
      <div
        class="absolute inset-0 bg-black/40 backdrop-blur-md"
        @click="closeConsultationModal"
      />
      <div
        ref="consultationModalPanelRef"
        class="relative flex w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl max-h-[min(980px,96vh)]"
        @click.stop
      >
        <div class="relative flex items-center justify-center border-b border-gray-100 px-8 py-5 sm:px-10">
          <h2
            v-if="consultationModalStep === 'form'"
            id="consultation-modal-title"
            class="text-center text-lg font-bold text-gray-800 sm:text-xl"
          >
            服务与产品咨询单
          </h2>
          <h2
            v-else
            id="consultation-success-title"
            class="text-center text-lg font-bold text-gray-800 sm:text-xl"
          >
            提交成功
          </h2>
          <button
            type="button"
            class="absolute right-4 top-1/2 -translate-y-1/2 rounded-full p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 sm:right-6"
            aria-label="关闭"
            @click="closeConsultationModal"
          >
            <X :size="20" />
          </button>
        </div>

        <template v-if="consultationModalStep === 'form'">
        <div
          class="min-w-0"
          :style="{ transform: `translateX(-${CONSULTATION_MODAL_SHIFT_LEFT_PX}px)` }"
        >
        <div class="space-y-6 px-8 py-6 sm:px-10">
            <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-5">
              <label class="shrink-0 text-right text-sm font-medium text-gray-700 sm:w-36">
                <span class="text-red-500">*</span> 服务地址
              </label>
              <input
                v-model="consultationForm.serviceAddress"
                type="text"
                placeholder="请输入服务地址"
                class="h-10 w-full min-w-0 flex-1 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-800 placeholder:text-gray-400 focus:border-[#FFEB69] focus:outline-none focus:ring-2 focus:ring-[#FFEB69]/30"
              />
            </div>

            <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-5">
              <label class="shrink-0 text-right text-sm font-medium text-gray-700 sm:w-36">联系人</label>
              <input
                v-model="consultationForm.contactName"
                type="text"
                placeholder="请输入联系人"
                class="h-10 w-full min-w-0 flex-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800 placeholder:text-gray-400 focus:border-[#FFEB69] focus:outline-none focus:ring-2 focus:ring-[#FFEB69]/30"
              />
            </div>

            <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-5">
              <label class="shrink-0 text-right text-sm font-medium text-gray-700 sm:w-36">联系电话</label>
              <input
                v-model="consultationForm.contactPhone"
                type="tel"
                inputmode="tel"
                placeholder="请输入联系电话"
                class="h-10 w-full min-w-0 flex-1 rounded-lg border border-gray-200 bg-white px-3 py-2 font-mono text-sm text-gray-800 placeholder:text-gray-400 focus:border-[#FFEB69] focus:outline-none focus:ring-2 focus:ring-[#FFEB69]/30"
              />
            </div>

            <div class="flex flex-col gap-6 sm:flex-row sm:items-start sm:gap-10">
              <div class="flex min-w-0 flex-1 flex-col gap-3 sm:flex-row sm:items-center sm:gap-5">
                <label class="shrink-0 pt-2 text-right text-sm font-medium text-gray-700 sm:w-36">
                  期望探勘时间
                </label>
                <div class="relative w-full max-w-[240px]">
                  <input
                    ref="surveyDatePickerRef"
                    v-model="consultationForm.surveyDate"
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
                    :value="formatDateSlash(consultationForm.surveyDate)"
                    placeholder="yyyy/mm/dd"
                    class="relative z-[1] h-10 w-full cursor-pointer rounded-lg border border-gray-200 bg-white py-2 pl-10 pr-4 text-sm text-gray-700 placeholder:text-gray-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#FFEB69] transition-all"
                    @click="openSurveyDatePicker"
                  />
                </div>
              </div>
              <div class="flex min-w-0 flex-1 flex-col gap-3 sm:flex-row sm:items-center sm:gap-5">
                <label class="shrink-0 pt-2 text-right text-sm font-medium text-gray-700 sm:w-36">
                  <span class="text-red-500">*</span> 期望服务开始时间
                </label>
                <div class="relative w-full max-w-[240px]">
                  <input
                    ref="serviceStartDatePickerRef"
                    v-model="consultationForm.serviceStartDate"
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
                    :value="formatDateSlash(consultationForm.serviceStartDate)"
                    placeholder="yyyy/mm/dd"
                    class="relative z-[1] h-10 w-full cursor-pointer rounded-lg border border-gray-200 bg-white py-2 pl-10 pr-4 text-sm text-gray-700 placeholder:text-gray-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#FFEB69] transition-all"
                    @click="openServiceStartDatePicker"
                  />
                </div>
              </div>
            </div>

            <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-5">
              <label class="shrink-0 text-right text-sm font-medium text-gray-700 sm:w-36">期望工期</label>
              <div class="flex flex-1 items-center gap-3">
                <button
                  type="button"
                  class="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-gray-50 text-lg text-gray-600 transition hover:bg-gray-100"
                  aria-label="减少天数"
                  @click="adjustDurationDays(-1)"
                >
                  −
                </button>
                <span class="min-w-[2rem] text-center text-sm font-semibold tabular-nums text-gray-800">
                  {{ consultationForm.durationDays }}
                </span>
                <button
                  type="button"
                  class="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-gray-50 text-lg text-gray-600 transition hover:bg-gray-100"
                  aria-label="增加天数"
                  @click="adjustDurationDays(1)"
                >
                  +
                </button>
                <span class="text-sm text-gray-600">天</span>
              </div>
            </div>

            <div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:gap-5">
              <label class="shrink-0 pt-1 text-right text-sm font-medium text-gray-700 sm:w-36">
                <span class="text-red-500">*</span> 是否需要报价
              </label>
              <div class="flex flex-1 flex-wrap items-center gap-6">
                <label class="flex cursor-pointer items-center gap-2">
                  <input
                    v-model="consultationForm.needQuote"
                    type="radio"
                    value="是"
                    class="h-4 w-4 border-gray-300 text-[#FFEB69] focus:ring-[#FFEB69]"
                  />
                  <span class="text-sm text-gray-800">是</span>
                </label>
                <label class="flex cursor-pointer items-center gap-2">
                  <input
                    v-model="consultationForm.needQuote"
                    type="radio"
                    value="否"
                    class="h-4 w-4 border-gray-300 text-[#FFEB69] focus:ring-[#FFEB69]"
                  />
                  <span class="text-sm text-gray-800">否</span>
                </label>
              </div>
            </div>

            <div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:gap-5">
              <label class="shrink-0 pt-1 text-right text-sm font-medium text-gray-700 sm:w-36">
                <span class="text-red-500">*</span> 需求
              </label>
              <textarea
                v-model="consultationForm.requirement"
                rows="4"
                placeholder="请描述您的需求"
                class="min-h-[6.5rem] w-full flex-1 resize-y rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:border-[#FFEB69] focus:outline-none focus:ring-2 focus:ring-[#FFEB69]/30"
              />
            </div>

            <div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:gap-5">
              <label class="shrink-0 pt-2 text-right text-sm font-medium text-gray-700 sm:w-36">相关资料</label>
              <div class="flex min-w-0 flex-1 flex-col gap-3">
                <div class="flex flex-wrap items-center gap-3">
                  <label
                    class="cursor-pointer rounded-lg bg-[#FFEB69] px-4 py-2 text-sm font-medium text-[#3A341C] shadow-sm transition-colors hover:bg-[#f5e05a]"
                    :class="{ 'cursor-not-allowed opacity-50': consultationForm.files.length >= 5 }"
                  >
                    选取文件
                    <input
                      type="file"
                      class="hidden"
                      accept="image/*,video/*"
                      multiple
                      :disabled="consultationForm.files.length >= 5"
                      @change="handleConsultationFileChange"
                    />
                  </label>
                  <span class="text-sm text-gray-500">
                    最多上传5个文件 ({{ consultationForm.files.length }}/5)
                  </span>
                </div>
                <div v-if="consultationForm.files.length > 0" class="flex flex-wrap gap-2">
                  <div
                    v-for="(file, index) in consultationForm.files"
                    :key="index + file.name"
                    class="flex max-w-[220px] items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5"
                  >
                    <span class="flex-1 truncate text-sm text-gray-600" :title="file.name">{{ file.name }}</span>
                    <button
                      type="button"
                      class="shrink-0 text-gray-400 transition-colors hover:text-red-500"
                      @click="removeConsultationFile(index)"
                    >
                      <X :size="14" />
                    </button>
                  </div>
                </div>
                <span v-else class="text-sm text-gray-400">未选择任何文件</span>
              </div>
            </div>
        </div>

        <div class="flex justify-end border-t border-gray-100 bg-gray-50/80 px-8 py-5 sm:px-10">
          <button
            type="button"
            class="rounded-full px-10 py-2.5 text-sm font-bold text-[#3A341C] shadow-sm transition-colors"
            :class="
              isConsultationFormValid
                ? 'bg-[#FFEB69] hover:bg-[#f5e05a]'
                : 'cursor-not-allowed bg-gray-200 text-gray-400'
            "
            :disabled="!isConsultationFormValid"
            @click="submitConsultationForm"
          >
            确定
          </button>
        </div>
        </div>
        </template>

        <template v-else>
          <div
            class="flex min-h-[400px] flex-1 flex-col items-center justify-center px-8 py-12"
          >
            <img :src="checkMarkImg" alt="" class="mb-6 h-36 w-56 object-contain" />
            <h3 class="mb-4 text-3xl font-bold tracking-tight text-gray-800">已完成提交</h3>
            <p class="mb-12 text-center text-gray-500">您的服务与产品咨询单已成功提交</p>
            <button
              type="button"
              class="rounded-xl border border-gray-200 bg-white px-8 py-3 font-bold text-[#3A341C] shadow-sm transition-colors hover:bg-gray-50"
              @click="closeConsultationModal"
            >
              返回上级页面
            </button>
          </div>
        </template>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
/* 与管理中心等页一致的毛玻璃卡片，无额外全局样式 */
.feedback-modal-project-select {
  accent-color: #ffeb69;
}
.feedback-modal-project-select option:checked,
.feedback-modal-project-select option:hover {
  background-color: #ffeb69;
  color: #3a341c;
}

</style>
