<script setup lang="ts">
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import MemberManagementView from '../components/MemberManagementView.vue';
import { useOrgStore } from '../stores/orgStore';

const router = useRouter();
const orgStore = useOrgStore();

onMounted(() => {
  orgStore.loadOrganizationData();
});
</script>

<template>
  <MemberManagementView
    :members="orgStore.members"
    @back="router.push({ name: 'org-architecture' })"
  />
</template>
