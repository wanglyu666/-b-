<template>
  <div 
    v-if="isOpen" 
    class="fixed inset-0 z-[100] bg-black/90 backdrop-blur-xl flex items-center justify-center p-8 animate-in fade-in duration-300" 
    @click="$emit('close')"
  >
    <img 
      :src="imageUrl" 
      class="max-w-full max-h-full object-contain rounded-2xl shadow-2xl scale-100 animate-in zoom-in-95 duration-300" 
      alt="Zoomed image"
      referrerPolicy="no-referrer"
    />
    <button 
      @click.stop="$emit('close')" 
      class="absolute top-8 right-8 text-white/50 hover:text-white transition-colors bg-white/10 hover:bg-white/20 p-3 rounded-full backdrop-blur-md"
    >
      <X :size="32" />
    </button>
  </div>
</template>

<script setup lang="ts">
import { X } from 'lucide-vue-next';

defineProps<{
  isOpen: boolean;
  imageUrl: string;
}>();

defineEmits(['close']);
</script>
