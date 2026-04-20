<script setup lang="ts">
import {
  ClipboardList,
  MoreHorizontal,
  ShoppingCart,
  UsersRound,
} from 'lucide-vue-next';
import { computed } from 'vue';
import TopBarActions from './TopBarActions.vue';
import spaceIllustration from '../../image asset/space.png';
import membersMgmtIllustration from '../../image asset/group icon.png';
import { approvalFlowCardsOrgPreview } from '../data/approvalFlowCards';
import type { Member, OrganizationTeam } from '../types';
import {
  teamsWithMemberAvatars,
  TEAM_CARD_AVATAR_DISPLAY_CAP,
} from '../utils/memberTeam';

const props = defineProps<{
  members: Member[];
  teams: OrganizationTeam[];
  /** 空间总数（与空间管理列表一致） */
  spaceCount: number;
}>();

const emit = defineEmits<{
  /** 不传 id：仅进入成员管理页；传成员 id：进入成员管理页并打开该成员详情 */
  openMemberManagement: [memberId?: number];
  /** 不传 id：仅进入团队页；传团队 id：进入团队页并打开该团队详情 */
  openTeamManagement: [teamId?: string];
  openSpaceManagement: [];
  openApprovalConfiguration: [];
}>();

/** 组织页「成员管理」卡片内仅展示前 3 人，布局不变 */
const membersPreview = computed(() => props.members.slice(0, 3));

/**
 * 底部「审批配置」与「团队」所在行的最小高度（像素）。
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

/** 组织页团队区：按创建时间从新到旧，仅展示最新的 2 个团队 */
function teamCreatedAtMs(t: OrganizationTeam): number {
  const d = t.createdAt?.trim();
  if (!d) return 0;
  const ms = Date.parse(d);
  if (Number.isFinite(ms)) return ms;
  const m = d.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (m) return Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  return 0;
}

const teamsSynced = computed(() =>
  teamsWithMemberAvatars(props.teams, props.members),
);

const teamBlocksPreview = computed(() =>
  [...teamsSynced.value]
    .sort((a, b) => teamCreatedAtMs(b) - teamCreatedAtMs(a))
    .slice(0, 2),
);

/** 审批配置 · 左右小卡预览（与审批配置页同源，见 approvalFlowCards.ts） */
const approvalBlocks = approvalFlowCardsOrgPreview;
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
        桌面：上排左成员、上排中空间（同高 400px）；下排左跨两列审批配置；右侧团队跨两行。
        小屏：自上而下 成员 → 空间 → 审批配置 → 团队。
        底部区域最小高度由脚本中 BOTTOM_PLACEHOLDER_MIN_PX 控制（见下方 style）。
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
                role="button"
                tabindex="0"
                class="flex items-center justify-between rounded-xl p-1.5 transition-colors hover:bg-gray-50 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-[#9FE870]/50"
                @click.stop="emit('openMemberManagement', m.id)"
                @keydown.enter.prevent="emit('openMemberManagement', m.id)"
                @keydown.space.prevent="emit('openMemberManagement', m.id)"
              >
                <div class="flex items-center space-x-3">
                  <div
                    class="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-xs shadow-sm ring-1 ring-gray-900/10"
                    :style="{ backgroundColor: m.bgColor }"
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

        <!-- 2 空间：插图居中，下方空间总数；点击卡片进入空间管理页 -->
        <div
          role="button"
          tabindex="0"
          class="flex h-[400px] cursor-pointer flex-col overflow-visible rounded-3xl border border-gray-100 bg-white/50 p-6 shadow-sm transition-shadow hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9FE870]/50 lg:col-start-2 lg:row-start-1"
          @click="emit('openSpaceManagement')"
          @keydown.enter.prevent="emit('openSpaceManagement')"
          @keydown.space.prevent="emit('openSpaceManagement')"
        >
          <div class="mb-4 flex shrink-0 items-center justify-between">
            <div class="flex items-center space-x-2">
              <div class="h-5 w-1 rounded-full bg-[#FFEB69]" />
              <h3 class="text-lg font-bold text-gray-800">空间</h3>
            </div>
            <ShoppingCart :size="18" class="text-gray-400" />
          </div>

          <div
            class="flex min-h-0 flex-1 flex-col items-center justify-center gap-5 overflow-visible"
          >
            <div class="flex w-full min-h-0 flex-1 items-center justify-center overflow-visible">
              <img
                :src="spaceIllustration"
                alt=""
                class="pointer-events-none max-h-full max-w-full shrink-0 object-contain"
                :style="{
                  width: `${SPACE_IMG_WIDTH_PX}px`,
                  height: `${SPACE_IMG_HEIGHT_PX}px`,
                }"
              />
            </div>
            <div class="flex shrink-0 flex-col items-center gap-1.5 text-center">
              <span class="text-sm font-medium text-gray-500">空间总数</span>
              <span
                class="text-5xl font-bold tabular-nums leading-none text-gray-900"
              >
                {{ spaceCount }}
              </span>
            </div>
          </div>
        </div>

        <!-- 3 审批配置：点击进入审批配置页；内左右小卡与列表页卡片样式一致 -->
        <div
          role="button"
          tabindex="0"
          class="org-arch-placeholder flex min-h-0 flex-col cursor-pointer rounded-3xl border border-gray-100 bg-white/50 p-6 shadow-sm outline-none transition-shadow hover:shadow-md focus-visible:ring-2 focus-visible:ring-[#9FE870]/50 lg:col-span-2 lg:col-start-1 lg:row-start-2"
          @click="emit('openApprovalConfiguration')"
          @keydown.enter.prevent="emit('openApprovalConfiguration')"
          @keydown.space.prevent="emit('openApprovalConfiguration')"
        >
          <div class="mb-4 flex shrink-0 items-center justify-between">
            <div class="flex items-center space-x-2">
              <div class="h-5 w-1 rounded-full bg-[#FFEB69]" />
              <h3 class="text-lg font-bold text-gray-800">审批配置</h3>
            </div>
            <ClipboardList :size="18" class="text-gray-400" />
          </div>
          <div
            class="flex min-h-0 flex-1 flex-col gap-4 lg:flex-row lg:gap-5"
          >
            <article
              v-for="block in approvalBlocks"
              :key="block.id"
              class="flex min-h-0 min-w-0 flex-1 flex-col rounded-3xl border border-slate-400/10 bg-slate-500/10 p-4 shadow-sm ring-1 ring-slate-400/5 sm:p-5"
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
                    class="rounded-2xl bg-emerald-500/35 px-6 py-2 text-center text-xs font-bold text-emerald-900 shadow-inner ring-1 ring-emerald-400/40 backdrop-blur-sm sm:px-8 sm:py-2.5 sm:text-sm"
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
                  <div
                    class="flex shrink-0 flex-col items-center gap-1 px-0.5"
                  >
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

        <!-- 4 团队：桌面跨两行；内嵌两块 50% 白小卡 + 重叠彩色头像 -->
        <div
          role="button"
          tabindex="0"
          class="team-outer cursor-pointer rounded-3xl border border-gray-100 bg-white shadow-sm outline-none transition-shadow hover:shadow-md focus-visible:ring-2 focus-visible:ring-[#9FE870]/50 flex flex-col min-h-[320px] p-6 lg:min-h-0 lg:col-start-3 lg:row-start-1 lg:row-span-2"
          @click="emit('openTeamManagement')"
          @keydown.enter.prevent="emit('openTeamManagement')"
          @keydown.space.prevent="emit('openTeamManagement')"
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
              v-for="team in teamBlocksPreview"
              :key="team.id"
              role="button"
              tabindex="0"
              class="team-inner-card flex min-h-0 flex-1 basis-0 flex-col cursor-pointer rounded-2xl border border-gray-100 bg-gray-50/90 p-5 text-left shadow-sm ring-1 ring-gray-100/80 transition-all hover:border-[#9FE870]/50 hover:bg-white hover:shadow-md outline-none focus-visible:ring-2 focus-visible:ring-[#9FE870]/50"
              @click.stop="emit('openTeamManagement', team.id)"
              @keydown.enter.prevent.stop="emit('openTeamManagement', team.id)"
              @keydown.space.prevent.stop="emit('openTeamManagement', team.id)"
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
                      v-for="(m, i) in team.members.slice(
                        0,
                        TEAM_CARD_AVATAR_DISPLAY_CAP,
                      )"
                      :key="m.memberId ?? `${team.id}-${i}`"
                      class="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white shadow-sm ring-1 ring-gray-900/10 sm:h-12 sm:w-12 sm:text-base"
                      :class="i > 0 ? '-ml-3 sm:-ml-3.5' : ''"
                      :style="{
                        backgroundColor: m.color,
                        zIndex:
                          Math.min(
                            team.members.length,
                            TEAM_CARD_AVATAR_DISPLAY_CAP,
                          ) - i,
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
