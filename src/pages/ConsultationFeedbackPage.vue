<script setup lang="ts">
import { useRouter } from 'vue-router';
import ConsultationFeedbackView from '../components/consultation-feedback/ConsultationFeedbackView.vue';
import { useAppStore } from '../stores/appStore';
import type { ConsultationSheetStatus } from '../data/consultations';

const router = useRouter();
const appStore = useAppStore();

function openAllConsultations(payload: {
  status: ConsultationSheetStatus;
  openConsultationId?: string;
}) {
  appStore.setConsultationOpenPayload(payload);
  router.push({ name: 'all-consultations' });
}

function openFeedbackRecords(payload?: { openConsultationId?: string }) {
  appStore.setPendingFeedbackOpenId(payload?.openConsultationId);
  router.push({ name: 'feedback-records' });
}
</script>

<template>
  <ConsultationFeedbackView
    :engineering-projects="appStore.engineeringProjects"
    @open-all-consultations="openAllConsultations"
    @open-feedback-records="openFeedbackRecords"
  />
</template>
