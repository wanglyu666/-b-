<script setup lang="ts">
import {
  computed,
  nextTick,
  onMounted,
  onUnmounted,
  ref,
  watch,
} from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ChevronDown, ChevronLeft, Plus, Search, X } from 'lucide-vue-next';
import checkMarkImg from '../../image asset/check mark.png';
import { useOrgStore } from '../stores/orgStore';
import type {
  Member,
  OrganizationSpace,
  OrganizationTeam,
} from '../types';

const orgStore = useOrgStore();

const props = defineProps<{
  teams: OrganizationTeam[];
  /** 与成员管理同源，用于详情内按团队名称匹配全名 */
  members: Member[];
}>();

const emit = defineEmits<{
  back: [];
}>();

const route = useRoute();
const router = useRouter();

/** 新增团队弹窗 */
const addTeamModalOpen = ref(false);
const addTeamStep = ref<'form' | 'success'>('form');
const draftAddTeamName = ref('');
/** 空间管理列表中的空间 id，与 orgStore.spaces 一致 */
const draftAddSpaceId = ref('');

function todayYmd(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

const addTeamFormValid = computed(
  () =>
    draftAddTeamName.value.trim() !== '' && draftAddSpaceId.value !== '',
);

function openAddTeamModal() {
  draftAddTeamName.value = '';
  draftAddSpaceId.value = '';
  addTeamSpaceDropdownOpen.value = false;
  addTeamStep.value = 'form';
  addTeamModalOpen.value = true;
}

function closeAddTeamModal() {
  addTeamSpaceDropdownOpen.value = false;
  addTeamModalOpen.value = false;
  addTeamStep.value = 'form';
}

/** 负责空间：与「新增成员 · 类型」一致的下拉（Teleport + 磨砂列表） */
const addTeamSpaceDropdownOpen = ref(false);
const addTeamSpaceTriggerEl = ref<HTMLElement | null>(null);
const addTeamSpaceDropdownStyle = ref<Record<string, string>>({});

function formatSpaceOptionLabel(s: OrganizationSpace): string {
  return `${s.name}（${s.province}${s.city}${s.district}）`;
}

const draftAddSpaceLabel = computed(() => {
  const id = draftAddSpaceId.value;
  if (!id) return '';
  const s = orgStore.spaces.find((x) => x.id === id);
  return s ? formatSpaceOptionLabel(s) : '';
});

function updateAddTeamSpaceDropdownPosition() {
  const el = addTeamSpaceTriggerEl.value;
  if (!el) return;
  const r = el.getBoundingClientRect();
  const maxListH = Math.min(window.innerHeight * 0.4, 256);
  const spaceBelow = window.innerHeight - r.bottom - 8;
  const openUp = spaceBelow < maxListH && r.top > maxListH + 16;
  const topPx = openUp ? Math.max(8, r.top - maxListH - 4) : r.bottom + 4;
  addTeamSpaceDropdownStyle.value = {
    position: 'fixed',
    left: `${r.left}px`,
    top: `${topPx}px`,
    width: `${r.width}px`,
    zIndex: '200',
    maxHeight: `${maxListH}px`,
  };
}

function toggleAddTeamSpaceDropdown() {
  if (orgStore.spaces.length === 0) return;
  addTeamSpaceDropdownOpen.value = !addTeamSpaceDropdownOpen.value;
  if (addTeamSpaceDropdownOpen.value) {
    nextTick(() => updateAddTeamSpaceDropdownPosition());
  }
}

function selectAddTeamSpace(id: string) {
  draftAddSpaceId.value = id;
  addTeamSpaceDropdownOpen.value = false;
}

function closeAddTeamSpaceDropdownOnScroll() {
  addTeamSpaceDropdownOpen.value = false;
}

watch(addTeamSpaceDropdownOpen, (open) => {
  if (open) {
    window.addEventListener('scroll', closeAddTeamSpaceDropdownOnScroll, true);
    window.addEventListener('resize', updateAddTeamSpaceDropdownPosition);
  } else {
    window.removeEventListener(
      'scroll',
      closeAddTeamSpaceDropdownOnScroll,
      true,
    );
    window.removeEventListener('resize', updateAddTeamSpaceDropdownPosition);
  }
});

watch(addTeamModalOpen, (open) => {
  if (!open) addTeamSpaceDropdownOpen.value = false;
});

function confirmAddTeam() {
  if (!addTeamFormValid.value) return;
  const space = orgStore.spaces.find((s) => s.id === draftAddSpaceId.value);
  if (!space) return;
  orgStore.addTeam({
    id: `t-${Date.now()}`,
    name: draftAddTeamName.value.trim(),
    /** 新增表单已取消组长填写，与成员管理关联后再展示 */
    leader: '—',
    space: space.name,
    createdAt: todayYmd(),
    members: [],
  });
  addTeamStep.value = 'success';
}

function onAddTeamSuccessClose() {
  closeAddTeamModal();
}

const searchQuery = ref('');
const selectedTeam = ref<OrganizationTeam | null>(null);

/** 团队详情弹窗：概览 | 审批配置 | 提交成功（成功页尺寸对齐成员管理 success 弹窗） */
const teamDetailInnerView = ref<'overview' | 'approvalFlow' | 'approvalSuccess'>(
  'overview',
);
const activeApprovalLabel = ref<string | null>(null);

const teamDetailModalStyle = computed(() => {
  const view = teamDetailInnerView.value;
  if (view === 'approvalSuccess') {
    return {
      '--jp-modal-w': '800px',
      '--jp-modal-w-max': '800px',
      '--jp-modal-h': '560px',
      '--jp-modal-max-h': 'min(96vh, 920px)',
      '--jp-modal-radius': '32px',
      '--jp-modal-scale': '1.02',
      '--jp-modal-bg': 'rgba(255, 255, 255, 0.15)',
      '--jp-modal-morph-duration': '0.8s',
      '--jp-modal-morph-ease': 'cubic-bezier(0.16, 1, 0.3, 1)',
    } as Record<string, string>;
  }
  const flow = view === 'approvalFlow';
  return {
    '--jp-modal-w': flow ? '920px' : '768px',
    '--jp-modal-w-max': flow ? '920px' : '768px',
    '--jp-modal-h': flow ? 'min(75vh, 720px)' : 'min(75vh, 720px)',
    '--jp-modal-max-h': 'min(96vh, 920px)',
    '--jp-modal-radius': '40px',
    '--jp-modal-scale': flow ? '1.01' : '1',
    '--jp-modal-bg': 'rgba(255, 255, 255, 0.1)',
    '--jp-modal-morph-duration': '0.8s',
    '--jp-modal-morph-ease': 'cubic-bezier(0.16, 1, 0.3, 1)',
  } as Record<string, string>;
});

const filteredTeams = computed(() => {
  const q = searchQuery.value.trim().toLowerCase().replace(/\s/g, '');
  if (!q) return props.teams;
  return props.teams.filter((t) => {
    const blob = `${t.name}${t.leader}${t.space}${t.createdAt}`.toLowerCase();
    return blob.replace(/\s/g, '').includes(q);
  });
});

/** 成员.team 与团队名称一致或为「、」分隔多团队时视为属于该团队（与成员管理展示一致） */
function memberBelongsToTeam(m: Member, teamName: string): boolean {
  const raw = m.team?.trim();
  if (!raw) return false;
  if (raw === teamName) return true;
  if (raw.includes('、')) {
    return raw
      .split('、')
      .map((s) => s.trim())
      .filter(Boolean)
      .includes(teamName);
  }
  return false;
}

const membersForSelectedTeam = computed(() => {
  const t = selectedTeam.value;
  if (!t) return [];
  return props.members
    .filter((m) => memberBelongsToTeam(m, t.name))
    .slice()
    .sort((a, b) => a.name.localeCompare(b.name, 'zh-Hans-CN'));
});

function openTeamDetail(team: OrganizationTeam) {
  selectedTeam.value = team;
  teamDetailInnerView.value = 'overview';
  activeApprovalLabel.value = null;
}

/** 从组织页「团队」小卡带入的 ?team=<id>：进入本页后自动打开对应团队详情弹窗 */
function tryOpenTeamFromQuery() {
  const raw = route.query.team;
  if (raw === undefined || raw === null || raw === '') return;
  const id = (Array.isArray(raw) ? raw[0] : raw) as string;
  if (!id) return;
  const team = props.teams.find((t) => t.id === id);
  const { team: _drop, ...restQuery } = route.query;
  if (!team) {
    if ('team' in route.query) {
      router.replace({ name: 'team-management', query: restQuery });
    }
    return;
  }
  openTeamDetail(team);
  if ('team' in route.query) {
    router.replace({ name: 'team-management', query: restQuery });
  }
}

watch(
  () => [props.teams, route.query.team] as const,
  () => {
    if (props.teams.length === 0) return;
    tryOpenTeamFromQuery();
  },
  { immediate: true, flush: 'post' },
);

function closeTeamDetail() {
  selectedTeam.value = null;
  teamDetailInnerView.value = 'overview';
  activeApprovalLabel.value = null;
  dragOverFlowTrack.value = false;
}

function backToTeamOverview() {
  teamDetailInnerView.value = 'overview';
  activeApprovalLabel.value = null;
  dragOverFlowTrack.value = false;
}

function onTeamDetailBack() {
  backToTeamOverview();
}

function onDocumentKeydown(e: KeyboardEvent) {
  if (e.key !== 'Escape') return;
  if (addTeamSpaceDropdownOpen.value) {
    addTeamSpaceDropdownOpen.value = false;
    return;
  }
  if (addTeamModalOpen.value) {
    closeAddTeamModal();
    return;
  }
  if (teamDetailInnerView.value === 'approvalSuccess') {
    backToTeamOverview();
    return;
  }
  if (teamDetailInnerView.value === 'approvalFlow') {
    backToTeamOverview();
    return;
  }
  closeTeamDetail();
}

onMounted(() => document.addEventListener('keydown', onDocumentKeydown));
onUnmounted(() => {
  document.removeEventListener('keydown', onDocumentKeydown);
  window.removeEventListener('scroll', closeAddTeamSpaceDropdownOnScroll, true);
  window.removeEventListener('resize', updateAddTeamSpaceDropdownPosition);
});

/** 团队详情 · 审批配置入口 */
const teamApprovalPillLabels = [
  '下单审批',
  '验收审批',
  '结算审批',
  '支付审批',
] as const;

type ApprovalLabel = (typeof teamApprovalPillLabels)[number];

/** 各审批类型：流程线上成员 id 顺序（从左到右） */
const approvalFlowOrder = ref<Record<string, number[]>>({});
/** 进入当前审批编辑页时的流程快照，用于判断是否有改动 */
const approvalFlowSnapshotWhenOpened = ref<Record<string, number[]>>({});
const flowTrackRef = ref<HTMLElement | null>(null);
const dragOverFlowTrack = ref(false);

function approvalOrdersEqual(a: number[], b: number[]): boolean {
  if (a.length !== b.length) return false;
  return a.every((id, i) => id === b[i]);
}

function openApprovalFlow(label: ApprovalLabel) {
  activeApprovalLabel.value = label;
  if (!approvalFlowOrder.value[label]) {
    approvalFlowOrder.value = { ...approvalFlowOrder.value, [label]: [] };
  }
  const cur = [...(approvalFlowOrder.value[label] ?? [])];
  approvalFlowSnapshotWhenOpened.value = {
    ...approvalFlowSnapshotWhenOpened.value,
    [label]: cur,
  };
  teamDetailInnerView.value = 'approvalFlow';
}

const currentFlowOrder = computed((): number[] => {
  const label = activeApprovalLabel.value;
  if (!label) return [];
  return approvalFlowOrder.value[label] ?? [];
});

/** 审批配置页：已在虚线上的成员不再出现在上方待选区 */
const membersInApprovalPool = computed(() => {
  const onLine = new Set(currentFlowOrder.value);
  return membersForSelectedTeam.value.filter((m) => !onLine.has(m.id));
});

/** 相对进入本页时的快照有变化才可确认（含增删、排序） */
const approvalFlowHasChangesFromSnapshot = computed(() => {
  const label = activeApprovalLabel.value;
  if (!label || teamDetailInnerView.value !== 'approvalFlow') return false;
  const cur = approvalFlowOrder.value[label] ?? [];
  const snap = approvalFlowSnapshotWhenOpened.value[label];
  if (snap === undefined) return false;
  return !approvalOrdersEqual(cur, snap);
});

function memberById(id: number): Member | undefined {
  return props.members.find((m) => m.id === id);
}

/** 与成员管理列表同源：Member.role */
function memberRoleLabel(m: Member | undefined): string {
  const r = m?.role?.trim();
  return r || '—';
}

/** 根据落点 X 计算插入下标（可排除正在拖动的线上成员，避免占位影响） */
function computeInsertIndex(
  trackEl: HTMLElement,
  clientX: number,
  excludeMemberId?: number,
): number {
  const rect = trackEl.getBoundingClientRect();
  const x = clientX - rect.left;
  const chips = [
    ...trackEl.querySelectorAll<HTMLElement>('[data-flow-chip]'),
  ].filter((el) => {
    if (excludeMemberId === undefined) return true;
    const id = Number(el.dataset.memberId);
    return id !== excludeMemberId;
  });
  if (chips.length === 0) return 0;
  for (let i = 0; i < chips.length; i++) {
    const cr = chips[i].getBoundingClientRect();
    const cx = cr.left + cr.width / 2 - rect.left;
    if (x < cx) return i;
  }
  return chips.length;
}

function applyFlowDrop(
  memberId: number,
  fromSource: 'pool' | 'flow',
  fromIndex: number | null,
  insertIndex: number,
) {
  const label = activeApprovalLabel.value;
  if (!label) return;
  let ids = [...(approvalFlowOrder.value[label] ?? [])];
  if (fromSource === 'flow' && fromIndex !== null) {
    if (fromIndex < 0 || fromIndex >= ids.length || ids[fromIndex] !== memberId)
      return;
    ids.splice(fromIndex, 1);
    let ins = insertIndex;
    if (fromIndex < ins) ins -= 1;
    ins = Math.max(0, Math.min(ins, ids.length));
    ids.splice(ins, 0, memberId);
  } else {
    ids = ids.filter((id) => id !== memberId);
    const ins = Math.max(0, Math.min(insertIndex, ids.length));
    ids.splice(ins, 0, memberId);
  }
  approvalFlowOrder.value = { ...approvalFlowOrder.value, [label]: ids };
}

function removeMemberFromFlow(memberId: number) {
  const label = activeApprovalLabel.value;
  if (!label) return;
  const ids = (approvalFlowOrder.value[label] ?? []).filter(
    (id) => id !== memberId,
  );
  approvalFlowOrder.value = { ...approvalFlowOrder.value, [label]: ids };
}

function onDragStartPool(e: DragEvent, memberId: number) {
  e.dataTransfer?.setData('application/x-member-id', String(memberId));
  e.dataTransfer?.setData('application/x-drag-source', 'pool');
  e.dataTransfer?.setData('text/plain', String(memberId));
  e.dataTransfer!.effectAllowed = 'move';
}

function onDragStartFlowChip(e: DragEvent, memberId: number, index: number) {
  e.dataTransfer?.setData('application/x-member-id', String(memberId));
  e.dataTransfer?.setData('application/x-drag-source', 'flow');
  e.dataTransfer?.setData('application/x-flow-index', String(index));
  e.dataTransfer?.setData('text/plain', String(memberId));
  e.dataTransfer!.effectAllowed = 'move';
}

function onDragOverFlowTrack(e: DragEvent) {
  e.preventDefault();
  dragOverFlowTrack.value = true;
}

function onDragLeaveFlowTrack(e: DragEvent) {
  const rel = e.relatedTarget as Node | null;
  if (flowTrackRef.value && rel && flowTrackRef.value.contains(rel)) return;
  dragOverFlowTrack.value = false;
}

function onDropFlowTrack(e: DragEvent) {
  e.preventDefault();
  dragOverFlowTrack.value = false;
  const el = flowTrackRef.value;
  if (!el) return;
  const raw =
    e.dataTransfer?.getData('application/x-member-id') ||
    e.dataTransfer?.getData('text/plain');
  const memberId = raw ? parseInt(raw, 10) : NaN;
  if (!Number.isFinite(memberId)) return;
  const source = (e.dataTransfer?.getData('application/x-drag-source') ||
    'pool') as 'pool' | 'flow';
  const fromIdxRaw = e.dataTransfer?.getData('application/x-flow-index');
  let fromIndex: number | null = null;
  if (source === 'flow' && fromIdxRaw !== '') {
    const parsed = parseInt(fromIdxRaw, 10);
    if (Number.isFinite(parsed)) fromIndex = parsed;
  }
  const exclude = source === 'flow' ? memberId : undefined;
  const insertIndex = computeInsertIndex(el, e.clientX, exclude);
  applyFlowDrop(memberId, source, fromIndex, insertIndex);
}

function confirmApprovalFlow() {
  if (!approvalFlowHasChangesFromSnapshot.value) return;
  teamDetailInnerView.value = 'approvalSuccess';
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
            <h1 class="text-3xl font-bold text-gray-800">团队</h1>
            <p class="mt-1 text-gray-500">查看与管理团队信息</p>
          </div>
        </div>

        <div
          class="flex w-full shrink-0 flex-col gap-3 sm:mt-1 sm:ml-auto sm:w-auto sm:flex-row sm:items-center sm:justify-end"
        >
          <button
            type="button"
            class="flex shrink-0 items-center justify-center gap-2 rounded-full border border-gray-200/80 bg-gray-100/80 px-5 py-2.5 text-sm font-bold text-gray-800 shadow-inner transition hover:bg-white/90 focus:outline-none focus:ring-2 focus:ring-[#9FE870]/40 active:scale-[0.99]"
            @click="openAddTeamModal"
          >
            <Plus :size="18" class="text-gray-600" aria-hidden="true" />
            新增团队
          </button>
          <div class="relative w-full min-w-0 sm:min-w-[280px] lg:min-w-[320px]">
            <Search
              class="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-400"
              :size="18"
              aria-hidden="true"
            />
            <input
              v-model="searchQuery"
              type="search"
              placeholder="搜索团队名称、组长、负责空间…"
              class="w-full rounded-full border border-gray-200/80 bg-gray-100/80 py-2.5 pl-10 pr-4 text-sm text-gray-800 shadow-inner placeholder:text-gray-400 focus:border-[#9FE870]/50 focus:outline-none focus:ring-2 focus:ring-[#9FE870]/40"
            />
          </div>
        </div>
      </header>

      <div
        class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
      >
        <article
          v-for="team in filteredTeams"
          :key="team.id"
          role="button"
          tabindex="0"
          class="flex cursor-pointer flex-col rounded-3xl border border-gray-100 bg-white/50 p-6 text-left shadow-sm backdrop-blur-sm transition-shadow hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9FE870]/50"
          @click="openTeamDetail(team)"
          @keydown.enter.prevent="openTeamDetail(team)"
          @keydown.space.prevent="openTeamDetail(team)"
        >
          <h2 class="mb-4 line-clamp-2 text-lg font-bold leading-snug text-gray-900">
            {{ team.name }}
          </h2>
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
            <p class="mt-1.5 text-sm leading-relaxed text-gray-600">
              {{ team.space }}
            </p>
          </div>
          <div class="mt-auto flex flex-col">
            <p class="text-[10px] font-bold uppercase tracking-wider text-gray-400">
              包含人员
            </p>
            <div class="mt-3 flex flex-wrap items-center gap-0">
              <div
                v-for="(m, i) in team.members"
                :key="`${team.id}-${i}`"
                class="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white shadow-sm ring-1 ring-gray-900/10 sm:h-12 sm:w-12 sm:text-base"
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
        </article>
      </div>

      <p
        v-if="filteredTeams.length === 0"
        class="py-16 text-center text-sm text-gray-500"
      >
        未找到匹配的团队
      </p>
    </div>

    <Teleport to="body">
      <div
        v-if="selectedTeam"
        class="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4 backdrop-blur-md animate-in fade-in duration-300 sm:p-6"
        role="dialog"
        aria-modal="true"
        aria-labelledby="team-detail-title"
        @click.self="closeTeamDetail"
      >
        <div
          class="jp-modal-morph flex max-h-[min(96vh,920px)] w-full flex-col overflow-hidden border border-white/20 shadow-2xl backdrop-blur-2xl"
          :style="teamDetailModalStyle"
          @click.stop
        >
          <div
            class="flex shrink-0 items-center justify-between border-b border-white/10 px-6 py-5 sm:px-8 sm:py-6"
          >
            <div class="flex min-w-0 items-center gap-2 sm:gap-3">
              <div
                class="h-6 w-1.5 shrink-0 rounded-full bg-[#FFE600] shadow-[0_0_15px_rgba(255,230,0,0.5)]"
              />
              <h2
                id="team-detail-title"
                class="truncate text-xl font-bold tracking-tight text-white sm:text-2xl"
              >
                <template
                  v-if="
                    teamDetailInnerView === 'approvalFlow' ||
                    teamDetailInnerView === 'approvalSuccess'
                  "
                >
                  审批配置 · {{ activeApprovalLabel }}
                </template>
                <template v-else>团队详情</template>
              </h2>
            </div>
            <div class="flex shrink-0 items-center gap-3 sm:gap-4">
              <button
                v-if="
                  teamDetailInnerView === 'approvalFlow' ||
                  teamDetailInnerView === 'approvalSuccess'
                "
                type="button"
                class="text-sm font-bold text-white/80 transition-colors hover:text-white"
                aria-label="返回团队详情"
                @click="onTeamDetailBack"
              >
                返回
              </button>
              <button
                type="button"
                class="rounded-full p-2 text-white/70 transition-colors hover:bg-white/10 hover:text-white"
                aria-label="关闭"
                @click="closeTeamDetail"
              >
                <X :size="24" />
              </button>
            </div>
          </div>

          <div
            class="custom-scrollbar min-h-0 flex-1 overflow-y-auto overflow-x-hidden p-6 sm:p-8"
          >
            <Transition name="modal-slide" mode="out-in">
              <!-- 团队信息 + 审批入口 -->
              <div
                v-if="teamDetailInnerView === 'overview'"
                key="team-overview"
                class="space-y-8"
              >
              <div
                class="relative rounded-[32px] border border-white/10 bg-white/5 p-6 shadow-inner backdrop-blur-xl sm:p-8"
              >
                <div
                  class="grid grid-cols-1 gap-x-12 gap-y-8 sm:grid-cols-2"
                >
                  <div class="sm:col-span-2">
                    <p
                      class="mb-2 text-xs font-bold uppercase tracking-widest text-white/40"
                    >
                      名称
                    </p>
                    <p class="text-xl font-bold tracking-tight text-white">
                      {{ selectedTeam.name }}
                    </p>
                  </div>
                  <div>
                    <p
                      class="mb-2 text-xs font-bold uppercase tracking-widest text-white/40"
                    >
                      创建时间
                    </p>
                    <p
                      class="font-mono text-xl font-bold tabular-nums tracking-tight text-white"
                    >
                      {{ selectedTeam.createdAt }}
                    </p>
                  </div>
                  <div>
                    <p
                      class="mb-2 text-xs font-bold uppercase tracking-widest text-white/40"
                    >
                      负责人
                    </p>
                    <p class="text-xl font-bold tracking-tight text-white">
                      {{ selectedTeam.leader }}
                    </p>
                  </div>
                  <div class="sm:col-span-2">
                    <p
                      class="mb-2 text-xs font-bold uppercase tracking-widest text-white/40"
                    >
                      负责空间
                    </p>
                    <p
                      class="text-lg font-bold leading-relaxed text-white/95"
                    >
                      {{ selectedTeam.space }}
                    </p>
                  </div>
                  <div class="sm:col-span-2">
                    <p
                      class="mb-3 text-xs font-bold uppercase tracking-widest text-white/40"
                    >
                      成员
                    </p>
                    <div
                      v-if="membersForSelectedTeam.length === 0"
                      class="text-sm text-white/45"
                    >
                      暂无成员管理中的记录与该团队关联（可在成员信息中设置所属团队）
                    </div>
                    <div v-else class="flex flex-wrap gap-2">
                      <span
                        v-for="m in membersForSelectedTeam"
                        :key="m.id"
                        class="inline-flex max-w-full items-center rounded-full border border-white/25 bg-white/15 px-3 py-1.5 text-sm font-medium text-white shadow-inner backdrop-blur-sm"
                      >
                        {{ m.name }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div class="w-full">
                <p
                  class="mb-3 text-xs font-bold uppercase tracking-widest text-white/40"
                >
                  审批配置
                </p>
                <div class="flex w-full gap-2 sm:gap-3">
                  <button
                    v-for="label in teamApprovalPillLabels"
                    :key="label"
                    type="button"
                    class="flex min-w-0 flex-1 items-center justify-center rounded-full border border-white/25 bg-white/15 px-1.5 py-2.5 text-center text-xs font-medium text-white shadow-inner backdrop-blur-sm transition hover:bg-white/25 sm:px-2 sm:text-sm"
                    @click="openApprovalFlow(label)"
                  >
                    {{ label }}
                  </button>
                </div>
              </div>
              </div>

              <!-- 审批流程配置 -->
              <div
                v-else-if="teamDetailInnerView === 'approvalFlow'"
                key="team-approval"
                class="flex min-h-[min(380px,46vh)] flex-col gap-6"
              >
              <div>
                <p
                  class="mb-3 text-xs font-bold uppercase tracking-widest text-white/40"
                >
                  团队成员
                </p>
                <p class="mb-3 text-xs text-white/45">
                  拖动姓名到下方虚线上；靠近时轨道高亮。线上成员可拖拽调整顺序，双击可移除。
                </p>
                <div
                  v-if="membersForSelectedTeam.length === 0"
                  class="rounded-2xl border border-dashed border-white/15 bg-white/5 px-4 py-8 text-center text-sm text-white/45"
                >
                  暂无成员，请先在成员管理中关联本团队
                </div>
                <div
                  v-else-if="membersInApprovalPool.length === 0"
                  class="rounded-2xl border border-dashed border-white/10 bg-white/[0.04] px-4 py-6 text-center text-sm text-white/40"
                >
                  可添加成员已全部在下方流程中；双击线上姓名可放回此处
                </div>
                <div v-else class="flex flex-wrap gap-3">
                  <span
                    v-for="m in membersInApprovalPool"
                    :key="'pool-' + m.id"
                    draggable="true"
                    class="inline-flex min-w-[5.75rem] cursor-grab select-none flex-col items-center justify-center gap-0.5 rounded-2xl border border-white/25 bg-white/15 px-5 py-2.5 text-center shadow-inner backdrop-blur-sm active:cursor-grabbing"
                    @dragstart="onDragStartPool($event, m.id)"
                  >
                    <span class="text-base font-semibold leading-tight text-white">{{
                      m.name
                    }}</span>
                    <span class="text-[11px] leading-tight text-white/55 sm:text-xs">{{
                      memberRoleLabel(m)
                    }}</span>
                  </span>
                </div>
              </div>

              <div class="w-full">
                <p
                  class="mb-4 text-xs font-bold uppercase tracking-widest text-white/40"
                >
                  流程
                </p>
                <div
                  class="flex w-full flex-col items-stretch gap-6 sm:flex-row sm:items-center sm:gap-4"
                >
                  <div
                    class="flex shrink-0 items-center justify-center rounded-2xl border border-white/20 bg-white/10 px-5 py-6 text-center font-bold text-white shadow-inner sm:min-w-[100px]"
                  >
                    开始
                  </div>

                  <div
                    class="relative flex min-h-[120px] flex-1 flex-col items-center justify-center sm:min-h-[100px]"
                  >
                    <div
                      class="pointer-events-none absolute left-0 right-0 top-[42%] sm:top-1/2 sm:-translate-y-1/2"
                    >
                      <div
                        class="h-0 w-full border-t-2 border-dashed border-white/35"
                      />
                    </div>
                    <div
                      ref="flowTrackRef"
                      class="relative z-10 flex min-h-[100px] w-full flex-row flex-wrap items-center justify-center gap-4 px-2 py-4 transition"
                      :class="
                        dragOverFlowTrack
                          ? 'rounded-2xl ring-2 ring-[#FFE600]/40 ring-offset-2 ring-offset-transparent'
                          : ''
                      "
                      @dragover.prevent="onDragOverFlowTrack"
                      @dragleave="onDragLeaveFlowTrack"
                      @drop="onDropFlowTrack"
                    >
                      <span
                        v-for="(mid, idx) in currentFlowOrder"
                        :key="'flow-' + mid + '-' + idx"
                        draggable="true"
                        data-flow-chip
                        :data-member-id="mid"
                        class="inline-flex min-w-[5.75rem] cursor-grab select-none flex-col items-center justify-center gap-0.5 rounded-2xl border border-white/25 bg-white/15 px-5 py-2.5 text-center shadow-inner backdrop-blur-sm active:cursor-grabbing"
                        @dragstart="onDragStartFlowChip($event, mid, idx)"
                        @dblclick.prevent="removeMemberFromFlow(mid)"
                      >
                        <span class="text-base font-semibold leading-tight text-white">{{
                          memberById(mid)?.name ?? '…'
                        }}</span>
                        <span class="text-[11px] leading-tight text-white/55 sm:text-xs">{{
                          memberRoleLabel(memberById(mid))
                        }}</span>
                      </span>
                    </div>
                  </div>

                  <div
                    class="flex shrink-0 items-center justify-center rounded-2xl border border-white/20 bg-white/10 px-5 py-6 text-center font-bold text-white shadow-inner sm:min-w-[100px]"
                  >
                    结束
                  </div>
                </div>
              </div>

              <div class="flex justify-end border-t border-white/10 pt-2">
                <button
                  type="button"
                  class="rounded-xl bg-[#FFE600] px-8 py-2.5 text-sm font-bold text-[#260A2F] shadow-[0_0_15px_rgba(255,230,0,0.25)] transition hover:brightness-95 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
                  :disabled="!approvalFlowHasChangesFromSnapshot"
                  @click="confirmApprovalFlow"
                >
                  确认
                </button>
              </div>
              </div>

              <div
                v-else-if="teamDetailInnerView === 'approvalSuccess'"
                key="team-approval-success"
                class="animate-in zoom-in-95 duration-500 flex min-h-[min(360px,48vh)] flex-col items-center justify-center py-6"
              >
                <img
                  :src="checkMarkImg"
                  alt=""
                  class="mb-6 h-36 w-56 object-contain"
                />
                <h2 class="mb-4 text-3xl font-bold tracking-tight text-white">
                  已完成提交
                </h2>
                <p class="mb-12 max-w-md text-center text-white/60">
                  「{{ activeApprovalLabel }}」审批流程已保存至系统中
                </p>
                <button
                  type="button"
                  class="rounded-xl border border-white/10 bg-white/10 px-8 py-3 font-bold text-white transition-colors hover:bg-white/20"
                  @click="backToTeamOverview"
                >
                  返回上级页面
                </button>
              </div>
            </Transition>
          </div>
        </div>
      </div>
    </Teleport>

    <Teleport to="body">
      <div
        v-if="addTeamModalOpen"
        class="fixed inset-0 z-[101] flex items-center justify-center bg-black/40 p-4 backdrop-blur-md animate-in fade-in duration-300 sm:p-6"
        role="dialog"
        aria-modal="true"
        :aria-labelledby="
          addTeamStep === 'form' ? 'team-add-title' : 'team-add-success-title'
        "
        @click.self="closeAddTeamModal"
      >
        <div
          class="jp-modal-morph flex max-h-[min(92vh,860px)] w-full max-w-xl flex-col overflow-hidden border border-white/20 shadow-2xl backdrop-blur-2xl"
          :style="{
            '--jp-modal-w': '560px',
            '--jp-modal-w-max': '560px',
            '--jp-modal-h': addTeamStep === 'form' ? '470px' : '520px',
            '--jp-modal-radius': '32px',
            '--jp-modal-scale': '1',
            '--jp-modal-bg': 'rgba(255, 255, 255, 0.15)',
          }"
          @click.stop
        >
          <template v-if="addTeamStep === 'form'">
            <div
              class="flex shrink-0 items-center justify-between border-b border-white/10 px-6 py-5 sm:px-8 sm:py-6"
            >
              <div class="flex min-w-0 items-center gap-2 sm:gap-3">
                <div
                  class="h-6 w-1.5 shrink-0 rounded-full bg-[#FFE600] shadow-[0_0_15px_rgba(255,230,0,0.5)]"
                />
                <h2
                  id="team-add-title"
                  class="truncate text-xl font-bold tracking-tight text-white sm:text-2xl"
                >
                  新增团队
                </h2>
              </div>
              <button
                type="button"
                class="rounded-full p-2 text-white/70 transition-all hover:bg-white/10 hover:text-white"
                aria-label="关闭"
                @click="closeAddTeamModal"
              >
                <X :size="24" />
              </button>
            </div>
            <div
              class="custom-scrollbar min-h-0 flex-1 overflow-y-auto overflow-x-hidden p-6 sm:p-8"
            >
              <div class="flex flex-col gap-5">
                <p class="text-sm text-white/60">
                  填写团队名称并选择负责空间（与空间管理列表一致）。创建时间将在提交时自动记录为当前系统日期。成员与组长可在成员管理中关联。
                </p>
                <div class="space-y-2">
                  <label
                    for="team-add-name"
                    class="block text-xs font-bold uppercase tracking-widest text-white/40"
                  >
                    团队名称
                  </label>
                  <input
                    id="team-add-name"
                    v-model="draftAddTeamName"
                    type="text"
                    maxlength="64"
                    placeholder="如 维保四组"
                    class="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2.5 text-sm text-white placeholder:text-white/35 focus:border-[#FFE600]/50 focus:outline-none focus:ring-1 focus:ring-[#FFE600]/40"
                  />
                </div>
                <div class="space-y-2">
                  <span
                    id="team-add-space-label"
                    class="block text-xs font-bold uppercase tracking-widest text-white/40"
                  >
                    负责空间
                  </span>
                  <div class="relative">
                    <button
                      id="team-add-space"
                      ref="addTeamSpaceTriggerEl"
                      type="button"
                      class="flex w-full min-h-[42px] items-center justify-between gap-2 rounded-xl border border-white/15 bg-white/5 px-3 py-2.5 text-left text-sm font-bold text-white shadow-inner backdrop-blur-xl transition focus:outline-none focus:ring-1 focus:ring-[#FFE600]/40 disabled:cursor-not-allowed disabled:opacity-50"
                      :class="
                        addTeamSpaceDropdownOpen
                          ? 'border-[#FFE600]/50 ring-1 ring-[#FFE600]/40'
                          : 'hover:border-white/25'
                      "
                      aria-haspopup="listbox"
                      :aria-expanded="addTeamSpaceDropdownOpen"
                      aria-labelledby="team-add-space-label"
                      :disabled="orgStore.spaces.length === 0"
                      @click="toggleAddTeamSpaceDropdown"
                    >
                      <span
                        class="min-w-0 flex-1 truncate"
                        :class="draftAddSpaceLabel ? '' : 'font-normal text-white/45'"
                      >
                        {{
                          draftAddSpaceLabel ||
                            (orgStore.spaces.length === 0
                              ? '暂无空间可选'
                              : '请选择空间')
                        }}
                      </span>
                      <ChevronDown
                        :size="18"
                        class="shrink-0 text-white/70 transition-transform duration-200"
                        :class="addTeamSpaceDropdownOpen ? 'rotate-180' : ''"
                        aria-hidden="true"
                      />
                    </button>
                  </div>
                  <p
                    v-if="orgStore.spaces.length === 0"
                    class="text-xs text-amber-200/90"
                  >
                    暂无空间数据，请先在「空间管理」中新增空间。
                  </p>
                </div>
                <div class="flex justify-end border-t border-white/10 pt-5">
                  <button
                    type="button"
                    class="rounded-xl bg-[#FFE600] px-8 py-2.5 text-sm font-bold text-[#260A2F] shadow-[0_0_15px_rgba(255,230,0,0.25)] transition hover:brightness-95 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
                    :disabled="!addTeamFormValid"
                    @click="confirmAddTeam"
                  >
                    确认
                  </button>
                </div>
              </div>
            </div>
          </template>

          <template v-else>
            <div
              class="flex min-h-[min(420px,52vh)] flex-col items-center justify-center px-6 py-10 sm:px-10"
            >
              <img
                :src="checkMarkImg"
                alt=""
                class="mb-6 h-36 w-56 object-contain"
              />
              <h2
                id="team-add-success-title"
                class="mb-4 text-3xl font-bold tracking-tight text-white"
              >
                已完成提交
              </h2>
              <p class="mb-10 max-w-md text-center text-white/60">
                新团队已成功添加至系统中。可在下方列表中查看，成员请在「成员管理」中关联。
              </p>
              <button
                type="button"
                class="rounded-xl border border-white/10 bg-white/10 px-8 py-3 font-bold text-white transition-colors hover:bg-white/20"
                @click="onAddTeamSuccessClose"
              >
                返回团队列表
              </button>
            </div>
          </template>
        </div>
      </div>
    </Teleport>

    <!-- 新增团队 · 负责空间下拉（与新增成员 · 类型一致：Teleport 避免被弹窗裁切） -->
    <Teleport to="body">
      <template v-if="addTeamSpaceDropdownOpen && addTeamModalOpen">
        <div
          class="fixed inset-0 z-[199]"
          aria-hidden="true"
          @click="addTeamSpaceDropdownOpen = false"
        />
        <ul
          role="listbox"
          aria-labelledby="team-add-space-label"
          :style="addTeamSpaceDropdownStyle"
          class="max-h-[min(40vh,16rem)] overflow-y-auto rounded-xl border border-white/20 bg-white/10 py-1 shadow-2xl backdrop-blur-2xl"
          @click.stop
        >
          <li
            v-for="s in orgStore.spaces"
            :key="s.id"
            role="option"
            :aria-selected="draftAddSpaceId === s.id"
            class="cursor-pointer px-3 py-2.5 text-sm font-bold text-white transition hover:bg-white/15"
            :class="
              draftAddSpaceId === s.id ? 'bg-white/10 text-[#FFE600]' : ''
            "
            :title="formatSpaceOptionLabel(s)"
            @click="selectAddTeamSpace(s.id)"
          >
            <span class="line-clamp-2 text-left leading-snug">{{
              formatSpaceOptionLabel(s)
            }}</span>
          </li>
        </ul>
      </template>
    </Teleport>
  </div>
</template>

<style scoped>
/* 与 MemberManagementView 成员详情 ↔ 子页一致：渐隐 + 轻微横向位移 */
.modal-slide-enter-active,
.modal-slide-leave-active {
  transition:
    opacity 0.22s ease,
    transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
.modal-slide-enter-from {
  opacity: 0;
  transform: translateX(1.25rem);
}
.modal-slide-leave-to {
  opacity: 0;
  transform: translateX(-0.75rem);
}
</style>
