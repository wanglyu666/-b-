<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { ChevronLeft, MoreHorizontal, Search } from 'lucide-vue-next';
import type { OrganizationSpace } from '../types';

const props = defineProps<{
  spaces: OrganizationSpace[];
}>();

const emit = defineEmits<{
  back: [];
}>();

const searchQuery = ref('');
const currentPage = ref(1);
const itemsPerPage = 8;

const filteredData = computed(() => {
  if (!searchQuery.value.trim()) return props.spaces;
  const q = searchQuery.value.toLowerCase();
  return props.spaces.filter(
    (row) =>
      row.name.toLowerCase().includes(q) ||
      row.owner.toLowerCase().includes(q) ||
      row.province.toLowerCase().includes(q) ||
      row.city.toLowerCase().includes(q) ||
      row.district.toLowerCase().includes(q) ||
      row.address.toLowerCase().includes(q),
  );
});

const totalPages = computed(() =>
  Math.max(1, Math.ceil(filteredData.value.length / itemsPerPage)),
);

const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  return filteredData.value.slice(start, start + itemsPerPage);
});

watch(searchQuery, () => {
  currentPage.value = 1;
});
</script>

<template>
  <div
    class="mx-auto max-w-[1600px] space-y-6 p-8 animate-in fade-in slide-in-from-bottom-4 duration-700"
  >
    <header class="mb-8 flex items-center justify-between">
      <div class="flex items-center space-x-4">
        <button
          type="button"
          class="rounded-xl border border-white/20 bg-white/50 p-2 backdrop-blur-md transition-all hover:bg-white/80 active:scale-95"
          @click="emit('back')"
        >
          <ChevronLeft :size="20" class="text-gray-600" />
        </button>
        <div>
          <h1 class="text-3xl font-bold text-gray-800">空间管理</h1>
          <p class="mt-1 text-gray-500">查看与管理所有空间信息</p>
        </div>
      </div>

      <div class="relative">
        <Search
          :size="18"
          class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
        />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="搜索名称/负责人/地址..."
          class="w-64 rounded-xl border border-white/20 bg-white/50 py-2 pl-10 pr-4 backdrop-blur-md transition-all focus:border-white/20 focus:outline-none focus:ring-0 focus-visible:ring-0"
        />
      </div>
    </header>

    <div
      class="overflow-hidden rounded-[32px] border border-white/30 bg-white/40 shadow-xl backdrop-blur-xl"
    >
      <div class="flex items-center space-x-3 border-b border-white/20 p-6">
        <div class="h-6 w-1.5 rounded-full bg-[#FFEB69]" />
        <h2 class="text-xl font-bold text-gray-800">空间列表</h2>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full border-collapse text-left">
          <thead>
            <tr
              class="border-b border-white/10 text-sm font-medium text-gray-500"
            >
              <th class="px-6 py-5">序号</th>
              <th class="px-6 py-5">名称</th>
              <th class="px-6 py-5">负责人</th>
              <th class="px-6 py-5">省</th>
              <th class="px-6 py-5">市</th>
              <th class="px-6 py-5">区/县</th>
              <th class="min-w-[200px] px-6 py-5">具体位置</th>
              <th class="px-6 py-5">面积</th>
              <th class="w-20 px-6 py-5" />
            </tr>
          </thead>
          <tbody class="divide-y divide-white/10">
            <tr
              v-for="(row, index) in paginatedData"
              :key="row.id"
              class="group transition-colors hover:bg-white/30"
            >
              <td class="px-6 py-5 text-gray-600">
                {{ (currentPage - 1) * itemsPerPage + index + 1 }}
              </td>
              <td class="px-6 py-5 font-medium text-gray-800">{{ row.name }}</td>
              <td class="px-6 py-5 text-gray-700">{{ row.owner }}</td>
              <td class="px-6 py-5 text-gray-600">{{ row.province }}</td>
              <td class="px-6 py-5 text-gray-600">{{ row.city }}</td>
              <td class="px-6 py-5 text-gray-600">{{ row.district }}</td>
              <td
                class="max-w-md px-6 py-5 text-gray-500"
                :title="row.address"
              >
                <span class="line-clamp-2">{{ row.address }}</span>
              </td>
              <td class="whitespace-nowrap px-6 py-5 text-gray-700">
                {{ row.area }}
              </td>
              <td class="px-6 py-5">
                <button
                  type="button"
                  class="rounded-lg p-2 text-gray-400 transition-all hover:bg-white/50 hover:text-[#E2943A]"
                  aria-label="更多操作"
                >
                  <MoreHorizontal :size="20" />
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div
        class="flex items-center justify-between border-t border-white/10 p-6 text-sm text-gray-500"
      >
        <p>
          显示 {{ (currentPage - 1) * itemsPerPage + 1 }} 到
          {{
            Math.min(currentPage * itemsPerPage, filteredData.length)
          }}
          条，共 {{ filteredData.length }} 条记录
        </p>
        <div class="flex space-x-2">
          <button
            type="button"
            class="rounded-lg border border-white/20 bg-white/50 px-3 py-1 transition-colors hover:bg-white/80 disabled:opacity-50"
            :disabled="currentPage <= 1"
            @click="currentPage > 1 && currentPage--"
          >
            上一页
          </button>
          <button
            v-for="page in totalPages"
            :key="page"
            type="button"
            :class="[
              'rounded-lg border px-3 py-1 shadow-sm transition-colors tabular-nums',
              currentPage === page
                ? 'border-[#FFEB69] bg-[#FFEB69] text-[#3A341C]'
                : 'border-white/20 bg-white/50 text-[#3A341C] hover:bg-white/80',
            ]"
            @click="currentPage = page"
          >
            {{ page }}
          </button>
          <button
            type="button"
            class="rounded-lg border border-white/20 bg-white/50 px-3 py-1 transition-colors hover:bg-white/80 disabled:opacity-50"
            :disabled="currentPage >= totalPages"
            @click="currentPage < totalPages && currentPage++"
          >
            下一页
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
