<script setup lang="ts">
import { ref } from 'vue';
import { ArrowLeft, Search } from 'lucide-vue-next';
import ImagePreviewModal from './engineering/ImagePreviewModal.vue';
import businessLicenseSample from '../../image asset/post1.png';

defineEmits<{
  back: [];
}>();

withDefaults(
  defineProps<{
    companyName?: string;
    businessLicenseUrl?: string;
    industry?: string;
    name?: string;
    position?: string;
    contact?: string;
    email?: string;
    serviceArea?: string;
  }>(),
  {
    companyName: '这么派（上海）科技有限公司',
    businessLicenseUrl: businessLicenseSample,
    industry: '建筑装饰与工程服务',
    name: '管理员',
    position: '系统管理员',
    contact: '138-0013-8000',
    email: 'admin@justpai.com',
    serviceArea: '上海市、江苏省、浙江省',
  },
);

const isImageZoomed = ref(false);

const textFields = [
  { key: 'companyName', label: '公司名称' },
  { key: 'industry', label: '所属行业' },
  { key: 'name', label: '姓名' },
  { key: 'position', label: '职位' },
  { key: 'contact', label: '联系方式' },
  { key: 'email', label: '邮箱' },
  { key: 'serviceArea', label: '服务区域' },
] as const;
</script>

<template>
  <div
    class="mx-auto flex w-full max-w-6xl flex-1 flex-col animate-in fade-in slide-in-from-bottom-2 duration-500"
  >
    <button
      type="button"
      class="mb-4 inline-flex w-fit items-center gap-2 rounded-lg px-2 py-1.5 text-sm font-medium text-gray-600 transition-colors hover:bg-white/50 hover:text-gray-900"
      @click="$emit('back')"
    >
      <ArrowLeft :size="18" />
      返回
    </button>

    <div
      class="flex min-h-[calc(100vh-10rem)] flex-1 flex-col overflow-hidden rounded-3xl border border-white/20 bg-white/70 shadow-sm backdrop-blur-md"
    >
      <div class="flex flex-1 flex-col px-6 py-10 sm:px-10 sm:py-12">
        <h2 class="text-xl font-bold text-gray-900 sm:text-2xl">基本注册信息</h2>

        <div class="mt-8 space-y-5 sm:mt-10 sm:space-y-6">
          <div class="border-b border-gray-200/60 pb-5 sm:pb-6">
            <p class="text-sm text-gray-500 sm:text-base">公司名称</p>
            <p class="mt-1.5 text-base font-medium text-gray-900 sm:mt-2 sm:text-lg">
              {{ companyName }}
            </p>
          </div>

          <div class="border-b border-gray-200/60 pb-5 sm:pb-6">
            <p class="text-sm text-gray-500 sm:text-base">营业执照</p>
            <div
              class="group relative mt-2 h-[150px] w-[240px] cursor-pointer overflow-hidden rounded-lg border border-gray-200/80 sm:mt-3 sm:h-[170px] sm:w-[280px]"
              @click="isImageZoomed = true"
            >
              <img
                :src="businessLicenseUrl"
                alt="营业执照"
                class="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div
                class="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 transition-all group-hover:bg-black/10 group-hover:opacity-100"
              >
                <div
                  class="rounded-full border border-white/30 bg-white/20 p-3 shadow-lg backdrop-blur-md sm:p-4"
                >
                  <Search :size="24" class="text-white sm:hidden" />
                  <Search :size="28" class="hidden text-white sm:block" />
                </div>
              </div>
            </div>
          </div>

          <div
            v-for="field in textFields.slice(1)"
            :key="field.key"
            class="border-b border-gray-200/60 pb-5 last:border-b-0 last:pb-0 sm:pb-6"
          >
            <p class="text-sm text-gray-500 sm:text-base">{{ field.label }}</p>
            <p class="mt-1.5 text-base font-medium text-gray-900 sm:mt-2 sm:text-lg">
              {{ $props[field.key] }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <ImagePreviewModal
      :is-open="isImageZoomed"
      :image-url="businessLicenseUrl"
      @close="isImageZoomed = false"
    />
  </div>
</template>
