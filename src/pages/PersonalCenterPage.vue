<script setup lang="ts">
import PersonalCenterProfileHeader from '../components/PersonalCenterProfileHeader.vue';
import { useAppStore } from '../stores/appStore';

const appStore = useAppStore();
</script>

<template>
  <div
    class="mx-auto min-h-screen max-w-[1600px] p-8 animate-in fade-in slide-in-from-bottom-4 duration-700"
  >
    <PersonalCenterProfileHeader :name="appStore.customerName" />
  </div>
</template>
