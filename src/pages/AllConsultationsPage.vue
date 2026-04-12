<script setup lang="ts">
import { useRouter } from 'vue-router';
import AllConsultationsView from '../components/consultation-feedback/AllConsultationsView.vue';
import { useAppStore } from '../stores/appStore';

const router = useRouter();
const appStore = useAppStore();

function backToConsultation() {
  appStore.resetConsultationEntry();
  router.push({ name: 'consultation-feedback' });
}
</script>

<template>
  <AllConsultationsView
    :initial-status="appStore.activeConsultationStatus"
    :initial-open-consultation-id="appStore.pendingOpenConsultationId"
    @back="backToConsultation"
    @opened-initial-consultation="appStore.clearPendingConsultationOpen"
    @add-to-cart="appStore.addToCart"
  />
</template>
