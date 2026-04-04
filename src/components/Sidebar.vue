<script setup lang="ts">
import { 
  Home, 
  ShoppingBag, 
  LogOut, 
  Briefcase, 
  BarChart2, 
  MessageSquare, 
  FileText 
} from 'lucide-vue-next';
import logoDarkGreen from '../../justpai logo/justpai logo darkgreen 1.png';

defineProps<{
  activeTab: string
}>();

defineEmits<{
  (e: 'update:activeTab', tab: string): void
}>();
</script>

<template>
  <aside class="w-64 bg-white h-full flex flex-col border-r border-gray-100 hidden md:flex sticky top-0">
    <div class="p-8">
      <div class="flex items-center gap-2">
        <img
          :src="logoDarkGreen"
          alt=""
          class="h-9 w-auto max-w-[140px] object-contain object-left shrink-0"
        />
        <span class="text-xl font-bold tracking-tight">这么派</span>
      </div>
    </div>

    <nav class="flex-1 px-4 space-y-2 mt-4">
      <div class="text-xs font-bold text-gray-400 uppercase px-6 mb-2">菜单</div>
      
      <div 
        @click="$emit('update:activeTab', 'home')"
        :class="['flex items-center space-x-3 px-6 py-4 cursor-pointer transition-all duration-200 group',
          (activeTab === 'home' || activeTab === 'messages') ? 'text-black font-bold border-l-4 border-black bg-gray-50' : 'text-gray-500 hover:text-black hover:bg-gray-50'
        ]"
      >
        <Home :size="20" :class="(activeTab === 'home' || activeTab === 'messages') ? 'text-black' : 'text-gray-400 group-hover:text-black'" />
        <span>首页</span>
      </div>

      <div 
        @click="$emit('update:activeTab', 'shop')"
        :class="['flex items-center space-x-3 px-6 py-4 cursor-pointer transition-all duration-200 group',
          (activeTab === 'shop' || activeTab === 'product-detail' || activeTab === 'cart' || activeTab === 'wishlist') ? 'text-black font-bold border-l-4 border-black bg-gray-50' : 'text-gray-500 hover:text-black hover:bg-gray-50'
        ]"
      >
        <ShoppingBag :size="20" :class="(activeTab === 'shop' || activeTab === 'product-detail' || activeTab === 'cart' || activeTab === 'wishlist') ? 'text-black' : 'text-gray-400 group-hover:text-black'" />
        <span>商店</span>
      </div>

      <div 
        @click="$emit('update:activeTab', 'management')"
        :class="['flex items-center space-x-3 px-6 py-4 cursor-pointer transition-all duration-200 group',
          activeTab === 'management' ? 'text-black font-bold border-l-4 border-black bg-gray-50' : 'text-gray-500 hover:text-black hover:bg-gray-50'
        ]"
      >
        <Briefcase :size="20" :class="activeTab === 'management' ? 'text-black' : 'text-gray-400 group-hover:text-black'" />
        <span>管理</span>
      </div>

      <div 
        class="flex items-center space-x-3 px-6 py-4 cursor-pointer transition-all duration-200 group text-gray-500 hover:text-black hover:bg-gray-50"
      >
        <BarChart2 :size="20" class="text-gray-400 group-hover:text-black" />
        <span>数据</span>
      </div>

      <div 
        @click="$emit('update:activeTab', 'contracts')"
        :class="['flex items-center space-x-3 px-6 py-4 cursor-pointer transition-all duration-200 group',
          activeTab === 'contracts' ? 'text-black font-bold border-l-4 border-black bg-gray-50' : 'text-gray-500 hover:text-black hover:bg-gray-50'
        ]"
      >
        <FileText :size="20" :class="activeTab === 'contracts' ? 'text-black' : 'text-gray-400 group-hover:text-black'" />
        <span>合同与结算</span>
      </div>

      <div
        @click="$emit('update:activeTab', 'consultation-feedback')"
        :class="['flex items-center space-x-3 px-6 py-4 cursor-pointer transition-all duration-200 group',
          (activeTab === 'consultation-feedback' || activeTab === 'all-consultations' || activeTab === 'feedback-records') ? 'text-black font-bold border-l-4 border-black bg-gray-50' : 'text-gray-500 hover:text-black hover:bg-gray-50'
        ]"
      >
        <MessageSquare :size="20" :class="(activeTab === 'consultation-feedback' || activeTab === 'all-consultations' || activeTab === 'feedback-records') ? 'text-black' : 'text-gray-400 group-hover:text-black'" />
        <span>咨询与反馈</span>
      </div>
    </nav>

    <div class="p-4 px-8 border-t border-gray-100">
       <button class="flex items-center space-x-3 text-gray-500 hover:text-red-500 transition-colors w-full py-2">
         <LogOut :size="20" />
         <span class="font-medium">退出登录</span>
       </button>
    </div>
  </aside>
</template>
