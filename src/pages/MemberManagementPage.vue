<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import MemberManagementView from '../components/MemberManagementView.vue';
import { useOrgStore } from '../stores/orgStore';

const router = useRouter();
const route = useRoute();
const orgStore = useOrgStore();

const initialOpenMemberId = computed(() => {
  const q = route.query.member;
  const raw = Array.isArray(q) ? q[0] : q;
  if (raw == null || raw === '') return undefined;
  const n = Number(raw);
  return Number.isFinite(n) ? n : undefined;
});

function clearMemberQueryParam() {
  const { member: _m, ...rest } = route.query;
  router.replace({ name: 'member-management', query: rest });
}

onMounted(() => {
  orgStore.loadOrganizationData();
});
</script>

<template>
  <MemberManagementView
    :members="orgStore.members"
    :teams="orgStore.teams"
    :spaces="orgStore.spaces"
    :initial-open-member-id="initialOpenMemberId"
    @back="router.push({ name: 'org-architecture' })"
    @initial-member-opened="clearMemberQueryParam"
  />
</template>
