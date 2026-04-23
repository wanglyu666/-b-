<script setup lang="ts">
import { useRouter } from 'vue-router';
import ContractArchivesView from '../components/ContractArchivesView.vue';

const router = useRouter();
</script>

<template>
  <ContractArchivesView @back="router.push({ name: 'contracts' })" />
</template>
