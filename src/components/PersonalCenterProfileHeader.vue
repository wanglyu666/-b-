<script setup lang="ts">
import coverBg from '../../image asset/background.png';

withDefaults(
  defineProps<{
    name?: string;
    role?: string;
    avatarUrl?: string;
    contact?: string;
    email?: string;
    department?: string;
  }>(),
  {
    name: '管理员',
    role: '系统管理员',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Cooper',
    contact: '138-0013-8000',
    email: 'admin@justpai.com',
    department: '系统管理部',
  },
);

defineEmits<{
  edit: [];
}>();
</script>

<template>
  <div
    class="mx-auto w-full max-w-6xl overflow-hidden rounded-3xl border border-white/20 shadow-sm"
  >
    <div class="relative h-56 sm:h-72">
      <img :src="coverBg" alt="" class="h-full w-full object-cover" />
    </div>

    <div
      class="relative border-t border-white/20 bg-white/50 px-6 pb-4 backdrop-blur-md sm:px-8 sm:pb-5"
    >
      <div class="flex min-w-0 flex-col">
          <div class="flex min-w-0 items-end gap-4 sm:gap-5">
            <img
              :src="avatarUrl"
              alt=""
              class="-mt-12 ml-3 h-32 w-32 shrink-0 rounded-full border-4 border-white bg-gray-100 object-cover shadow-sm sm:-mt-14 sm:ml-4 sm:h-36 sm:w-36"
            />
            <div class="min-w-0 -translate-y-5 sm:-translate-y-6">
              <h2 class="truncate text-xl font-bold text-gray-800 sm:text-2xl">
                {{ name }}
              </h2>
              <p class="mt-0.5 text-sm text-gray-500 sm:text-base">{{ role }}</p>
            </div>
          </div>
          <div class="-mt-0.5 flex gap-4 sm:-mt-1 sm:gap-5">
            <div
              class="ml-3 h-0 w-32 shrink-0 sm:ml-4 sm:w-36"
              aria-hidden="true"
            />
            <div class="min-w-0 space-y-1 text-sm sm:space-y-1.5 sm:text-base">
              <p class="text-gray-500">
                联系方式：<span class="font-medium text-gray-700">{{ contact }}</span>
              </p>
              <p class="text-gray-500">
                邮箱：<span class="font-medium text-gray-700">{{ email }}</span>
              </p>
              <p class="text-gray-500">
                部门：<span class="font-medium text-gray-700">{{ department }}</span>
              </p>
            </div>
          </div>
      </div>

      <button
        type="button"
        class="absolute bottom-4 right-6 rounded-lg bg-[#B0D4C5] px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#9bc4b3] sm:bottom-5 sm:right-8"
        @click="$emit('edit')"
      >
        编辑资料
      </button>
    </div>
  </div>
</template>
