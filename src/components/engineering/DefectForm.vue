<template>
  <div class="animate-in slide-in-from-bottom-4 duration-500 flex flex-col h-full relative">
    <div class="flex-1 flex flex-col gap-8">
      <!-- Image Upload Section -->
      <div class="space-y-4">
        <p class="text-[10px] text-white/30 uppercase tracking-[0.2em] font-bold">缺陷照片上传</p>
        <div 
          @click="triggerFileInput"
          class="w-[550px] h-[325px] rounded-3xl border-2 border-dashed border-white/10 bg-white/5 hover:bg-white/10 transition-all cursor-pointer flex flex-col items-center justify-center gap-4 group overflow-hidden relative mx-auto"
        >
          <input 
            type="file" 
            ref="fileInput" 
            class="hidden" 
            accept="image/*" 
            @change="handleImageUpload" 
          />
          
          <template v-if="newDefectImage">
            <img :src="newDefectImage" class="w-full h-full object-cover" />
            <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <Loader v-if="uploading" :size="32" class="text-white animate-spin" />
              <template v-else>
                <ImageIcon :size="32" class="text-white" />
                <span class="text-white text-xs font-bold">更换图片</span>
              </template>
            </div>
          </template>
          <template v-else>
            <div v-if="uploading" class="flex flex-col items-center gap-4">
              <div class="w-10 h-10 border-2 border-white/20 border-t-[#FFE600] rounded-full animate-spin"></div>
              <p class="text-white/60 font-bold text-sm">上传中...</p>
            </div>
            <template v-else>
              <div class="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Plus :size="32" class="text-white/40" />
              </div>
              <div class="text-center">
                <p class="text-white/60 font-bold text-sm">点击上传缺陷照片</p>
                <p class="text-white/20 text-[10px] mt-1 uppercase tracking-widest">支持 JPG, PNG 格式</p>
              </div>
            </template>
          </template>
        </div>
      </div>

      <!-- Description Section -->
      <div class="space-y-4">
        <p class="text-[10px] text-white/30 uppercase tracking-[0.2em] font-bold">缺陷描述</p>
        <textarea 
          v-model="newDefectDescription"
          placeholder="请输入缺陷详细描述，例如：位置、具体问题、整改要求等..."
          class="w-full h-[100px] bg-white/5 border border-white/10 rounded-2xl p-6 text-white text-sm leading-relaxed focus:outline-none focus:border-orange-400/50 transition-all placeholder:text-white/10 resize-none"
        ></textarea>
      </div>
    </div>

    <!-- Bottom Action -->
    <div class="flex justify-end pt-6">
      <button 
        @click="confirmAddDefect"
        :disabled="uploading || !newDefectImage || !newDefectDescription"
        :class="[
          'px-12 py-4 rounded-2xl font-bold hover:scale-105 active:scale-95 transition-all shadow-xl shadow-orange-500/20 flex items-center gap-2',
          (uploading || !newDefectImage || !newDefectDescription)
            ? 'bg-white/10 text-white/30 cursor-not-allowed'
            : 'bg-[#FFE600] text-[#260A2F]'
        ]"
      >
        <Loader v-if="uploading" :size="18" class="animate-spin" />
        确定发布
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { Image as ImageIcon, Plus, Loader } from 'lucide-vue-next';
import { uploadFile, createDefect } from '../../api/projectApi';

const props = defineProps<{
  spotOrderId: string;
  projectId: string;
  nodeName: string;
}>();

const emit = defineEmits(['submit', 'success']);

const fileInput = ref<HTMLInputElement | null>(null);
const newDefectImage = ref('');
const uploadedUrl = ref('');
const newDefectDescription = ref('');
const uploading = ref(false);

const triggerFileInput = () => {
  fileInput.value?.click();
};

const handleImageUpload = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (!target.files || !target.files[0]) return;

  const file = target.files[0];
  // 本地预览
  const reader = new FileReader();
  reader.onload = (e) => {
    newDefectImage.value = e.target?.result as string;
  };
  reader.readAsDataURL(file);

  // 上传到服务器
  uploading.value = true;
  try {
    const url = await uploadFile(file);
    uploadedUrl.value = url;
  } catch (e) {
    console.error('图片上传失败:', e);
    alert('图片上传失败，请重试');
    newDefectImage.value = '';
  } finally {
    uploading.value = false;
  }
};

const confirmAddDefect = async () => {
  if (!uploadedUrl.value || !newDefectDescription.value) {
    alert('请上传照片并输入描述');
    return;
  }
  try {
    await createDefect({
      spotOrderId: props.spotOrderId,
      projectId: props.projectId,
      nodeName: props.nodeName,
      defectFile: uploadedUrl.value,
      defectDescribe: newDefectDescription.value,
    });
    emit('success');
  } catch (e) {
    console.error('新增缺陷失败:', e);
    alert('新增缺陷失败，请重试');
  }
};
</script>
