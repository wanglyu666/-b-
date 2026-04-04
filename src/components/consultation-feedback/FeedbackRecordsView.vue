<script setup lang="ts">
import { computed, ref, watch, watchEffect, nextTick } from 'vue';
import { ChevronLeft, MoreHorizontal, Search, X } from 'lucide-vue-next';
import {
  type ConsultationSheetStatus,
  type ConsultationRecord,
  type ConsultationRelatedMaterialFile,
  allConsultationsMerged,
  effectiveConsultationRecord,
  findConsultationById,
} from '../../data/consultations';

const props = defineProps<{
  /** 从咨询首页点表格「⋯」进入时自动打开该条的反馈详情（消费后由父级清空） */
  initialOpenConsultationId?: string | null;
}>();

const emit = defineEmits<{
  back: [];
  'opened-initial-feedback-detail': [];
}>();

/** 三点菜单：当前查看的反馈详情 */
const detailRecord = ref<ConsultationRecord | null>(null);

function openFeedbackDetail(row: ConsultationRecord) {
  detailRecord.value = row;
}

function closeFeedbackDetail() {
  mediaPreview.value = null;
  detailRecord.value = null;
}

/** 附件全屏预览（与全部咨询「相关资料」一致） */
const mediaPreview = ref<ConsultationRelatedMaterialFile | null>(null);

function openMediaPreview(f: ConsultationRelatedMaterialFile) {
  mediaPreview.value = f;
}

function closeMediaPreview() {
  mediaPreview.value = null;
}

watchEffect((onCleanup) => {
  if (!detailRecord.value && !mediaPreview.value) return;
  const prevOverflow = document.body.style.overflow;
  document.body.style.overflow = 'hidden';
  const onKey = (e: KeyboardEvent) => {
    if (e.key !== 'Escape') return;
    if (mediaPreview.value) closeMediaPreview();
    else closeFeedbackDetail();
  };
  window.addEventListener('keydown', onKey);
  onCleanup(() => {
    document.body.style.overflow = prevOverflow;
    window.removeEventListener('keydown', onKey);
  });
});

const searchQuery = ref('');
const currentPage = ref(1);
const itemsPerPage = 6;

const allRows = computed(() => {
  const list = allConsultationsMerged().map((c) => effectiveConsultationRecord(c));
  list.sort((a, b) => b.time.localeCompare(a.time, 'zh-CN'));
  return list;
});

const filteredRows = computed(() => {
  const q = searchQuery.value.trim().toLowerCase();
  if (!q) return allRows.value;
  return allRows.value.filter(
    (c) =>
      c.title.toLowerCase().includes(q) ||
      c.no.toLowerCase().includes(q) ||
      c.contact.toLowerCase().includes(q) ||
      c.contactPhone.includes(q) ||
      c.category.toLowerCase().includes(q) ||
      c.requirement.toLowerCase().includes(q),
  );
});

const totalPages = computed(() => Math.max(1, Math.ceil(filteredRows.value.length / itemsPerPage)));

const paginatedRows = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  return filteredRows.value.slice(start, start + itemsPerPage);
});

watch(searchQuery, () => {
  currentPage.value = 1;
});

watch(
  () => props.initialOpenConsultationId,
  async (id) => {
    if (!id) return;
    await nextTick();
    const record = findConsultationById(id);
    if (!record) {
      emit('opened-initial-feedback-detail');
      return;
    }
    const idx = filteredRows.value.findIndex((c) => c.id === id);
    if (idx >= 0) {
      currentPage.value = Math.floor(idx / itemsPerPage) + 1;
    }
    await nextTick();
    openFeedbackDetail(record);
    emit('opened-initial-feedback-detail');
  },
  { immediate: true },
);

function statusClass(s: ConsultationSheetStatus) {
  const map: Record<ConsultationSheetStatus, string> = {
    待回复: 'bg-blue-500/15 text-blue-700 border border-blue-500/25',
    进行中: 'bg-orange-500/15 text-orange-700 border border-orange-500/25',
    已结束: 'bg-[#A1D573]/20 text-[#163300] border border-[#A1D573]/30',
  };
  return map[s];
}

/** 深色玻璃弹窗内状态标签（对齐工单详情 / 咨询详情） */
function statusClassDark(s: ConsultationSheetStatus) {
  const map: Record<ConsultationSheetStatus, string> = {
    待回复: 'bg-blue-500/25 text-blue-300 border border-blue-400/35',
    进行中: 'bg-orange-500/25 text-orange-300 border border-orange-400/35',
    已结束: 'bg-[#A1D573]/25 text-[#B8E86C] border border-[#A1D573]/35',
  };
  return map[s];
}

</script>

<template>
  <div class="min-h-full p-6 pb-12 sm:p-8 max-w-[1600px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
    <header class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
      <div class="flex items-start gap-3 sm:gap-4 min-w-0">
        <button
          type="button"
          class="mt-1 shrink-0 p-2 rounded-xl border border-white/20 bg-white/50 backdrop-blur-md hover:bg-white/80 transition-all active:scale-95"
          aria-label="返回咨询与反馈"
          @click="emit('back')"
        >
          <ChevronLeft :size="20" class="text-gray-600" />
        </button>
        <div class="min-w-0">
          <h1 class="text-2xl sm:text-3xl font-bold text-gray-800">意见反馈</h1>
          <p class="text-gray-500 mt-1 text-sm sm:text-base">全部反馈单汇总</p>
        </div>
      </div>
      <div class="relative w-full sm:max-w-sm shrink-0">
        <Search
          :size="18"
          class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
        />
        <input
          v-model="searchQuery"
          type="search"
          placeholder="搜索单号、标题、联系人、需求…"
          class="w-full pl-10 pr-4 py-2 rounded-xl border border-white/20 bg-white/50 backdrop-blur-md text-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#9FE870]/40"
        />
      </div>
    </header>

    <div
      class="mt-8 md:mt-10 bg-white/40 backdrop-blur-xl rounded-[32px] border border-white/30 shadow-xl overflow-hidden"
    >
      <div class="p-6 border-b border-white/20 flex items-center space-x-3">
        <div class="w-1.5 h-6 bg-[#FFEB69] rounded-full" />
        <h2 class="text-xl font-bold text-gray-800">反馈记录</h2>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full min-w-[560px] text-left border-collapse">
          <thead>
            <tr class="text-gray-500 text-sm font-medium border-b border-white/10">
              <th class="py-5 px-6 whitespace-nowrap">序号</th>
              <th class="py-5 px-6 min-w-[12rem]">项目名称</th>
              <th class="py-5 px-6 whitespace-nowrap">反馈时间</th>
              <th class="py-5 px-6 text-center whitespace-nowrap">状态</th>
              <th class="py-5 px-6 w-14 text-right" aria-label="操作" />
            </tr>
          </thead>
          <tbody class="divide-y divide-white/10">
            <tr
              v-for="(row, index) in paginatedRows"
              :key="row.id"
              class="hover:bg-white/30 transition-colors"
            >
              <td class="py-5 px-6 text-sm text-gray-600 tabular-nums">
                {{ (currentPage - 1) * itemsPerPage + index + 1 }}
              </td>
              <td
                class="py-5 px-6 text-sm font-medium text-gray-800 max-w-md truncate"
                :title="row.title"
              >
                {{ row.title }}
              </td>
              <td class="py-5 px-6 font-mono text-sm text-gray-600 whitespace-nowrap">
                {{ row.time }}
              </td>
              <td class="py-5 px-6 text-center">
                <span
                  class="inline-flex rounded-full px-3 py-1 text-xs font-bold"
                  :class="statusClass(row.status)"
                >
                  {{ row.status }}
                </span>
              </td>
              <td class="py-5 px-6 text-right">
                <button
                  type="button"
                  class="inline-flex rounded-lg p-2 text-gray-400 border border-transparent hover:text-[#A1D573] hover:bg-white/50 hover:border-gray-100 transition-colors"
                  aria-label="查看反馈详情"
                  @click.stop="openFeedbackDetail(row)"
                >
                  <MoreHorizontal :size="20" />
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div
        v-if="filteredRows.length === 0"
        class="px-6 py-16 text-center text-gray-500 text-sm"
      >
        暂无匹配记录，请调整搜索条件。
      </div>

      <div
        v-else
        class="p-6 border-t border-white/10 flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center text-sm text-gray-500"
      >
        <p>共 {{ filteredRows.length }} 条，每页 {{ itemsPerPage }} 条</p>
        <div class="flex flex-wrap items-center gap-2">
          <button
            type="button"
            class="px-3 py-1 rounded-lg border border-white/20 bg-white/50 hover:bg-white/80 disabled:opacity-50 transition-colors"
            :disabled="currentPage <= 1"
            @click="currentPage > 1 && currentPage--"
          >
            上一页
          </button>
          <button
            v-for="page in totalPages"
            :key="page"
            type="button"
            :class="[
              'px-3 py-1 rounded-lg border shadow-sm transition-colors tabular-nums',
              currentPage === page
                ? 'bg-[#FFEB69] text-[#3A341C] border-[#FFEB69]'
                : 'bg-white/50 border-white/20 hover:bg-white/80 text-[#3A341C]',
            ]"
            @click="currentPage = page"
          >
            {{ page }}
          </button>
          <button
            type="button"
            class="px-3 py-1 rounded-lg border border-white/20 bg-white/50 hover:bg-white/80 disabled:opacity-50 transition-colors"
            :disabled="currentPage >= totalPages"
            @click="currentPage < totalPages && currentPage++"
          >
            下一页
          </button>
        </div>
      </div>
    </div>

    <!-- 反馈详情（三点菜单）：深色玻璃态，对齐工单详情 / 咨询详情弹窗 -->
    <Teleport to="body">
      <div
        v-if="detailRecord"
        class="fixed inset-0 z-[150] flex items-center justify-center p-4 sm:p-6 bg-black/40 backdrop-blur-md animate-in fade-in duration-300"
        role="dialog"
        aria-modal="true"
        aria-labelledby="feedback-detail-title"
        @click.self="closeFeedbackDetail"
      >
        <div
          class="flex h-[min(90vh,700px)] w-full max-w-2xl flex-col overflow-hidden rounded-[32px] border border-white/20 bg-white/10 shadow-2xl backdrop-blur-2xl animate-in zoom-in-95 duration-300"
          @click.stop
        >
          <div
            class="flex shrink-0 items-center justify-between border-b border-white/10 px-6 py-5 sm:px-8"
          >
            <div class="flex min-w-0 items-center gap-3">
              <div
                class="h-6 w-1.5 shrink-0 rounded-full bg-[#FFE600] shadow-[0_0_15px_rgba(255,230,0,0.5)]"
              />
              <h2
                id="feedback-detail-title"
                class="text-xl font-bold tracking-tight text-white"
              >
                反馈详情
              </h2>
            </div>
            <button
              type="button"
              class="shrink-0 rounded-full p-2 text-white/70 transition-all hover:bg-white/10 hover:text-white"
              aria-label="关闭"
              @click="closeFeedbackDetail"
            >
              <X :size="22" />
            </button>
          </div>

          <div
            class="custom-scrollbar min-h-0 flex-1 overflow-y-auto px-6 py-5 sm:px-8 sm:py-6"
          >
            <!-- 顶部汇总卡片 -->
            <div
              class="mb-4 rounded-2xl border border-white/10 bg-white/5 p-5 shadow-none backdrop-blur-xl"
            >
              <p class="mb-1 text-[10px] font-bold uppercase tracking-widest text-white/40">
                项目名称
              </p>
              <p class="text-base font-bold leading-snug text-white">
                {{ detailRecord.title }}
              </p>
              <div
                class="mt-4 grid grid-cols-1 gap-4 border-t border-white/10 pt-4 sm:grid-cols-2"
              >
                <div>
                  <p class="mb-1 text-[10px] font-bold uppercase tracking-widest text-white/40">
                    反馈时间
                  </p>
                  <p class="font-mono text-sm font-bold tabular-nums text-white">
                    {{ detailRecord.time }}
                  </p>
                </div>
                <div>
                  <p class="mb-1 text-[10px] font-bold uppercase tracking-widest text-white/40">
                    状态
                  </p>
                  <span
                    class="inline-flex w-fit rounded-full px-3 py-1 text-xs font-bold"
                    :class="statusClassDark(detailRecord.status)"
                  >
                    {{ detailRecord.status }}
                  </span>
                </div>
              </div>
            </div>

            <!-- 反馈正文（对齐工单「报修原因」区块） -->
            <div
              class="mb-4 rounded-2xl border border-white/10 bg-white/5 p-4 shadow-none backdrop-blur-xl"
            >
              <p class="mb-1.5 text-[10px] font-bold uppercase tracking-widest text-white/40">
                反馈内容
              </p>
              <p class="text-sm leading-relaxed text-white/85 whitespace-pre-wrap">
                {{ detailRecord.requirement }}
              </p>
            </div>

            <!-- 附件：圆角标签 + 全屏预览（与「相关资料」一致） -->
            <div
              class="mb-4 rounded-2xl border border-white/10 bg-white/5 p-4 shadow-none backdrop-blur-xl"
            >
              <p class="mb-3 text-[10px] font-bold uppercase tracking-widest text-white/40">
                附件
              </p>
              <div
                v-if="detailRecord.relatedMaterialFiles?.length"
                class="flex flex-wrap gap-2"
              >
                <button
                  v-for="(f, idx) in detailRecord.relatedMaterialFiles"
                  :key="`${f.fileName}-${idx}`"
                  type="button"
                  class="inline-flex max-w-full min-w-0 items-center gap-2 rounded-lg border border-white/18 bg-white/[0.14] px-3 py-2 text-left text-sm font-medium text-white/90 shadow-sm backdrop-blur-sm transition hover:border-white/28 hover:bg-white/[0.2] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FFE600]/50"
                  @click="openMediaPreview(f)"
                >
                  <span class="min-w-0 truncate">{{ f.fileName }}</span>
                  <X
                    class="pointer-events-none h-3.5 w-3.5 shrink-0 text-white/40"
                    aria-hidden="true"
                  />
                </button>
              </div>
              <p v-else class="text-sm text-white/45">
                {{ detailRecord.relatedMaterials?.trim() || '暂无上传' }}
              </p>
            </div>

            <!-- 反馈结果（数据只读，无则暂无） -->
            <div
              class="rounded-2xl border border-white/10 bg-white/5 p-4 shadow-none backdrop-blur-xl"
            >
              <p class="mb-1.5 text-[10px] font-bold uppercase tracking-widest text-white/40">
                反馈结果
              </p>
              <p class="text-sm leading-relaxed text-white/85 whitespace-pre-wrap">
                {{ detailRecord.feedbackResult?.trim() || '暂无' }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- 附件全屏预览 -->
    <Teleport to="body">
      <div
        v-if="mediaPreview"
        class="fixed inset-0 z-[200] bg-black"
        role="dialog"
        aria-modal="true"
        aria-label="媒体全屏预览"
      >
        <button
          type="button"
          class="absolute top-4 right-4 z-20 rounded-full border border-white/25 bg-white/10 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/20"
          @click="closeMediaPreview"
        >
          退出全览
        </button>
        <div
          class="absolute inset-0 flex items-center justify-center p-4 sm:p-8"
          @click.self="closeMediaPreview"
        >
          <img
            v-if="mediaPreview.kind === 'image'"
            :src="mediaPreview.url"
            :alt="mediaPreview.fileName"
            class="max-h-full max-w-full object-contain"
            @click.stop
          />
          <video
            v-else
            :src="mediaPreview.url"
            controls
            playsinline
            class="max-h-full max-w-full object-contain"
            @click.stop
          />
        </div>
      </div>
    </Teleport>
  </div>
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
</style>
