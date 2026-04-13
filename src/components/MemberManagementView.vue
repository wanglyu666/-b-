<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue';
import {
  Briefcase,
  Building2,
  Check,
  ChevronDown,
  ChevronLeft,
  Plus,
  Search,
  Trash2,
  UserCog,
  UserPen,
  UsersRound,
  X,
} from 'lucide-vue-next';
import type { Component } from 'vue';
import type {
  EngineeringProject,
  Member,
  OrganizationSpace,
  OrganizationTeam,
} from '../types';
import { engineeringProjects } from '../data';
import checkMarkImg from '../../image asset/check mark.png';

const props = defineProps<{
  members: Member[];
  /** 与「团队管理」同源，用于成员详情内团队配置 */
  teams: OrganizationTeam[];
  /** 与「空间管理」同源，用于成员详情内空间分配 */
  spaces: OrganizationSpace[];
}>();

const emit = defineEmits<{
  back: [];
}>();

/** 本页新增的成员（与 props 合并展示；持久化需对接后端） */
const localAddedMembers = ref<Member[]>([]);
const allMembers = computed(() => [...props.members, ...localAddedMembers.value]);

const searchQuery = ref('');
const selectedMember = ref<Member | null>(null);
/** 成员详情信息卡：是否展开「负责空间 / 公司」 */
const memberDetailExpanded = ref(false);

/** 弹窗内视图：详情 | 角色配置 | 信息修改 | 信息修改成功 | 团队配置 | 团队配置成功 | 项目分配 | 项目分配成功 | 空间分配 | 空间分配成功 */
const modalView = ref<
  | 'detail'
  | 'roleConfig'
  | 'infoEdit'
  | 'infoEditSuccess'
  | 'teamConfig'
  | 'teamConfigSuccess'
  | 'projectAssign'
  | 'projectAssignSuccess'
  | 'spaceAssign'
  | 'spaceAssignSuccess'
>('detail');

/** 成员 id → 信息修改（确认后写入） */
const memberInfoOverrides = ref<
  Record<
    number,
    {
      name: string;
      email: string;
      remarks: string;
      phone: string;
      memberType: '内部成员' | '外部成员';
    }
  >
>({});

const draftInfoName = ref('');
const draftInfoEmail = ref('');
const draftInfoRemarks = ref('');
const draftInfoPhone = ref('');
const draftInfoMemberType = ref<'内部成员' | '外部成员'>('内部成员');

/** 进入信息修改页时的表单快照，用于判断是否有任意修改 */
const infoEditBaseline = ref<{
  name: string;
  email: string;
  remarks: string;
  phone: string;
  memberType: '内部成员' | '外部成员';
} | null>(null);

const infoEditHasChanges = computed(() => {
  const b = infoEditBaseline.value;
  if (!b) return false;
  return (
    draftInfoName.value.trim() !== b.name ||
    draftInfoEmail.value.trim() !== b.email ||
    draftInfoRemarks.value.trim() !== b.remarks ||
    draftInfoPhone.value.trim() !== b.phone ||
    draftInfoMemberType.value !== b.memberType
  );
});

const addMemberModalOpen = ref(false);
const draftAddName = ref('');
const draftAddPhone = ref('');
const draftAddEmail = ref('');
const draftAddRemarks = ref('');
const draftAddMemberType = ref<'内部成员' | '外部成员'>('内部成员');
const draftAddCompany = ref('');

/** 新增成员：除备注外均为必填；外部成员须填公司名称 */
const addMemberFormValid = computed(() => {
  if (!draftAddName.value.trim()) return false;
  if (!draftAddPhone.value.trim()) return false;
  if (!draftAddEmail.value.trim()) return false;
  if (draftAddMemberType.value === '外部成员' && !draftAddCompany.value.trim())
    return false;
  return true;
});

const addMemberModalStyle = computed(
  () =>
    ({
      '--jp-modal-w': '768px',
      '--jp-modal-h': '720px',
      '--jp-modal-radius': '32px',
      '--jp-modal-scale': '1.02',
      '--jp-modal-bg': 'rgba(255, 255, 255, 0.15)',
    }) as Record<string, string>,
);

const AVATAR_BG_ROTATION = [
  'bg-blue-500',
  'bg-green-500',
  'bg-yellow-500',
  'bg-indigo-500',
  'bg-rose-500',
  'bg-teal-500',
] as const;

function openAddMemberModal() {
  draftAddName.value = '';
  draftAddPhone.value = '';
  draftAddEmail.value = '';
  draftAddRemarks.value = '';
  draftAddMemberType.value = '内部成员';
  draftAddCompany.value = '';
  addMemberTypeDropdownOpen.value = false;
  addMemberModalOpen.value = true;
}

function closeAddMemberModal() {
  addMemberModalOpen.value = false;
}

function confirmAddMember() {
  const name = draftAddName.value.trim();
  if (!name || !addMemberFormValid.value) return;
  const ids = [...props.members, ...localAddedMembers.value].map((m) => m.id);
  const id = Math.max(0, ...ids) + 1;
  const initial = name.slice(0, 1) || '·';
  const bgColor = AVATAR_BG_ROTATION[id % AVATAR_BG_ROTATION.length];
  const newMember: Member = {
    id,
    name,
    role: '成员',
    initial,
    bgColor,
    online: true,
    phone: draftAddPhone.value.trim() || undefined,
    email: draftAddEmail.value.trim() || undefined,
    memberType: draftAddMemberType.value,
    remarks: draftAddRemarks.value.trim() || undefined,
    ...(draftAddMemberType.value === '外部成员'
      ? { company: draftAddCompany.value.trim() || undefined }
      : {}),
  };
  localAddedMembers.value = [...localAddedMembers.value, newMember];
  addMemberModalOpen.value = false;
}

const addMemberTypeDropdownOpen = ref(false);
const addMemberTypeTriggerEl = ref<HTMLElement | null>(null);
const addMemberTypeDropdownStyle = ref<Record<string, string>>({});

function updateAddMemberTypeDropdownPosition() {
  const el = addMemberTypeTriggerEl.value;
  if (!el) return;
  const r = el.getBoundingClientRect();
  const maxListH = Math.min(window.innerHeight * 0.4, 256);
  const spaceBelow = window.innerHeight - r.bottom - 8;
  const openUp = spaceBelow < maxListH && r.top > maxListH + 16;
  const topPx = openUp ? Math.max(8, r.top - maxListH - 4) : r.bottom + 4;
  addMemberTypeDropdownStyle.value = {
    position: 'fixed',
    left: `${r.left}px`,
    top: `${topPx}px`,
    width: `${r.width}px`,
    zIndex: '200',
    maxHeight: `${maxListH}px`,
  };
}

function toggleAddMemberTypeDropdown() {
  addMemberTypeDropdownOpen.value = !addMemberTypeDropdownOpen.value;
  if (addMemberTypeDropdownOpen.value) {
    nextTick(() => updateAddMemberTypeDropdownPosition());
  }
}

function selectAddMemberType(opt: '内部成员' | '外部成员') {
  draftAddMemberType.value = opt;
  if (opt === '内部成员') draftAddCompany.value = '';
  addMemberTypeDropdownOpen.value = false;
}

function closeAddMemberTypeDropdownOnScroll() {
  addMemberTypeDropdownOpen.value = false;
}

watch(addMemberTypeDropdownOpen, (open) => {
  if (open) {
    window.addEventListener('scroll', closeAddMemberTypeDropdownOnScroll, true);
    window.addEventListener('resize', updateAddMemberTypeDropdownPosition);
  } else {
    window.removeEventListener('scroll', closeAddMemberTypeDropdownOnScroll, true);
    window.removeEventListener('resize', updateAddMemberTypeDropdownPosition);
  }
});

watch(addMemberModalOpen, (open) => {
  if (!open) addMemberTypeDropdownOpen.value = false;
});

const memberTypeOptions = ['内部成员', '外部成员'] as const;
const memberTypeDropdownOpen = ref(false);
const memberTypeTriggerEl = ref<HTMLElement | null>(null);
const memberTypeDropdownStyle = ref<Record<string, string>>({});

function updateMemberTypeDropdownPosition() {
  const el = memberTypeTriggerEl.value;
  if (!el) return;
  const r = el.getBoundingClientRect();
  memberTypeDropdownStyle.value = {
    position: 'fixed',
    left: `${r.left}px`,
    top: `${r.bottom + 4}px`,
    width: `${r.width}px`,
    zIndex: '200',
  };
}

function toggleMemberTypeDropdown() {
  memberTypeDropdownOpen.value = !memberTypeDropdownOpen.value;
  if (memberTypeDropdownOpen.value) {
    nextTick(() => updateMemberTypeDropdownPosition());
  }
}

function selectMemberType(opt: '内部成员' | '外部成员') {
  draftInfoMemberType.value = opt;
  memberTypeDropdownOpen.value = false;
}

watch(memberTypeDropdownOpen, (open) => {
  if (open) {
    window.addEventListener('scroll', closeMemberTypeDropdownOnScroll, true);
    window.addEventListener('resize', updateMemberTypeDropdownPosition);
  } else {
    window.removeEventListener('scroll', closeMemberTypeDropdownOnScroll, true);
    window.removeEventListener('resize', updateMemberTypeDropdownPosition);
  }
});

function closeMemberTypeDropdownOnScroll() {
  memberTypeDropdownOpen.value = false;
}

watch(
  () => modalView.value,
  (v) => {
    if (v !== 'infoEdit') memberTypeDropdownOpen.value = false;
    if (v !== 'projectAssign') recipientMemberDropdownOpen.value = false;
  },
);

function effectiveMemberName(m: Member): string {
  return memberInfoOverrides.value[m.id]?.name ?? m.name;
}

function effectiveEmail(m: Member): string {
  const o = memberInfoOverrides.value[m.id]?.email;
  if (o !== undefined) return o;
  return m.email ?? '';
}

function effectivePhone(m: Member): string {
  const o = memberInfoOverrides.value[m.id]?.phone;
  if (o !== undefined) return o;
  return m.phone ?? '';
}

function effectiveRemarks(m: Member): string {
  const o = memberInfoOverrides.value[m.id]?.remarks;
  if (o !== undefined) return o;
  return m.remarks ?? '';
}

function effectiveMemberType(m: Member): '内部成员' | '外部成员' {
  const o = memberInfoOverrides.value[m.id]?.memberType;
  if (o !== undefined) return o;
  return m.memberType ?? '内部成员';
}

/** 成员 id → 已选空间 id（确认后写入，与空间管理列表一致） */
const memberSpaceIdOverrides = ref<Record<number, string[]>>({});
/** 空间分配：当前多选 */
const selectedSpaceIdsForMember = ref<string[]>([]);
/** 进入空间分配页时的勾选快照（用于判断是否有改动） */
const spaceAssignBaselineIds = ref<string[]>([]);

function normalizeSpaceIdsForCompare(ids: string[]): string {
  return [...ids].sort().join('\0');
}

const spaceAssignHasChanges = computed(
  () =>
    normalizeSpaceIdsForCompare(selectedSpaceIdsForMember.value) !==
    normalizeSpaceIdsForCompare(spaceAssignBaselineIds.value),
);

function effectiveResponsibleSpace(m: Member): string {
  const raw = memberSpaceIdOverrides.value;
  if (Object.prototype.hasOwnProperty.call(raw, m.id)) {
    const ids = raw[m.id] ?? [];
    const names = ids
      .map((id) => props.spaces.find((s) => s.id === id)?.name)
      .filter((n): n is string => Boolean(n));
    return names.length ? names.join('、') : '—';
  }
  return m.responsibleSpace ?? '—';
}

function effectiveCompany(m: Member): string {
  return m.company ?? '—';
}

/** 成员 id → 已选团队 id 列表（确认后写入，与团队页数据一致） */
const memberTeamIdOverrides = ref<Record<number, string[]>>({});
/** 团队配置：当前多选 */
const selectedTeamIdsForMember = ref<string[]>([]);

/** 成员 id → 本地覆盖后的角色（确认后写入） */
const roleOverrides = ref<Record<number, string>>({});

/** 预设 + 用户添加的自定义角色名（用于可选按钮） */
const defaultPresetRoles = ['项目经理', '采购', '行政', '设计'] as const;
const customRoles = ref<string[]>([]);

/** 角色配置页：当前选中 */
const draftRole = ref('');
const customRoleInput = ref('');

/** 权限选择（多选，与后台模块对应；分两行展示） */
const permissionModuleOptionRows = [
  ['维保项目管理', '订单管理', '工程项目管理', '维保报修管理', '人员管理'],
  ['合同档案', '合同签约管理', '结算管理', '违约账单', '账单管理'],
] as const;

const draftPermissionKeys = ref<string[]>([]);

/** 能否下单：null 表示未选择 */
const draftCanPlaceOrder = ref<boolean | null>(null);
/** 可下单金额（元），仅在「能下单」时填写 */
const draftOrderAmountLimit = ref('');

/** 成员 id → 角色配置扩展（权限、下单） */
const memberRoleConfigExtras = ref<
  Record<
    number,
    {
      permissions: string[];
      canPlaceOrder: boolean;
      orderAmountLimit: string;
    }
  >
>({});

function toggleDraftPermission(key: string) {
  const arr = draftPermissionKeys.value;
  const i = arr.indexOf(key);
  if (i === -1) arr.push(key);
  else arr.splice(i, 1);
}

/**
 * 成员弹窗尺寸/圆角/缩放：与工程项目「项目详情」弹窗 `.modal-morph` 同一套过渡（0.8s、cubic-bezier(0.16,1,0.3,1)）。
 * 详情页含操作按钮区偏高；角色配置 / 信息修改 / 项目分配等内容区相对紧凑。
 * 修改宽高：下面 `infoEdit` 与 `roleConfig` 共用分支（如 768×750）。
 */
const memberModalDimensions = computed(() => {
  if (modalView.value === 'roleConfig' || modalView.value === 'infoEdit') {
    return { width: '768px', height: '600px', radius: '32px', scale: 1.02 };
  }
  if (
    modalView.value === 'projectAssign' ||
    modalView.value === 'teamConfig' ||
    modalView.value === 'spaceAssign'
  ) {
    return { width: '870px', height: '640px', radius: '32px', scale: 1.02 };
  }
  /** 对齐维保项目「项目评价」成功页（evaluation_success）尺寸与动效 */
  if (
    modalView.value === 'infoEditSuccess' ||
    modalView.value === 'teamConfigSuccess' ||
    modalView.value === 'projectAssignSuccess' ||
    modalView.value === 'spaceAssignSuccess'
  ) {
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
  const name = effectiveMemberName(m);
  return engineeringProjects.filter((p) => effectiveProjectManager(p) === name);
});

const recipientMemberOptions = computed(() => {
  const cur = selectedMember.value;
  if (!cur) return [];
  return allMembers.value.filter((x) => x.id !== cur.id);
});

/** 项目分配：多选 id */
const selectedProjectIdsForAssign = ref<string[]>([]);
const recipientMemberIdForAssign = ref('');

const recipientMemberTriggerLabel = computed(() => {
  const v = recipientMemberIdForAssign.value;
  if (v === '' || v === null) return '';
  const m = recipientMemberOptions.value.find((x) => String(x.id) === String(v));
  if (!m) return '';
  return `${effectiveMemberName(m)} · ${effectiveTeamLabel(m)}`;
});

const recipientMemberDropdownOpen = ref(false);
const recipientMemberTriggerEl = ref<HTMLElement | null>(null);
const recipientMemberDropdownStyle = ref<Record<string, string>>({});

function updateRecipientMemberDropdownPosition() {
  const el = recipientMemberTriggerEl.value;
  if (!el) return;
  const r = el.getBoundingClientRect();
  const maxListH = Math.min(window.innerHeight * 0.4, 256);
  const spaceBelow = window.innerHeight - r.bottom - 8;
  /** 下方空间不足时在按钮上方展开，避免列表溢出视口 */
  const openUp = spaceBelow < maxListH && r.top > maxListH + 16;
  const topPx = openUp
    ? Math.max(8, r.top - maxListH - 4)
    : r.bottom + 4;
  recipientMemberDropdownStyle.value = {
    position: 'fixed',
    left: `${r.left}px`,
    top: `${topPx}px`,
    width: `${r.width}px`,
    zIndex: '200',
    maxHeight: `${maxListH}px`,
  };
}

function toggleRecipientMemberDropdown() {
  recipientMemberDropdownOpen.value = !recipientMemberDropdownOpen.value;
  if (recipientMemberDropdownOpen.value) {
    nextTick(() => updateRecipientMemberDropdownPosition());
  }
}

function selectRecipientMember(id: number) {
  recipientMemberIdForAssign.value = String(id);
  recipientMemberDropdownOpen.value = false;
}

function closeRecipientMemberDropdownOnScroll() {
  recipientMemberDropdownOpen.value = false;
}

watch(recipientMemberDropdownOpen, (open) => {
  if (open) {
    window.addEventListener('scroll', closeRecipientMemberDropdownOnScroll, true);
    window.addEventListener('resize', updateRecipientMemberDropdownPosition);
  } else {
    window.removeEventListener('scroll', closeRecipientMemberDropdownOnScroll, true);
    window.removeEventListener('resize', updateRecipientMemberDropdownPosition);
  }
});

function toggleProjectAssignSelection(id: string) {
  const arr = selectedProjectIdsForAssign.value;
  const i = arr.indexOf(id);
  if (i === -1) arr.push(id);
  else arr.splice(i, 1);
}

function openProjectAssign() {
  selectedProjectIdsForAssign.value = [];
  recipientMemberIdForAssign.value = '';
  recipientMemberDropdownOpen.value = false;
  modalView.value = 'projectAssign';
}

function inferTeamIdsFromMember(m: Member): string[] {
  if (Object.prototype.hasOwnProperty.call(memberTeamIdOverrides.value, m.id)) {
    return [...(memberTeamIdOverrides.value[m.id] ?? [])];
  }
  const t = m.team?.trim();
  if (!t) return [];
  const single = props.teams.find((x) => x.name === t);
  if (single) return [single.id];
  if (t.includes('、')) {
    const ids: string[] = [];
    for (const p of t.split('、').map((s) => s.trim()).filter(Boolean)) {
      const hit = props.teams.find((x) => x.name === p);
      if (hit) ids.push(hit.id);
    }
    return ids;
  }
  return [];
}

function openTeamConfig() {
  const m = selectedMember.value;
  if (!m) return;
  selectedTeamIdsForMember.value = inferTeamIdsFromMember(m);
  modalView.value = 'teamConfig';
}

function toggleTeamSelection(id: string) {
  const arr = selectedTeamIdsForMember.value;
  const i = arr.indexOf(id);
  if (i === -1) arr.push(id);
  else arr.splice(i, 1);
}

function confirmTeamConfig() {
  const m = selectedMember.value;
  if (!m) return;
  memberTeamIdOverrides.value = {
    ...memberTeamIdOverrides.value,
    [m.id]: [...selectedTeamIdsForMember.value],
  };
  modalView.value = 'teamConfigSuccess';
}

function openSpaceAssign() {
  const m = selectedMember.value;
  if (!m) return;
  const initial = [...(memberSpaceIdOverrides.value[m.id] ?? [])];
  selectedSpaceIdsForMember.value = initial;
  spaceAssignBaselineIds.value = [...initial];
  modalView.value = 'spaceAssign';
}

function toggleSpaceSelection(id: string) {
  const arr = selectedSpaceIdsForMember.value;
  const i = arr.indexOf(id);
  if (i === -1) arr.push(id);
  else arr.splice(i, 1);
}

function confirmSpaceAssign() {
  const m = selectedMember.value;
  if (!m || !spaceAssignHasChanges.value) return;
  memberSpaceIdOverrides.value = {
    ...memberSpaceIdOverrides.value,
    [m.id]: [...selectedSpaceIdsForMember.value],
  };
  modalView.value = 'spaceAssignSuccess';
}

function openInfoEdit() {
  const m = selectedMember.value;
  if (!m) return;
  draftInfoName.value = effectiveMemberName(m);
  draftInfoEmail.value = effectiveEmail(m);
  draftInfoRemarks.value = effectiveRemarks(m);
  draftInfoPhone.value = effectivePhone(m);
  draftInfoMemberType.value = effectiveMemberType(m);
  memberTypeDropdownOpen.value = false;
  infoEditBaseline.value = {
    name: draftInfoName.value.trim(),
    email: draftInfoEmail.value.trim(),
    remarks: draftInfoRemarks.value.trim(),
    phone: draftInfoPhone.value.trim(),
    memberType: draftInfoMemberType.value,
  };
  modalView.value = 'infoEdit';
}

function confirmInfoEdit() {
  const m = selectedMember.value;
  if (!m || !infoEditHasChanges.value) return;
  const name = draftInfoName.value.trim();
  if (!name) return;
  memberInfoOverrides.value = {
    ...memberInfoOverrides.value,
    [m.id]: {
      name,
      email: draftInfoEmail.value.trim(),
      remarks: draftInfoRemarks.value.trim(),
      phone: draftInfoPhone.value.trim(),
      memberType: draftInfoMemberType.value,
    },
  };
  modalView.value = 'infoEditSuccess';
}

function effectiveTeamLabel(m: Member): string {
  const raw = memberTeamIdOverrides.value;
  if (Object.prototype.hasOwnProperty.call(raw, m.id)) {
    const ids = raw[m.id] ?? [];
    const names = ids
      .map((id) => props.teams.find((t) => t.id === id)?.name)
      .filter((n): n is string => Boolean(n));
    return names.length ? names.join('、') : '—';
  }
  return m.team ?? '—';
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
    key: 'space',
    label: '空间分配',
    icon: Building2,
    iconClass:
      'text-cyan-400 group-hover:scale-110 group-hover:drop-shadow-[0_0_8px_rgba(34,211,238,0.45)] transition-all',
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
const memberActionButtonsBottom = computed(() => memberActionButtons.slice(3, 6));

function effectiveRole(m: Member): string {
  return roleOverrides.value[m.id] ?? m.role;
}

function loadRoleConfigDraftForMember(m: Member) {
  draftRole.value = effectiveRole(m);
  draftPermissionKeys.value = [];
  draftCanPlaceOrder.value = null;
  draftOrderAmountLimit.value = '';
  const extra = memberRoleConfigExtras.value[m.id];
  if (extra) {
    draftPermissionKeys.value = [...extra.permissions];
    draftCanPlaceOrder.value = extra.canPlaceOrder;
    draftOrderAmountLimit.value = extra.orderAmountLimit;
  }
}

function onMemberAction(key: string) {
  if (!selectedMember.value) return;
  if (key === 'role') {
    loadRoleConfigDraftForMember(selectedMember.value);
    modalView.value = 'roleConfig';
    return;
  }
  if (key === 'team') {
    openTeamConfig();
    return;
  }
  if (key === 'project') {
    openProjectAssign();
    return;
  }
  if (key === 'space') {
    openSpaceAssign();
    return;
  }
  if (key === 'account') {
    openInfoEdit();
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
  const can = draftCanPlaceOrder.value;
  memberRoleConfigExtras.value = {
    ...memberRoleConfigExtras.value,
    [m.id]: {
      permissions: [...draftPermissionKeys.value],
      canPlaceOrder: can === true,
      orderAmountLimit: can === true ? draftOrderAmountLimit.value.trim() : '',
    },
  };
  modalView.value = 'detail';
}

const filteredMembers = computed(() => {
  const q = searchQuery.value.trim().toLowerCase().replace(/\s/g, '');
  if (!q) return allMembers.value;
  return allMembers.value.filter((m) => {
    const phone = effectivePhone(m).toLowerCase().replace(/-/g, '');
    const qFlat = q.replace(/-/g, '');
    const roleText = effectiveRole(m).toLowerCase();
    return (
      effectiveMemberName(m).toLowerCase().includes(q) ||
      roleText.includes(q) ||
      phone.includes(qFlat)
    );
  });
});

function openMemberDetail(m: Member) {
  selectedMember.value = m;
  memberDetailExpanded.value = false;
  modalView.value = 'detail';
}

function closeMemberDetail() {
  selectedMember.value = null;
  memberDetailExpanded.value = false;
  modalView.value = 'detail';
}

function onDocumentKeydown(e: KeyboardEvent) {
  if (e.key !== 'Escape') return;
  if (addMemberModalOpen.value) {
    if (addMemberTypeDropdownOpen.value) {
      addMemberTypeDropdownOpen.value = false;
      return;
    }
    addMemberModalOpen.value = false;
    return;
  }
  if (!selectedMember.value) return;
  if (memberTypeDropdownOpen.value) {
    memberTypeDropdownOpen.value = false;
    return;
  }
  if (recipientMemberDropdownOpen.value) {
    recipientMemberDropdownOpen.value = false;
    return;
  }
  if (
    modalView.value === 'roleConfig' ||
    modalView.value === 'infoEdit' ||
    modalView.value === 'infoEditSuccess' ||
    modalView.value === 'teamConfig' ||
    modalView.value === 'teamConfigSuccess' ||
    modalView.value === 'projectAssign' ||
    modalView.value === 'projectAssignSuccess' ||
    modalView.value === 'spaceAssign' ||
    modalView.value === 'spaceAssignSuccess'
  ) {
    modalView.value = 'detail';
  } else {
    closeMemberDetail();
  }
}

onMounted(() => document.addEventListener('keydown', onDocumentKeydown));
onUnmounted(() => {
  document.removeEventListener('keydown', onDocumentKeydown);
  window.removeEventListener('scroll', closeMemberTypeDropdownOnScroll, true);
  window.removeEventListener('resize', updateMemberTypeDropdownPosition);
  window.removeEventListener('scroll', closeRecipientMemberDropdownOnScroll, true);
  window.removeEventListener('resize', updateRecipientMemberDropdownPosition);
  window.removeEventListener('scroll', closeAddMemberTypeDropdownOnScroll, true);
  window.removeEventListener('resize', updateAddMemberTypeDropdownPosition);
});
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

        <div
          class="flex w-full flex-shrink-0 flex-col gap-3 sm:mt-1 sm:w-auto sm:flex-row sm:items-center sm:justify-end"
        >
          <button
            type="button"
            class="flex shrink-0 items-center justify-center gap-2 rounded-full border border-gray-200/80 bg-gray-100/80 px-5 py-2.5 text-sm font-bold text-gray-800 shadow-inner transition hover:bg-white/90 focus:outline-none focus:ring-2 focus:ring-[#9FE870]/40 active:scale-[0.99]"
            @click="openAddMemberModal"
          >
            <Plus :size="18" class="text-gray-600" aria-hidden="true" />
            新增
          </button>
          <div class="relative min-w-0 flex-1 sm:min-w-[280px] lg:min-w-[320px]">
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
          <p class="text-lg font-bold text-gray-900">{{ effectiveMemberName(m) }}</p>
          <p class="mt-1.5 text-sm text-gray-600">{{ effectiveRole(m) }}</p>
          <p class="mt-1.5 text-sm tabular-nums text-gray-500">
            {{ effectivePhone(m) || '—' }}
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

    <!-- 新增成员弹窗 -->
    <Teleport to="body">
      <div
        v-if="addMemberModalOpen"
        class="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4 backdrop-blur-md animate-in fade-in duration-300 sm:p-6"
        role="dialog"
        aria-modal="true"
        aria-labelledby="member-add-title"
        @click.self="closeAddMemberModal"
      >
        <div
          class="jp-modal-morph flex max-h-[min(92vh,860px)] w-full flex-col overflow-hidden border border-white/20 shadow-2xl backdrop-blur-2xl"
          :style="addMemberModalStyle"
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
                id="member-add-title"
                class="truncate text-xl font-bold tracking-tight text-white sm:text-2xl"
              >
                新增成员
              </h2>
            </div>
            <button
              type="button"
              class="rounded-full p-2 text-white/70 transition-all hover:bg-white/10 hover:text-white"
              aria-label="关闭"
              @click="closeAddMemberModal"
            >
              <X :size="24" />
            </button>
          </div>
          <div
            class="custom-scrollbar min-h-0 flex-1 overflow-y-auto overflow-x-hidden p-6 sm:p-8"
          >
            <div class="flex min-h-0 flex-col gap-5">
              <p class="text-sm text-white/60">
                填写新成员信息，完成后点击确认。除备注外均为必填。
              </p>
              <div class="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div class="space-y-2 sm:col-span-2 sm:max-w-md">
                  <label
                    for="member-add-name"
                    class="block text-xs font-bold uppercase tracking-widest text-white/40"
                  >
                    姓名
                  </label>
                  <input
                    id="member-add-name"
                    v-model="draftAddName"
                    type="text"
                    maxlength="64"
                    required
                    autocomplete="name"
                    class="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2.5 text-sm text-white placeholder:text-white/35 focus:border-[#FFE600]/50 focus:outline-none focus:ring-1 focus:ring-[#FFE600]/40"
                  />
                </div>
                <div class="space-y-2">
                  <label
                    for="member-add-phone"
                    class="block text-xs font-bold uppercase tracking-widest text-white/40"
                  >
                    联系电话
                  </label>
                  <input
                    id="member-add-phone"
                    v-model="draftAddPhone"
                    type="text"
                    required
                    inputmode="tel"
                    autocomplete="tel"
                    class="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2.5 font-mono text-sm text-white tabular-nums placeholder:text-white/35 focus:border-[#FFE600]/50 focus:outline-none focus:ring-1 focus:ring-[#FFE600]/40"
                  />
                </div>
                <div class="space-y-2">
                  <label
                    for="member-add-email"
                    class="block text-xs font-bold uppercase tracking-widest text-white/40"
                  >
                    联系邮箱
                  </label>
                  <input
                    id="member-add-email"
                    v-model="draftAddEmail"
                    type="email"
                    required
                    autocomplete="email"
                    class="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2.5 text-sm text-white placeholder:text-white/35 focus:border-[#FFE600]/50 focus:outline-none focus:ring-1 focus:ring-[#FFE600]/40"
                  />
                </div>
                <div class="space-y-2 sm:col-span-2 sm:max-w-md">
                  <span
                    id="add-member-type-label"
                    class="block text-xs font-bold uppercase tracking-widest text-white/40"
                  >
                    类型
                  </span>
                  <div class="relative">
                    <button
                      id="member-add-type"
                      ref="addMemberTypeTriggerEl"
                      type="button"
                      class="flex w-full items-center justify-between gap-2 rounded-xl border border-white/15 bg-white/5 px-3 py-2.5 text-left text-sm font-bold text-white shadow-inner backdrop-blur-xl transition focus:outline-none focus:ring-1 focus:ring-[#FFE600]/40"
                      :class="
                        addMemberTypeDropdownOpen
                          ? 'border-[#FFE600]/50 ring-1 ring-[#FFE600]/40'
                          : 'hover:border-white/25'
                      "
                      aria-haspopup="listbox"
                      :aria-expanded="addMemberTypeDropdownOpen"
                      aria-labelledby="add-member-type-label"
                      @click="toggleAddMemberTypeDropdown"
                    >
                      <span class="min-w-0 truncate">{{ draftAddMemberType }}</span>
                      <ChevronDown
                        :size="18"
                        class="shrink-0 text-white/70 transition-transform duration-200"
                        :class="addMemberTypeDropdownOpen ? 'rotate-180' : ''"
                        aria-hidden="true"
                      />
                    </button>
                  </div>
                </div>
              </div>
              <div
                v-if="draftAddMemberType === '外部成员'"
                class="space-y-2 sm:max-w-md"
              >
                <label
                  for="member-add-company"
                  class="block text-xs font-bold uppercase tracking-widest text-white/40"
                >
                  公司名称
                </label>
                <input
                  id="member-add-company"
                  v-model="draftAddCompany"
                  type="text"
                  maxlength="128"
                  required
                  autocomplete="organization"
                  class="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2.5 text-sm text-white placeholder:text-white/35 focus:border-[#FFE600]/50 focus:outline-none focus:ring-1 focus:ring-[#FFE600]/40"
                />
              </div>
              <div class="space-y-2">
                <label
                  for="member-add-remarks"
                  class="block text-xs font-bold uppercase tracking-widest text-white/40"
                >
                  备注（选填）
                </label>
                <textarea
                  id="member-add-remarks"
                  v-model="draftAddRemarks"
                  rows="4"
                  maxlength="2000"
                  class="w-full resize-y rounded-xl border border-white/15 bg-white/5 px-3 py-2.5 text-sm leading-relaxed text-white placeholder:text-white/35 focus:border-[#FFE600]/50 focus:outline-none focus:ring-1 focus:ring-[#FFE600]/40"
                />
              </div>
              <div class="flex justify-end border-t border-white/10 pt-5">
                <button
                  type="button"
                  class="rounded-xl bg-[#FFE600] px-8 py-2.5 text-sm font-bold text-[#260A2F] shadow-[0_0_15px_rgba(255,230,0,0.25)] transition hover:brightness-95 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
                  :disabled="!addMemberFormValid"
                  @click="confirmAddMember"
                >
                  确认
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

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
            : modalView === 'infoEdit' || modalView === 'infoEditSuccess'
              ? 'member-info-title'
              : modalView === 'teamConfig' || modalView === 'teamConfigSuccess'
                ? 'member-team-title'
                : modalView === 'projectAssign' || modalView === 'projectAssignSuccess'
                  ? 'member-project-assign-title'
                  : modalView === 'spaceAssign' || modalView === 'spaceAssignSuccess'
                    ? 'member-space-assign-title'
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
                    : modalView === 'infoEdit' || modalView === 'infoEditSuccess'
                      ? 'member-info-title'
                      : modalView === 'teamConfig' || modalView === 'teamConfigSuccess'
                        ? 'member-team-title'
                        : modalView === 'projectAssign' || modalView === 'projectAssignSuccess'
                          ? 'member-project-assign-title'
                          : modalView === 'spaceAssign' || modalView === 'spaceAssignSuccess'
                            ? 'member-space-assign-title'
                            : 'member-detail-title'
                "
                class="truncate text-xl font-bold tracking-tight text-white sm:text-2xl"
              >
                {{
                  modalView === 'roleConfig'
                    ? '角色配置'
                    : modalView === 'infoEdit' || modalView === 'infoEditSuccess'
                      ? '信息修改'
                      : modalView === 'teamConfig' || modalView === 'teamConfigSuccess'
                        ? '团队配置'
                        : modalView === 'projectAssign' || modalView === 'projectAssignSuccess'
                          ? '项目分配'
                          : modalView === 'spaceAssign' || modalView === 'spaceAssignSuccess'
                            ? '空间分配'
                            : '成员详情'
                }}
              </h2>
            </div>
            <div class="flex shrink-0 items-center gap-3 sm:gap-4">
              <button
                v-if="
                  modalView === 'roleConfig' ||
                  modalView === 'infoEdit' ||
                  modalView === 'infoEditSuccess' ||
                  modalView === 'teamConfig' ||
                  modalView === 'teamConfigSuccess' ||
                  modalView === 'projectAssign' ||
                  modalView === 'projectAssignSuccess' ||
                  modalView === 'spaceAssign' ||
                  modalView === 'spaceAssignSuccess'
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
                  class="relative rounded-[32px] border border-white/10 bg-white/5 p-6 shadow-inner backdrop-blur-xl sm:p-8"
                >
                  <button
                    type="button"
                    class="absolute right-4 top-4 z-10 rounded-lg px-2 py-1 text-xs font-bold text-white/75 transition-colors hover:bg-white/10 hover:text-[#FFE600] sm:right-5 sm:top-5 sm:text-sm"
                    :aria-expanded="memberDetailExpanded"
                    aria-controls="member-detail-extra"
                    @click="memberDetailExpanded = !memberDetailExpanded"
                  >
                    {{ memberDetailExpanded ? '收起' : '完整显示' }}
                  </button>
                  <div
                    class="grid grid-cols-1 gap-x-12 gap-y-8 pr-12 sm:grid-cols-2 sm:pr-20"
                  >
                    <div>
                      <p class="mb-2 text-xs font-bold uppercase tracking-widest text-white/40">
                        姓名
                      </p>
                      <p class="text-xl font-bold tracking-tight text-white">
                        {{ effectiveMemberName(selectedMember) }}
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
                        {{ effectiveTeamLabel(selectedMember) }}
                      </p>
                    </div>
                    <div>
                      <p class="mb-2 text-xs font-bold uppercase tracking-widest text-white/40">
                        联系电话
                      </p>
                      <p class="font-mono text-xl font-bold tracking-tight text-white tabular-nums">
                        {{ effectivePhone(selectedMember) || '—' }}
                      </p>
                    </div>
                    <div>
                      <p class="mb-2 text-xs font-bold uppercase tracking-widest text-white/40">
                        联系邮箱
                      </p>
                      <p class="break-all text-xl font-bold tracking-tight text-white">
                        {{ effectiveEmail(selectedMember) || '—' }}
                      </p>
                    </div>
                    <div>
                      <p class="mb-2 text-xs font-bold uppercase tracking-widest text-white/40">
                        类型
                      </p>
                      <p class="text-xl font-bold tracking-tight text-white">
                        {{ effectiveMemberType(selectedMember) }}
                      </p>
                    </div>
                    <div class="sm:col-span-2">
                      <p class="mb-2 text-xs font-bold uppercase tracking-widest text-white/40">
                        备注
                      </p>
                      <p class="text-lg font-bold leading-relaxed text-white/95">
                        {{ effectiveRemarks(selectedMember) || '—' }}
                      </p>
                    </div>
                  </div>
                  <Transition name="member-detail-expand">
                    <div
                      v-if="memberDetailExpanded"
                      id="member-detail-extra"
                      class="member-detail-extra-inner overflow-hidden"
                    >
                      <div
                        class="mt-6 grid grid-cols-1 gap-x-12 gap-y-6 border-t border-white/10 pt-6 sm:grid-cols-2"
                      >
                        <div
                          :class="
                            effectiveMemberType(selectedMember) === '外部成员'
                              ? ''
                              : 'sm:col-span-2'
                          "
                        >
                          <p
                            class="mb-2 text-xs font-bold uppercase tracking-widest text-white/40"
                          >
                            负责空间
                          </p>
                          <p
                            class="text-lg font-bold leading-relaxed text-white/95"
                          >
                            {{ effectiveResponsibleSpace(selectedMember) }}
                          </p>
                        </div>
                        <div
                          v-if="
                            effectiveMemberType(selectedMember) === '外部成员'
                          "
                        >
                          <p
                            class="mb-2 text-xs font-bold uppercase tracking-widest text-white/40"
                          >
                            公司
                          </p>
                          <p class="text-xl font-bold tracking-tight text-white">
                            {{ effectiveCompany(selectedMember) }}
                          </p>
                        </div>
                      </div>
                    </div>
                  </Transition>
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
                    <div class="grid grid-cols-3 gap-3 sm:gap-4">
                      <button
                        v-for="btn in memberActionButtonsBottom"
                        :key="btn.key"
                        type="button"
                        class="group flex min-h-[3rem] w-full flex-row items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm font-bold text-white backdrop-blur-lg transition-all hover:bg-white/15 sm:min-h-[3.25rem] sm:gap-4 sm:px-6"
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
                class="flex min-h-[320px] flex-col gap-6"
              >
                <p class="text-sm text-white/60">
                  为「<span class="font-semibold text-white">{{
                    effectiveMemberName(selectedMember)
                  }}</span
                  >」选择角色，可点选预设或添加自定义。
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

                <div class="space-y-3">
                  <p
                    class="text-xs font-bold uppercase tracking-widest text-white/40"
                  >
                    权限选择
                  </p>
                  <div class="flex flex-col gap-3">
                    <div
                      v-for="(row, rowIdx) in permissionModuleOptionRows"
                      :key="rowIdx"
                      class="flex flex-wrap gap-3"
                    >
                      <button
                        v-for="perm in row"
                        :key="perm"
                        type="button"
                        class="rounded-full border px-4 py-2 text-sm font-bold transition-all"
                        :class="
                          draftPermissionKeys.includes(perm)
                            ? 'border-[#FFE600] bg-[#FFE600]/15 text-white shadow-[0_0_12px_rgba(255,230,0,0.25)]'
                            : 'border-white/15 bg-white/5 text-white/90 hover:bg-white/10'
                        "
                        @click="toggleDraftPermission(perm)"
                      >
                        {{ perm }}
                      </button>
                    </div>
                  </div>
                </div>

                <div class="space-y-3">
                  <p
                    class="text-xs font-bold uppercase tracking-widest text-white/40"
                  >
                    下单权限
                  </p>
                  <div class="flex flex-wrap gap-3">
                    <button
                      type="button"
                      class="rounded-full border px-5 py-2 text-sm font-bold transition-all"
                      :class="
                        draftCanPlaceOrder === true
                          ? 'border-[#FFE600] bg-[#FFE600]/15 text-white shadow-[0_0_12px_rgba(255,230,0,0.25)]'
                          : 'border-white/15 bg-white/5 text-white/90 hover:bg-white/10'
                      "
                      @click="draftCanPlaceOrder = true"
                    >
                      能下单
                    </button>
                    <button
                      type="button"
                      class="rounded-full border px-5 py-2 text-sm font-bold transition-all"
                      :class="
                        draftCanPlaceOrder === false
                          ? 'border-[#FFE600] bg-[#FFE600]/15 text-white shadow-[0_0_12px_rgba(255,230,0,0.25)]'
                          : 'border-white/15 bg-white/5 text-white/90 hover:bg-white/10'
                      "
                      @click="
                        draftCanPlaceOrder = false;
                        draftOrderAmountLimit = '';
                      "
                    >
                      不能下单
                    </button>
                  </div>
                  <div v-if="draftCanPlaceOrder === true" class="pt-1">
                    <label
                      for="role-order-amount-limit"
                      class="mb-1.5 block text-xs font-medium text-white/50"
                    >
                      可下单金额（元）
                    </label>
                    <input
                      id="role-order-amount-limit"
                      v-model="draftOrderAmountLimit"
                      type="text"
                      inputmode="decimal"
                      placeholder="请输入可下单金额上限"
                      class="w-full max-w-md rounded-xl border border-white/15 bg-white/5 px-3 py-2.5 text-sm text-white placeholder:text-white/35 focus:border-[#FFE600]/50 focus:outline-none focus:ring-1 focus:ring-[#FFE600]/40"
                    />
                  </div>
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
                v-else-if="modalView === 'infoEdit'"
                key="infoEdit"
                class="flex min-h-[320px] flex-col gap-5"
              >
                <p class="text-sm text-white/60">
                  修改「<span class="font-semibold text-white">{{
                    effectiveMemberName(selectedMember)
                  }}</span
                  >」的基本信息，完成后请点击确认。
                </p>
                <div class="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <div class="space-y-2">
                    <label
                      for="member-edit-name"
                      class="block text-xs font-bold uppercase tracking-widest text-white/40"
                    >
                      姓名
                    </label>
                    <input
                      id="member-edit-name"
                      v-model="draftInfoName"
                      type="text"
                      maxlength="64"
                      autocomplete="name"
                      class="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2.5 text-sm text-white placeholder:text-white/35 focus:border-[#FFE600]/50 focus:outline-none focus:ring-1 focus:ring-[#FFE600]/40"
                    />
                  </div>
                  <div class="space-y-2">
                    <label
                      for="member-edit-phone"
                      class="block text-xs font-bold uppercase tracking-widest text-white/40"
                    >
                      联系电话
                    </label>
                    <input
                      id="member-edit-phone"
                      v-model="draftInfoPhone"
                      type="text"
                      inputmode="tel"
                      autocomplete="tel"
                      class="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2.5 font-mono text-sm text-white tabular-nums placeholder:text-white/35 focus:border-[#FFE600]/50 focus:outline-none focus:ring-1 focus:ring-[#FFE600]/40"
                    />
                  </div>
                  <div class="space-y-2">
                    <label
                      for="member-edit-email"
                      class="block text-xs font-bold uppercase tracking-widest text-white/40"
                    >
                      联系邮箱
                    </label>
                    <input
                      id="member-edit-email"
                      v-model="draftInfoEmail"
                      type="email"
                      autocomplete="email"
                      class="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2.5 text-sm text-white placeholder:text-white/35 focus:border-[#FFE600]/50 focus:outline-none focus:ring-1 focus:ring-[#FFE600]/40"
                    />
                  </div>
                  <div class="space-y-2">
                    <span
                      id="member-edit-type-label"
                      class="block text-xs font-bold uppercase tracking-widest text-white/40"
                    >
                      类型
                    </span>
                    <div class="relative">
                      <button
                        id="member-edit-type"
                        ref="memberTypeTriggerEl"
                        type="button"
                        class="flex w-full items-center justify-between gap-2 rounded-xl border border-white/15 bg-white/5 px-3 py-2.5 text-left text-sm font-bold text-white shadow-inner backdrop-blur-xl transition focus:outline-none focus:ring-1 focus:ring-[#FFE600]/40"
                        :class="
                          memberTypeDropdownOpen
                            ? 'border-[#FFE600]/50 ring-1 ring-[#FFE600]/40'
                            : 'hover:border-white/25'
                        "
                        aria-haspopup="listbox"
                        :aria-expanded="memberTypeDropdownOpen"
                        aria-labelledby="member-edit-type-label"
                        @click="toggleMemberTypeDropdown"
                      >
                        <span class="min-w-0 truncate">{{ draftInfoMemberType }}</span>
                        <ChevronDown
                          :size="18"
                          class="shrink-0 text-white/70 transition-transform duration-200"
                          :class="memberTypeDropdownOpen ? 'rotate-180' : ''"
                          aria-hidden="true"
                        />
                      </button>
                    </div>
                  </div>
                </div>
                <div class="space-y-2 sm:col-span-2">
                  <label
                    for="member-edit-remarks"
                    class="block text-xs font-bold uppercase tracking-widest text-white/40"
                  >
                    备注
                  </label>
                  <textarea
                    id="member-edit-remarks"
                    v-model="draftInfoRemarks"
                    rows="4"
                    maxlength="2000"
                    class="w-full resize-y rounded-xl border border-white/15 bg-white/5 px-3 py-2.5 text-sm leading-relaxed text-white placeholder:text-white/35 focus:border-[#FFE600]/50 focus:outline-none focus:ring-1 focus:ring-[#FFE600]/40"
                  />
                </div>
                <div class="flex justify-end border-t border-white/10 pt-5">
                  <button
                    type="button"
                    class="rounded-xl bg-[#FFE600] px-8 py-2.5 text-sm font-bold text-[#260A2F] shadow-[0_0_15px_rgba(255,230,0,0.25)] transition hover:brightness-95 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
                    :disabled="!draftInfoName.trim() || !infoEditHasChanges"
                    @click="confirmInfoEdit"
                  >
                    确认
                  </button>
                </div>
              </div>

              <div
                v-else-if="modalView === 'infoEditSuccess'"
                key="infoEditSuccess"
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
                  成员信息已成功更新至系统中
                </p>
                <button
                  type="button"
                  class="rounded-xl border border-white/10 bg-white/10 px-8 py-3 font-bold text-white transition-colors hover:bg-white/20"
                  @click="backToMemberDetailFromSubView"
                >
                  返回上级页面
                </button>
              </div>

              <div
                v-else-if="modalView === 'teamConfig'"
                key="teamConfig"
                class="flex min-h-[320px] flex-col gap-5"
              >
                <p class="text-sm text-white/60">
                  选择与「<span class="font-semibold text-white">{{
                    effectiveMemberName(selectedMember)
                  }}</span
                  >」关联的团队（可多选），数据与组织「团队管理」列表一致。
                </p>
                <div
                  v-if="teams.length === 0"
                  class="rounded-2xl border border-dashed border-white/15 bg-white/5 px-6 py-12 text-center text-sm text-white/50"
                >
                  暂无团队数据，请先在团队管理中维护团队
                </div>
                <div
                  v-else
                  class="grid grid-cols-1 gap-3 sm:grid-cols-2"
                >
                  <button
                    v-for="t in teams"
                    :key="t.id"
                    type="button"
                    class="group relative flex flex-col gap-2 rounded-2xl border px-4 py-3 text-left transition-all"
                    :class="
                      selectedTeamIdsForMember.includes(t.id)
                        ? 'border-[#FFE600]/80 bg-[#FFE600]/10 shadow-[0_0_12px_rgba(255,230,0,0.15)]'
                        : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10'
                    "
                    @click="toggleTeamSelection(t.id)"
                  >
                    <span
                      class="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full border text-[#FFE600]"
                      :class="
                        selectedTeamIdsForMember.includes(t.id)
                          ? 'border-[#FFE600] bg-[#FFE600]/20'
                          : 'border-white/20 bg-white/5 opacity-60 group-hover:opacity-100'
                      "
                    >
                      <Check
                        v-if="selectedTeamIdsForMember.includes(t.id)"
                        :size="14"
                        class="text-[#FFE600]"
                        stroke-width="3"
                      />
                    </span>
                    <p class="pr-8 text-xs font-bold uppercase tracking-wider text-white/40">
                      {{ t.name }}
                    </p>
                    <p class="line-clamp-2 text-sm font-bold text-white">
                      负责人：{{ t.leader }}
                    </p>
                    <p class="line-clamp-2 text-xs text-white/55">
                      {{ t.space }}
                    </p>
                    <div class="mt-1 flex flex-wrap gap-2 text-[11px] font-bold text-white/50">
                      <span
                        class="rounded-md border border-white/10 bg-white/5 px-2 py-0.5 text-white/70"
                        >{{ t.members.length }} 人</span
                      >
                      <span class="tabular-nums">{{ t.createdAt }}</span>
                    </div>
                  </button>
                </div>
                <div class="flex justify-end border-t border-white/10 pt-5">
                  <button
                    type="button"
                    class="rounded-xl bg-[#FFE600] px-8 py-2.5 text-sm font-bold text-[#260A2F] shadow-[0_0_15px_rgba(255,230,0,0.25)] transition hover:brightness-95 active:scale-[0.99]"
                    @click="confirmTeamConfig"
                  >
                    确认
                  </button>
                </div>
              </div>

              <div
                v-else-if="modalView === 'teamConfigSuccess'"
                key="teamConfigSuccess"
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
                  该成员的团队关联已成功更新至系统中
                </p>
                <button
                  type="button"
                  class="rounded-xl border border-white/10 bg-white/10 px-8 py-3 font-bold text-white transition-colors hover:bg-white/20"
                  @click="backToMemberDetailFromSubView"
                >
                  返回上级页面
                </button>
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
                  class="grid grid-cols-1 gap-3 sm:grid-cols-2"
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
                  class="flex flex-col gap-4 border-t border-white/10 pt-5 sm:flex-row sm:items-end sm:justify-between sm:gap-6"
                >
                  <div class="min-w-0 flex-1 space-y-2">
                    <span
                      id="recipient-member-label"
                      class="block text-xs font-bold uppercase tracking-widest text-white/40"
                    >
                      接收成员
                    </span>
                    <div class="relative max-w-md">
                      <button
                        id="recipient-member-select"
                        ref="recipientMemberTriggerEl"
                        type="button"
                        class="flex w-full items-center justify-between gap-2 rounded-xl border border-white/15 bg-white/5 px-3 py-2.5 text-left text-sm font-bold shadow-inner backdrop-blur-xl transition focus:outline-none focus:ring-1 focus:ring-[#FFE600]/40"
                        :class="
                          recipientMemberDropdownOpen
                            ? 'border-[#FFE600]/50 text-white ring-1 ring-[#FFE600]/40'
                            : recipientMemberTriggerLabel
                              ? 'text-white hover:border-white/25'
                              : 'text-white/40 hover:border-white/25'
                        "
                        aria-haspopup="listbox"
                        :aria-expanded="recipientMemberDropdownOpen"
                        aria-labelledby="recipient-member-label"
                        @click="toggleRecipientMemberDropdown"
                      >
                        <span class="min-w-0 truncate">{{
                          recipientMemberTriggerLabel || '请选择接收成员'
                        }}</span>
                        <ChevronDown
                          :size="18"
                          class="shrink-0 text-white/70 transition-transform duration-200"
                          :class="recipientMemberDropdownOpen ? 'rotate-180' : ''"
                          aria-hidden="true"
                        />
                      </button>
                    </div>
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

              <div
                v-else-if="modalView === 'spaceAssign'"
                key="spaceAssign"
                class="flex min-h-[320px] flex-col gap-5"
              >
                <p class="text-sm text-white/60">
                  勾选与「<span class="font-semibold text-white">{{
                    effectiveMemberName(selectedMember)
                  }}</span
                  >」关联的空间（可多选），数据与组织「空间管理」列表一致。
                </p>
                <div
                  v-if="spaces.length === 0"
                  class="rounded-2xl border border-dashed border-white/15 bg-white/5 px-6 py-12 text-center text-sm text-white/50"
                >
                  暂无空间数据，请先在空间管理中维护空间
                </div>
                <div
                  v-else
                  class="overflow-hidden rounded-2xl border border-white/10"
                >
                  <table
                    class="w-full table-fixed border-collapse text-left text-xs sm:text-sm"
                  >
                    <colgroup>
                      <col class="w-10" />
                      <col class="w-[14%]" />
                      <col class="w-[12%]" />
                      <col class="w-[9%]" />
                      <col class="w-[9%]" />
                      <col class="w-[10%]" />
                      <col />
                      <col class="w-[9%]" />
                    </colgroup>
                    <thead>
                      <tr
                        class="border-b border-white/10 bg-white/5 text-[10px] font-bold uppercase tracking-wider text-white/50 sm:text-xs"
                      >
                        <th class="px-2 py-2.5 text-center sm:px-3 sm:py-3">
                          选择
                        </th>
                        <th class="px-2 py-2.5 sm:px-3 sm:py-3">名称</th>
                        <th class="px-2 py-2.5 sm:px-3 sm:py-3">负责人</th>
                        <th class="px-2 py-2.5 sm:px-3 sm:py-3">省</th>
                        <th class="px-2 py-2.5 sm:px-3 sm:py-3">市</th>
                        <th class="px-2 py-2.5 sm:px-3 sm:py-3">区/县</th>
                        <th class="px-2 py-2.5 sm:px-3 sm:py-3">具体位置</th>
                        <th class="px-2 py-2.5 sm:px-3 sm:py-3">面积</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-white/10">
                      <tr
                        v-for="s in spaces"
                        :key="s.id"
                        class="cursor-pointer transition-colors hover:bg-white/5"
                        @click="toggleSpaceSelection(s.id)"
                      >
                        <td class="px-2 py-2.5 text-center sm:px-3 sm:py-3" @click.stop>
                          <input
                            type="checkbox"
                            class="space-assign-checkbox"
                            :checked="selectedSpaceIdsForMember.includes(s.id)"
                            @click.stop
                            @change="toggleSpaceSelection(s.id)"
                          />
                        </td>
                        <td
                          class="break-words px-2 py-2.5 font-bold text-white sm:px-3 sm:py-3"
                        >
                          {{ s.name }}
                        </td>
                        <td
                          class="break-words px-2 py-2.5 text-white/90 sm:px-3 sm:py-3"
                        >
                          {{ s.owner }}
                        </td>
                        <td
                          class="break-words px-2 py-2.5 text-white/80 sm:px-3 sm:py-3"
                        >
                          {{ s.province }}
                        </td>
                        <td
                          class="break-words px-2 py-2.5 text-white/80 sm:px-3 sm:py-3"
                        >
                          {{ s.city }}
                        </td>
                        <td
                          class="break-words px-2 py-2.5 text-white/80 sm:px-3 sm:py-3"
                        >
                          {{ s.district }}
                        </td>
                        <td
                          class="break-words px-2 py-2.5 leading-snug text-white/70 sm:px-3 sm:py-3"
                        >
                          {{ s.address }}
                        </td>
                        <td
                          class="whitespace-normal break-words px-2 py-2.5 text-white/80 sm:px-3 sm:py-3"
                        >
                          {{ s.area }}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div class="flex justify-end border-t border-white/10 pt-5">
                  <button
                    type="button"
                    class="rounded-xl bg-[#FFE600] px-8 py-2.5 text-sm font-bold text-[#260A2F] shadow-[0_0_15px_rgba(255,230,0,0.25)] transition hover:brightness-95 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
                    :disabled="spaces.length === 0 || !spaceAssignHasChanges"
                    @click="confirmSpaceAssign"
                  >
                    确定
                  </button>
                </div>
              </div>

              <div
                v-else-if="modalView === 'spaceAssignSuccess'"
                key="spaceAssignSuccess"
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
                  该成员的空间关联已成功更新至系统中
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

    <!-- 类型下拉：磨砂玻璃列表（Teleport 避免被弹窗滚动区域裁切） -->
    <Teleport to="body">
      <template v-if="memberTypeDropdownOpen && modalView === 'infoEdit'">
        <div
          class="fixed inset-0 z-[199]"
          aria-hidden="true"
          @click="memberTypeDropdownOpen = false"
        />
        <ul
          role="listbox"
          aria-labelledby="member-edit-type-label"
          :style="memberTypeDropdownStyle"
          class="max-h-[min(40vh,16rem)] overflow-y-auto rounded-xl border border-white/20 bg-white/10 py-1 shadow-2xl backdrop-blur-2xl"
          @click.stop
        >
          <li
            v-for="opt in memberTypeOptions"
            :key="opt"
            role="option"
            :aria-selected="draftInfoMemberType === opt"
            class="cursor-pointer px-3 py-2.5 text-sm font-bold text-white transition hover:bg-white/15"
            :class="
              draftInfoMemberType === opt ? 'bg-white/10 text-[#FFE600]' : ''
            "
            @click="selectMemberType(opt)"
          >
            {{ opt }}
          </li>
        </ul>
      </template>
    </Teleport>

    <!-- 新增成员 · 类型下拉 -->
    <Teleport to="body">
      <template v-if="addMemberTypeDropdownOpen && addMemberModalOpen">
        <div
          class="fixed inset-0 z-[199]"
          aria-hidden="true"
          @click="addMemberTypeDropdownOpen = false"
        />
        <ul
          role="listbox"
          aria-labelledby="add-member-type-label"
          :style="addMemberTypeDropdownStyle"
          class="max-h-[min(40vh,16rem)] overflow-y-auto rounded-xl border border-white/20 bg-white/10 py-1 shadow-2xl backdrop-blur-2xl"
          @click.stop
        >
          <li
            v-for="opt in memberTypeOptions"
            :key="'add-type-' + opt"
            role="option"
            :aria-selected="draftAddMemberType === opt"
            class="cursor-pointer px-3 py-2.5 text-sm font-bold text-white transition hover:bg-white/15"
            :class="
              draftAddMemberType === opt ? 'bg-white/10 text-[#FFE600]' : ''
            "
            @click="selectAddMemberType(opt)"
          >
            {{ opt }}
          </li>
        </ul>
      </template>
    </Teleport>

    <!-- 项目分配 · 接收成员：磨砂玻璃下拉 -->
    <Teleport to="body">
      <template
        v-if="recipientMemberDropdownOpen && modalView === 'projectAssign'"
      >
        <div
          class="fixed inset-0 z-[199]"
          aria-hidden="true"
          @click="recipientMemberDropdownOpen = false"
        />
        <ul
          role="listbox"
          aria-labelledby="recipient-member-label"
          :style="recipientMemberDropdownStyle"
          class="max-h-[min(40vh,16rem)] overflow-y-auto rounded-xl border border-white/20 bg-white/10 py-1 shadow-2xl backdrop-blur-2xl"
          @click.stop
        >
          <li
            v-for="m in recipientMemberOptions"
            :key="m.id"
            role="option"
            :aria-selected="String(recipientMemberIdForAssign) === String(m.id)"
            class="cursor-pointer px-3 py-2.5 text-sm font-bold text-white transition hover:bg-white/15"
            :class="
              String(recipientMemberIdForAssign) === String(m.id)
                ? 'bg-white/10 text-[#FFE600]'
                : ''
            "
            @click="selectRecipientMember(m.id)"
          >
            {{ effectiveMemberName(m) }} · {{ effectiveTeamLabel(m) }}
          </li>
        </ul>
      </template>
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

/* 成员详情信息卡：完整显示 — 向下展开 */
.member-detail-expand-enter-active.member-detail-extra-inner,
.member-detail-expand-leave-active.member-detail-extra-inner {
  transition:
    opacity 0.38s cubic-bezier(0.4, 0, 0.2, 1),
    max-height 0.48s cubic-bezier(0.33, 1, 0.32, 1);
}
.member-detail-expand-enter-from.member-detail-extra-inner,
.member-detail-expand-leave-to.member-detail-extra-inner {
  opacity: 0;
  max-height: 0;
}
.member-detail-expand-enter-to.member-detail-extra-inner,
.member-detail-expand-leave-from.member-detail-extra-inner {
  opacity: 1;
  max-height: 22rem;
}

/* 空间分配表：复选框未选白 50% 透明，选中黄色（非系统蓝） */
.space-assign-checkbox {
  appearance: none;
  -webkit-appearance: none;
  width: 1rem;
  height: 1rem;
  border-radius: 0.25rem;
  border: 1px solid rgba(255, 255, 255, 0.35);
  background-color: rgba(255, 255, 255, 0.5);
  cursor: pointer;
  flex-shrink: 0;
  vertical-align: middle;
}
.space-assign-checkbox:checked {
  background-color: #ffe600;
  border-color: #ffe600;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23260A2F' stroke-width='3'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M5 13l4 4L19 7'/%3E%3C/svg%3E");
  background-size: 0.7rem;
  background-position: center;
  background-repeat: no-repeat;
}
.space-assign-checkbox:focus {
  outline: none;
}
.space-assign-checkbox:focus-visible {
  box-shadow: 0 0 0 2px rgba(255, 230, 0, 0.45);
}
</style>
