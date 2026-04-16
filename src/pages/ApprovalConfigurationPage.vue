<script setup lang="ts">
import { useRouter } from 'vue-router';
import ApprovalConfigurationView from '../components/ApprovalConfigurationView.vue';

const router = useRouter();
</script>

<template>
  <ApprovalConfigurationView
    @back="router.push({ name: 'org-architecture' })"
  />
</template>
