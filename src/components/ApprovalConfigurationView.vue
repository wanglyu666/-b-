<script setup lang="ts">
import { ChevronLeft, X } from 'lucide-vue-next';
import { computed, ref } from 'vue';
import {
  approvalFlowCards,
  type ApprovalFlowCard,
} from '../data/approvalFlowCards';
import type { Member } from '../types';
import { resolveApprovalStepAvatar } from '../utils/resolveApprovalAvatar';

const props = withDefaults(
  defineProps<{
    /** 与成员管理同源，按审批人姓名匹配彩圈与字 */
    members?: Member[];
  }>(),
  { members: () => [] },
);

const emit = defineEmits<{
  back: [];
}>();

const selectedCard = ref<ApprovalFlowCard | null>(null);

/** 弹窗时间轴：头像与成员管理对齐（姓名命中则用 bgColor / initial） */
const modalTimelineRows = computed(() => {
  const card = selectedCard.value;
  if (!card) return [];
  return card.timeline.map((step, index) => ({
    step,
    index,
    avatar: resolveApprovalStepAvatar(step, props.members),
  }));
});

function openRecordModal(card: ApprovalFlowCard) {
  selectedCard.value = card;
}

function closeRecordModal() {
  selectedCard.value = null;
}
</script>

<template>
  <div class="relative z-10 min-h-screen overflow-x-hidden bg-transparent">
    <div class="mx-auto max-w-[1600px] animate-in fade-in duration-500 p-8">
      <header
        class="mb-8 flex flex-col gap-4 sm:mb-10 sm:flex-row sm:items-start sm:justify-between"
      >
        <div class="flex min-w-0 items-start gap-4">
          <button
            type="button"
            class="shrink-0 rounded-xl border border-white/20 bg-white/50 p-2 backdrop-blur-md transition-all hover:bg-white/80 active:scale-95"
            aria-label="返回"
            @click="emit('back')"
          >
            <ChevronLeft :size="20" class="text-gray-600" />
          </button>
          <div class="min-w-0">
            <h1 class="text-3xl font-bold text-gray-800">审批配置</h1>
            <p class="mt-1 text-gray-500">查看各审批流程与当前节点</p>
          </div>
        </div>
      </header>

      <div
        class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
      >
        <article
          v-for="block in approvalFlowCards"
          :key="block.id"
          role="button"
          tabindex="0"
          class="flex min-h-0 min-w-0 cursor-pointer flex-col rounded-3xl border border-gray-100/80 bg-white/50 p-4 shadow-sm ring-1 ring-white/30 backdrop-blur-sm transition-shadow hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9FE870]/50 sm:p-5"
          @click="openRecordModal(block)"
          @keydown.enter.prevent="openRecordModal(block)"
          @keydown.space.prevent="openRecordModal(block)"
        >
          <div class="space-y-2.5 text-sm text-gray-800">
            <div class="flex gap-2">
              <span class="shrink-0 text-gray-500">审批类型</span>
              <span class="font-medium">{{ block.type }}</span>
            </div>
            <div class="flex gap-2">
              <span class="shrink-0 text-gray-500">发起人</span>
              <span class="font-medium">{{ block.initiator }}</span>
            </div>
            <div class="flex gap-2">
              <span class="shrink-0 text-gray-500">发起时间</span>
              <span class="font-medium tabular-nums">{{ block.time }}</span>
            </div>
          </div>
          <div
            class="mt-4 flex min-h-0 flex-1 flex-col justify-end border-t border-slate-400/10 pt-3"
          >
            <div
              v-if="block.status === 'completed'"
              class="flex w-full min-h-[3.25rem] items-center justify-center"
            >
              <div
                class="rounded-2xl bg-emerald-500/35 px-8 py-2.5 text-center text-sm font-bold text-emerald-900 shadow-inner ring-1 ring-emerald-400/40 backdrop-blur-sm sm:px-10 sm:py-3 sm:text-base"
              >
                已完成
              </div>
            </div>
            <div
              v-else
              class="flex w-full min-w-0 items-center gap-1 sm:gap-2"
            >
              <div
                class="shrink-0 rounded-xl border border-white/40 bg-white/50 px-3 py-2 text-center text-xs font-bold text-gray-800 shadow-sm backdrop-blur-sm sm:px-4 sm:text-sm"
              >
                开始
              </div>
              <div
                class="relative flex min-h-[2px] min-w-[0.75rem] flex-1 items-center"
                aria-hidden="true"
              >
                <div
                  class="h-0 w-full border-t-2 border-dashed border-gray-500/50"
                />
              </div>
              <div class="flex shrink-0 flex-col items-center gap-1 px-0.5">
                <div
                  class="min-w-[3.5rem] rounded-xl border border-amber-200/80 bg-amber-50/90 px-3 py-2 text-center text-xs font-bold text-amber-900 shadow-sm backdrop-blur-sm sm:min-w-[4.5rem] sm:px-4 sm:py-2.5 sm:text-sm"
                >
                  {{ block.currentApprover }}
                </div>
                <span class="text-[10px] text-gray-500">当前</span>
              </div>
              <div
                class="relative flex min-h-[2px] min-w-[0.75rem] flex-1 items-center"
                aria-hidden="true"
              >
                <div
                  class="h-0 w-full border-t-2 border-dashed border-gray-500/50"
                />
              </div>
              <div
                class="shrink-0 rounded-xl border border-white/40 bg-white/50 px-3 py-2 text-center text-xs font-bold text-gray-800 shadow-sm backdrop-blur-sm sm:px-4 sm:text-sm"
              >
                结束
              </div>
            </div>
          </div>
        </article>
      </div>
    </div>

    <Teleport to="body">
      <div
        v-if="selectedCard"
        class="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4 backdrop-blur-md animate-in fade-in duration-300 sm:p-6"
        role="dialog"
        aria-modal="true"
        aria-labelledby="approval-record-title"
        @click.self="closeRecordModal"
      >
        <div
          class="jp-modal-morph flex max-h-[min(92vh,860px)] w-full max-w-lg flex-col overflow-hidden border border-white/20 shadow-2xl backdrop-blur-2xl sm:max-w-2xl"
          :style="{
            '--jp-modal-w': '700px',
            '--jp-modal-w-max': '700px',
            '--jp-modal-h': 'min(90vh, 820px)',
            '--jp-modal-max-h': 'min(94vh, 840px)',
            '--jp-modal-radius': '32px',
            '--jp-modal-scale': '1',
            '--jp-modal-bg': 'rgba(255, 255, 255, 0.12)',
          }"
          @click.stop
        >
          <div
            class="flex shrink-0 items-center justify-between border-b border-white/10 px-6 py-5 sm:px-8 sm:py-6"
          >
            <div class="flex min-w-0 items-center gap-2.5 pr-4 sm:gap-3">
              <div
                class="h-7 w-2 shrink-0 rounded-full bg-[#FFE600] shadow-[0_0_15px_rgba(255,230,0,0.5)]"
              />
              <h2
                id="approval-record-title"
                class="truncate text-2xl font-bold tracking-tight text-white sm:text-[1.65rem]"
              >
                审批流程记录
              </h2>
            </div>
            <div class="flex shrink-0 items-center gap-3 sm:gap-4">
              <button
                type="button"
                class="text-base font-bold text-white/80 transition-colors hover:text-white"
                aria-label="返回"
                @click="closeRecordModal"
              >
                返回
              </button>
              <button
                type="button"
                class="rounded-full p-2 text-white/70 transition-colors hover:bg-white/10 hover:text-white"
                aria-label="关闭"
                @click="closeRecordModal"
              >
                <X :size="26" />
              </button>
            </div>
          </div>

          <div
            class="custom-scrollbar min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-5 py-6 sm:px-7 sm:py-7"
          >
            <div v-if="selectedCard" class="space-y-0">
              <div
                v-for="(row, i) in modalTimelineRows"
                :key="row.index"
                class="flex gap-5 pb-9 last:pb-0"
              >
                <div class="flex w-14 shrink-0 flex-col items-center">
                  <div
                    class="flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-base font-bold text-white shadow-md ring-1 ring-white/15"
                    :class="row.avatar.useHex ? '' : row.avatar.tailwindClass"
                    :style="
                      row.avatar.useHex
                        ? { backgroundColor: row.avatar.hex }
                        : undefined
                    "
                  >
                    {{ row.avatar.initial }}
                  </div>
                  <div
                    v-if="i < selectedCard.timeline.length - 1"
                    class="my-1.5 h-16 w-0.5 shrink-0 bg-white/25"
                    aria-hidden="true"
                  />
                </div>
                <div class="min-w-0 flex-1 pt-0.5">
                  <p class="text-base leading-relaxed text-white/95">
                    <span class="text-white/45">审批人：</span>
                    <span class="font-semibold text-white">{{
                      row.step.approverName
                    }}</span>
                    <span class="text-white/75">（{{ row.step.role }}）</span>
                  </p>
                  <p class="mt-2 text-base">
                    <span class="text-white/45">审批时间：</span>
                    <span class="tabular-nums text-white/90">{{
                      row.step.time
                    }}</span>
                  </p>
                  <p class="mt-2 flex flex-wrap items-center gap-2 text-base">
                    <span class="text-white/45">审批结果：</span>
                    <span
                      class="inline-flex rounded-full px-3 py-1 text-sm font-semibold ring-1"
                      :class="
                        row.step.result === '同意'
                          ? 'bg-emerald-500/25 text-emerald-200 ring-emerald-400/30'
                          : row.step.result === '待审批'
                            ? 'bg-amber-500/30 text-amber-100 ring-amber-400/40'
                            : 'bg-white/10 text-white/55 ring-white/20'
                      "
                    >
                      {{ row.step.result }}
                    </span>
                  </p>
                  <div
                    v-if="row.step.comment && row.step.comment !== '—'"
                    class="mt-4 rounded-xl border border-white/10 bg-white/5 p-4 text-base leading-relaxed text-white/85 backdrop-blur-sm"
                  >
                    <span class="text-white/45">审批意见：</span
                    >{{ row.step.comment }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.15);
  border-radius: 999px;
}
</style>
