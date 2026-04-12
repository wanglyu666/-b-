import { computed, ref } from 'vue';
import { defineStore } from 'pinia';
import { fetchMembers, fetchOrganizationTeams } from '../api/orgApi';
import type { Member, OrganizationTeam } from '../types';

export const useOrgStore = defineStore('org', () => {
  const members = ref<Member[]>([]);
  const teams = ref<OrganizationTeam[]>([]);
  const loading = ref(false);
  const loaded = ref(false);
  const error = ref<string | null>(null);

  async function loadOrganizationData(force = false) {
    if (loaded.value && !force) return;
    loading.value = true;
    error.value = null;
    try {
      const [memberList, teamList] = await Promise.all([
        fetchMembers(),
        fetchOrganizationTeams(),
      ]);
      members.value = memberList;
      teams.value = teamList;
      loaded.value = true;
    } catch (e) {
      error.value = e instanceof Error ? e.message : '组织数据加载失败';
    } finally {
      loading.value = false;
    }
  }

  const memberCount = computed(() => members.value.length);
  const teamCount = computed(() => teams.value.length);

  return {
    members,
    teams,
    loading,
    loaded,
    error,
    memberCount,
    teamCount,
    loadOrganizationData,
  };
});
