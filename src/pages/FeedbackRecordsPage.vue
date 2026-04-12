<script setup lang="ts">
import { useRouter } from 'vue-router';
import FeedbackRecordsView from '../components/consultation-feedback/FeedbackRecordsView.vue';
import { useAppStore } from '../stores/appStore';

const router = useRouter();
const appStore = useAppStore();

function backToConsultation() {
  appStore.resetConsultationEntry();
  router.push({ name: 'consultation-feedback' });
}
</script>

<template>
  <FeedbackRecordsView
    :initial-open-consultation-id="appStore.pendingOpenFeedbackConsultationId"
    @back="backToConsultation"
    @opened-initial-feedback-detail="appStore.clearPendingFeedbackOpen"
  />
</template>
