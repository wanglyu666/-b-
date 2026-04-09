<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue';
import {
  Briefcase,
  Check,
  ChevronLeft,
  Search,
  Trash2,
  UserCog,
  UserPen,
  UsersRound,
  X,
} from 'lucide-vue-next';
import type { Component } from 'vue';
import type { EngineeringProject, Member } from '../types';
import { engineeringProjects } from '../data';
import checkMarkImg from '../../image asset/check mark.png';

const props = defineProps<{
  members: Member[];
}>();

const emit = defineEmits<{
  back: [];
}>();

const searchQuery = ref('');
const selectedMember = ref<Member | null>(null);

/** 弹窗内视图：详情 | 角色配置 | 项目分配 | 项目分配成功 */
const modalView = ref<
  'detail' | 'roleConfig' | 'projectAssign' | 'projectAssignSuccess'
>('detail');

/** 成员 id → 本地覆盖后的角色（确认后写入） */
const roleOverrides = ref<Record<number, string>>({});

/** 预设 + 用户添加的自定义角色名（用于可选按钮） */
const defaultPresetRoles = ['项目经理', '采购', '行政', '设计'] as const;
const customRoles = ref<string[]>([]);

/** 角色配置页：当前选中 */
const draftRole = ref('');
const customRoleInput = ref('');

/**
 * 成员弹窗尺寸/圆角/缩放：与工程项目「项目详情」弹窗 `.modal-morph` 同一套过渡（0.8s、cubic-bezier(0.16,1,0.3,1)）。
 * 详情页含操作按钮区偏高；角色配置 / 项目分配内容区相对紧凑。
 */
const memberModalDimensions = computed(() => {
  if (modalView.value === 'roleConfig') {
    return { width: '768px', height: '500px', radius: '32px', scale: 1.02 };
  }
  if (modalView.value === 'projectAssign') {
    return { width: '800px', height: '640px', radius: '32px', scale: 1.02 };
  }
  /** 对齐维保项目「项目评价」成功页（evaluation_success）尺寸与动效 */
  if (modalView.value === 'projectAssignSuccess') {
    return { width: '800px', height: '560px', radius: '32px', scale: 1.02 };
  }
  return { width: '768px', height: '880px', radius: '40px', scale: 1 };
});

const memberModalSurface = computed(() =>
  modalView.value === 'detail' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.15)',
);

/** 工程项目负责人本地覆盖（与 data 中 engineeringProjects 对齐，用于项目分配演示） */
const engineeringProjectManagerOverrides = ref<Record<string, string>>({});

function effectiveProjectManager(p: EngineeringProject): string {
  return engineeringProjectManagerOverrides.value[p.id] ?? p.manager;
}

const memberEngineeringProjects = computed(() => {
  const m = selectedMember.value;
  if (!m) return [];
  return engineeringProjects.filter((p) => effectiveProjectManager(p) === m.name);
});

const recipientMemberOptions = computed(() => {
  const cur = selectedMember.value;
  if (!cur) return [];
  return props.members.filter((x) => x.id !== cur.id);
});

/** 项目分配：多选 id */
const selectedProjectIdsForAssign = ref<string[]>([]);
const recipientMemberIdForAssign = ref('');

function toggleProjectAssignSelection(id: string) {
  const arr = selectedProjectIdsForAssign.value;
  const i = arr.indexOf(id);
  if (i === -1) arr.push(id);
  else arr.splice(i, 1);
}

function openProjectAssign() {
  selectedProjectIdsForAssign.value = [];
  recipientMemberIdForAssign.value = '';
  modalView.value = 'projectAssign';
}

function confirmProjectAssign() {
  const ids = selectedProjectIdsForAssign.value;
  const ridStr = recipientMemberIdForAssign.value;
  if (!ids.length || ridStr === '') return;
  const recipient = props.members.find((x) => String(x.id) === String(ridStr));
  if (!recipient) return;
  const next = { ...engineeringProjectManagerOverrides.value };
  for (const id of ids) {
    next[id] = recipient.name;
  }
  engineeringProjectManagerOverrides.value = next;
  selectedProjectIdsForAssign.value = [];
  recipientMemberIdForAssign.value = '';
  modalView.value = 'projectAssignSuccess';
}

/** 供全局 `src/styles/modal-morph.css` 中 `.jp-modal-morph` 使用 */
const memberModalMorphStyle = computed(() => {
  const d = memberModalDimensions.value;
  return {
    '--jp-modal-w': d.width,
    '--jp-modal-h': d.height,
    '--jp-modal-radius': d.radius,
    '--jp-modal-scale': String(d.scale),
    '--jp-modal-bg': memberModalSurface.value,
  } as Record<string, string>;
});

/** 对齐工程项目「项目操作指令」：上排大图标配色 + 图标上、文案下 */
const memberActionButtons: {
  key: string;
  label: string;
  icon: Component;
  iconClass: string;
}[] = [
  {
    key: 'role',
    label: '角色配置',
    icon: UserCog,
    iconClass:
      'text-blue-400 group-hover:scale-110 group-hover:drop-shadow-[0_0_8px_rgba(96,165,250,0.5)] transition-all',
  },
  {
    key: 'team',
    label: '团队配置',
    icon: UsersRound,
    iconClass:
      'text-orange-400 group-hover:scale-110 group-hover:drop-shadow-[0_0_8px_rgba(251,146,60,0.5)] transition-all',
  },
  {
    key: 'account',
    label: '信息修改',
    icon: UserPen,
    iconClass:
      'text-emerald-400 group-hover:scale-110 group-hover:drop-shadow-[0_0_8px_rgba(52,211,153,0.5)] transition-all',
  },
  {
    key: 'project',
    label: '项目分配',
    icon: Briefcase,
    iconClass:
      'text-indigo-400 group-hover:scale-110 group-hover:drop-shadow-[0_0_8px_rgba(129,140,248,0.5)] transition-all',
  },
  {
    key: 'delete',
    label: '删除',
    icon: Trash2,
    iconClass:
      'text-rose-400 group-hover:scale-110 group-hover:drop-shadow-[0_0_8px_rgba(244,63,94,0.45)] transition-all',
  },
];

const memberActionButtonsTop = computed(() => memberActionButtons.slice(0, 3));
const memberActionButtonsBottom = computed(() => memberActionButtons.slice(3, 5));

function effectiveRole(m: Member): string {
  return roleOverrides.value[m.id] ?? m.role;
}

function onMemberAction(key: string) {
  if (!selectedMember.value) return;
  if (key === 'role') {
    draftRole.value = effectiveRole(selectedMember.value);
    modalView.value = 'roleConfig';
    return;
  }
  if (key === 'project') {
    openProjectAssign();
    return;
  }
  if (key === 'delete') {
    const ok = confirm(`确定要删除成员「${selectedMember.value.name}」吗？`);
    if (!ok) return;
  }
}

function backToMemberDetailFromSubView() {
  modalView.value = 'detail';
}

function addCustomRole() {
  const t = customRoleInput.value.trim();
  if (!t) return;
  const preset = defaultPresetRoles as readonly string[];
  if (preset.includes(t) || customRoles.value.includes(t)) {
    draftRole.value = t;
    customRoleInput.value = '';
    return;
  }
  customRoles.value.push(t);
  draftRole.value = t;
  customRoleInput.value = '';
}

function confirmRoleConfig() {
  const m = selectedMember.value;
  if (!m || !draftRole.value.trim()) return;
  roleOverrides.value = {
    ...roleOverrides.value,
    [m.id]: draftRole.value.trim(),
  };
  modalView.value = 'detail';
}

const filteredMembers = computed(() => {
  const q = searchQuery.value.trim().toLowerCase().replace(/\s/g, '');
  if (!q) return props.members;
  return props.members.filter((m) => {
    const phone = (m.phone ?? '').toLowerCase().replace(/-/g, '');
    const qFlat = q.replace(/-/g, '');
    const roleText = effectiveRole(m).toLowerCase();
    return (
      m.name.toLowerCase().includes(q) ||
      roleText.includes(q) ||
      phone.includes(qFlat)
    );
  });
});

function openMemberDetail(m: Member) {
  selectedMember.value = m;
  modalView.value = 'detail';
}

function closeMemberDetail() {
  selectedMember.value = null;
  modalView.value = 'detail';
}

function onDocumentKeydown(e: KeyboardEvent) {
  if (e.key !== 'Escape' || !selectedMember.value) return;
  if (
    modalView.value === 'roleConfig' ||
    modalView.value === 'projectAssign' ||
    modalView.value === 'projectAssignSuccess'
  ) {
    modalView.value = 'detail';
  } else {
    closeMemberDetail();
  }
}

onMounted(() => document.addEventListener('keydown', onDocumentKeydown));
onUnmounted(() => document.removeEventListener('keydown', onDocumentKeydown));
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
            <h1 class="text-3xl font-bold text-gray-800">成员管理</h1>
            <p class="mt-1 text-gray-500">查看组织成员与联系方式</p>
          </div>
        </div>

        <div class="relative w-full shrink-0 sm:mt-1 sm:w-auto sm:min-w-[280px] lg:min-w-[320px]">
          <Search
            class="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-400"
            :size="18"
            aria-hidden="true"
          />
          <input
            v-model="searchQuery"
            type="search"
            placeholder="搜索姓名、角色、电话..."
            class="w-full rounded-full border border-gray-200/80 bg-gray-100/80 py-2.5 pl-10 pr-4 text-sm text-gray-800 shadow-inner placeholder:text-gray-400 focus:border-[#9FE870]/50 focus:outline-none focus:ring-2 focus:ring-[#9FE870]/40"
          />
        </div>
      </header>

      <div
        class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
      >
        <button
          v-for="m in filteredMembers"
          :key="m.id"
          type="button"
          class="flex flex-col items-center rounded-3xl border border-gray-100 bg-white/50 px-6 pb-8 pt-10 text-center shadow-sm backdrop-blur-sm transition-all hover:bg-white/70 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-[#9FE870]/50"
          @click="openMemberDetail(m)"
        >
          <div
            :class="[
              'mb-5 flex h-24 w-24 shrink-0 items-center justify-center rounded-full text-2xl font-bold text-white shadow-sm',
              m.bgColor,
            ]"
          >
            {{ m.initial }}
          </div>
          <p class="text-lg font-bold text-gray-900">{{ m.name }}</p>
          <p class="mt-1.5 text-sm text-gray-600">{{ effectiveRole(m) }}</p>
          <p class="mt-1.5 text-sm tabular-nums text-gray-500">
            {{ m.phone ?? '—' }}
          </p>
        </button>
      </div>

      <p
        v-if="filteredMembers.length === 0"
        class="py-16 text-center text-sm text-gray-500"
      >
        未找到匹配的成员
      </p>
    </div>

    <!-- 成员详情弹窗（样式对齐维保项目「项目详情」） -->
    <Teleport to="body">
      <div
        v-if="selectedMember"
        class="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4 backdrop-blur-md animate-in fade-in duration-300 sm:p-6"
        role="dialog"
        aria-modal="true"
        :aria-labelledby="
          modalView === 'roleConfig'
            ? 'member-role-title'
            : modalView === 'projectAssign' || modalView === 'projectAssignSuccess'
              ? 'member-project-assign-title'
              : 'member-detail-title'
        "
        @click.self="closeMemberDetail"
      >
        <div
          class="jp-modal-morph flex w-full flex-col overflow-hidden border border-white/20 shadow-2xl backdrop-blur-2xl"
          :style="memberModalMorphStyle"
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
                :id="
                  modalView === 'roleConfig'
                    ? 'member-role-title'
                    : modalView === 'projectAssign' || modalView === 'projectAssignSuccess'
                      ? 'member-project-assign-title'
                      : 'member-detail-title'
                "
                class="truncate text-xl font-bold tracking-tight text-white sm:text-2xl"
              >
                {{
                  modalView === 'roleConfig'
                    ? '角色配置'
                    : modalView === 'projectAssign' || modalView === 'projectAssignSuccess'
                      ? '项目分配'
                      : '成员详情'
                }}
              </h2>
            </div>
            <div class="flex shrink-0 items-center gap-3 sm:gap-4">
              <button
                v-if="
                  modalView === 'roleConfig' ||
                  modalView === 'projectAssign' ||
                  modalView === 'projectAssignSuccess'
                "
                type="button"
                class="text-sm font-bold text-white/80 transition-colors hover:text-white"
                aria-label="返回成员详情"
                @click="backToMemberDetailFromSubView"
              >
                返回
              </button>
              <button
                type="button"
                class="rounded-full p-2 text-white/70 transition-all hover:bg-white/10 hover:text-white"
                aria-label="关闭"
                @click="closeMemberDetail"
              >
                <X :size="24" />
              </button>
            </div>
          </div>

          <div class="custom-scrollbar min-h-0 flex-1 overflow-y-auto overflow-x-hidden p-6 sm:p-8">
            <Transition name="modal-slide" mode="out-in">
              <div v-if="modalView === 'detail'" key="detail" class="space-y-8">
                <div
                  class="rounded-[32px] border border-white/10 bg-white/5 p-6 shadow-inner backdrop-blur-xl sm:p-8"
                >
                  <div
                    class="grid grid-cols-1 gap-x-12 gap-y-8 sm:grid-cols-2"
                  >
                    <div>
                      <p class="mb-2 text-xs font-bold uppercase tracking-widest text-white/40">
                        姓名
                      </p>
                      <p class="text-xl font-bold tracking-tight text-white">
                        {{ selectedMember.name }}
                      </p>
                    </div>
                    <div>
                      <p class="mb-2 text-xs font-bold uppercase tracking-widest text-white/40">
                        角色
                      </p>
                      <p class="text-xl font-bold tracking-tight text-white">
                        {{ effectiveRole(selectedMember) }}
                      </p>
                    </div>
                    <div>
                      <p class="mb-2 text-xs font-bold uppercase tracking-widest text-white/40">
                        团队
                      </p>
                      <p class="text-xl font-bold tracking-tight text-white">
                        {{ selectedMember.team ?? '—' }}
                      </p>
                    </div>
                    <div>
                      <p class="mb-2 text-xs font-bold uppercase tracking-widest text-white/40">
                        联系电话
                      </p>
                      <p class="font-mono text-xl font-bold tracking-tight text-white tabular-nums">
                        {{ selectedMember.phone ?? '—' }}
                      </p>
                    </div>
                    <div class="sm:col-span-2">
                      <p class="mb-2 text-xs font-bold uppercase tracking-widest text-white/40">
                        联系邮箱
                      </p>
                      <p class="break-all text-xl font-bold tracking-tight text-white">
                        {{ selectedMember.email ?? '—' }}
                      </p>
                    </div>
                    <div class="sm:col-span-2">
                      <p class="mb-2 text-xs font-bold uppercase tracking-widest text-white/40">
                        备注
                      </p>
                      <p class="text-lg font-bold leading-relaxed text-white/95">
                        {{ selectedMember.remarks ?? '—' }}
                      </p>
                    </div>
                  </div>
                </div>

                <!-- 对齐工程项目 ProjectOverview「项目操作指令」布局 -->
                <div>
                  <h3
                    class="mb-6 px-2 text-sm font-bold uppercase tracking-widest text-white/40"
                  >
                    成员操作指令
                  </h3>
                  <div class="flex flex-col gap-4">
                    <div class="grid grid-cols-2 gap-4 sm:grid-cols-3">
                      <button
                        v-for="btn in memberActionButtonsTop"
                        :key="btn.key"
                        type="button"
                        class="group flex flex-col items-center justify-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-sm font-bold text-white backdrop-blur-lg transition-all hover:bg-white/15"
                        @click="onMemberAction(btn.key)"
                      >
                        <div :class="btn.iconClass">
                          <component :is="btn.icon" :size="20" />
                        </div>
                        <span class="tracking-wide">{{ btn.label }}</span>
                      </button>
                    </div>
                    <div class="grid grid-cols-2 gap-4">
                      <button
                        v-for="btn in memberActionButtonsBottom"
                        :key="btn.key"
                        type="button"
                        class="group flex min-h-[3rem] w-full flex-row items-center justify-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-bold text-white backdrop-blur-lg transition-all hover:bg-white/15 sm:min-h-[3.25rem] sm:gap-4 sm:px-8"
                        :class="
                          btn.key === 'delete'
                            ? 'hover:border-rose-500/30'
                            : ''
                        "
                        @click="onMemberAction(btn.key)"
                      >
                        <div class="shrink-0" :class="btn.iconClass">
                          <component :is="btn.icon" :size="20" />
                        </div>
                        <span class="min-w-0 truncate tracking-wide">{{ btn.label }}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div
                v-else-if="modalView === 'roleConfig'"
                key="role"
                class="flex min-h-[280px] flex-col gap-6"
              >
                <p class="text-sm text-white/60">
                  为「<span class="font-semibold text-white">{{ selectedMember.name }}</span>」选择角色，可点选预设或添加自定义。
                </p>
                <div class="flex flex-wrap gap-3">
                  <button
                    v-for="r in defaultPresetRoles"
                    :key="r"
                    type="button"
                    class="rounded-full border px-4 py-2 text-sm font-bold transition-all"
                    :class="
                      draftRole === r
                        ? 'border-[#FFE600] bg-[#FFE600]/15 text-white shadow-[0_0_12px_rgba(255,230,0,0.25)]'
                        : 'border-white/15 bg-white/5 text-white/90 hover:bg-white/10'
                    "
                    @click="draftRole = r"
                  >
                    {{ r }}
                  </button>
                </div>
                <div class="flex flex-wrap gap-3">
                  <button
                    v-for="r in customRoles"
                    :key="'c-' + r"
                    type="button"
                    class="rounded-full border px-4 py-2 text-sm font-bold transition-all"
                    :class="
                      draftRole === r
                        ? 'border-[#FFE600] bg-[#FFE600]/15 text-white shadow-[0_0_12px_rgba(255,230,0,0.25)]'
                        : 'border-white/15 bg-white/5 text-white/90 hover:bg-white/10'
                    "
                    @click="draftRole = r"
                  >
                    {{ r }}
                  </button>
                </div>
                <div class="flex flex-wrap items-center gap-2">
                  <input
                    v-model="customRoleInput"
                    type="text"
                    maxlength="32"
                    placeholder="输入自定义角色后添加"
                    class="min-w-[8rem] flex-1 rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/35 focus:border-[#FFE600]/50 focus:outline-none focus:ring-1 focus:ring-[#FFE600]/40"
                    @keydown.enter.prevent="addCustomRole"
                  />
                  <button
                    type="button"
                    class="shrink-0 rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-xs font-bold text-white transition hover:bg-white/20"
                    @click="addCustomRole"
                  >
                    添加
                  </button>
                </div>
                <div class="flex flex-1 items-end justify-end pt-4">
                  <button
                    type="button"
                    class="rounded-xl bg-[#FFE600] px-8 py-2.5 text-sm font-bold text-[#260A2F] shadow-[0_0_15px_rgba(255,230,0,0.25)] transition hover:brightness-95 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
                    :disabled="!draftRole.trim()"
                    @click="confirmRoleConfig"
                  >
                    确认
                  </button>
                </div>
              </div>

              <div
                v-else-if="modalView === 'projectAssign'"
                key="projectAssign"
                class="flex min-h-[320px] flex-col gap-5"
              >
                <p class="text-sm text-white/60">
                  勾选需要转出的工程项目，选择接收成员后确认。数据与「工程项目管理」中的负责人一致。
                </p>
                <div
                  v-if="memberEngineeringProjects.length === 0"
                  class="rounded-2xl border border-dashed border-white/15 bg-white/5 px-6 py-12 text-center text-sm text-white/50"
                >
                  该成员暂无负责的工程项目
                </div>
                <div
                  v-else
                  class="grid max-h-[min(52vh,22rem)] grid-cols-1 gap-3 overflow-y-auto pr-1 sm:grid-cols-2"
                >
                  <button
                    v-for="p in memberEngineeringProjects"
                    :key="p.id"
                    type="button"
                    class="group relative flex flex-col gap-2 rounded-2xl border px-4 py-3 text-left transition-all"
                    :class="
                      selectedProjectIdsForAssign.includes(p.id)
                        ? 'border-[#FFE600]/80 bg-[#FFE600]/10 shadow-[0_0_12px_rgba(255,230,0,0.15)]'
                        : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10'
                    "
                    @click="toggleProjectAssignSelection(p.id)"
                  >
                    <span
                      class="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full border text-[#FFE600]"
                      :class="
                        selectedProjectIdsForAssign.includes(p.id)
                          ? 'border-[#FFE600] bg-[#FFE600]/20'
                          : 'border-white/20 bg-white/5 opacity-60 group-hover:opacity-100'
                      "
                    >
                      <Check
                        v-if="selectedProjectIdsForAssign.includes(p.id)"
                        :size="14"
                        class="text-[#FFE600]"
                        stroke-width="3"
                      />
                    </span>
                    <p class="pr-8 text-xs font-bold uppercase tracking-wider text-white/40">
                      {{ p.no }}
                    </p>
                    <p class="line-clamp-2 text-sm font-bold text-white">
                      {{ p.name }}
                    </p>
                    <p class="line-clamp-1 text-xs text-white/55">
                      {{ p.address }}
                    </p>
                    <div class="mt-1 flex flex-wrap gap-2 text-[11px] font-bold text-white/50">
                      <span
                        class="rounded-md border border-white/10 bg-white/5 px-2 py-0.5 text-white/70"
                        >{{ p.status }}</span
                      >
                      <span v-if="p.amount" class="tabular-nums">{{ p.amount }}</span>
                    </div>
                  </button>
                </div>
                <div
                  class="mt-auto flex shrink-0 flex-col gap-4 border-t border-white/10 pt-5 sm:flex-row sm:items-end sm:justify-between sm:gap-6"
                >
                  <div class="min-w-0 flex-1 space-y-2">
                    <label
                      for="recipient-member-select"
                      class="block text-xs font-bold uppercase tracking-widest text-white/40"
                    >
                      接收成员
                    </label>
                    <select
                      id="recipient-member-select"
                      v-model="recipientMemberIdForAssign"
                      class="w-full max-w-md rounded-xl border border-white/15 bg-white/5 px-3 py-2.5 text-sm font-bold text-white focus:border-[#FFE600]/50 focus:outline-none focus:ring-1 focus:ring-[#FFE600]/40"
                    >
                      <option disabled value="">请选择接收成员</option>
                      <option
                        v-for="m in recipientMemberOptions"
                        :key="m.id"
                        :value="m.id"
                        class="bg-[#1a1a24] text-white"
                      >
                        {{ m.name }} · {{ m.team ?? '—' }}
                      </option>
                    </select>
                  </div>
                  <div class="flex justify-end sm:pb-0.5">
                    <button
                      type="button"
                      class="rounded-xl bg-[#FFE600] px-8 py-2.5 text-sm font-bold text-[#260A2F] shadow-[0_0_15px_rgba(255,230,0,0.25)] transition hover:brightness-95 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
                      :disabled="
                        memberEngineeringProjects.length === 0 ||
                        selectedProjectIdsForAssign.length === 0 ||
                        recipientMemberIdForAssign === ''
                      "
                      @click="confirmProjectAssign"
                    >
                      确定
                    </button>
                  </div>
                </div>
              </div>

              <div
                v-else-if="modalView === 'projectAssignSuccess'"
                key="projectAssignSuccess"
                class="animate-in zoom-in-95 duration-500 flex min-h-[min(420px,52vh)] flex-col items-center justify-center py-6"
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
                  所选工程项目的负责人已成功更新至系统中
                </p>
                <button
                  type="button"
                  class="rounded-xl border border-white/10 bg-white/10 px-8 py-3 font-bold text-white transition-colors hover:bg-white/20"
                  @click="backToMemberDetailFromSubView"
                >
                  返回上级页面
                </button>
              </div>
            </Transition>
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

/* 弹窗内 详情 ↔ 角色配置 切换 */
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
