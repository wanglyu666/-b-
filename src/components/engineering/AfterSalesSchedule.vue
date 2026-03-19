<template>
  <div class="animate-in slide-in-from-right-4 duration-500 flex flex-col gap-6 h-full">
    <div class="bg-white/5 backdrop-blur-xl rounded-[32px] border border-white/10 overflow-hidden shadow-inner flex flex-col flex-1">
      <div class="px-8 py-6 border-b border-white/10 bg-white/5 flex justify-between items-center flex-shrink-0">
        <h3 class="text-white font-bold flex items-center gap-2">
            <div class="w-1 h-4 bg-[#FFC091] rounded-full shadow-[0_0_8px_rgba(255,192,145,0.4)]"></div>
            预约验收时间
        </h3>
      </div>
      
      <div class="p-8 flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-8">
        <!-- Form Fields -->
        <div class="grid grid-cols-1 gap-6">
          <div class="flex items-center gap-4">
            <div class="w-24 text-white/60 text-sm text-right"><span class="text-red-400 mr-1">*</span>售后计划</div>
            <div class="text-white font-medium">{{ plan?.planName }}</div>
          </div>
          
          <div class="flex items-center gap-4">
            <div class="w-24 text-white/60 text-sm text-right"><span class="text-red-400 mr-1">*</span>计划时间</div>
            <div class="text-white/40 font-mono">{{ plan?.planDate }}</div>
          </div>
          
          <div class="flex items-center gap-4">
            <div class="w-24 text-white/60 text-sm text-right"><span class="text-red-400 mr-1">*</span>预约验收时间</div>
            <input 
              type="date" 
              v-model="scheduledDate"
              class="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-[#FFC091] transition-colors font-mono w-48"
            />
          </div>
        </div>

        <!-- Contacts Section -->
        <div class="mt-4">
          <div class="flex items-center gap-4 mb-4">
            <div class="w-24 text-white/60 text-sm text-right">现场联系人</div>
            <button 
              @click="addContact"
              :disabled="contacts.length >= 3"
              class="px-4 py-1.5 bg-[#FFC091] text-[#260A2F] text-xs font-bold rounded-lg hover:bg-[#ffad70] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              添加人员
            </button>
            <span class="text-white/40 text-xs ml-2">最多添加3人</span>
          </div>
          
          <div class="pl-[112px]">
            <table class="w-full text-left border-collapse">
              <thead>
                <tr class="text-white/40 text-xs border-b border-white/10">
                  <th class="pb-2 font-normal w-1/3">姓名</th>
                  <th class="pb-2 font-normal w-1/3">职位</th>
                  <th class="pb-2 font-normal w-1/3">手机号</th>
                  <th class="pb-2 font-normal w-12 text-center"></th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="contacts.length === 0">
                  <td colspan="4" class="py-8 text-center text-white/20 text-sm">暂无数据</td>
                </tr>
                <tr v-for="(contact, index) in contacts" :key="index" class="border-b border-white/5">
                  <td class="py-3 pr-4">
                    <input type="text" v-model="contact.name" placeholder="请输入" class="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#FFC091] transition-colors" />
                  </td>
                  <td class="py-3 pr-4">
                    <input type="text" v-model="contact.position" placeholder="请输入" class="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#FFC091] transition-colors" />
                  </td>
                  <td class="py-3 pr-4">
                    <input type="tel" v-model="contact.phone" placeholder="请输入" class="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#FFC091] transition-colors" />
                  </td>
                  <td class="py-3 text-center">
                    <button @click="removeContact(index)" class="text-white/40 hover:text-red-400 transition-colors p-2 rounded-lg hover:bg-white/5">
                      <Trash2 :size="16" />
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
      <!-- Footer -->
      <div class="px-8 py-4 border-t border-white/10 bg-white/5 flex justify-end flex-shrink-0">
        <button 
          @click="submit"
          :disabled="!isValid"
          class="px-8 py-2.5 bg-[#FFC091] text-[#260A2F] text-sm font-bold rounded-xl hover:bg-[#ffad70] transition-colors shadow-[0_0_15px_rgba(255,192,145,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          确定
        </button>
      </div>
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
const contacts = ref<{name: string, position: string, phone: string}[]>([]);

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
  
  // If contacts exist, all fields must be filled
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
