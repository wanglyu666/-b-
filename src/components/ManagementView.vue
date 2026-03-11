<script setup lang="ts">
import { HardHat, Clock, Wrench, CheckCircle, Banknote, Shield, ShieldAlert, AlertCircle, ClipboardList, Users, MoreHorizontal, ShoppingCart } from 'lucide-vue-next';
import TopBarActions from './TopBarActions.vue';
import { members } from '../data';
</script>

<template>
  <div class="p-8 space-y-6 max-w-[1600px] mx-auto animate-in fade-in duration-500">
    <header class="flex justify-between items-center mb-8">
      <div>
        <h1 class="text-3xl font-bold text-gray-800">管理中心</h1>
        <p class="text-gray-500 mt-1">全局项目与人员管控</p>
      </div>
      <TopBarActions :isShop="false" />
    </header>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      <div class="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col h-[520px]">
         <div class="flex justify-between items-center mb-6">
            <div class="flex items-center space-x-2">
               <div class="w-1 h-5 bg-[#A1D573] rounded-full"></div>
               <h3 class="font-bold text-lg text-gray-800">工程项目管理</h3>
            </div>
            <HardHat :size="18" class="text-gray-400" />
         </div>
         
         <div class="flex-1 flex flex-col justify-between">
            <div class="flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition-colors">
               <div class="flex items-center space-x-4">
                  <div class="p-2 bg-yellow-50 text-yellow-500 rounded-full"><Clock :size="16" /></div>
                  <span class="text-gray-600 font-medium">待开工</span>
               </div>
               <span class="font-bold text-xl text-gray-900">8</span>
            </div>

            <div class="flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition-colors">
               <div class="flex items-center space-x-4">
                  <div class="p-2 bg-[#163300]/10 text-[#163300] rounded-full"><Wrench :size="16" /></div>
                  <span class="text-gray-600 font-medium">施工中</span>
               </div>
               <span class="font-bold text-xl text-gray-900">15</span>
            </div>

            <div class="flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition-colors">
               <div class="flex items-center space-x-4">
                  <div class="p-2 bg-[#A1D573]/20 text-[#5a8632] rounded-full"><CheckCircle :size="16" /></div>
                  <span class="text-gray-600 font-medium">已完工</span>
               </div>
               <span class="font-bold text-xl text-gray-900">42</span>
            </div>

            <div class="flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition-colors">
               <div class="flex items-center space-x-4">
                  <div class="p-2 bg-[#A1D573]/20 text-[#5a8632] rounded-full"><Banknote :size="16" /></div>
                  <span class="text-gray-600 font-medium">已结算</span>
               </div>
               <span class="font-bold text-xl text-gray-900">28</span>
            </div>

            <div class="flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition-colors">
               <div class="flex items-center space-x-4">
                  <div class="p-2 bg-gray-100 text-gray-500 rounded-full"><Shield :size="16" /></div>
                  <span class="text-gray-600 font-medium">保修中</span>
               </div>
               <span class="font-bold text-xl text-gray-900">10</span>
            </div>

            <div class="flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition-colors">
               <div class="flex items-center space-x-4">
                  <div class="p-2 bg-gray-100 text-gray-400 rounded-full"><ShieldAlert :size="16" /></div>
                  <span class="text-gray-600 font-medium">保修外</span>
               </div>
               <span class="font-bold text-xl text-gray-900">3</span>
            </div>
         </div>
      </div>

      <div class="flex flex-col gap-6 h-[520px]">
         <div class="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex-1 flex flex-col">
            <div class="flex justify-between items-center mb-4">
               <div class="flex items-center space-x-2">
                  <div class="w-1 h-5 bg-[#163300] rounded-full"></div>
                  <h3 class="font-bold text-lg text-gray-800">维保项目管理</h3>
               </div>
               <Wrench :size="18" class="text-gray-400" />
            </div>
            <div class="flex-1 flex flex-col justify-between">
                <div class="flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition-colors">
                   <div class="flex items-center space-x-4">
                      <div class="p-2 bg-yellow-50 text-yellow-500 rounded-full"><Clock :size="16" /></div>
                      <span class="text-gray-600 font-medium">待开工</span>
                   </div>
                   <span class="font-bold text-xl text-gray-900">12</span>
                </div>
                <div class="flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition-colors">
                   <div class="flex items-center space-x-4">
                      <div class="p-2 bg-[#163300]/10 text-[#163300] rounded-full"><Wrench :size="16" /></div>
                      <span class="text-gray-600 font-medium">施工中</span>
                   </div>
                   <span class="font-bold text-xl text-gray-900">5</span>
                </div>
                <div class="flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition-colors">
                   <div class="flex items-center space-x-4">
                      <div class="p-2 bg-[#A1D573]/20 text-[#5a8632] rounded-full"><CheckCircle :size="16" /></div>
                      <span class="text-gray-600 font-medium">已完工</span>
                   </div>
                   <span class="font-bold text-xl text-gray-900">34</span>
                </div>
            </div>
         </div>

         <div class="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex-1 flex flex-col justify-between">
            <div class="flex justify-between items-center mb-2">
               <div class="flex items-center space-x-2">
                  <div class="w-1 h-5 bg-[#A1D573] rounded-full"></div>
                  <h3 class="font-bold text-lg text-gray-800">维保报修管理</h3>
               </div>
               <AlertCircle :size="18" class="text-gray-400" />
            </div>
            <div class="flex items-center justify-between px-2">
                <div class="flex items-center space-x-3 text-gray-600">
                   <ClipboardList :size="20" class="text-[#163300]" />
                   <span class="font-medium">项目数量</span>
                </div>
                <span class="font-bold text-3xl text-gray-900">42</span>
            </div>
            <button class="w-full py-3.5 bg-[#A1D573] text-[#163300] font-bold rounded-2xl shadow-sm hover:bg-[#8ec260] transition-colors mt-2">
               新增
            </button>
         </div>
      </div>

      <div class="flex flex-col gap-6 h-[520px]">
         <div class="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex-[1.6] flex flex-col">
            <div class="flex justify-between items-center mb-4">
               <div class="flex items-center space-x-2">
                  <div class="w-1 h-5 bg-[#163300] rounded-full"></div>
                  <h3 class="font-bold text-lg text-gray-800">成员管理</h3>
               </div>
               <Users :size="18" class="text-gray-400" />
            </div>
            
            <div class="flex-1 flex flex-col justify-between mb-4">
               <div v-for="member in members" :key="member.id" class="flex items-center justify-between p-2 hover:bg-gray-50 rounded-xl transition-colors cursor-pointer">
                  <div class="flex items-center space-x-3">
                     <div :class="['w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm', member.bgColor]">
                        {{ member.initial }}
                     </div>
                     <div class="flex flex-col">
                        <span class="font-bold text-gray-900 text-sm">{{ member.name }}</span>
                        <span class="text-xs text-gray-500">{{ member.role }}</span>
                     </div>
                  </div>
                  <div :class="['w-2 h-2 rounded-full', member.online ? 'bg-[#A1D573]' : 'bg-gray-300']"></div>
               </div>
            </div>
            <button class="text-sm font-medium text-gray-400 hover:text-gray-800 transition-colors py-2 flex justify-center items-center gap-1 w-full border-t border-gray-50 pt-3">
               <MoreHorizontal :size="14" /> 查看全部成员
            </button>
         </div>

         <div class="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex-1 flex flex-col">
            <div class="flex justify-between items-center mb-4">
               <div class="flex items-center space-x-2">
                  <div class="w-1 h-5 bg-[#A1D573] rounded-full"></div>
                  <h3 class="font-bold text-lg text-gray-800">订单管理</h3>
               </div>
               <ShoppingCart :size="18" class="text-gray-400" />
            </div>
            
            <div class="flex-1 flex flex-col justify-center">
               <div class="flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition-colors">
                  <div class="flex items-center space-x-4">
                     <div class="p-2 bg-[#A1D573]/20 text-[#5a8632] rounded-full">
                        <ShoppingCart :size="16" />
                     </div>
                     <span class="text-gray-600 font-medium">总订单数</span>
                  </div>
                  <span class="font-bold text-2xl text-gray-900">156</span>
               </div>
            </div>
         </div>
      </div>

    </div>
  </div>
</template>
