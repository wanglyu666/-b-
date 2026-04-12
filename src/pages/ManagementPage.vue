<script setup lang="ts">
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import ManagementView from '../components/ManagementView.vue';
import { useAppStore } from '../stores/appStore';
import { useOrgStore } from '../stores/orgStore';

const router = useRouter();
const appStore = useAppStore();
const orgStore = useOrgStore();

onMounted(() => {
  appStore.loadGlobalModules();
  orgStore.loadOrganizationData();
});

function viewProjects(status: string) {
  appStore.setEngineeringProjectEntry({ projectStatus: status });
  router.push({ name: 'engineering-projects' });
}

function viewMaintenanceProjects(status: string) {
  appStore.setMaintenanceProjectStatus(status);
  router.push({ name: 'maintenance-projects' });
}
</script>

<template>
  <ManagementView
    :repair-order-count="appStore.repairOrderCount"
    :order-total-count="appStore.orderTotalCount"
    :members="orgStore.members"
    :engineering-projects="appStore.engineeringProjects"
    :maintenance-projects="appStore.maintenanceProjects"
    @view-projects="viewProjects"
    @view-maintenance="router.push({ name: 'maintenance-repair' })"
    @view-maintenance-projects="viewMaintenanceProjects"
    @add-repair="appStore.addRepairReport"
    @view-orders="router.push({ name: 'order-management' })"
  />
</template>
