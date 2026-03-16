<script setup lang="ts">
import { HardHat, Clock, Wrench, CheckCircle, Banknote, Shield, ShieldAlert, AlertCircle, ClipboardList, Users, MoreHorizontal, ShoppingCart } from 'lucide-vue-next';
import TopBarActions from './TopBarActions.vue';
import { members } from '../data';

defineEmits(['viewProjects']);
</script>

<template>
  <div class="min-h-screen bg-transparent relative overflow-x-hidden">
    <!-- Content Area -->
    <div class="relative z-10 p-8 space-y-6 max-w-[1600px] mx-auto animate-in fade-in duration-700">
      <header class="flex justify-between items-center mb-8">
      <div>
        <h1 class="text-3xl font-bold text-gray-800">管理中心</h1>
        <p class="text-gray-500 mt-1">全局项目与人员管控</p>
      </div>
      <TopBarActions :isShop="false" />
    </header>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      <!-- 左侧与中间列 (Span 2) -->
      <div class="lg:col-span-2 flex flex-col gap-6">
        <!-- 维保项目管理 (红色框) -->
        <div class="bg-white/40 backdrop-blur-md p-6 rounded-3xl shadow-sm border border-white/20 flex flex-col h-[280px]">
           <div class="flex justify-between items-center mb-6">
              <div class="flex items-center space-x-2">
                 <div class="w-1 h-5 bg-[#163300] rounded-full"></div>
                 <h3 class="font-bold text-lg text-gray-800">维保项目管理</h3>
              </div>
              <Wrench :size="18" class="text-gray-400" />
           </div>
           <div class="flex-1 grid grid-cols-3 gap-6 pl-32 pr-6 py-4">
               <button class="relative overflow-hidden rounded-3xl bg-[#FFC091] text-[#260A2F] transition-all hover:shadow-xl active:scale-95 border border-[#FFC091]/20 group">
                  <span class="absolute top-3 right-5 text-6xl font-black opacity-90 leading-none tracking-tighter transition-all duration-700 group-hover:scale-110 group-hover:-translate-y-2 group-hover:drop-shadow-lg">12</span>
                  <span class="absolute bottom-5 left-5 text-2xl font-bold opacity-70 tracking-tight transition-all duration-700 group-hover:translate-y-1 group-hover:opacity-100">待开工</span>
               </button>
               <button class="relative overflow-hidden rounded-3xl bg-[#FFEB69] text-[#3A341C] transition-all hover:shadow-xl active:scale-95 border border-[#FFEB69]/20 group">
                  <span class="absolute top-3 right-5 text-6xl font-black opacity-90 leading-none tracking-tighter transition-all duration-700 group-hover:scale-110 group-hover:-translate-y-2 group-hover:drop-shadow-lg">5</span>
                  <span class="absolute bottom-5 left-5 text-2xl font-bold opacity-70 tracking-tight transition-all duration-700 group-hover:translate-y-1 group-hover:opacity-100">施工中</span>
               </button>
               <button class="relative overflow-hidden rounded-3xl bg-[#A0E1E1] text-[#21231D] transition-all hover:shadow-xl active:scale-95 border border-[#A0E1E1]/20 group">
                  <span class="absolute top-4 right-6 text-6xl font-black opacity-90 leading-none tracking-tighter transition-all duration-700 group-hover:scale-110 group-hover:-translate-y-2 group-hover:drop-shadow-lg">34</span>
                  <span class="absolute bottom-6 left-6 text-2xl font-bold opacity-70 tracking-tight transition-all duration-700 group-hover:translate-y-1 group-hover:opacity-100">已完工</span>
               </button>
           </div>
        </div>

        <div class="grid grid-cols-2 gap-6">
          <!-- 工程项目管理 (粉色框) -->
          <div class="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col h-[400px]">
             <div class="flex justify-between items-center mb-4">
                <div class="flex items-center space-x-2">
                   <div class="w-1 h-5 bg-[#A1D573] rounded-full"></div>
                   <h3 class="font-bold text-lg text-gray-800">工程项目管理</h3>
                </div>
                <HardHat :size="18" class="text-gray-400" />
             </div>
             
             <div class="flex-1 flex flex-col justify-between py-0.5">
                <div @click="$emit('viewProjects', '待开工')" class="flex items-center justify-between p-1.5 hover:bg-gray-50 rounded-xl transition-colors cursor-pointer">
                   <div class="flex items-center space-x-3">
                      <div class="p-1.5 bg-yellow-50 text-yellow-500 rounded-full"><Clock :size="14" /></div>
                      <span class="text-gray-600 font-medium text-sm">待开工</span>
                   </div>
                   <span class="font-bold text-lg text-gray-900">8</span>
                </div>

                <div @click="$emit('viewProjects', '施工中')" class="flex items-center justify-between p-1.5 hover:bg-gray-50 rounded-xl transition-colors cursor-pointer">
                   <div class="flex items-center space-x-3">
                      <div class="p-1.5 bg-[#163300]/10 text-[#163300] rounded-full"><Wrench :size="14" /></div>
                      <span class="text-gray-600 font-medium text-sm">施工中</span>
                   </div>
                   <span class="font-bold text-lg text-gray-900">15</span>
                </div>

                <div @click="$emit('viewProjects', '已完工')" class="flex items-center justify-between p-1.5 hover:bg-gray-50 rounded-xl transition-colors cursor-pointer">
                   <div class="flex items-center space-x-3">
                      <div class="p-1.5 bg-[#A1D573]/20 text-[#5a8632] rounded-full"><CheckCircle :size="14" /></div>
                      <span class="text-gray-600 font-medium text-sm">已完工</span>
                   </div>
                   <span class="font-bold text-lg text-gray-900">42</span>
                </div>

                <div @click="$emit('viewProjects', '已结算')" class="flex items-center justify-between p-1.5 hover:bg-gray-50 rounded-xl transition-colors cursor-pointer">
                   <div class="flex items-center space-x-3">
                      <div class="p-1.5 bg-[#A1D573]/20 text-[#5a8632] rounded-full"><Banknote :size="14" /></div>
                      <span class="text-gray-600 font-medium text-sm">已结算</span>
                   </div>
                   <span class="font-bold text-lg text-gray-900">28</span>
                </div>

                <div @click="$emit('viewProjects', '保修中')" class="flex items-center justify-between p-1.5 hover:bg-gray-50 rounded-xl transition-colors cursor-pointer">
                   <div class="flex items-center space-x-3">
                      <div class="p-1.5 bg-gray-100 text-gray-500 rounded-full"><Shield :size="14" /></div>
                      <span class="text-gray-600 font-medium text-sm">保修中</span>
                   </div>
                   <span class="font-bold text-lg text-gray-900">10</span>
                </div>

                <div @click="$emit('viewProjects', '保修外')" class="flex items-center justify-between p-1.5 hover:bg-gray-50 rounded-xl transition-colors cursor-pointer">
                   <div class="flex items-center space-x-3">
                      <div class="p-1.5 bg-gray-100 text-gray-400 rounded-full"><ShieldAlert :size="14" /></div>
                      <span class="text-gray-600 font-medium text-sm">保修外</span>
                   </div>
                   <span class="font-bold text-lg text-gray-900">3</span>
                </div>
             </div>
          </div>

          <!-- 成员管理 (绿色框) -->
          <div class="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col h-[400px]">
             <div class="flex justify-between items-center mb-4">
                <div class="flex items-center space-x-2">
                   <div class="w-1 h-5 bg-[#163300] rounded-full"></div>
                   <h3 class="font-bold text-lg text-gray-800">成员管理</h3>
                </div>
                <Users :size="18" class="text-gray-400" />
             </div>
             
             <div class="flex-1 flex flex-col">
                <!-- 占位图 -->
                <div class="flex justify-center mb-2">
                   <div class="w-24 h-24 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-100 flex items-center justify-center">
                      <span class="text-gray-300 font-medium text-[10px]">占位图</span>
                   </div>
                </div>

                <div class="mt-auto flex flex-col gap-0.5 mb-2">
                   <div v-for="member in members" :key="member.id" class="flex items-center justify-between p-1.5 hover:bg-gray-50 rounded-xl transition-colors cursor-pointer">
                      <div class="flex items-center space-x-3">
                         <div :class="['w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-xs', member.bgColor]">
                            {{ member.initial }}
                         </div>
                         <div class="flex flex-col">
                            <span class="font-bold text-gray-900 text-xs">{{ member.name }}</span>
                            <span class="text-[10px] text-gray-500">{{ member.role }}</span>
                         </div>
                      </div>
                   </div>
                </div>
             </div>
             <button class="text-xs font-medium text-gray-400 hover:text-gray-800 transition-colors py-1.5 flex justify-center items-center gap-1 w-full border-t border-gray-50 pt-2">
                <MoreHorizontal :size="12" /> 查看全部成员
             </button>
          </div>
        </div>
      </div>

      <!-- 右侧列 (独立堆叠) -->
      <div class="flex flex-col gap-6">
        <!-- 订单管理 (蓝色框) -->
        <div class="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col h-[460px]">
           <div class="flex justify-between items-center mb-4">
              <div class="flex items-center space-x-2">
                 <div class="w-1 h-5 bg-[#A1D573] rounded-full"></div>
                 <h3 class="font-bold text-lg text-gray-800">订单管理</h3>
              </div>
           </div>
           
           <div class="flex-1 flex flex-col items-center justify-center">
              <!-- 占位图 -->
              <div class="w-40 h-40 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 flex items-center justify-center mb-6">
                 <span class="text-gray-300 font-medium text-sm">占位图</span>
              </div>
              
              <div class="flex flex-col items-center">
                 <span class="text-gray-500 font-medium mb-1 text-sm">总订单数</span>
                 <span class="font-bold text-5xl text-gray-900">156</span>
              </div>
           </div>
        </div>

        <!-- 维保报修管理 (黄色框) -->
        <div class="bg-white/50 backdrop-blur-md p-6 rounded-3xl shadow-sm border border-white/20 flex flex-col justify-between h-[220px]">
           <div class="flex justify-between items-center mb-4">
              <div class="flex items-center space-x-2">
                 <div class="w-1 h-5 bg-[#A1D573] rounded-full"></div>
                 <h3 class="font-bold text-lg text-gray-800">维保报修管理</h3>
              </div>
              <AlertCircle :size="18" class="text-gray-400" />
           </div>
           <div class="flex-1 flex flex-col justify-center space-y-3">
              <div class="flex items-center justify-between px-2">
                  <div class="flex items-center space-x-3 text-gray-600">
                     <ClipboardList :size="18" class="text-[#163300]" />
                     <span class="font-medium text-sm">项目数量</span>
                  </div>
                  <span class="font-bold text-3xl text-gray-900">42</span>
              </div>
              <button class="w-full py-2.5 bg-[#A1D573] text-[#163300] font-bold rounded-2xl shadow-sm hover:bg-[#8ec260] transition-colors">
                 新增
              </button>
           </div>
        </div>
      </div>

    </div>
  </div>
</div>
</template>

