<script lang="ts">
export type AddressRecord = {
  id: string;
  contactName: string;
  contactPhone: string;
  province: string;
  city: string;
  district: string;
  detailAddress: string;
  isDefault?: boolean;
};

const DEFAULT_ADDRESSES: AddressRecord[] = [
  {
    id: 'addr-1',
    contactName: '张伟',
    contactPhone: '138-0013-8000',
    province: '北京市',
    city: '北京市',
    district: '朝阳区',
    detailAddress: '住邦2000商务中心4号楼5层',
    isDefault: true,
  },
  {
    id: 'addr-2',
    contactName: '李秀英',
    contactPhone: '139-2234-5678',
    province: '上海市',
    city: '上海市',
    district: '浦东新区',
    detailAddress: '陆家嘴环路1000号恒生银行大厦15层',
  },
  {
    id: 'addr-3',
    contactName: '刘洋',
    contactPhone: '136-5566-7788',
    province: '广东省',
    city: '深圳市',
    district: '南山区',
    detailAddress: '科技园南区深南大道9988号',
  },
  {
    id: 'addr-4',
    contactName: '陈明',
    contactPhone: '135-6677-8899',
    province: '四川省',
    city: '成都市',
    district: '双流区',
    detailAddress: '航空港物流园B区7号库',
  },
];
</script>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { ArrowLeft, Pencil, Plus, Trash2 } from 'lucide-vue-next';

type ViewMode = 'list' | 'add' | 'edit';

defineEmits<{
  back: [];
}>();

const props = withDefaults(
  defineProps<{
    addresses?: AddressRecord[];
  }>(),
  {
    addresses: () => DEFAULT_ADDRESSES,
  },
);

const localAddresses = ref<AddressRecord[]>([...props.addresses]);
const viewMode = ref<ViewMode>('list');
const editingId = ref<string | null>(null);

const draftContactName = ref('');
const draftContactPhone = ref('');
const draftProvince = ref('');
const draftCity = ref('');
const draftDistrict = ref('');
const draftDetailAddress = ref('');
const draftIsDefault = ref(false);

const canConfirm = computed(
  () =>
    draftContactName.value.trim() !== '' &&
    draftContactPhone.value.trim() !== '' &&
    draftProvince.value.trim() !== '' &&
    draftCity.value.trim() !== '' &&
    draftDistrict.value.trim() !== '' &&
    draftDetailAddress.value.trim() !== '',
);

const inputClass =
  'w-full rounded-xl border border-gray-200/80 bg-white/90 px-4 py-3 text-base text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-transparent focus:ring-2 focus:ring-[#9FE870]/80';

function regionText(addr: AddressRecord) {
  return [addr.province, addr.city, addr.district].filter(Boolean).join(' ');
}

function resetDraft() {
  draftContactName.value = '';
  draftContactPhone.value = '';
  draftProvince.value = '';
  draftCity.value = '';
  draftDistrict.value = '';
  draftDetailAddress.value = '';
  draftIsDefault.value = false;
  editingId.value = null;
}

function openAddForm() {
  resetDraft();
  viewMode.value = 'add';
}

function openEditForm(id: string) {
  const addr = localAddresses.value.find((item) => item.id === id);
  if (!addr) return;

  editingId.value = id;
  draftContactName.value = addr.contactName;
  draftContactPhone.value = addr.contactPhone;
  draftProvince.value = addr.province;
  draftCity.value = addr.city;
  draftDistrict.value = addr.district;
  draftDetailAddress.value = addr.detailAddress;
  draftIsDefault.value = !!addr.isDefault;
  viewMode.value = 'edit';
}

function applyDefaultFlag(targetId: string, isDefault: boolean) {
  if (!isDefault) return;
  localAddresses.value.forEach((item) => {
    item.isDefault = item.id === targetId;
  });
}

function deleteAddress(id: string) {
  const index = localAddresses.value.findIndex((item) => item.id === id);
  if (index === -1) return;

  const wasDefault = localAddresses.value[index].isDefault;
  localAddresses.value.splice(index, 1);

  if (wasDefault && localAddresses.value.length > 0) {
    localAddresses.value[0].isDefault = true;
  }
}

function handleConfirmAdd() {
  if (!canConfirm.value) return;

  const newId = `addr-${Date.now()}`;
  localAddresses.value.push({
    id: newId,
    contactName: draftContactName.value.trim(),
    contactPhone: draftContactPhone.value.trim(),
    province: draftProvince.value.trim(),
    city: draftCity.value.trim(),
    district: draftDistrict.value.trim(),
    detailAddress: draftDetailAddress.value.trim(),
  });

  resetDraft();
  viewMode.value = 'list';
}

function handleConfirmEdit() {
  if (!canConfirm.value || !editingId.value) return;

  const index = localAddresses.value.findIndex((item) => item.id === editingId.value);
  if (index === -1) return;

  localAddresses.value[index] = {
    ...localAddresses.value[index],
    contactName: draftContactName.value.trim(),
    contactPhone: draftContactPhone.value.trim(),
    province: draftProvince.value.trim(),
    city: draftCity.value.trim(),
    district: draftDistrict.value.trim(),
    detailAddress: draftDetailAddress.value.trim(),
    isDefault: draftIsDefault.value,
  };

  applyDefaultFlag(editingId.value, draftIsDefault.value);

  resetDraft();
  viewMode.value = 'list';
}

function handleFormConfirm() {
  if (viewMode.value === 'add') {
    handleConfirmAdd();
    return;
  }
  handleConfirmEdit();
}
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
      <div class="flex min-h-0 flex-1 flex-col px-6 py-10 sm:px-10 sm:py-12">
        <div class="flex items-center justify-between gap-4">
          <h2 class="text-xl font-bold text-gray-900 sm:text-2xl">地址信息</h2>
          <button
            v-if="viewMode === 'list'"
            type="button"
            class="flex shrink-0 items-center justify-center gap-2 rounded-full border border-gray-200/80 bg-gray-100/80 px-5 py-2.5 text-sm font-bold text-gray-800 shadow-inner transition hover:bg-white/90 focus:outline-none focus:ring-2 focus:ring-[#9FE870]/40 active:scale-[0.99]"
            @click="openAddForm"
          >
            <Plus :size="18" class="text-gray-600" aria-hidden="true" />
            新增
          </button>
        </div>

        <Transition name="addr-panel" mode="out-in">
          <div v-if="viewMode === 'list'" key="list" class="mt-8 flex min-h-0 flex-1 flex-col sm:mt-10">
            <div
              v-if="localAddresses.length === 0"
              class="flex flex-1 items-center justify-center text-sm text-gray-500"
            >
              暂无地址信息
            </div>

            <TransitionGroup
              v-else
              name="addr-item"
              tag="div"
              class="addr-list flex flex-col gap-5 sm:gap-6"
            >
              <div
                v-for="addr in localAddresses"
                :key="addr.id"
                class="addr-item-card w-full rounded-2xl border border-gray-200/60 bg-white/50 px-5 py-5 sm:px-6 sm:py-6"
              >
                <div class="mb-4 flex items-start justify-between gap-3">
                  <div class="flex min-w-0 flex-1 items-center gap-2">
                    <h3 class="text-base font-semibold text-gray-900 sm:text-lg">
                      {{ addr.detailAddress }}
                    </h3>
                    <span
                      v-if="addr.isDefault"
                      class="shrink-0 rounded-full bg-[#B0D4C5]/30 px-2.5 py-0.5 text-xs font-medium text-[#5a8a75]"
                    >
                      默认
                    </span>
                  </div>

                  <div class="flex shrink-0 items-center gap-1">
                    <button
                      type="button"
                      class="rounded-lg p-2 text-gray-400 transition-colors hover:bg-white/80 hover:text-[#5a8a75]"
                      aria-label="编辑地址"
                      @click="openEditForm(addr.id)"
                    >
                      <Pencil :size="18" />
                    </button>
                    <button
                      type="button"
                      class="rounded-lg p-2 text-gray-400 transition-colors hover:bg-white/80 hover:text-red-500"
                      aria-label="删除地址"
                      @click="deleteAddress(addr.id)"
                    >
                      <Trash2 :size="18" />
                    </button>
                  </div>
                </div>

                <div class="space-y-3 sm:space-y-3.5">
                  <div class="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
                    <div>
                      <p class="text-sm text-gray-500">联系人</p>
                      <p class="mt-1 text-base font-medium text-gray-900">{{ addr.contactName }}</p>
                    </div>
                    <div>
                      <p class="text-sm text-gray-500">联系电话</p>
                      <p class="mt-1 text-base font-medium text-gray-900">{{ addr.contactPhone }}</p>
                    </div>
                  </div>
                  <div>
                    <p class="text-sm text-gray-500">所在地区</p>
                    <p class="mt-1 text-base font-medium text-gray-900">{{ regionText(addr) }}</p>
                  </div>
                </div>
              </div>
            </TransitionGroup>
          </div>

          <div v-else key="form" class="mt-8 flex min-h-0 flex-1 flex-col sm:mt-10">
            <div class="flex-1 space-y-5 sm:space-y-6">
              <div class="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6">
                <div>
                  <label for="addr-contact" class="mb-2 block text-sm font-medium text-gray-600">
                    联系人
                  </label>
                  <input
                    id="addr-contact"
                    v-model="draftContactName"
                    type="text"
                    maxlength="64"
                    placeholder="请输入联系人"
                    :class="inputClass"
                  />
                </div>
                <div>
                  <label for="addr-phone" class="mb-2 block text-sm font-medium text-gray-600">
                    联系电话
                  </label>
                  <input
                    id="addr-phone"
                    v-model="draftContactPhone"
                    type="tel"
                    maxlength="20"
                    placeholder="请输入联系电话"
                    :class="inputClass"
                  />
                </div>
              </div>

              <div class="grid grid-cols-1 gap-5 sm:grid-cols-3 sm:gap-6">
                <div>
                  <label for="addr-province" class="mb-2 block text-sm font-medium text-gray-600">
                    省
                  </label>
                  <input
                    id="addr-province"
                    v-model="draftProvince"
                    type="text"
                    maxlength="64"
                    placeholder="请输入省份"
                    :class="inputClass"
                  />
                </div>
                <div>
                  <label for="addr-city" class="mb-2 block text-sm font-medium text-gray-600">
                    市
                  </label>
                  <input
                    id="addr-city"
                    v-model="draftCity"
                    type="text"
                    maxlength="64"
                    placeholder="请输入城市"
                    :class="inputClass"
                  />
                </div>
                <div>
                  <label for="addr-district" class="mb-2 block text-sm font-medium text-gray-600">
                    区/县
                  </label>
                  <input
                    id="addr-district"
                    v-model="draftDistrict"
                    type="text"
                    maxlength="64"
                    placeholder="请输入区/县"
                    :class="inputClass"
                  />
                </div>
              </div>

              <div>
                <label for="addr-detail" class="mb-2 block text-sm font-medium text-gray-600">
                  详细地址
                </label>
                <input
                  id="addr-detail"
                  v-model="draftDetailAddress"
                  type="text"
                  maxlength="256"
                  placeholder="请输入详细地址"
                  :class="inputClass"
                />
              </div>

              <div
                v-if="viewMode === 'edit'"
                class="flex items-center justify-between rounded-2xl border border-gray-200/60 bg-white/50 px-5 py-4 sm:px-6"
              >
                <div>
                  <p class="text-sm font-medium text-gray-900">设为默认地址</p>
                  <p class="mt-0.5 text-xs text-gray-500">开启后，该地址将作为默认服务地址</p>
                </div>
                <button
                  type="button"
                  role="switch"
                  :aria-checked="draftIsDefault"
                  class="relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors duration-200"
                  :class="draftIsDefault ? 'bg-[#B0D4C5]' : 'bg-gray-200'"
                  @click="draftIsDefault = !draftIsDefault"
                >
                  <span
                    class="inline-block h-5 w-5 rounded-full bg-white shadow transition-transform duration-200"
                    :class="draftIsDefault ? 'translate-x-6' : 'translate-x-1'"
                  />
                </button>
              </div>
            </div>

            <div class="mt-8 flex justify-end pt-2 sm:mt-10">
              <button
                type="button"
                class="min-w-[120px] rounded-xl px-8 py-3 text-sm font-bold transition-colors sm:min-w-[140px] sm:text-base"
                :class="
                  canConfirm
                    ? 'bg-[#B0D4C5] text-white hover:bg-[#9bc4b3]'
                    : 'cursor-not-allowed bg-[#B0D4C5]/40 text-white/70'
                "
                :disabled="!canConfirm"
                @click="handleFormConfirm"
              >
                确定
              </button>
            </div>
          </div>
        </Transition>
      </div>
    </div>
  </div>
</template>

<style scoped>
.addr-panel-enter-active,
.addr-panel-leave-active {
  transition:
    opacity 0.32s cubic-bezier(0.4, 0, 0.2, 1),
    transform 0.32s cubic-bezier(0.33, 1, 0.32, 1);
}

.addr-panel-enter-from,
.addr-panel-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

.addr-panel-enter-to,
.addr-panel-leave-from {
  opacity: 1;
  transform: translateY(0);
}

.addr-list {
  position: relative;
}

.addr-item-move {
  transition: transform 0.32s cubic-bezier(0.33, 1, 0.32, 1);
}

.addr-item-enter-active {
  transition:
    opacity 0.28s cubic-bezier(0.4, 0, 0.2, 1),
    transform 0.32s cubic-bezier(0.33, 1, 0.32, 1);
}

.addr-item-leave-active {
  position: absolute;
  left: 0;
  right: 0;
  z-index: 0;
  transition:
    opacity 0.28s cubic-bezier(0.4, 0, 0.2, 1),
    transform 0.32s cubic-bezier(0.33, 1, 0.32, 1);
  pointer-events: none;
}

.addr-item-enter-from {
  opacity: 0;
  transform: translateY(-10px);
}

.addr-item-leave-to {
  opacity: 0;
  transform: scale(0.96) translateX(12px);
}
</style>
