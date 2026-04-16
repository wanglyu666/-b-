import { computed, ref } from 'vue';
import { defineStore } from 'pinia';
import {
  fetchMembers,
  fetchOrganizationSpaces,
  fetchOrganizationTeams,
} from '../api/orgApi';
import type { Member, OrganizationSpace, OrganizationTeam } from '../types';

export const useOrgStore = defineStore('org', () => {
  const members = ref<Member[]>([]);
  const teams = ref<OrganizationTeam[]>([]);
  const spaces = ref<OrganizationSpace[]>([]);
  const loading = ref(false);
  const loaded = ref(false);
  const error = ref<string | null>(null);

  async function loadOrganizationData(force = false) {
    if (loaded.value && !force) return;
    loading.value = true;
    error.value = null;
    try {
      const [memberList, teamList, spaceList] = await Promise.all([
        fetchMembers(),
        fetchOrganizationTeams(),
        fetchOrganizationSpaces(),
      ]);
      members.value = memberList;
      teams.value = teamList;
      spaces.value = spaceList;
      loaded.value = true;
    } catch (e) {
      error.value = e instanceof Error ? e.message : '组织数据加载失败';
    } finally {
      loading.value = false;
    }
  }

  const memberCount = computed(() => members.value.length);
  const teamCount = computed(() => teams.value.length);
  const spaceCount = computed(() => spaces.value.length);

  /** 空间管理页本地新增（演示；持久化需对接后端） */
  function addSpace(space: OrganizationSpace) {
    spaces.value = [...spaces.value, space];
  }

  /** 空间管理页本地更新（演示；负责人请在成员管理中分配，此处不修改 owner） */
  function updateSpace(
    id: string,
    patch: Omit<Partial<OrganizationSpace>, 'id' | 'owner'>,
  ) {
    spaces.value = spaces.value.map((s) =>
      s.id === id ? { ...s, ...patch } : s,
    );
  }

  /** 团队管理页本地新增（演示；持久化需对接后端） */
  function addTeam(team: OrganizationTeam) {
    teams.value = [...teams.value, team];
  }

  return {
    members,
    teams,
    spaces,
    loading,
    loaded,
    error,
    memberCount,
    teamCount,
    spaceCount,
    loadOrganizationData,
    addSpace,
    updateSpace,
    addTeam,
  };
});
