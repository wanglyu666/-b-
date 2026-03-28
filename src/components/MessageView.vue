<script setup lang="ts">
import { ArrowLeft, Clock, FileText, FolderCheck, CalendarClock, Star, ClipboardCheck, ChevronRight } from 'lucide-vue-next';

type TodoItem = {
  id: number;
  title: string;
  content: string;
  projectName: string;
  projectId: string;
  projectStatus: string;
  viewMode: string;
  time: string;
  kind: 'report' | 'completion' | 'acceptance' | 'evaluation' | 'standards';
  unread?: boolean;
};

const props = defineProps<{
  todoItems: TodoItem[];
}>();

const emit = defineEmits(['back', 'openProjectView']);

const iconMap = {
  report: { icon: FileText, color: 'text-blue-400', bg: 'bg-blue-400/10' },
  completion: { icon: FolderCheck, color: 'text-indigo-400', bg: 'bg-indigo-400/10' },
  acceptance: { icon: CalendarClock, color: 'text-orange-400', bg: 'bg-orange-400/10' },
  evaluation: { icon: Star, color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
  standards: { icon: ClipboardCheck, color: 'text-teal-400', bg: 'bg-teal-400/10' },
} as const;

const handleMessageClick = (item: TodoItem) => {
  emit('openProjectView', {
    projectId: item.projectId,
    projectStatus: item.projectStatus,
    viewMode: item.viewMode
  });
};
</script>

<template>
  <div class="relative min-h-screen bg-transparent overflow-x-hidden w-full">
    <div class="relative z-10 px-4 sm:px-6 md:px-8 py-8 max-w-[1600px] mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
     <header class="flex-shrink-0 flex items-center gap-4">
           <button 
              @click="$emit('back')" 
              class="p-2 rounded-full bg-white border border-gray-200 hover:bg-gray-50 transition-colors"
           >
              <ArrowLeft :size="20" />
           </button>
           <h1 class="text-2xl font-bold text-gray-900">消息通知</h1>
     </header>

     <div class="mt-8 md:mt-12 space-y-4 pb-12">
        <div
          v-for="note in props.todoItems"
          :key="note.id"
          @click="handleMessageClick(note)"
          class="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-all cursor-pointer"
        >
           <div class="flex items-start gap-4">
              <div :class="['w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0', iconMap[note.kind].bg]">
                <component :is="iconMap[note.kind].icon" :size="20" :class="iconMap[note.kind].color" />
              </div>
              <div class="flex-1 min-w-0">
                <div class="flex justify-between items-start mb-1.5">
                  <h3 class="font-bold text-base text-gray-900 truncate pr-2">{{ note.title }}</h3>
                  <span v-if="note.unread !== false" class="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></span>
                </div>
                <p class="text-sm text-gray-500 mb-2 leading-relaxed">{{ note.projectName }}</p>
                <p class="text-gray-500 text-sm mb-3 leading-relaxed line-clamp-2">{{ note.content }}</p>
                <div class="flex items-center justify-between">
                  <div class="flex items-center text-xs text-gray-400 font-medium">
                    <Clock :size="14" class="mr-1.5" />
                    {{ note.time }}
                  </div>
                  <div class="flex items-center text-xs text-gray-400">
                    立即处理
                    <ChevronRight :size="14" class="ml-1" />
                  </div>
                </div>
              </div>
           </div>
        </div>
        
        <div class="text-center pt-8">
           <span class="text-gray-300 text-xs">没有更多消息了</span>
        </div>
     </div>
    </div>
  </div>
</template>
