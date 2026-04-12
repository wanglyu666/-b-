<script setup lang="ts">
import { computed, onMounted, watch } from 'vue';
import { RouterView, useRoute, useRouter } from 'vue-router';
import { Settings } from 'lucide-vue-next';
import Sidebar from './components/Sidebar.vue';
import ManagementHaloBackground from './components/ManagementHaloBackground.vue';
import { useAppStore } from './stores/appStore';

const router = useRouter();
const route = useRoute();
const appStore = useAppStore();

const rootBgColor = 'bg-[#f1f3f0]';
const activeTab = computed(() => String(route.meta.activeTab ?? 'home'));

const tabRouteMap: Record<string, string> = {
  home: '/home',
  shop: '/shop',
  management: '/management',
  'org-architecture': '/org',
  contracts: '/contracts',
  'consultation-feedback': '/consultation-feedback',
};

function onSidebarNavigate(tab: string) {
  const to = tabRouteMap[tab];
  if (to) router.push(to);
}

onMounted(() => {
  appStore.loadGlobalModules();
});

watch(
  () => route.fullPath,
  () => {
    const mainEl = document.getElementById('main-content');
    if (mainEl) mainEl.scrollTop = 0;
    requestAnimationFrame(() => {
      if (mainEl) mainEl.scrollTop = 0;
    });
  },
);
</script>

<template>
  <div :class="['flex h-screen font-sans text-gray-900 selection:bg-[#A1D573] selection:text-white relative overflow-hidden transition-colors duration-300 ease-out', rootBgColor]">
    <div class="absolute inset-0 overflow-hidden pointer-events-none z-0">
      <ManagementHaloBackground />
    </div>

    <Sidebar
      :activeTab="activeTab"
      @update:activeTab="onSidebarNavigate"
      class="relative z-10"
    />

    <main id="main-content" class="main-scroll flex-1 overflow-y-auto h-full relative z-10 min-w-0">
      <Transition name="page-transition" mode="out-in">
        <RouterView />
      </Transition>
    </main>

    <div class="md:hidden fixed bottom-6 right-6 bg-black text-white p-4 rounded-full shadow-xl z-50">
      <Settings :size="24" />
    </div>
  </div>
</template>

<style>
.main-scroll {
  scrollbar-gutter: stable;
}

.page-transition-enter-active {
  transition: opacity 0.28s cubic-bezier(0.4, 0, 0.2, 1);
}
.page-transition-leave-active {
  transition: opacity 0.18s cubic-bezier(0.4, 0, 0.2, 1);
}
.page-transition-enter-from,
.page-transition-leave-to {
  opacity: 0;
}
</style>
