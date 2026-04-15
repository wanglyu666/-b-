<script setup lang="ts">
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import TeamManagementView from '../components/TeamManagementView.vue';
import { useOrgStore } from '../stores/orgStore';

const router = useRouter();
const orgStore = useOrgStore();

onMounted(() => {
  orgStore.loadOrganizationData();
});
</script>

<template>
  <TeamManagementView
    :teams="orgStore.teams"
    :members="orgStore.members"
    @back="router.push({ name: 'org-architecture' })"
  />
</template>
