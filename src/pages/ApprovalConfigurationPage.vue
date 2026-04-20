<script setup lang="ts">
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import ApprovalConfigurationView from '../components/ApprovalConfigurationView.vue';
import { useOrgStore } from '../stores/orgStore';

const router = useRouter();
const orgStore = useOrgStore();

onMounted(() => {
  orgStore.loadOrganizationData();
});
</script>

<template>
  <ApprovalConfigurationView
    :members="orgStore.members"
    @back="router.push({ name: 'org-architecture' })"
  />
</template>
