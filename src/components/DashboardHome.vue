<script setup lang="ts">
import { TrendingUp, Package, MoreHorizontal } from 'lucide-vue-next';
import CalendarWidget from './CalendarWidget.vue';
import TopBarActions from './TopBarActions.vue';
import { 
  chartData, 
  pieDataStatus, 
  pieDataWarranty, 
  distributionData, 
  COLORS_DIST 
} from '../data';

import { use } from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import { PieChart, LineChart } from 'echarts/charts';
import { TooltipComponent, GridComponent, LegendComponent } from 'echarts/components';
import VChart from 'vue-echarts';

use([
  CanvasRenderer,
  PieChart,
  LineChart,
  TooltipComponent,
  GridComponent,
  LegendComponent
]);

defineProps<{
  cartCount: number;
  wishlistCount: number;
  messageCount: number;
}>();

defineEmits(['cartClick', 'wishlistClick', 'messageClick']);

const statusOption = {
  tooltip: { trigger: 'item' },
  color: pieDataStatus.map(d => d.color),
  series: [
    {
      type: 'pie',
      radius: ['60%', '80%'],
      avoidLabelOverlap: false,
      label: { show: false },
      data: pieDataStatus
    }
  ]
};

const warrantyOption = {
  tooltip: { trigger: 'item' },
  color: pieDataWarranty.map(d => d.color),
  series: [
    {
      type: 'pie',
      radius: ['60%', '80%'],
      avoidLabelOverlap: false,
      label: { show: false },
      data: pieDataWarranty
    }
  ]
};

const areaOption = {
  tooltip: {
    trigger: 'axis',
    backgroundColor: '#1f2937',
    textStyle: { color: '#fff' },
    borderWidth: 0,
    borderRadius: 8
  },
  grid: { top: 10, right: 10, left: 0, bottom: 0, containLabel: true },
  xAxis: {
    type: 'category',
    boundaryGap: false,
    data: chartData.map(d => d.name),
    axisLine: { show: false },
    axisTick: { show: false },
    axisLabel: { color: '#9ca3af', fontSize: 12, margin: 10 }
  },
  yAxis: {
    type: 'value',
    splitLine: { lineStyle: { type: 'dashed', color: '#f0f0f0' } },
    axisLabel: { color: '#9ca3af', fontSize: 12 }
  },
  series: [
    {
      data: chartData.map(d => d.value),
      type: 'line',
      smooth: true,
      lineStyle: { color: '#A1D573', width: 3 },
      showSymbol: false,
      areaStyle: {
        color: {
          type: 'linear',
          x: 0, y: 0, x2: 0, y2: 1,
          colorStops: [
            { offset: 0, color: 'rgba(161, 213, 115, 0.3)' },
            { offset: 1, color: 'rgba(161, 213, 115, 0)' }
          ]
        }
      }
    }
  ]
};

const distributionOption = {
  tooltip: { trigger: 'item' },
  color: COLORS_DIST,
  series: [
    {
      type: 'pie',
      radius: '80%',
      center: ['50%', '50%'],
      label: { show: false },
      data: distributionData
    }
  ]
};
</script>

<template>
  <div class="relative min-h-screen bg-transparent overflow-x-hidden">
    <!-- Content Area -->
    <div class="relative z-10 p-8 space-y-6 max-w-[1600px] mx-auto animate-in fade-in duration-700">
      <header class="flex justify-between items-center mb-8">
      <div>
        <h1 class="text-3xl font-bold text-gray-800">欢迎回来，JustPai！</h1>
        <p class="text-gray-500 mt-1">这是您目前的销售概览</p>
      </div>
      <TopBarActions 
        :isShop="false" 
        :cartCount="cartCount" 
        @cartClick="$emit('cartClick')" 
        @wishlistClick="$emit('wishlistClick')" 
        :wishlistCount="wishlistCount" 
        @messageClick="$emit('messageClick')" 
        :messageCount="messageCount" 
      />
    </header>
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <div class="lg:col-span-3 h-[340px]"><CalendarWidget /></div>
      <div class="lg:col-span-9 h-[340px] flex flex-col gap-6">
          <div class="flex-1 bg-[#A1D573] rounded-3xl px-8 py-6 relative overflow-hidden shadow-sm hover:shadow-md transition-shadow group flex items-center justify-between">
              <div class="relative z-10 flex flex-col justify-center h-full">
                   <div class="flex items-center space-x-3 mb-2"><div class="p-2 bg-white/30 rounded-lg backdrop-blur-sm"><TrendingUp :size="20" class="text-gray-800" /></div><span class="bg-white/30 px-3 py-1 rounded-full text-xs font-bold backdrop-blur-sm text-gray-900">+12.5%</span></div>
                   <p class="text-gray-800 font-medium text-base opacity-80 mb-1">总收入</p>
                   <h3 class="text-4xl font-bold tracking-tight text-gray-900">¥128,430</h3>
              </div>
              <div class="hidden sm:block absolute -bottom-10 -right-10 w-64 h-64 bg-white/20 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-700"></div>
          </div>
          <div class="flex-1 bg-white rounded-3xl px-8 py-6 shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition-shadow">
               <div class="flex flex-col justify-center h-full">
                   <div class="flex items-center space-x-3 mb-2"><div class="p-2 bg-gray-50 rounded-lg"><Package :size="20" class="text-gray-400" /></div><span class="text-gray-500 font-medium">总订单数</span></div>
                   <div class="flex items-end space-x-4"><h3 class="text-3xl font-bold text-gray-800">2,219</h3><p class="text-[#A1D573] font-bold flex items-center bg-[#A1D573]/10 px-2 py-1 rounded-lg text-sm mb-1"><TrendingUp :size="14" class="mr-1" /> +1.18%</p></div>
               </div>
          </div>
      </div>
      <div class="lg:col-span-5 bg-white rounded-3xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow h-[340px] flex flex-col">
        <div class="flex justify-between items-center mb-4"><h3 class="font-bold text-xl text-gray-800">订单状态概览</h3><MoreHorizontal :size="20" class="text-gray-400 cursor-pointer" /></div>
        <div class="flex-1 grid grid-cols-2 gap-4 items-center">
           <div class="flex flex-col items-center">
              <div class="w-32 h-32 relative">
                <v-chart class="w-full h-full" :option="statusOption" autoresize />
                <div class="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"><span class="text-xs text-gray-400">进度</span><span class="text-lg font-bold text-gray-800">70%</span></div>
              </div>
              <div class="flex gap-2 mt-2 justify-center flex-wrap"><div v-for="item in pieDataStatus" :key="item.name" class="flex items-center text-[10px] text-gray-600"><span class="w-2 h-2 rounded-full mr-1" :style="{ backgroundColor: item.color }"></span>{{ item.name }}</div></div>
           </div>
           <div class="flex flex-col items-center border-l border-gray-50 pl-4">
              <div class="w-32 h-32 relative">
                <v-chart class="w-full h-full" :option="warrantyOption" autoresize />
                <div class="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"><span class="text-xs text-gray-400">保修</span><span class="text-lg font-bold text-gray-800">85%</span></div>
              </div>
              <div class="flex gap-2 mt-2 justify-center flex-wrap"><div v-for="item in pieDataWarranty" :key="item.name" class="flex items-center text-[10px] text-gray-600"><span class="w-2 h-2 rounded-full mr-1" :style="{ backgroundColor: item.color }"></span>{{ item.name }}</div></div>
           </div>
        </div>
      </div>
      <div class="lg:col-span-7 bg-white rounded-3xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow h-[340px] flex flex-col">
        <div class="flex justify-between items-center mb-4"><h3 class="font-bold text-xl text-gray-800">销售概览</h3><div class="flex space-x-4"><span class="flex items-center text-xs text-gray-500"><span class="w-2 h-2 rounded-full bg-[#A1D573] mr-2"></span>收入</span><span class="flex items-center text-xs text-gray-500"><span class="w-2 h-2 rounded-full bg-[#FFEB69] mr-2"></span>预测</span></div></div>
        <div class="flex-1 w-full">
          <v-chart class="w-full h-full" :option="areaOption" autoresize />
        </div>
      </div>
      <div class="lg:col-span-7 bg-white rounded-3xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow h-[280px] flex flex-col justify-center">
          <h3 class="font-bold text-xl text-gray-800 mb-6">结算状态</h3>
          <div class="space-y-8 pr-4">
            <div><div class="flex justify-between text-sm mb-2"><span class="text-gray-500">未结算 (34单)</span><span class="font-bold text-[#A1D573] text-base">70%</span></div><div class="w-full bg-gray-100 rounded-full h-3"><div class="bg-[#A1D573] h-3 rounded-full" style="width: 70%;"></div></div></div>
            <div><div class="flex justify-between text-sm mb-2"><span class="text-gray-500">已结算 (10单)</span><span class="font-bold text-[#FFEB69] text-base">30%</span></div><div class="w-full bg-gray-100 rounded-full h-3"><div class="bg-[#FFEB69] h-3 rounded-full" style="width: 30%;"></div></div></div>
          </div>
      </div>
      <div class="lg:col-span-5 bg-white rounded-3xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow h-[280px] flex flex-col">
          <h3 class="font-bold text-xl text-gray-800 mb-2">区域分布</h3>
          <div class="flex-1 flex flex-row items-center">
              <div class="w-1/2 h-full relative">
                <v-chart class="w-full h-full" :option="distributionOption" autoresize />
              </div>
              <div class="w-1/2 flex flex-col justify-center gap-3 pl-2"><div v-for="(entry, index) in distributionData" :key="entry.name" class="flex items-center justify-between text-sm"><div class="flex items-center"><span class="w-2.5 h-2.5 rounded-full mr-2" :style="{ backgroundColor: COLORS_DIST[index % COLORS_DIST.length] }"></span><span class="text-gray-600 text-xs">{{ entry.name }}</span></div><span class="font-bold text-gray-800">{{ entry.value }}</span></div></div>
          </div>
      </div>
    </div>
  </div>
</div>
</template>
