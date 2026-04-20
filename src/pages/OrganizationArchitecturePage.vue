<script setup lang="ts">
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import OrganizationArchitectureView from '../components/OrganizationArchitectureView.vue';
import { useOrgStore } from '../stores/orgStore';

const router = useRouter();
const orgStore = useOrgStore();

onMounted(() => {
  orgStore.loadOrganizationData();
});
</script>

<template>
  <OrganizationArchitectureView
    :members="orgStore.members"
    :teams="orgStore.teams"
    :space-count="orgStore.spaceCount"
    @open-member-management="
      (memberId) =>
        router.push({
          name: 'member-management',
          ...(memberId != null
            ? { query: { member: String(memberId) } }
            : {}),
        })
    "
    @open-team-management="
      (teamId) =>
        router.push({
          name: 'team-management',
          ...(teamId != null && teamId !== ''
            ? { query: { team: teamId } }
            : {}),
        })
    "
    @open-space-management="router.push({ name: 'space-management' })"
    @open-approval-configuration="router.push({ name: 'approval-configuration' })"
  />
</template>
