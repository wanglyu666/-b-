<script setup lang="ts">
import { useRouter } from 'vue-router';
import ContractSigningManagementView from '../components/ContractSigningManagementView.vue';

const router = useRouter();
</script>

<template>
  <ContractSigningManagementView @back="router.push({ name: 'contracts' })" />
</template>
