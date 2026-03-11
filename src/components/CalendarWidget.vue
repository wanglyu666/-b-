<script setup lang="ts">
import { Calendar as CalendarIcon } from 'lucide-vue-next';

const days = ['日', '一', '二', '三', '四', '五', '六'];
const dates = Array.from({ length: 30 }, (_, i) => i + 1);
const currentDay = 16; 
</script>

<template>
  <div class="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 h-full flex flex-col justify-between overflow-hidden">
    <div class="flex justify-between items-center mb-2">
      <h3 class="font-bold text-lg text-gray-800">2023年 11月</h3>
      <div class="p-2 bg-gray-50 rounded-full hover:bg-gray-100 cursor-pointer">
         <CalendarIcon :size="16" class="text-gray-600" />
      </div>
    </div>
    
    <div class="flex-1 flex flex-col justify-center">
      <div class="grid grid-cols-7 gap-1 mb-2">
        <div v-for="d in days" :key="d" class="text-center text-xs text-gray-400 font-bold">{{ d }}</div>
      </div>
      <div class="grid grid-cols-7 gap-y-1 gap-x-1 sm:gap-x-2">
        <div class="col-span-3"></div> 
        <div 
          v-for="date in dates" 
          :key="date" 
          :class="['h-7 w-full sm:h-8 flex items-center justify-center text-sm rounded-lg cursor-pointer transition-all',
            date === currentDay ? 'bg-black text-white font-bold shadow-md' : 'text-gray-600 hover:bg-gray-100 font-medium'
          ]"
        >
          {{ date }}
        </div>
      </div>
    </div>
  </div>
</template>
