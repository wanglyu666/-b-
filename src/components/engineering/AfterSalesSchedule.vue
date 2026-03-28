<template>
  <div class="animate-in slide-in-from-right-4 duration-500 flex h-full min-h-0 flex-col">
    <div class="custom-scrollbar flex min-h-0 flex-1 flex-col gap-8 overflow-y-auto py-1">
      <!-- Form Fields -->
      <div class="grid grid-cols-1 gap-6">
        <div class="flex items-center gap-4">
          <div class="w-24 text-right text-sm text-white/60">
            <span class="mr-1 text-red-400">*</span>{{ plan?.nodeName ? '验收节点名称' : '售后计划' }}
          </div>
          <div class="font-medium text-white">{{ plan?.nodeName || plan?.planName }}</div>
        </div>

        <div class="flex items-center gap-4">
          <div class="w-24 text-right text-sm text-white/60"><span class="mr-1 text-red-400">*</span>计划时间</div>
          <div class="font-mono text-white/40">{{ plan?.plannedTime || plan?.planDate }}</div>
        </div>

        <div class="flex items-center gap-4">
          <div class="w-24 text-right text-sm text-white/60"><span class="mr-1 text-red-400">*</span>预约验收时间</div>
          <div class="relative w-48">
            <input
              ref="datePickerRef"
              v-model="scheduledDate"
              type="date"
              tabindex="-1"
              aria-hidden="true"
              class="absolute m-0 h-px w-px overflow-hidden border-0 p-0 opacity-0"
            />
            <input
              type="text"
              readonly
              :value="formatDateSlash(scheduledDate)"
              placeholder="yyyy/mm/dd"
              class="w-full cursor-pointer rounded-xl border border-white/10 bg-white/5 px-4 py-2 font-mono text-white transition-colors focus:border-[#FFC091] focus:outline-none"
              @click="openDatePicker"
            />
          </div>
        </div>
      </div>

      <!-- Contacts Section -->
      <div class="mt-4">
        <div class="mb-4 flex items-center gap-4">
          <div class="w-24 text-right text-sm text-white/60">现场联系人</div>
          <button
            type="button"
            @click="addContact"
            :disabled="contacts.length >= 3"
            class="rounded-lg bg-[#FFC091] px-4 py-1.5 text-xs font-bold text-[#260A2F] transition-colors hover:bg-[#ffad70] disabled:cursor-not-allowed disabled:opacity-50"
          >
            添加人员
          </button>
          <span class="ml-2 text-xs text-white/40">最多添加3人</span>
        </div>

        <div class="pl-[112px]">
          <table class="w-full border-collapse text-left">
            <thead>
              <tr class="border-b border-white/10 text-xs text-white/40">
                <th class="w-1/3 pb-2 font-normal">姓名</th>
                <th class="w-1/3 pb-2 font-normal">职位</th>
                <th class="w-1/3 pb-2 font-normal">手机号</th>
                <th class="w-12 pb-2 text-center font-normal"></th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="contacts.length === 0">
                <td colspan="4" class="py-8 text-center text-sm text-white/20">暂无数据</td>
              </tr>
              <tr v-for="(contact, index) in contacts" :key="index" class="border-b border-white/5">
                <td class="py-3 pr-4">
                  <input
                    type="text"
                    v-model="contact.name"
                    placeholder="请输入"
                    class="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white transition-colors focus:border-[#FFC091] focus:outline-none"
                  />
                </td>
                <td class="py-3 pr-4">
                  <input
                    type="text"
                    v-model="contact.position"
                    placeholder="请输入"
                    class="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white transition-colors focus:border-[#FFC091] focus:outline-none"
                  />
                </td>
                <td class="py-3 pr-4">
                  <input
                    type="tel"
                    v-model="contact.phone"
                    placeholder="请输入"
                    class="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white transition-colors focus:border-[#FFC091] focus:outline-none"
                  />
                </td>
                <td class="py-3 text-center">
                  <button
                    type="button"
                    @click="removeContact(index)"
                    class="rounded-lg p-2 text-white/40 transition-colors hover:bg-white/5 hover:text-red-400"
                  >
                    <Trash2 :size="16" />
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <div class="flex flex-shrink-0 justify-end border-t border-white/10 pt-4">
      <button
        type="button"
        @click="submit"
        :disabled="!isValid"
        class="rounded-xl bg-[#FFC091] px-8 py-2.5 text-sm font-bold text-[#260A2F] shadow-[0_0_15px_rgba(255,192,145,0.3)] transition-colors hover:bg-[#ffad70] disabled:cursor-not-allowed disabled:opacity-50"
      >
        确定
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { Trash2 } from 'lucide-vue-next';

const props = defineProps<{
  plan: any;
}>();

const emit = defineEmits(['submit']);

const scheduledDate = ref('');
const contacts = ref<{ name: string; position: string; phone: string }[]>([]);

/** YYYY-MM-DD → yyyy/mm/dd */
function formatDateSlash(isoDate: string): string {
  if (!isoDate?.trim()) return '';
  const m = isoDate.trim().match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!m) return isoDate;
  return `${m[1]}/${m[2]}/${m[3]}`;
}

const datePickerRef = ref<HTMLInputElement | null>(null);
const openDatePicker = () => {
  const el = datePickerRef.value;
  if (!el) return;
  try {
    el.showPicker?.();
  } catch {
    /* ignore */
  }
  el.focus();
};

const addContact = () => {
  if (contacts.value.length < 3) {
    contacts.value.push({ name: '', position: '', phone: '' });
  }
};

const removeContact = (index: number) => {
  contacts.value.splice(index, 1);
};

const isValid = computed(() => {
  if (!scheduledDate.value) return false;

  for (const contact of contacts.value) {
    if (!contact.name.trim() || !contact.position.trim() || !contact.phone.trim()) {
      return false;
    }
  }

  return true;
});

const submit = () => {
  if (isValid.value) {
    emit('submit', {
      plan: props.plan,
      scheduledDate: scheduledDate.value,
      contacts: contacts.value
    });
  }
};
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.2);
}
</style>
