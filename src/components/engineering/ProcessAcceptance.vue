<template>
  <div class="animate-in slide-in-from-right-4 duration-500 flex flex-col gap-6">
    <!-- Sub Tabs -->
    <div class="flex gap-3">
      <button 
        @click="setTab('material')"
        :class="['px-6 py-2 rounded-full text-sm font-bold transition-all', 
          acceptanceTab === 'material' ? 'bg-[#FFC091] text-[#260A2F]' : 'bg-white/5 text-white/60 hover:bg-white/10']"
      >
        材料管控
      </button>
      <button 
        @click="setTab('progress')"
        :class="['px-6 py-2 rounded-full text-sm font-bold transition-all', 
          acceptanceTab === 'progress' ? 'bg-[#FFC091] text-[#260A2F]' : 'bg-white/5 text-white/60 hover:bg-white/10']"
      >
        进度管控
      </button>
    </div>

    <Transition name="fade-slide" mode="out-in">
      <!-- Material Content -->
      <div v-if="acceptanceTab === 'material'" :key="'material'" class="flex flex-col gap-8">
        <!-- Table 1: Material List -->
        <div class="bg-white/5 backdrop-blur-xl rounded-[32px] border border-white/10 overflow-hidden shadow-inner">
          <div class="px-8 py-4 border-b border-white/10 bg-white/5 flex justify-between items-center">
            <h3 class="text-white font-bold flex items-center gap-2">
                <div class="w-1 h-4 bg-[#FFC091] rounded-full shadow-[0_0_8px_rgba(255,192,145,0.4)]"></div>
                材料清单
            </h3>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
              <thead>
                <tr class="bg-white/5 text-white/40 text-[10px] uppercase tracking-widest font-bold">
                  <th class="px-6 py-3">专业</th>
                  <th class="px-6 py-3">品类</th>
                  <th class="px-6 py-3">物料编码</th>
                  <th class="px-6 py-3">物料名称</th>
                  <th class="px-6 py-3">品牌</th>
                  <th class="px-6 py-3">规格型号</th>
                  <th class="px-6 py-3">单位</th>
                  <th class="px-6 py-3">备注</th>
                </tr>
              </thead>
              <tbody class="text-white/80 text-xs">
                <tr v-for="(item, i) in materialData" :key="i" class="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td class="px-6 py-4">{{ item.pro }}</td>
                  <td class="px-6 py-4">{{ item.cat }}</td>
                  <td class="px-6 py-4 font-mono">{{ item.code }}</td>
                  <td class="px-6 py-4">{{ item.name }}</td>
                  <td class="px-6 py-4">{{ item.brand }}</td>
                  <td class="px-6 py-4">{{ item.spec }}</td>
                  <td class="px-6 py-4">{{ item.unit }}</td>
                  <td class="px-6 py-4 text-white/40 italic">{{ item.note || '-' }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Table 2: Entry Plan -->
        <div class="bg-white/5 backdrop-blur-xl rounded-[32px] border border-white/10 overflow-hidden shadow-inner">
          <div class="px-8 py-4 border-b border-white/10 bg-white/5 flex justify-between items-center">
            <h3 class="text-white font-bold flex items-center gap-2">
                <div class="w-1 h-4 bg-[#FFC091] rounded-full shadow-[0_0_8px_rgba(255,192,145,0.4)]"></div>
                材料进场计划
            </h3>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
              <thead>
                <tr class="bg-white/5 text-white/40 text-[10px] uppercase tracking-widest font-bold">
                  <th class="px-6 py-3">专业</th>
                  <th class="px-6 py-3">品类</th>
                  <th class="px-6 py-3">物料编码</th>
                  <th class="px-6 py-3">物料名称</th>
                  <th class="px-6 py-3">品牌</th>
                  <th class="px-6 py-3">型号</th>
                  <th class="px-6 py-3">规格</th>
                  <th class="px-6 py-3">单位</th>
                  <th class="px-6 py-3">数量</th>
                  <th class="px-6 py-3">计划进场时间</th>
                  <th class="px-6 py-3">实际进场时间</th>
                  <th class="px-6 py-3">备注</th>
                  <th class="px-6 py-3"></th>
                </tr>
              </thead>
              <tbody class="text-white/80 text-xs">
                <tr v-for="(item, i) in materialData" :key="i" class="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td class="px-6 py-4">{{ item.pro }}</td>
                  <td class="px-6 py-4">{{ item.cat }}</td>
                  <td class="px-6 py-4 font-mono">{{ item.code }}</td>
                  <td class="px-6 py-4">{{ item.name }}</td>
                  <td class="px-6 py-4">{{ item.brand }}</td>
                  <td class="px-6 py-4">{{ item.model }}</td>
                  <td class="px-6 py-4">{{ item.spec }}</td>
                  <td class="px-6 py-4">{{ item.unit }}</td>
                  <td class="px-6 py-4 font-bold">{{ item.qty || '-' }}</td>
                  <td class="px-6 py-4 font-mono">{{ item.plan }}</td>
                  <td class="px-6 py-4 font-mono text-white/80">{{ item.actual || '-' }}</td>
                  <td class="px-6 py-4 text-white/40 italic">{{ item.note || '-' }}</td>
                  <td class="px-6 py-4">
                    <button @click="$emit('viewMaterialDetail', item)" class="p-1 hover:bg-white/10 rounded-full transition-colors">
                      <MoreHorizontal :size="16" />
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Progress Content -->
      <div v-else :key="'progress'" class="flex flex-col gap-8">
        <div class="bg-white/5 backdrop-blur-xl rounded-[32px] border border-white/10 overflow-hidden shadow-inner">
          <div class="px-8 py-4 border-b border-white/10 bg-white/5 flex justify-between items-center">
            <h3 class="text-white font-bold flex items-center gap-2">
                <div class="w-1 h-4 bg-[#FFC091] rounded-full shadow-[0_0_8px_rgba(255,192,145,0.4)]"></div>
                进度验收节点
            </h3>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
              <thead>
                <tr class="bg-white/5 text-white/40 text-[10px] uppercase tracking-widest font-bold">
                  <th class="px-6 py-3">验收节点名称</th>
                  <th class="px-6 py-3">计划验收时间</th>
                  <th class="px-6 py-3">预约验收时间</th>
                  <th class="px-6 py-3">验收类型</th>
                  <th class="px-6 py-3">验收状态</th>
                  <th class="px-6 py-3"></th>
                </tr>
              </thead>
              <tbody class="text-white/80 text-xs">
                <tr v-for="(item, i) in progressData" :key="i" class="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td class="px-6 py-4">{{ item.node }}</td>
                  <td class="px-6 py-4 font-mono">{{ item.planDate }}</td>
                  <td class="px-6 py-4 font-mono">{{ item.appointmentDate }}</td>
                  <td class="px-6 py-4">{{ item.type }}</td>
                  <td class="px-6 py-4">
                    <span :class="[
                      'px-3 py-1 rounded-full text-[10px] font-bold',
                      item.status === '已通过' ? 'bg-[#A1D573]/20 text-[#A1D573]' : 'bg-rose-500/20 text-rose-400'
                    ]">
                      {{ item.status }}
                    </span>
                  </td>
                  <td class="px-6 py-4 flex items-center gap-2">
                    <button 
                      v-if="item.status !== '已通过'"
                      @click="$emit('scheduleAcceptance', item)"
                      :disabled="!!item.appointmentDate"
                      :class="[
                        'px-4 py-1.5 rounded-full text-xs font-bold transition-colors',
                        item.appointmentDate 
                          ? 'bg-white/10 text-white/40 cursor-not-allowed' 
                          : 'bg-[#FFC091] hover:bg-[#ffb078] text-[#260A2F]'
                      ]"
                    >
                      {{ item.appointmentDate ? '已确认时间' : '预约时间' }}
                    </button>
                    <button @click="$emit('viewProgressDetail', item)" class="p-1 hover:bg-white/10 rounded-full transition-colors">
                      <MoreHorizontal :size="16" />
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { MoreHorizontal } from 'lucide-vue-next';

const props = defineProps<{
  materialData: any[];
  progressData: any[];
  initialTab?: 'material' | 'progress';
}>();

const emit = defineEmits(['viewMaterialDetail', 'viewProgressDetail', 'scheduleAcceptance', 'update:tab']);

const acceptanceTab = ref<'material' | 'progress'>(props.initialTab || 'material');

watch(() => props.initialTab, (newVal) => {
  if (newVal) {
    acceptanceTab.value = newVal;
  }
});

const setTab = (tab: 'material' | 'progress') => {
  acceptanceTab.value = tab;
  emit('update:tab', tab);
};
</script>

<style scoped>
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.3s ease;
}
.fade-slide-enter-from {
  opacity: 0;
  transform: translateY(10px);
}
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
