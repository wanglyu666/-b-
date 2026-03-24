<script setup lang="ts">
import { ref } from 'vue';
import { ChevronLeft, MoreHorizontal, Search, Filter, Download } from 'lucide-vue-next';

const emit = defineEmits(['back']);

const maintenanceData = ref([
  { id: 1, no: 'WB202603241401488', projectName: '星巴克上海臻选烘焙工坊', address: '上海市静安区南京西路789号', managerName: '张伟', managerPhone: '13812345678', status: '维保中' },
  { id: 2, no: 'WB202603241348443', projectName: '喜茶深圳欢乐海岸店', address: '深圳市南山区滨海大道2008号', managerName: '李芳', managerPhone: '13987654321', status: '维保中' },
  { id: 3, no: 'WB202603241348302', projectName: '奈雪的茶北京三里屯店', address: '北京市朝阳区三里屯路19号', managerName: '王强', managerPhone: '13700001111', status: '待处理' },
  { id: 4, no: 'WB202603241348139', projectName: '乐乐茶杭州湖滨银泰店', address: '杭州市上城区延安路258号', managerName: '赵敏', managerPhone: '13622223333', status: '已完成' },
  { id: 5, no: 'WB202603241348001', projectName: '瑞幸咖啡广州天河城店', address: '广州市天河区天河路208号', managerName: '刘洋', managerPhone: '13544445555', status: '维保中' },
  { id: 6, no: 'WB202603241347998', projectName: 'Manner Coffee上海静安寺店', address: '上海市静安区南京西路1618号', managerName: '陈晨', managerPhone: '13466667777', status: '维保中' },
]);

</script>

<template>
  <div class="p-8 space-y-6 max-w-[1600px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
    <!-- Header -->
    <header class="flex justify-between items-center mb-8">
      <div class="flex items-center space-x-4">
        <button 
          @click="emit('back')"
          class="p-2 bg-white/50 backdrop-blur-md rounded-xl border border-white/20 hover:bg-white/80 transition-all active:scale-95"
        >
          <ChevronLeft :size="20" class="text-gray-600" />
        </button>
        <div>
          <h1 class="text-3xl font-bold text-gray-800">维保报修管理</h1>
          <p class="text-gray-500 mt-1">查看与管理所有维保报修工单</p>
        </div>
      </div>
      
      <div class="flex items-center space-x-3">
        <div class="relative">
          <Search :size="18" class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            placeholder="搜索维保编号/项目名称..." 
            class="pl-10 pr-4 py-2 bg-white/50 backdrop-blur-md border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#A1D573] w-64 transition-all"
          />
        </div>
        <button class="p-2 bg-white/50 backdrop-blur-md rounded-xl border border-white/20 hover:bg-white/80 transition-all">
          <Filter :size="20" class="text-gray-600" />
        </button>
        <button class="p-2 bg-white/50 backdrop-blur-md rounded-xl border border-white/20 hover:bg-white/80 transition-all">
          <Download :size="20" class="text-gray-600" />
        </button>
      </div>
    </header>

    <!-- Table Container (Glassmorphism Style) -->
    <div class="bg-white/40 backdrop-blur-xl rounded-[32px] border border-white/30 shadow-xl overflow-hidden">
      <!-- Table Header Title -->
      <div class="p-6 border-b border-white/20 flex items-center space-x-3">
        <div class="w-1.5 h-6 bg-[#E2943A] rounded-full"></div>
        <h2 class="text-xl font-bold text-gray-800">维保工单列表</h2>
      </div>

      <!-- Table Content -->
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="text-gray-500 text-sm font-medium border-b border-white/10">
              <th class="py-5 px-6">序号</th>
              <th class="py-5 px-6">维保编号</th>
              <th class="py-5 px-6">项目名称</th>
              <th class="py-5 px-6">项目地址</th>
              <th class="py-5 px-6">项目主管姓名</th>
              <th class="py-5 px-6">项目主管电话</th>
              <th class="py-5 px-6">工单状态</th>
              <th class="py-5 px-6 w-20"></th> <!-- Empty header for Operation -->
            </tr>
          </thead>
          <tbody class="divide-y divide-white/10">
            <tr 
              v-for="(item, index) in maintenanceData" 
              :key="item.id"
              class="group hover:bg-white/30 transition-colors"
            >
              <td class="py-5 px-6 text-gray-600">{{ index + 1 }}</td>
              <td class="py-5 px-6 font-medium text-gray-800">{{ item.no }}</td>
              <td class="py-5 px-6 text-gray-700">{{ item.projectName }}</td>
              <td class="py-5 px-6 text-gray-500 max-w-xs truncate" :title="item.address">{{ item.address }}</td>
              <td class="py-5 px-6 text-gray-600">{{ item.managerName }}</td>
              <td class="py-5 px-6 text-gray-600">{{ item.managerPhone }}</td>
              <td class="py-5 px-6">
                <span 
                  class="px-3 py-1 rounded-full text-xs font-bold"
                  :class="{
                    'bg-orange-500/20 text-orange-600': item.status === '维保中',
                    'bg-blue-500/20 text-blue-600': item.status === '待处理',
                    'bg-[#A1D573]/20 text-[#163300]': item.status === '已完成'
                  }"
                >
                  {{ item.status }}
                </span>
              </td>
              <td class="py-5 px-6">
                <button class="p-2 text-gray-400 hover:text-[#E2943A] hover:bg-white/50 rounded-lg transition-all">
                  <MoreHorizontal :size="20" />
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination Placeholder -->
      <div class="p-6 border-t border-white/10 flex justify-between items-center text-sm text-gray-500">
        <p>显示 1 到 {{ maintenanceData.length }} 条，共 {{ maintenanceData.length }} 条记录</p>
        <div class="flex space-x-2">
          <button class="px-3 py-1 bg-white/50 rounded-lg border border-white/20 hover:bg-white/80 disabled:opacity-50" disabled>上一页</button>
          <button class="px-3 py-1 bg-[#A1D573] text-white rounded-lg border border-[#A1D573] shadow-sm">1</button>
          <button class="px-3 py-1 bg-white/50 rounded-lg border border-white/20 hover:bg-white/80">下一页</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Glassmorphism table specific styles if needed */
table {
  border-spacing: 0;
}
</style>
