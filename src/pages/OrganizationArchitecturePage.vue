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
    @open-member-management="router.push({ name: 'member-management' })"
    @open-team-management="router.push({ name: 'team-management' })"
  />
</template>
