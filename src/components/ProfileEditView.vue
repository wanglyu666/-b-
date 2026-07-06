<script setup lang="ts">
import { onUnmounted, ref, watch } from 'vue';
import { ArrowLeft, Camera } from 'lucide-vue-next';

export type ProfileEditPayload = {
  name: string;
  email: string;
  avatarUrl: string;
};

const props = withDefaults(
  defineProps<{
    name?: string;
    email?: string;
    avatarUrl?: string;
  }>(),
  {
    name: '管理员',
    email: 'admin@justpai.com',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Cooper',
  },
);

const emit = defineEmits<{
  back: [];
  save: [payload: ProfileEditPayload];
}>();

const draftName = ref(props.name);
const draftEmail = ref(props.email);
const draftAvatarUrl = ref(props.avatarUrl);

const fileInputRef = ref<HTMLInputElement | null>(null);
let objectUrl: string | null = null;

watch(
  () => [props.name, props.email, props.avatarUrl] as const,
  ([name, email, avatarUrl]) => {
    draftName.value = name;
    draftEmail.value = email;
    draftAvatarUrl.value = avatarUrl;
  },
);

function revokeObjectUrl() {
  if (objectUrl) {
    URL.revokeObjectURL(objectUrl);
    objectUrl = null;
  }
}

function openAvatarPicker() {
  fileInputRef.value?.click();
}

function handleAvatarChange(event: Event) {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file || !file.type.startsWith('image/')) return;

  revokeObjectUrl();
  objectUrl = URL.createObjectURL(file);
  draftAvatarUrl.value = objectUrl;
  input.value = '';
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function handleSave() {
  const name = draftName.value.trim();
  const email = draftEmail.value.trim();
  if (!name || !isValidEmail(email)) return;

  emit('save', {
    name,
    email,
    avatarUrl: draftAvatarUrl.value,
  });
}

onUnmounted(() => {
  revokeObjectUrl();
});

const inputClass =
  'w-full rounded-xl border border-gray-200/80 bg-white/90 px-4 py-3 text-base text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-transparent focus:ring-2 focus:ring-[#9FE870]/80';
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
        <h2 class="text-xl font-bold text-gray-900 sm:text-2xl">编辑资料</h2>

        <div class="mt-8 flex flex-1 flex-col sm:mt-10">
          <div class="flex flex-col items-center">
            <button
              type="button"
              class="group relative"
              aria-label="更换头像"
              @click="openAvatarPicker"
            >
              <img
                :src="draftAvatarUrl"
                alt=""
                class="h-28 w-28 rounded-full border-4 border-white bg-gray-100 object-cover shadow-sm transition group-hover:brightness-95 sm:h-32 sm:w-32"
              />
              <span
                class="absolute inset-0 flex items-center justify-center rounded-full bg-black/0 transition group-hover:bg-black/20"
              >
                <span
                  class="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-gray-700 opacity-0 shadow transition group-hover:opacity-100"
                >
                  <Camera :size="18" />
                </span>
              </span>
            </button>
            <p class="mt-3 text-sm text-gray-500">点击头像更换</p>
            <input
              ref="fileInputRef"
              type="file"
              accept="image/*"
              class="hidden"
              @change="handleAvatarChange"
            />
          </div>

          <div class="mx-auto mt-8 w-full max-w-lg space-y-5 sm:mt-10 sm:space-y-6">
            <div>
              <label for="profile-name" class="mb-2 block text-sm font-medium text-gray-600">
                名称
              </label>
              <input
                id="profile-name"
                v-model="draftName"
                type="text"
                maxlength="64"
                placeholder="请输入名称"
                :class="inputClass"
              />
            </div>

            <div>
              <label for="profile-email" class="mb-2 block text-sm font-medium text-gray-600">
                邮箱
              </label>
              <input
                id="profile-email"
                v-model="draftEmail"
                type="email"
                maxlength="128"
                placeholder="请输入邮箱"
                :class="inputClass"
              />
            </div>
          </div>

          <div class="mt-auto flex justify-end pt-10">
            <button
              type="button"
              class="min-w-[120px] rounded-xl px-8 py-3 text-sm font-bold transition-colors sm:min-w-[140px] sm:text-base"
              :class="
                draftName.trim() && isValidEmail(draftEmail.trim())
                  ? 'bg-[#B0D4C5] text-white hover:bg-[#9bc4b3]'
                  : 'cursor-not-allowed bg-[#B0D4C5]/40 text-white/70'
              "
              :disabled="!draftName.trim() || !isValidEmail(draftEmail.trim())"
              @click="handleSave"
            >
              确定
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
