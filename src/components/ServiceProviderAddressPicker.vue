<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue';
import { ChevronDown, MapPin, Pencil, Plus } from 'lucide-vue-next';
import {
  serviceProviderAddressList,
  type ServiceProviderAddress,
} from '../data/serviceProviderAddresses';

type AddressModalView = 'list' | 'add' | 'edit';
type AddressModalSizeMode = 'list' | 'form';

const ADDRESS_CONTENT_LEAVE_MS = 300;
const ADDRESS_SIZE_CHANGE_MS = 420;

const model = defineModel<string>({ default: '' });

defineProps<{
  inputId?: string;
}>();

const addressModalOpen = ref(false);
const addressModalView = ref<AddressModalView>('list');
const addressModalSizeMode = ref<AddressModalSizeMode>('list');
const addressContentVisible = ref(true);
const addressTransitionPending = ref(false);
const editingAddressId = ref<string | null>(null);
const draftContact = ref('');
const draftPhone = ref('');
const draftRegion = ref('');
const draftAddress = ref('');

let addressTransitionTimer: ReturnType<typeof setTimeout> | null = null;

function clearAddressTransitionTimer() {
  if (addressTransitionTimer) {
    clearTimeout(addressTransitionTimer);
    addressTransitionTimer = null;
  }
}

function switchAddressModalView(target: AddressModalView, prepare?: () => void) {
  if (addressTransitionPending.value || addressModalView.value === target) return;

  clearAddressTransitionTimer();
  addressTransitionPending.value = true;
  addressContentVisible.value = false;

  addressTransitionTimer = window.setTimeout(() => {
    prepare?.();
    addressModalView.value = target;
    addressModalSizeMode.value = target === 'list' ? 'list' : 'form';

    addressTransitionTimer = window.setTimeout(() => {
      addressContentVisible.value = true;
      addressTransitionPending.value = false;
      addressTransitionTimer = null;
    }, ADDRESS_SIZE_CHANGE_MS);
  }, ADDRESS_CONTENT_LEAVE_MS);
}

function openAddressModal() {
  clearAddressTransitionTimer();
  addressModalView.value = 'list';
  addressModalSizeMode.value = 'list';
  addressContentVisible.value = true;
  addressTransitionPending.value = false;
  editingAddressId.value = null;
  addressModalOpen.value = true;
}

function closeAddressModal() {
  clearAddressTransitionTimer();
  addressModalOpen.value = false;
  addressModalView.value = 'list';
  addressModalSizeMode.value = 'list';
  addressContentVisible.value = true;
  addressTransitionPending.value = false;
  editingAddressId.value = null;
}

function resetAddressDraft() {
  draftContact.value = '';
  draftPhone.value = '';
  draftRegion.value = '';
  draftAddress.value = '';
}

function backToAddressList() {
  switchAddressModalView('list', () => {
    editingAddressId.value = null;
    resetAddressDraft();
  });
}

function openAddAddressForm() {
  switchAddressModalView('add', () => {
    editingAddressId.value = null;
    resetAddressDraft();
  });
}

function openEditAddressForm(id: string) {
  const target = serviceProviderAddressList.value.find((item) => item.id === id);
  if (!target) return;
  switchAddressModalView('edit', () => {
    editingAddressId.value = id;
    draftContact.value = target.contact;
    draftPhone.value = target.phone;
    draftRegion.value = target.region;
    draftAddress.value = target.address;
  });
}

function saveAddressForm() {
  const address = draftAddress.value.trim();
  const contact = draftContact.value.trim();
  const phone = draftPhone.value.trim();
  const region = draftRegion.value.trim();
  if (!address || !contact || !phone || !region) return;

  const payload: ServiceProviderAddress = {
    id: editingAddressId.value ?? `addr-${Date.now()}`,
    address,
    contact,
    phone,
    region,
  };

  if (addressModalView.value === 'edit' && editingAddressId.value) {
    const index = serviceProviderAddressList.value.findIndex((item) => item.id === editingAddressId.value);
    if (index >= 0) {
      const previousAddress = serviceProviderAddressList.value[index].address;
      serviceProviderAddressList.value[index] = payload;
      if (model.value === previousAddress) {
        model.value = address;
      }
    }
  } else {
    serviceProviderAddressList.value.push(payload);
  }

  backToAddressList();
}

function selectServiceAddress(address: string) {
  model.value = address;
  closeAddressModal();
}

const addressModalTitle = computed(() => {
  if (addressModalView.value === 'add') return '新增地址';
  if (addressModalView.value === 'edit') return '修改地址';
  return '选择服务方地址';
});

const addressInputClass =
  'h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-800 placeholder:text-gray-400 focus:border-[#FFEB69] focus:outline-none focus:ring-2 focus:ring-[#FFEB69]/30';

onBeforeUnmount(() => {
  clearAddressTransitionTimer();
});
</script>

<template>
  <button
    :id="inputId"
    type="button"
    class="flex h-10 w-full min-w-0 flex-1 items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 text-left text-sm transition-colors hover:border-gray-300 focus:border-[#FFEB69] focus:outline-none focus:ring-2 focus:ring-[#FFEB69]/30"
    @click="openAddressModal"
  >
    <span
      class="min-w-0 flex-1 truncate"
      :class="model ? 'text-gray-800' : 'text-gray-400'"
    >
      {{ model || '请选择服务方地址' }}
    </span>
    <ChevronDown :size="16" class="shrink-0 text-gray-400" />
  </button>

  <Teleport to="body">
    <div
      v-if="addressModalOpen"
      class="fixed inset-0 z-[120] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="service-provider-address-title"
      @click.self="closeAddressModal"
    >
      <div
        class="service-provider-address-modal flex w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl"
        :class="addressModalSizeMode === 'list' ? 'service-provider-address-modal--list' : 'service-provider-address-modal--form'"
        @click.stop
      >
        <div class="flex items-center justify-between gap-3 border-b border-gray-100 px-6 py-4">
          <h2 id="service-provider-address-title" class="text-lg font-bold text-gray-900">
            {{ addressModalTitle }}
          </h2>
          <Transition name="service-provider-address-action" mode="out-in">
            <button
              v-if="addressModalView === 'list'"
              key="add"
              type="button"
              class="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-[#9FE870]/40 bg-[#9FE870] px-4 py-1.5 text-sm font-bold text-[#163300] transition hover:brightness-[0.97] disabled:cursor-not-allowed disabled:opacity-50"
              :disabled="addressTransitionPending"
              @click="openAddAddressForm"
            >
              <Plus :size="16" />
              新增
            </button>
            <button
              v-else
              key="back"
              type="button"
              class="shrink-0 text-sm font-medium text-gray-500 transition hover:text-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
              :disabled="addressTransitionPending"
              @click="backToAddressList"
            >
              返回列表
            </button>
          </Transition>
        </div>

        <div class="service-provider-address-body-shell min-h-0 flex-1 overflow-hidden">
          <Transition name="service-provider-address-content-fade">
            <div
              v-if="addressContentVisible"
              :key="addressModalView"
              class="service-provider-address-body-panel custom-scrollbar h-full px-6 py-5"
              :class="[
                addressModalView === 'list' ? 'space-y-3 overflow-y-auto' : 'overflow-hidden',
              ]"
            >
              <template v-if="addressModalView === 'list'">
                <div
                  v-for="option in serviceProviderAddressList"
                  :key="option.id"
                  class="service-provider-address-card w-full text-left"
                  :class="{ 'service-provider-address-card--selected': model === option.address }"
                >
                  <div class="mb-3 flex items-start gap-3">
                    <button
                      type="button"
                      class="flex min-w-0 flex-1 items-start gap-3 text-left"
                      :disabled="addressTransitionPending"
                      @click="selectServiceAddress(option.address)"
                    >
                      <div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#9FE870]/20 text-[#163300]">
                        <MapPin :size="18" />
                      </div>
                      <p class="min-w-0 flex-1 text-base font-semibold leading-relaxed text-gray-900">
                        {{ option.address }}
                      </p>
                    </button>
                    <button
                      type="button"
                      class="service-provider-address-edit-btn shrink-0"
                      aria-label="修改地址"
                      :disabled="addressTransitionPending"
                      @click="openEditAddressForm(option.id)"
                    >
                      <Pencil :size="16" />
                    </button>
                  </div>
                  <div class="grid grid-cols-1 gap-2 border-t border-gray-100 pt-3 sm:grid-cols-2">
                    <div>
                      <p class="text-xs text-gray-500">所在地区</p>
                      <p class="mt-0.5 text-sm font-medium text-gray-800">{{ option.region }}</p>
                    </div>
                    <div>
                      <p class="text-xs text-gray-500">联系人</p>
                      <p class="mt-0.5 text-sm font-medium text-gray-800">{{ option.contact }}</p>
                    </div>
                    <div class="sm:col-span-2">
                      <p class="text-xs text-gray-500">联系电话</p>
                      <p class="mt-0.5 text-sm font-medium text-gray-800">{{ option.phone }}</p>
                    </div>
                  </div>
                </div>
              </template>

              <div v-else class="space-y-4">
                <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label class="mb-2 block text-sm font-medium text-gray-600" for="spa-addr-contact">
                      联系人
                    </label>
                    <input
                      id="spa-addr-contact"
                      v-model="draftContact"
                      type="text"
                      placeholder="请输入联系人"
                      :class="addressInputClass"
                    />
                  </div>
                  <div>
                    <label class="mb-2 block text-sm font-medium text-gray-600" for="spa-addr-phone">
                      联系电话
                    </label>
                    <input
                      id="spa-addr-phone"
                      v-model="draftPhone"
                      type="tel"
                      inputmode="tel"
                      placeholder="请输入联系电话"
                      :class="addressInputClass"
                    />
                  </div>
                </div>
                <div>
                  <label class="mb-2 block text-sm font-medium text-gray-600" for="spa-addr-region">
                    所在地区
                  </label>
                  <input
                    id="spa-addr-region"
                    v-model="draftRegion"
                    type="text"
                    placeholder="请输入所在地区"
                    :class="addressInputClass"
                  />
                </div>
                <div>
                  <label class="mb-2 block text-sm font-medium text-gray-600" for="spa-addr-detail">
                    详细地址
                  </label>
                  <input
                    id="spa-addr-detail"
                    v-model="draftAddress"
                    type="text"
                    placeholder="请输入详细地址"
                    :class="addressInputClass"
                  />
                </div>
              </div>
            </div>
          </Transition>
        </div>

        <div class="flex justify-end gap-3 border-t border-gray-100 px-6 py-4">
          <button
            type="button"
            class="rounded-full border border-gray-200 bg-white px-6 py-2 text-sm font-bold text-gray-700 transition hover:bg-gray-50"
            @click="addressModalView === 'list' ? closeAddressModal() : backToAddressList()"
          >
            取消
          </button>
          <Transition name="service-provider-address-action" mode="out-in">
            <button
              v-if="addressModalView !== 'list'"
              key="save"
              type="button"
              class="rounded-full border border-[#9FE870]/40 bg-[#9FE870] px-6 py-2 text-sm font-bold text-[#163300] transition hover:brightness-[0.97]"
              @click="saveAddressForm"
            >
              保存
            </button>
          </Transition>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.service-provider-address-modal {
  will-change: height;
  transition: height 0.42s cubic-bezier(0.33, 1, 0.32, 1);
}

.service-provider-address-modal--list {
  height: 600px;
}

.service-provider-address-modal--form {
  height: 480px;
}

@media (max-height: 720px) {
  .service-provider-address-modal--list {
    height: 78vh;
  }

  .service-provider-address-modal--form {
    height: min(60vh, 480px);
  }
}

.service-provider-address-body-shell {
  position: relative;
  overflow: hidden;
}

.service-provider-address-body-panel {
  width: 100%;
}

.service-provider-address-content-fade-enter-active,
.service-provider-address-content-fade-leave-active {
  transition: opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.service-provider-address-content-fade-leave-active {
  position: absolute;
  inset: 0;
  width: 100%;
}

.service-provider-address-content-fade-enter-from,
.service-provider-address-content-fade-leave-to {
  opacity: 0;
}

.service-provider-address-content-fade-enter-to,
.service-provider-address-content-fade-leave-from {
  opacity: 1;
}

.service-provider-address-action-enter-active,
.service-provider-address-action-leave-active {
  transition:
    opacity 0.24s cubic-bezier(0.4, 0, 0.2, 1),
    transform 0.24s cubic-bezier(0.33, 1, 0.32, 1);
}

.service-provider-address-action-enter-from,
.service-provider-address-action-leave-to {
  opacity: 0;
  transform: translateY(4px);
}

.service-provider-address-action-enter-to,
.service-provider-address-action-leave-from {
  opacity: 1;
  transform: translateY(0);
}

.service-provider-address-card {
  border-radius: 1rem;
  border: 1px solid #e5e7eb;
  background-color: #fff;
  padding: 1rem 1.25rem;
  transition:
    border-color 0.15s ease,
    box-shadow 0.15s ease,
    background-color 0.15s ease;
}

.service-provider-address-card:hover {
  border-color: rgba(159, 232, 112, 0.55);
  background-color: rgba(159, 232, 112, 0.06);
}

.service-provider-address-card--selected {
  border-color: #9fe870;
  background-color: rgba(159, 232, 112, 0.1);
  box-shadow: 0 0 0 3px rgba(159, 232, 112, 0.2);
}

.service-provider-address-edit-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 0.5rem;
  padding: 0.5rem;
  color: #9ca3af;
  transition:
    color 0.15s ease,
    background-color 0.15s ease;
}

.service-provider-address-edit-btn:hover {
  background-color: rgba(255, 255, 255, 0.9);
  color: #5a8a75;
}

.service-provider-address-edit-btn:focus,
.service-provider-address-edit-btn:focus-visible {
  outline: none;
  box-shadow: 0 0 0 2px rgba(159, 232, 112, 0.45);
}

.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.04);
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.12);
  border-radius: 10px;
}
</style>
