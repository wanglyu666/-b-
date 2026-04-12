<script setup lang="ts">
import { computed, ref } from 'vue';
import { ChevronLeft, Search } from 'lucide-vue-next';
import type { OrganizationTeam } from '../types';

const props = defineProps<{
  teams: OrganizationTeam[];
}>();

const emit = defineEmits<{
  back: [];
}>();

const searchQuery = ref('');

const filteredTeams = computed(() => {
  const q = searchQuery.value.trim().toLowerCase().replace(/\s/g, '');
  if (!q) return props.teams;
  return props.teams.filter((t) => {
    const blob = `${t.name}${t.leader}${t.space}${t.createdAt}`.toLowerCase();
    return blob.replace(/\s/g, '').includes(q);
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
            <h1 class="text-3xl font-bold text-gray-800">团队</h1>
            <p class="mt-1 text-gray-500">查看与管理团队信息</p>
          </div>
        </div>

        <div
          class="relative w-full shrink-0 sm:mt-1 sm:ml-auto sm:w-auto sm:min-w-[280px] lg:min-w-[320px]"
        >
          <Search
            class="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-400"
            :size="18"
            aria-hidden="true"
          />
          <input
            v-model="searchQuery"
            type="search"
            placeholder="搜索团队名称、组长、负责空间…"
            class="w-full rounded-full border border-gray-200/80 bg-gray-100/80 py-2.5 pl-10 pr-4 text-sm text-gray-800 shadow-inner placeholder:text-gray-400 focus:border-[#9FE870]/50 focus:outline-none focus:ring-2 focus:ring-[#9FE870]/40"
          />
        </div>
      </header>

      <div
        class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
      >
        <article
          v-for="team in filteredTeams"
          :key="team.id"
          class="flex flex-col rounded-3xl border border-gray-100 bg-white/50 p-6 text-left shadow-sm backdrop-blur-sm transition-shadow hover:shadow-md"
        >
          <h2 class="mb-4 line-clamp-2 text-lg font-bold leading-snug text-gray-900">
            {{ team.name }}
          </h2>
          <div class="mb-4 flex shrink-0 gap-4">
            <div class="min-w-0 flex-1">
              <p class="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                组长
              </p>
              <p class="mt-1.5 text-sm font-semibold text-gray-800">
                {{ team.leader }}
              </p>
            </div>
            <div class="min-w-0 flex-1 text-left">
              <p class="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                创建时间
              </p>
              <p class="mt-1.5 font-mono text-sm font-semibold tabular-nums text-gray-800">
                {{ team.createdAt }}
              </p>
            </div>
          </div>
          <div class="mb-4 flex-shrink-0">
            <p class="text-[10px] font-bold uppercase tracking-wider text-gray-400">
              负责空间
            </p>
            <p class="mt-1.5 text-sm leading-relaxed text-gray-600">
              {{ team.space }}
            </p>
          </div>
          <div class="mt-auto flex flex-col">
            <p class="text-[10px] font-bold uppercase tracking-wider text-gray-400">
              包含人员
            </p>
            <div class="mt-3 flex flex-wrap items-center gap-0">
              <div
                v-for="(m, i) in team.members"
                :key="`${team.id}-${i}`"
                class="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white shadow-sm ring-1 ring-gray-900/15 sm:h-12 sm:w-12 sm:text-base"
                :class="i > 0 ? '-ml-3 sm:-ml-3.5' : ''"
                :style="{
                  backgroundColor: m.color,
                  zIndex: team.members.length - i,
                }"
              >
                {{ m.initial }}
              </div>
            </div>
          </div>
        </article>
      </div>

      <p
        v-if="filteredTeams.length === 0"
        class="py-16 text-center text-sm text-gray-500"
      >
        未找到匹配的团队
      </p>
    </div>
  </div>
</template>
