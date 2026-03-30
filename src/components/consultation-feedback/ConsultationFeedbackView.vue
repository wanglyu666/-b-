<script setup lang="ts">
import { ref, computed } from 'vue';
import { MessageSquare, FilePlus, MessageCirclePlus, MessagesSquare } from 'lucide-vue-next';
import TopBarActions from '../TopBarActions.vue';
import {
  CONSULTATION_STATUSES,
  type ConsultationSheetStatus,
  previewConsultations,
} from '../../data/consultations';
import { truncateWithEllipsis } from '../../utils/string';
import imgFeedbackNewConsultation from '../../../image asset/feedback.png';
import imgFeedbackNewOpinion from '../../../image asset/feedback_2.png';

const REQUIREMENT_MAX_LEN = 50;

/** 下方两处插图尺寸（像素），按需改数字即可 */
const imgNewConsultationSizePx = 260;
const imgNewOpinionSizePx = 260;

/** 插图水平偏移（像素）：正数向右，负数向左 */
const imgNewConsultationOffsetXPx = 0;
const imgNewOpinionOffsetXPx = 20;

const emit = defineEmits<{
  openAllConsultations: [status: ConsultationSheetStatus];
}>();

const consultationSheetStatus = ref<ConsultationSheetStatus>('待回复');
const statusOptions = CONSULTATION_STATUSES;

const currentConsultationCards = computed(() => previewConsultations(consultationSheetStatus.value));

function goToAllConsultations() {
  emit('openAllConsultations', consultationSheetStatus.value);
}

/** 仅点击白底区域（标题栏、留白等）跳转；子卡片内点击由 @click.stop 拦截 */
function onConsultationSheetBackgroundClick() {
  goToAllConsultations();
}

function requirementPreview(text: string) {
  return truncateWithEllipsis(text, REQUIREMENT_MAX_LEN);
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
                v-for="(item, index) in currentConsultationCards"
                :key="item.id"
                data-consultation-item
                class="flex min-h-0 flex-1 basis-0 cursor-default flex-col rounded-2xl border border-gray-100 bg-gray-50/90 p-5 shadow-sm ring-1 ring-gray-100/80"
                @click.stop
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
              @click.stop
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
              @click.stop
            >
              新增反馈
            </button>
          </div>
        </section>

        <!-- 意见反馈：底部通栏（与上两格总宽对齐） -->
        <section
          class="order-4 flex min-h-[300px] flex-col rounded-3xl border border-white/20 bg-white/40 p-6 shadow-sm backdrop-blur-md lg:order-none lg:col-span-8 lg:row-start-2 lg:col-start-5"
        >
          <div class="mb-4 flex items-center justify-between">
            <div class="flex items-center gap-2">
              <div class="h-5 w-1 rounded-full bg-[#FFEB69]" />
              <h2 class="text-lg font-bold text-gray-800">意见反馈</h2>
            </div>
            <MessagesSquare :size="20" class="text-gray-400" />
          </div>
          <div
            class="flex min-h-[calc(10rem+100px)] flex-1 items-center justify-center rounded-2xl border border-dashed border-gray-200/80 bg-white/30 text-sm text-gray-400"
          >
            内容区预留
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 与管理中心等页一致的毛玻璃卡片，无额外全局样式 */
</style>
