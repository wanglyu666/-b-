<script setup lang="ts">
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import SpaceManagementView from '../components/SpaceManagementView.vue';
import { useOrgStore } from '../stores/orgStore';

const router = useRouter();
const orgStore = useOrgStore();

onMounted(() => {
  orgStore.loadOrganizationData();
});
</script>

<template>
  <SpaceManagementView @back="router.push({ name: 'org-architecture' })" />
</template>
