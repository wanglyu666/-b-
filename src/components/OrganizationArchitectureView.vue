<script setup lang="ts">
import {
  UsersRound,
  MoreHorizontal,
  ShoppingCart,
} from 'lucide-vue-next';
import { computed } from 'vue';
import TopBarActions from './TopBarActions.vue';
import { members } from '../data';
import spaceIllustration from '../../image asset/space.png';
import membersMgmtIllustration from '../../image asset/group icon.png';

const emit = defineEmits<{
  openMemberManagement: [];
}>();

/** 组织页「成员管理」卡片内仅展示前 3 人，布局不变 */
const membersPreview = computed(() => members.slice(0, 3));

/**
 * 底部「审批配置」「团队」占位区域的最小高度（像素）。
 * 数值越大，这两块卡片从底部向下越长（与上排 400px 卡片之间的空隙由 gap-6 固定）。
 * 修改后保存即可生效。
 */
const BOTTOM_PLACEHOLDER_MIN_PX = 300;

const orgGridStyle = computed(() => ({
  '--org-bottom-min': `${BOTTOM_PLACEHOLDER_MIN_PX}px`,
}));

/**
 * 「空间」卡片插图：宽高（px），直接改数字即可调大小；object-fit: contain 在框内按比例显示。
 */
const SPACE_IMG_WIDTH_PX = 450;
const SPACE_IMG_HEIGHT_PX = 450;
/**
 * 插图水平偏移（px）：正值向右、负值向左（相对左列起始位置）。
 */
const SPACE_IMG_OFFSET_X_PX = 0;
/**
 * 「空间总数」区块水平偏移（px）：正值向右、负值向左（相对默认靠右位置）。
 */
const SPACE_STATS_OFFSET_X_PX = -30;
/** 「空间总数」列内容宽度（px），略大可避免数字换行 */
const SPACE_CARD_STATS_WIDTH_PX = 92;

/** 团队小卡片演示数据；后续可对接接口 */
type TeamBlock = {
  id: string;
  name: string;
  leader: string;
  space: string;
  createdAt: string;
  members: { initial: string; color: string }[];
};

const teamBlocks: TeamBlock[] = [
  {
    id: 't1',
    name: '维保一组',
    leader: '张伟',
    space: 'A 区 · 商业综合体',
    createdAt: '2024-03-15',
    members: [
      { initial: '张', color: '#4F46E5' },
      { initial: '李', color: '#10B981' },
      { initial: '王', color: '#F59E0B' },
      { initial: '江', color: '#EF4444' },
    ],
  },
  {
    id: 't2',
    name: '维保二组',
    leader: '李秀英',
    space: 'B 区 · 工业园区',
    createdAt: '2024-06-01',
    members: [
      { initial: '刘', color: '#8B5CF6' },
      { initial: '陈', color: '#06B6D4' },
      { initial: '赵', color: '#EC4899' },
    ],
  },
];
</script>

<template>
  <div class="min-h-screen bg-transparent relative overflow-x-hidden">
    <div class="relative z-10 p-8 max-w-[1600px] mx-auto animate-in fade-in duration-500">
      <header class="flex justify-between items-center mb-8">
        <div>
          <h1 class="text-3xl font-bold text-gray-800">组织与架构</h1>
          <p class="text-gray-500 mt-1">成员、空间与审批配置</p>
        </div>
        <TopBarActions :is-shop="false" />
      </header>

      <!--
        桌面：上排左成员、上排中空间（同高 400px）；下排左跨两列审批；右侧团队跨两行。
        小屏：自上而下 成员 → 空间 → 审批 → 团队。
        底部占位高度由脚本中 BOTTOM_PLACEHOLDER_MIN_PX 控制（见下方 style）。
      -->
      <div
        class="org-arch-grid grid grid-cols-1 gap-6 lg:grid-cols-3"
        :style="orgGridStyle"
      >
        <!-- 1 成员管理（与管理中心图二一致；仅前 3 人；点击进入成员管理页） -->
        <div
          role="button"
          tabindex="0"
          class="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col h-[400px] lg:col-start-1 lg:row-start-1 cursor-pointer transition-shadow hover:shadow-md outline-none focus-visible:ring-2 focus-visible:ring-[#9FE870]/50"
          @click="emit('openMemberManagement')"
          @keydown.enter.prevent="emit('openMemberManagement')"
          @keydown.space.prevent="emit('openMemberManagement')"
        >
          <div class="flex justify-between items-center mb-4">
            <div class="flex items-center space-x-2">
              <div class="w-1 h-5 bg-[#FFEB69] rounded-full" />
              <h3 class="font-bold text-lg text-gray-800">成员管理</h3>
            </div>
            <UsersRound :size="18" class="text-gray-400" />
          </div>

          <div class="flex-1 min-h-0 flex flex-col gap-2">
            <div class="min-h-0 flex-1 flex items-center justify-center overflow-hidden">
              <img
                :src="membersMgmtIllustration"
                alt=""
                class="max-h-full max-w-full w-auto h-auto object-contain"
              />
            </div>

            <div class="flex-shrink-0 flex flex-col gap-0.5 mb-2">
              <div
                v-for="m in membersPreview"
                :key="m.id"
                class="flex items-center justify-between p-1.5 hover:bg-gray-50 rounded-xl transition-colors"
              >
                <div class="flex items-center space-x-3">
                  <div
                    :class="['w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-xs', m.bgColor]"
                  >
                    {{ m.initial }}
                  </div>
                  <div class="flex flex-col">
                    <span class="font-bold text-gray-900 text-xs">{{ m.name }}</span>
                    <span class="text-[10px] text-gray-500">{{ m.role }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <button
            type="button"
            class="text-xs font-medium text-gray-400 hover:text-gray-800 transition-colors py-1.5 flex justify-center items-center gap-1 w-full border-t border-gray-50 pt-2"
            @click.stop="emit('openMemberManagement')"
          >
            <MoreHorizontal :size="12" /> 查看全部成员
          </button>
        </div>

        <!-- 2 空间：左图右统计，底部长条「新增」 -->
        <div
          class="bg-white/50 p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col h-[400px] overflow-visible lg:col-start-2 lg:row-start-1"
        >
          <div class="flex justify-between items-center mb-4 shrink-0">
            <div class="flex items-center space-x-2">
              <div class="w-1 h-5 bg-[#FFEB69] rounded-full" />
              <h3 class="font-bold text-lg text-gray-800">空间</h3>
            </div>
            <ShoppingCart :size="18" class="text-gray-400" />
          </div>

          <div class="flex min-h-0 flex-1 flex-col gap-4 overflow-visible">
            <!-- 左：固定 px 尺寸插图（可溢出容器）；右：空间总数，各自 translate 微调左右 -->
            <div
              class="relative z-0 flex min-h-0 flex-1 items-center gap-2 overflow-visible sm:gap-3"
            >
              <div
                class="flex min-h-0 min-w-0 flex-1 items-center justify-start overflow-visible"
              >
                <img
                  :src="spaceIllustration"
                  alt=""
                  class="pointer-events-none shrink-0"
                  :style="{
                    width: `${SPACE_IMG_WIDTH_PX}px`,
                    height: `${SPACE_IMG_HEIGHT_PX}px`,
                    objectFit: 'contain',
                    transform: `translateX(${SPACE_IMG_OFFSET_X_PX}px)`,
                  }"
                />
              </div>
              <div
                class="flex shrink-0 flex-col items-end justify-center gap-1.5 text-right"
                :style="{
                  width: `${SPACE_CARD_STATS_WIDTH_PX}px`,
                  transform: `translateX(${SPACE_STATS_OFFSET_X_PX}px)`,
                }"
              >
                <span class="text-sm font-medium text-gray-500">空间总数</span>
                <span class="font-bold text-5xl tabular-nums leading-none text-gray-900">
                  0
                </span>
              </div>
            </div>
            <button
              type="button"
              class="w-full shrink-0 rounded-full border border-[#9FE870]/50 bg-[#9FE870] px-6 py-3 text-center text-base font-bold text-[#163300] shadow-sm transition hover:brightness-[0.97] active:scale-[0.99]"
            >
              新增
            </button>
          </div>
        </div>

        <!-- 3 审批配置：仅占位（高度随 BOTTOM_PLACEHOLDER_MIN_PX）；底 50% 白 -->
        <div
          class="org-arch-placeholder rounded-3xl border border-gray-100 bg-white/50 shadow-sm lg:col-span-2 lg:col-start-1 lg:row-start-2"
          aria-hidden="true"
        />

        <!-- 4 团队：桌面跨两行；内嵌两块 50% 白小卡 + 重叠彩色头像 -->
        <div
          class="team-outer rounded-3xl border border-gray-100 bg-white shadow-sm flex flex-col min-h-[320px] p-6 lg:min-h-0 lg:col-start-3 lg:row-start-1 lg:row-span-2"
        >
          <div class="flex justify-between items-center mb-4 shrink-0">
            <div class="flex items-center space-x-2">
              <div class="w-1 h-5 bg-[#FFEB69] rounded-full" />
              <h3 class="font-bold text-lg text-gray-800">团队</h3>
            </div>
            <UsersRound :size="18" class="text-gray-400" />
          </div>

          <!-- 内层小卡结构与咨询与反馈页「咨询单」列表项一致：ConsultationFeedbackView.vue article -->
          <div
            class="flex min-h-0 flex-1 flex-col gap-4 overflow-hidden pr-0.5"
          >
            <article
              v-for="team in teamBlocks"
              :key="team.id"
              class="team-inner-card flex min-h-0 flex-1 basis-0 flex-col rounded-2xl border border-gray-100 bg-gray-50/90 p-5 text-left shadow-sm ring-1 ring-gray-100/80 transition-all hover:border-[#9FE870]/50 hover:bg-white hover:shadow-md"
            >
              <h3 class="mb-4 line-clamp-2 text-base font-bold leading-snug text-gray-900">
                {{ team.name }}
              </h3>
              <div class="mb-4 flex shrink-0 gap-4">
                <div class="min-w-0 flex-1">
                  <p class="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                    组长
                  </p>
                  <p class="mt-1.5 text-sm font-semibold text-gray-800">
                    {{ team.leader }}
                  </p>
                </div>
                <div class="min-w-0 flex-1 text-left">
                  <p class="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                    创建时间
                  </p>
                  <p class="mt-1.5 font-mono text-sm font-semibold tabular-nums text-gray-800">
                    {{ team.createdAt }}
                  </p>
                </div>
              </div>
              <div class="mb-4 flex-shrink-0">
                <p class="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  负责空间
                </p>
                <p class="mt-1.5 text-sm leading-[1.75] text-gray-600">
                  {{ team.space }}
                </p>
              </div>
              <div class="flex min-h-0 flex-1 flex-col">
                <p class="flex-shrink-0 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  包含人员
                </p>
                <div
                  class="mt-3 flex min-h-[3.25rem] flex-1 items-center justify-center px-1 sm:min-h-[3.5rem]"
                >
                  <div class="flex items-center justify-center">
                    <div
                      v-for="(m, i) in team.members"
                      :key="`${team.id}-${i}`"
                      class="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white shadow-sm ring-1 ring-gray-900/15 sm:h-12 sm:w-12 sm:text-base"
                      :class="i > 0 ? '-ml-3 sm:-ml-3.5' : ''"
                      :style="{
                        backgroundColor: m.color,
                        zIndex: team.members.length - i,
                      }"
                    >
                      {{ m.initial }}
                    </div>
                  </div>
                </div>
              </div>
            </article>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 桌面：第二行最小高度 = --org-bottom-min（由脚本 BOTTOM_PLACEHOLDER_MIN_PX 注入） */
@media (min-width: 1024px) {
  .org-arch-grid {
    grid-template-rows: 400px minmax(var(--org-bottom-min, 300px), auto);
  }
}

/* 小屏与桌面：空白卡至少撑到同一最小高度 */
.org-arch-placeholder {
  min-height: var(--org-bottom-min, 300px);
}
</style>
