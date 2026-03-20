<template>
  <div class="animate-in slide-in-from-left-4 duration-500">
    <div class="bg-white/5 backdrop-blur-xl rounded-[32px] p-8 mb-8 border border-white/10 shadow-inner">
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-y-8 gap-x-12">
        <div>
          <p class="text-xs text-white/40 uppercase tracking-widest font-bold mb-2">项目编号</p>
          <p class="font-bold text-white text-xl font-mono tracking-tight">{{ project.no }}</p>
        </div>
        <div>
          <p class="text-xs text-white/40 uppercase tracking-widest font-bold mb-2">项目名称</p>
          <p class="font-bold text-white text-xl tracking-tight">{{ project.name }}</p>
        </div>
        <div class="sm:col-span-2">
          <p class="text-xs text-white/40 uppercase tracking-widest font-bold mb-2">项目地址</p>
          <p class="font-bold text-white text-xl tracking-tight">{{ project.address }}</p>
        </div>
        <div>
          <p class="text-xs text-white/40 uppercase tracking-widest font-bold mb-2">合同金额</p>
          <p class="font-bold text-white text-3xl tracking-tighter">{{ project.amount }}</p>
        </div>
        <div>
          <p class="text-xs text-white/40 uppercase tracking-widest font-bold mb-2">项目状态</p>
          <div class="inline-flex items-center px-3 py-1 rounded-full bg-[#A1D573]/20 border border-[#A1D573]/30 text-[#A1D573] text-sm font-bold">
            {{ project.status }}
          </div>
        </div>
        <div>
          <p class="text-xs text-white/40 uppercase tracking-widest font-bold mb-2">项目负责人</p>
          <p class="font-bold text-white text-xl tracking-tight">{{ project.manager }}</p>
        </div>
        <div>
          <p class="text-xs text-white/40 uppercase tracking-widest font-bold mb-2">联系方式</p>
          <p class="font-bold text-white text-xl font-mono tracking-tight">{{ project.contact }}</p>
        </div>
      </div>
    </div>
    
    <!-- 操作按钮组 -->
    <h3 class="text-sm font-bold text-white/40 uppercase tracking-widest mb-6 px-2">项目操作指令</h3>
    <div class="flex flex-col gap-4">
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <button @click="$emit('enterReports')" class="py-4 px-4 bg-white/5 backdrop-blur-lg border border-white/10 hover:bg-white/15 text-white font-bold text-sm rounded-2xl transition-all flex flex-col items-center justify-center gap-3 group">
          <div class="text-blue-400 group-hover:scale-110 group-hover:drop-shadow-[0_0_8px_rgba(96,165,250,0.5)] transition-all"><FileText :size="20" /></div>
          <span class="tracking-wide">施工报告</span>
        </button>
        <button @click="$emit('enterAcceptance')" class="py-4 px-4 bg-white/5 backdrop-blur-lg border border-white/10 hover:bg-white/15 text-white font-bold text-sm rounded-2xl transition-all flex flex-col items-center justify-center gap-3 group">
          <div class="text-orange-400 group-hover:scale-110 group-hover:drop-shadow-[0_0_8px_rgba(251,146,60,0.5)] transition-all"><ClipboardCheck :size="20" /></div>
          <span class="tracking-wide">过程验收</span>
        </button>
        <button @click="$emit('enterAfterSales')" class="py-4 px-4 bg-white/5 backdrop-blur-lg border border-white/10 hover:bg-white/15 text-white font-bold text-sm rounded-2xl transition-all flex flex-col items-center justify-center gap-3 group">
          <div class="text-pink-400 group-hover:scale-110 group-hover:drop-shadow-[0_0_8px_rgba(244,114,182,0.5)] transition-all"><Headset :size="20" /></div>
          <span class="tracking-wide">售后计划</span>
        </button>
        <button @click="$emit('enterCompletion')" class="py-4 px-4 bg-white/5 backdrop-blur-lg border border-white/10 hover:bg-white/15 text-white font-bold text-sm rounded-2xl transition-all flex flex-col items-center justify-center gap-3 group">
          <div class="text-indigo-400 group-hover:scale-110 group-hover:drop-shadow-[0_0_8px_rgba(129,140,248,0.5)] transition-all"><FolderCheck :size="20" /></div>
          <span class="tracking-wide">竣工资料</span>
        </button>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <button @click="$emit('enterDefects')" class="py-4 px-4 bg-white/5 backdrop-blur-lg border border-white/10 hover:bg-white/15 text-white font-bold text-sm rounded-2xl transition-all flex items-center justify-center gap-4 group">
          <div class="text-rose-400 group-hover:scale-110 transition-all"><AlertTriangle :size="20" /></div>
          <span class="tracking-wide">缺陷汇报</span>
        </button>
        <button @click="$emit('enterEvaluation')" class="py-4 px-4 bg-white/5 backdrop-blur-lg border border-white/10 hover:bg-white/15 text-white font-bold text-sm rounded-2xl transition-all flex items-center justify-center gap-4 group">
          <div class="text-yellow-400 group-hover:scale-110 transition-all"><Star :size="20" /></div>
          <span class="tracking-wide">项目评价</span>
        </button>
        <button @click="$emit('enterStandards')" class="py-4 px-4 bg-white/5 backdrop-blur-lg border border-white/10 hover:bg-white/15 text-white font-bold text-sm rounded-2xl transition-all flex items-center justify-center gap-4 group">
          <div class="text-[#A1D573] group-hover:scale-110 transition-all"><ShieldCheck :size="20" /></div>
          <span class="tracking-wide">施工标准</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { FileText, ClipboardCheck, Headset, FolderCheck, AlertTriangle, Star, ShieldCheck } from 'lucide-vue-next';
import type { EngineeringProject } from '@/data';

defineProps<{
  project: EngineeringProject;
}>();

defineEmits(['enterAcceptance', 'enterDefects', 'enterAfterSales', 'enterEvaluation', 'enterCompletion', 'enterStandards', 'enterReports']);
</script>
