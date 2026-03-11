<script setup lang="ts">
import { ArrowLeft, Clock } from 'lucide-vue-next';
import { notifications } from '../data';

defineEmits(['back']);
</script>

<template>
  <div class="p-8 h-full flex flex-col max-w-[900px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
     <header class="flex justify-between items-center mb-8">
        <div class="flex items-center gap-4">
           <button 
              @click="$emit('back')" 
              class="p-2 rounded-full bg-white border border-gray-200 hover:bg-gray-50 transition-colors"
           >
              <ArrowLeft :size="20" />
           </button>
           <h1 class="text-2xl font-bold text-gray-900">消息通知</h1>
        </div>
     </header>

     <div class="flex-1 space-y-4 overflow-y-auto pb-12">
        <div v-for="note in notifications" :key="note.id" class="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-all cursor-pointer">
           <div class="flex justify-between items-start mb-2">
              <h3 class="font-bold text-lg text-gray-900">{{ note.title }}</h3>
              <span v-if="!note.read" class="w-2 h-2 bg-red-500 rounded-full mt-2"></span>
           </div>
           <p class="text-gray-500 text-sm mb-4 leading-relaxed line-clamp-2">{{ note.content }}</p>
           <div class="flex items-center text-xs text-gray-400 font-medium">
              <Clock :size="14" class="mr-1.5" />
              {{ note.time }}
           </div>
        </div>
        
        <div class="text-center pt-8">
           <span class="text-gray-300 text-xs">没有更多消息了</span>
        </div>
     </div>
  </div>
</template>
