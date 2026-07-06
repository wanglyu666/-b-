<script setup lang="ts">
import { computed, onUnmounted, reactive, ref } from 'vue';
import { ArrowLeft, ImagePlus } from 'lucide-vue-next';

export type EnterpriseUpgradePayload = {
  businessLicenseUrl: string;
  companyName: string;
  creditCode: string;
  registeredAddress: string;
  registeredPhone: string;
  bankName: string;
  bankAccount: string;
};

const emit = defineEmits<{
  back: [];
  submit: [payload: EnterpriseUpgradePayload];
}>();

const businessLicenseUrl = ref('');

const form = reactive({
  companyName: '',
  creditCode: '',
  registeredAddress: '',
  registeredPhone: '',
  bankName: '',
  bankAccount: '',
});

const fileInputRef = ref<HTMLInputElement | null>(null);
let objectUrl: string | null = null;

const billingFields = [
  { key: 'companyName', label: '企业全称', placeholder: '请输入企业全称' },
  { key: 'creditCode', label: '统一信用代码', placeholder: '请输入统一信用代码' },
  { key: 'registeredAddress', label: '注册地址', placeholder: '请输入注册地址' },
  { key: 'registeredPhone', label: '注册电话', placeholder: '请输入注册电话' },
  { key: 'bankName', label: '开户行', placeholder: '请输入开户行' },
  { key: 'bankAccount', label: '银行账号', placeholder: '请输入银行账号' },
] as const;

const canSubmit = computed(() =>
  businessLicenseUrl.value.trim() !== '' &&
  billingFields.every((field) => form[field.key].trim() !== ''),
);

const inputClass =
  'w-full rounded-xl border border-gray-200/80 bg-white/90 px-4 py-3 text-base text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-transparent focus:ring-2 focus:ring-[#9FE870]/80';

function revokeObjectUrl() {
  if (objectUrl) {
    URL.revokeObjectURL(objectUrl);
    objectUrl = null;
  }
}

function openLicensePicker() {
  fileInputRef.value?.click();
}

function handleLicenseChange(event: Event) {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file || !file.type.startsWith('image/')) return;

  revokeObjectUrl();
  objectUrl = URL.createObjectURL(file);
  businessLicenseUrl.value = objectUrl;
  input.value = '';
}

function handleSubmit() {
  if (!canSubmit.value) return;

  emit('submit', {
    businessLicenseUrl: businessLicenseUrl.value,
    companyName: form.companyName.trim(),
    creditCode: form.creditCode.trim(),
    registeredAddress: form.registeredAddress.trim(),
    registeredPhone: form.registeredPhone.trim(),
    bankName: form.bankName.trim(),
    bankAccount: form.bankAccount.trim(),
  });
}

onUnmounted(() => {
  revokeObjectUrl();
});
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
        <div>
          <h2 class="text-xl font-bold text-gray-900 sm:text-2xl">升级企业账号</h2>
          <p class="mt-2 text-sm text-gray-500 sm:text-base">
            上传营业执照并填写开票信息，提交后将进入企业账号审核流程
          </p>
        </div>

        <div class="mt-8 flex flex-1 flex-col sm:mt-10">
          <div>
            <p class="mb-3 text-sm font-medium text-gray-600">营业执照</p>
            <button
              type="button"
              class="group block w-full max-w-md text-left"
              @click="openLicensePicker"
            >
              <div
                v-if="businessLicenseUrl"
                class="overflow-hidden rounded-2xl border border-gray-200/80 bg-white/90"
              >
                <img
                  :src="businessLicenseUrl"
                  alt="营业执照预览"
                  class="h-[170px] w-full object-cover transition group-hover:brightness-95 sm:h-[190px]"
                />
              </div>
              <div
                v-else
                class="flex h-[170px] w-full max-w-md flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200/90 bg-white/50 transition hover:border-[#B0D4C5]/80 hover:bg-white/80 sm:h-[190px]"
              >
                <ImagePlus :size="28" class="text-gray-400" />
                <p class="mt-3 text-sm font-medium text-gray-600">点击上传营业执照</p>
                <p class="mt-1 text-xs text-gray-400">支持 JPG、PNG 等图片格式</p>
              </div>
            </button>
            <input
              ref="fileInputRef"
              type="file"
              accept="image/*"
              class="hidden"
              @change="handleLicenseChange"
            />
          </div>

          <div class="mt-8 sm:mt-10">
            <h3 class="text-base font-semibold text-gray-900 sm:text-lg">开票信息</h3>
            <div class="mt-5 space-y-5 sm:mt-6 sm:space-y-6">
              <div v-for="field in billingFields" :key="field.key">
                <label :for="`enterprise-${field.key}`" class="mb-2 block text-sm font-medium text-gray-600">
                  {{ field.label }}
                </label>
                <input
                  :id="`enterprise-${field.key}`"
                  v-model="form[field.key]"
                  type="text"
                  maxlength="256"
                  :placeholder="field.placeholder"
                  :class="inputClass"
                />
              </div>
            </div>
          </div>

          <div class="mt-auto flex justify-end pt-10">
            <button
              type="button"
              class="min-w-[120px] rounded-xl px-8 py-3 text-sm font-bold transition-colors sm:min-w-[140px] sm:text-base"
              :class="
                canSubmit
                  ? 'bg-[#B0D4C5] text-white hover:bg-[#9bc4b3]'
                  : 'cursor-not-allowed bg-[#B0D4C5]/40 text-white/70'
              "
              :disabled="!canSubmit"
              @click="handleSubmit"
            >
              提交申请
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
