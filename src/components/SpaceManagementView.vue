<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { ChevronLeft, MoreHorizontal, Plus, Search, X } from 'lucide-vue-next';
import { useOrgStore } from '../stores/orgStore';
import type { OrganizationSpace } from '../types';
import checkMarkImg from '../../image asset/check mark.png';

const orgStore = useOrgStore();

const emit = defineEmits<{
  back: [];
}>();

const searchQuery = ref('');
const currentPage = ref(1);
const itemsPerPage = 8;

/** 新增空间弹窗 */
const addSpaceModalOpen = ref(false);
const addSpaceStep = ref<'form' | 'success'>('form');

const draftAddName = ref('');
const draftAddProvince = ref('');
const draftAddCity = ref('');
const draftAddDistrict = ref('');
const draftAddAddress = ref('');
const draftAddArea = ref('');

const addSpaceFormValid = computed(
  () =>
    draftAddName.value.trim() !== '' &&
    draftAddProvince.value.trim() !== '' &&
    draftAddCity.value.trim() !== '' &&
    draftAddDistrict.value.trim() !== '' &&
    draftAddAddress.value.trim() !== '' &&
    draftAddArea.value.trim() !== '',
);

const filteredData = computed(() => {
  const list = orgStore.spaces;
  if (!searchQuery.value.trim()) return list;
  const q = searchQuery.value.toLowerCase();
  return list.filter(
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

function normalizeAreaDisplay(raw: string): string {
  const t = raw.trim();
  if (!t) return t;
  if (/[㎡m²]/i.test(t)) return t;
  return `${t}㎡`;
}

function openAddSpaceModal() {
  draftAddName.value = '';
  draftAddProvince.value = '';
  draftAddCity.value = '';
  draftAddDistrict.value = '';
  draftAddAddress.value = '';
  draftAddArea.value = '';
  addSpaceStep.value = 'form';
  addSpaceModalOpen.value = true;
}

function closeAddSpaceModal() {
  addSpaceModalOpen.value = false;
  addSpaceStep.value = 'form';
}

function confirmAddSpace() {
  if (!addSpaceFormValid.value) return;
  orgStore.addSpace({
    id: `s-${Date.now()}`,
    name: draftAddName.value.trim(),
    /** 负责人在成员管理中分配，此处不设置 */
    owner: '—',
    province: draftAddProvince.value.trim(),
    city: draftAddCity.value.trim(),
    district: draftAddDistrict.value.trim(),
    address: draftAddAddress.value.trim(),
    area: normalizeAreaDisplay(draftAddArea.value),
  });
  addSpaceStep.value = 'success';
}

function onSuccessClose() {
  closeAddSpaceModal();
}

/** 编辑空间（除负责人外可改，与新增字段一致） */
const editSpaceModalOpen = ref(false);
const editSpaceStep = ref<'form' | 'success'>('form');
const editingSpaceId = ref('');
const draftEditName = ref('');
const draftEditProvince = ref('');
const draftEditCity = ref('');
const draftEditDistrict = ref('');
const draftEditAddress = ref('');
const draftEditArea = ref('');
/** 仅展示，不可编辑 */
const draftEditOwnerDisplay = ref('');

const editSpaceFormValid = computed(
  () =>
    draftEditName.value.trim() !== '' &&
    draftEditProvince.value.trim() !== '' &&
    draftEditCity.value.trim() !== '' &&
    draftEditDistrict.value.trim() !== '' &&
    draftEditAddress.value.trim() !== '' &&
    draftEditArea.value.trim() !== '',
);

function openEditSpace(row: OrganizationSpace) {
  editingSpaceId.value = row.id;
  draftEditName.value = row.name;
  draftEditProvince.value = row.province;
  draftEditCity.value = row.city;
  draftEditDistrict.value = row.district;
  draftEditAddress.value = row.address;
  draftEditArea.value = row.area.replace(/㎡$|m²$/i, '').trim();
  draftEditOwnerDisplay.value = row.owner;
  editSpaceStep.value = 'form';
  editSpaceModalOpen.value = true;
}

function closeEditSpaceModal() {
  editSpaceModalOpen.value = false;
  editSpaceStep.value = 'form';
  editingSpaceId.value = '';
}

function confirmEditSpace() {
  if (!editSpaceFormValid.value || !editingSpaceId.value) return;
  orgStore.updateSpace(editingSpaceId.value, {
    name: draftEditName.value.trim(),
    province: draftEditProvince.value.trim(),
    city: draftEditCity.value.trim(),
    district: draftEditDistrict.value.trim(),
    address: draftEditAddress.value.trim(),
    area: normalizeAreaDisplay(draftEditArea.value),
  });
  editSpaceStep.value = 'success';
}

function onEditSpaceSuccessClose() {
  closeEditSpaceModal();
}
</script>

<template>
  <div
    class="mx-auto max-w-[1600px] space-y-6 p-8 animate-in fade-in slide-in-from-bottom-4 duration-700"
  >
    <header class="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
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

      <div class="flex w-full flex-shrink-0 items-center justify-end gap-3 sm:w-auto">
        <button
          type="button"
          class="flex shrink-0 items-center justify-center gap-2 rounded-full border border-gray-200/80 bg-gray-100/80 px-5 py-2.5 text-sm font-bold text-gray-800 shadow-inner transition hover:bg-white/90 focus:outline-none focus:ring-2 focus:ring-[#9FE870]/40 active:scale-[0.99]"
          @click="openAddSpaceModal"
        >
          <Plus :size="18" class="text-gray-600" aria-hidden="true" />
          新增
        </button>
        <div class="relative min-w-0 flex-1 sm:min-w-[16rem] sm:flex-initial">
          <Search
            :size="18"
            class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="搜索名称/负责人/地址..."
            class="w-full rounded-xl border border-white/20 bg-white/50 py-2 pl-10 pr-4 backdrop-blur-md transition-all focus:border-white/20 focus:outline-none focus:ring-0 focus-visible:ring-0 sm:w-64"
          />
        </div>
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
                  aria-label="编辑空间"
                  @click.stop="openEditSpace(row)"
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

    <Teleport to="body">
      <div
        v-if="addSpaceModalOpen"
        class="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4 backdrop-blur-md animate-in fade-in duration-300 sm:p-6"
        role="dialog"
        aria-modal="true"
        :aria-labelledby="
          addSpaceStep === 'form' ? 'space-add-title' : 'space-add-success-title'
        "
        @click.self="closeAddSpaceModal"
      >
        <div
          class="jp-modal-morph flex max-h-[min(92vh,860px)] w-full max-w-xl flex-col overflow-hidden border border-white/20 shadow-2xl backdrop-blur-2xl"
          :style="{
            '--jp-modal-w': '560px',
            '--jp-modal-w-max': '560px',
            '--jp-modal-h': addSpaceStep === 'form' ? '680px' : '520px',
            '--jp-modal-radius': '32px',
            '--jp-modal-scale': '1',
            '--jp-modal-bg': 'rgba(255, 255, 255, 0.15)',
          }"
          @click.stop
        >
          <template v-if="addSpaceStep === 'form'">
            <div
              class="flex shrink-0 items-center justify-between border-b border-white/10 px-6 py-5 sm:px-8 sm:py-6"
            >
              <div class="flex min-w-0 items-center gap-2 sm:gap-3">
                <div
                  class="h-6 w-1.5 shrink-0 rounded-full bg-[#FFE600] shadow-[0_0_15px_rgba(255,230,0,0.5)]"
                />
                <h2
                  id="space-add-title"
                  class="truncate text-xl font-bold tracking-tight text-white sm:text-2xl"
                >
                  新增空间
                </h2>
              </div>
              <button
                type="button"
                class="rounded-full p-2 text-white/70 transition-all hover:bg-white/10 hover:text-white"
                aria-label="关闭"
                @click="closeAddSpaceModal"
              >
                <X :size="24" />
              </button>
            </div>
            <div
              class="custom-scrollbar min-h-0 flex-1 overflow-y-auto overflow-x-hidden p-6 sm:p-8"
            >
              <div class="flex flex-col gap-5">
                <p class="text-sm text-white/60">
                  填写空间信息。负责人请在「成员管理」中通过空间分配设置，此处无需填写。
                </p>
                <div class="space-y-2">
                  <label
                    for="space-add-name"
                    class="block text-xs font-bold uppercase tracking-widest text-white/40"
                  >
                    名称
                  </label>
                  <input
                    id="space-add-name"
                    v-model="draftAddName"
                    type="text"
                    maxlength="128"
                    class="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2.5 text-sm text-white placeholder:text-white/35 focus:border-[#FFE600]/50 focus:outline-none focus:ring-1 focus:ring-[#FFE600]/40"
                  />
                </div>
                <div class="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <div class="space-y-2">
                    <label
                      for="space-add-province"
                      class="block text-xs font-bold uppercase tracking-widest text-white/40"
                    >
                      省
                    </label>
                    <input
                      id="space-add-province"
                      v-model="draftAddProvince"
                      type="text"
                      maxlength="64"
                      class="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2.5 text-sm text-white placeholder:text-white/35 focus:border-[#FFE600]/50 focus:outline-none focus:ring-1 focus:ring-[#FFE600]/40"
                    />
                  </div>
                  <div class="space-y-2">
                    <label
                      for="space-add-city"
                      class="block text-xs font-bold uppercase tracking-widest text-white/40"
                    >
                      市
                    </label>
                    <input
                      id="space-add-city"
                      v-model="draftAddCity"
                      type="text"
                      maxlength="64"
                      class="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2.5 text-sm text-white placeholder:text-white/35 focus:border-[#FFE600]/50 focus:outline-none focus:ring-1 focus:ring-[#FFE600]/40"
                    />
                  </div>
                  <div class="space-y-2">
                    <label
                      for="space-add-district"
                      class="block text-xs font-bold uppercase tracking-widest text-white/40"
                    >
                      区/县
                    </label>
                    <input
                      id="space-add-district"
                      v-model="draftAddDistrict"
                      type="text"
                      maxlength="64"
                      class="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2.5 text-sm text-white placeholder:text-white/35 focus:border-[#FFE600]/50 focus:outline-none focus:ring-1 focus:ring-[#FFE600]/40"
                    />
                  </div>
                  <div class="space-y-2">
                    <label
                      for="space-add-area"
                      class="block text-xs font-bold uppercase tracking-widest text-white/40"
                    >
                      面积
                    </label>
                    <input
                      id="space-add-area"
                      v-model="draftAddArea"
                      type="text"
                      maxlength="32"
                      placeholder="如 1000 或 1000㎡"
                      class="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2.5 text-sm text-white placeholder:text-white/35 focus:border-[#FFE600]/50 focus:outline-none focus:ring-1 focus:ring-[#FFE600]/40"
                    />
                  </div>
                </div>
                <div class="space-y-2">
                  <label
                    for="space-add-address"
                    class="block text-xs font-bold uppercase tracking-widest text-white/40"
                  >
                    具体位置
                  </label>
                  <textarea
                    id="space-add-address"
                    v-model="draftAddAddress"
                    rows="3"
                    maxlength="500"
                    class="w-full resize-y rounded-xl border border-white/15 bg-white/5 px-3 py-2.5 text-sm leading-relaxed text-white placeholder:text-white/35 focus:border-[#FFE600]/50 focus:outline-none focus:ring-1 focus:ring-[#FFE600]/40"
                  />
                </div>
                <div class="flex justify-end border-t border-white/10 pt-5">
                  <button
                    type="button"
                    class="rounded-xl bg-[#FFE600] px-8 py-2.5 text-sm font-bold text-[#260A2F] shadow-[0_0_15px_rgba(255,230,0,0.25)] transition hover:brightness-95 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
                    :disabled="!addSpaceFormValid"
                    @click="confirmAddSpace"
                  >
                    确认
                  </button>
                </div>
              </div>
            </div>
          </template>

          <template v-else>
            <div
              class="flex min-h-[min(420px,52vh)] flex-col items-center justify-center px-6 py-10 sm:px-10"
            >
              <img
                :src="checkMarkImg"
                alt=""
                class="mb-6 h-36 w-56 object-contain"
              />
              <h2
                id="space-add-success-title"
                class="mb-4 text-3xl font-bold tracking-tight text-white"
              >
                已完成提交
              </h2>
              <p class="mb-10 max-w-md text-center text-white/60">
                新空间信息已成功添加至系统中。负责人请在成员管理中分配。
              </p>
              <button
                type="button"
                class="rounded-xl border border-white/10 bg-white/10 px-8 py-3 font-bold text-white transition-colors hover:bg-white/20"
                @click="onSuccessClose"
              >
                返回空间列表
              </button>
            </div>
          </template>
        </div>
      </div>
    </Teleport>

    <Teleport to="body">
      <div
        v-if="editSpaceModalOpen"
        class="fixed inset-0 z-[101] flex items-center justify-center bg-black/40 p-4 backdrop-blur-md animate-in fade-in duration-300 sm:p-6"
        role="dialog"
        aria-modal="true"
        :aria-labelledby="
          editSpaceStep === 'form' ? 'space-edit-title' : 'space-edit-success-title'
        "
        @click.self="closeEditSpaceModal"
      >
        <div
          class="jp-modal-morph flex max-h-[min(92vh,860px)] w-full max-w-xl flex-col overflow-hidden border border-white/20 shadow-2xl backdrop-blur-2xl"
          :style="{
            '--jp-modal-w': '560px',
            '--jp-modal-w-max': '560px',
            '--jp-modal-h': editSpaceStep === 'form' ? '720px' : '520px',
            '--jp-modal-radius': '32px',
            '--jp-modal-scale': '1',
            '--jp-modal-bg': 'rgba(255, 255, 255, 0.15)',
          }"
          @click.stop
        >
          <template v-if="editSpaceStep === 'form'">
            <div
              class="flex shrink-0 items-center justify-between border-b border-white/10 px-6 py-5 sm:px-8 sm:py-6"
            >
              <div class="flex min-w-0 items-center gap-2 sm:gap-3">
                <div
                  class="h-6 w-1.5 shrink-0 rounded-full bg-[#FFE600] shadow-[0_0_15px_rgba(255,230,0,0.5)]"
                />
                <h2
                  id="space-edit-title"
                  class="truncate text-xl font-bold tracking-tight text-white sm:text-2xl"
                >
                  编辑空间
                </h2>
              </div>
              <div class="flex shrink-0 items-center gap-3 sm:gap-4">
                <button
                  type="button"
                  class="text-sm font-bold text-white/80 transition-colors hover:text-white"
                  aria-label="返回"
                  @click="closeEditSpaceModal"
                >
                  返回
                </button>
                <button
                  type="button"
                  class="rounded-full p-2 text-white/70 transition-all hover:bg-white/10 hover:text-white"
                  aria-label="关闭"
                  @click="closeEditSpaceModal"
                >
                  <X :size="24" />
                </button>
              </div>
            </div>
            <div
              class="custom-scrollbar min-h-0 flex-1 overflow-y-auto overflow-x-hidden p-6 sm:p-8"
            >
              <div class="flex flex-col gap-5">
                <p class="text-sm text-white/60">
                  可修改除负责人外的字段。负责人请在「成员管理」中通过空间分配设置。
                </p>
                <div class="space-y-2">
                  <label
                    for="space-edit-owner"
                    class="block text-xs font-bold uppercase tracking-widest text-white/40"
                  >
                    负责人（只读）
                  </label>
                  <input
                    id="space-edit-owner"
                    type="text"
                    readonly
                    tabindex="-1"
                    :value="draftEditOwnerDisplay"
                    class="w-full cursor-not-allowed rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5 text-sm text-white/55"
                  />
                </div>
                <div class="space-y-2">
                  <label
                    for="space-edit-name"
                    class="block text-xs font-bold uppercase tracking-widest text-white/40"
                  >
                    名称
                  </label>
                  <input
                    id="space-edit-name"
                    v-model="draftEditName"
                    type="text"
                    maxlength="128"
                    class="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2.5 text-sm text-white placeholder:text-white/35 focus:border-[#FFE600]/50 focus:outline-none focus:ring-1 focus:ring-[#FFE600]/40"
                  />
                </div>
                <div class="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <div class="space-y-2">
                    <label
                      for="space-edit-province"
                      class="block text-xs font-bold uppercase tracking-widest text-white/40"
                    >
                      省
                    </label>
                    <input
                      id="space-edit-province"
                      v-model="draftEditProvince"
                      type="text"
                      maxlength="64"
                      class="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2.5 text-sm text-white placeholder:text-white/35 focus:border-[#FFE600]/50 focus:outline-none focus:ring-1 focus:ring-[#FFE600]/40"
                    />
                  </div>
                  <div class="space-y-2">
                    <label
                      for="space-edit-city"
                      class="block text-xs font-bold uppercase tracking-widest text-white/40"
                    >
                      市
                    </label>
                    <input
                      id="space-edit-city"
                      v-model="draftEditCity"
                      type="text"
                      maxlength="64"
                      class="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2.5 text-sm text-white placeholder:text-white/35 focus:border-[#FFE600]/50 focus:outline-none focus:ring-1 focus:ring-[#FFE600]/40"
                    />
                  </div>
                  <div class="space-y-2">
                    <label
                      for="space-edit-district"
                      class="block text-xs font-bold uppercase tracking-widest text-white/40"
                    >
                      区/县
                    </label>
                    <input
                      id="space-edit-district"
                      v-model="draftEditDistrict"
                      type="text"
                      maxlength="64"
                      class="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2.5 text-sm text-white placeholder:text-white/35 focus:border-[#FFE600]/50 focus:outline-none focus:ring-1 focus:ring-[#FFE600]/40"
                    />
                  </div>
                  <div class="space-y-2">
                    <label
                      for="space-edit-area"
                      class="block text-xs font-bold uppercase tracking-widest text-white/40"
                    >
                      面积
                    </label>
                    <input
                      id="space-edit-area"
                      v-model="draftEditArea"
                      type="text"
                      maxlength="32"
                      placeholder="如 1000 或 1000㎡"
                      class="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2.5 text-sm text-white placeholder:text-white/35 focus:border-[#FFE600]/50 focus:outline-none focus:ring-1 focus:ring-[#FFE600]/40"
                    />
                  </div>
                </div>
                <div class="space-y-2">
                  <label
                    for="space-edit-address"
                    class="block text-xs font-bold uppercase tracking-widest text-white/40"
                  >
                    具体位置
                  </label>
                  <textarea
                    id="space-edit-address"
                    v-model="draftEditAddress"
                    rows="3"
                    maxlength="500"
                    class="w-full resize-y rounded-xl border border-white/15 bg-white/5 px-3 py-2.5 text-sm leading-relaxed text-white placeholder:text-white/35 focus:border-[#FFE600]/50 focus:outline-none focus:ring-1 focus:ring-[#FFE600]/40"
                  />
                </div>
                <div class="flex justify-end border-t border-white/10 pt-5">
                  <button
                    type="button"
                    class="rounded-xl bg-[#FFE600] px-8 py-2.5 text-sm font-bold text-[#260A2F] shadow-[0_0_15px_rgba(255,230,0,0.25)] transition hover:brightness-95 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
                    :disabled="!editSpaceFormValid"
                    @click="confirmEditSpace"
                  >
                    确认
                  </button>
                </div>
              </div>
            </div>
          </template>

          <template v-else>
            <div
              class="flex min-h-[min(420px,52vh)] flex-col items-center justify-center px-6 py-10 sm:px-10"
            >
              <img
                :src="checkMarkImg"
                alt=""
                class="mb-6 h-36 w-56 object-contain"
              />
              <h2
                id="space-edit-success-title"
                class="mb-4 text-3xl font-bold tracking-tight text-white"
              >
                已完成提交
              </h2>
              <p class="mb-10 max-w-md text-center text-white/60">
                空间信息已成功更新至系统中。
              </p>
              <button
                type="button"
                class="rounded-xl border border-white/10 bg-white/10 px-8 py-3 font-bold text-white transition-colors hover:bg-white/20"
                @click="onEditSpaceSuccessClose"
              >
                返回空间列表
              </button>
            </div>
          </template>
        </div>
      </div>
    </Teleport>
  </div>
</template>
