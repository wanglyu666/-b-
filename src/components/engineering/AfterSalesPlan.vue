<template>
  <div class="animate-in slide-in-from-right-4 duration-500 flex flex-col gap-6 h-full">
    <div class="bg-white/5 backdrop-blur-xl rounded-[32px] border border-white/10 overflow-hidden shadow-inner flex flex-col h-full">
      <div class="px-8 py-4 border-b border-white/10 bg-white/5 flex justify-between items-center flex-shrink-0">
        <h3 class="text-white font-bold flex items-center gap-2">
            <div class="w-1 h-4 bg-[#FFE600] rounded-full shadow-[0_0_8px_rgba(255,230,0,0.4)]"></div>
            售后计划
        </h3>
      </div>
      <div class="overflow-x-auto flex-1 custom-scrollbar">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-white/5 text-white/40 text-[10px] uppercase tracking-widest font-bold">
              <th class="px-6 py-3">售后计划</th>
              <th class="px-6 py-3">计划时间</th>
              <th class="px-6 py-3">开始时间</th>
              <th class="px-6 py-3">结束时间</th>
              <th class="px-6 py-3"></th> <!-- Empty header for action column -->
            </tr>
          </thead>
          <tbody class="text-white/80 text-xs">
            <tr v-for="(item, i) in afterSalesData" :key="i" class="border-b border-white/5 hover:bg-white/5 transition-colors">
              <td class="px-6 py-4">{{ item.plan }}</td>
              <td class="px-6 py-4 font-mono">{{ item.planTime }}</td>
              <td class="px-6 py-4 font-mono">{{ item.startTime }}</td>
              <td class="px-6 py-4 font-mono">{{ item.endTime }}</td>
              <td class="px-6 py-4 text-right">
                <button 
                  v-if="item.status === '1'"
                  @click="$emit('scheduleAcceptance', item)" 
                  class="px-4 py-1.5 bg-[#FFE600] text-[#260A2F] text-xs font-bold rounded-full hover:bg-[#e6cf00] transition-colors shadow-[0_0_10px_rgba(255,230,0,0.3)] active:scale-95"
                >
                  预约巡检时间
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  afterSalesData: any[];
}>();

defineEmits(['scheduleAcceptance']);
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.2);
}
</style>
