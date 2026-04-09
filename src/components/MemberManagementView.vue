<script setup lang="ts">
import { computed, ref } from 'vue';
import { ChevronLeft, Search } from 'lucide-vue-next';
import type { Member } from '../types';

const props = defineProps<{
  members: Member[];
}>();

const emit = defineEmits<{
  back: [];
}>();

const searchQuery = ref('');

const filteredMembers = computed(() => {
  const q = searchQuery.value.trim().toLowerCase().replace(/\s/g, '');
  if (!q) return props.members;
  return props.members.filter((m) => {
    const phone = (m.phone ?? '').toLowerCase().replace(/-/g, '');
    const qFlat = q.replace(/-/g, '');
    return (
      m.name.toLowerCase().includes(q) ||
      m.role.toLowerCase().includes(q) ||
      phone.includes(qFlat)
    );
  });
});
</script>

<template>
  <div class="relative z-10 min-h-screen overflow-x-hidden bg-transparent">
    <div class="mx-auto max-w-[1600px] animate-in fade-in duration-500 p-8">
      <header
        class="mb-8 flex flex-col gap-4 sm:mb-10 sm:flex-row sm:items-start sm:justify-between"
      >
        <div class="flex min-w-0 items-start gap-4">
          <button
            type="button"
            class="shrink-0 rounded-xl border border-white/20 bg-white/50 p-2 backdrop-blur-md transition-all hover:bg-white/80 active:scale-95"
            aria-label="返回"
            @click="emit('back')"
          >
            <ChevronLeft :size="20" class="text-gray-600" />
          </button>
          <div class="min-w-0">
            <h1 class="text-3xl font-bold text-gray-800">成员管理</h1>
            <p class="mt-1 text-gray-500">查看组织成员与联系方式</p>
          </div>
        </div>

        <div class="relative w-full shrink-0 sm:mt-1 sm:w-auto sm:min-w-[280px] lg:min-w-[320px]">
          <Search
            class="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-400"
            :size="18"
            aria-hidden="true"
          />
          <input
            v-model="searchQuery"
            type="search"
            placeholder="搜索姓名、角色、电话..."
            class="w-full rounded-full border border-gray-200/80 bg-gray-100/80 py-2.5 pl-10 pr-4 text-sm text-gray-800 shadow-inner placeholder:text-gray-400 focus:border-[#9FE870]/50 focus:outline-none focus:ring-2 focus:ring-[#9FE870]/40"
          />
        </div>
      </header>

      <div
        class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
      >
        <div
          v-for="m in filteredMembers"
          :key="m.id"
          class="flex flex-col items-center rounded-3xl border border-gray-100 bg-white/50 px-6 pb-8 pt-10 text-center shadow-sm backdrop-blur-sm"
        >
          <div
            :class="[
              'mb-5 flex h-24 w-24 shrink-0 items-center justify-center rounded-full text-2xl font-bold text-white shadow-sm',
              m.bgColor,
            ]"
          >
            {{ m.initial }}
          </div>
          <p class="text-lg font-bold text-gray-900">{{ m.name }}</p>
          <p class="mt-1.5 text-sm text-gray-600">{{ m.role }}</p>
          <p class="mt-1.5 text-sm tabular-nums text-gray-500">
            {{ m.phone ?? '—' }}
          </p>
        </div>
      </div>

      <p
        v-if="filteredMembers.length === 0"
        class="py-16 text-center text-sm text-gray-500"
      >
        未找到匹配的成员
      </p>
    </div>
  </div>
</template>
