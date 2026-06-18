<script setup lang="ts">
import { useRouter } from 'vue-router';
import { Search, ShoppingBag, Heart, Bell } from 'lucide-vue-next';

const router = useRouter();

const props = withDefaults(defineProps<{
  isShop?: boolean;
  cartCount?: number;
  wishlistCount?: number;
  messageCount?: number;
  showBell?: boolean;
  userName?: string;
}>(), {
  isShop: false,
  cartCount: 0,
  wishlistCount: 0,
  messageCount: 0,
  showBell: false,
  userName: '管理员',
});

defineEmits(['cartClick', 'wishlistClick', 'messageClick', 'bellClick']);

function goPersonalCenter() {
  router.push({ name: 'personal-center' });
}
</script>

<template>
  <div class="flex items-center space-x-4">
    <div class="flex items-center bg-white rounded-full border border-gray-100 shadow-sm px-4 py-2 space-x-5 h-12">
      
      <div v-if="isShop" 
        @click="$emit('cartClick')"
        class="relative cursor-pointer hover:text-black transition-colors"
      >
        <ShoppingBag :size="20" class="text-gray-600" />
        <span v-if="cartCount > 0" class="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-3.5 h-3.5 flex items-center justify-center rounded-full border border-white font-bold">
            {{ cartCount > 9 ? '9+' : cartCount }}
        </span>
      </div>
      <div v-else class="flex items-center space-x-4">
        <Search :size="20" class="text-gray-600 cursor-pointer hover:text-black transition-colors" />
        <div v-if="showBell" @click="$emit('bellClick')" class="relative cursor-pointer hover:text-black transition-colors">
          <Bell :size="20" class="text-gray-600" />
          <span class="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
        </div>
      </div>
      
      <div v-if="isShop"
        @click="$emit('wishlistClick')"
        class="relative cursor-pointer hover:text-red-500 transition-colors"
      >
        <Heart :size="20" class="text-gray-600" />
        <span v-if="wishlistCount > 0" class="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
      </div>

    </div>
    <button
      type="button"
      class="flex h-12 items-center space-x-3 rounded-full border border-gray-100 bg-white py-1.5 pl-2 pr-4 shadow-sm transition-colors hover:bg-gray-50"
      aria-label="个人中心"
      @click="goPersonalCenter"
    >
      <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Cooper" alt="" class="h-9 w-9 rounded-full bg-gray-100" />
      <span class="text-sm font-bold text-gray-700">{{ props.userName }}</span>
    </button>
  </div>
</template>
