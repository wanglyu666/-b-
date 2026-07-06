<script setup lang="ts">
import { ref } from 'vue';
import {
  Banknote,
  Building2,
  ChevronRight,
  ClipboardList,
  FileText,
  HelpCircle,
  KeyRound,
  MapPin,
  Shield,
  Smartphone,
  UserCircle,
  UserX,
  type LucideIcon,
} from 'lucide-vue-next';

type MenuItem = {
  id: string;
  label: string;
  description: string;
  icon: LucideIcon;
};

const menuItems: MenuItem[] = [
  {
    id: 'security',
    label: '账号与安全',
    description: '密码、登录方式与安全设置',
    icon: Shield,
  },
  {
    id: 'registration',
    label: '基本信息',
    description: '查看注册信息、开票信息、地址信息',
    icon: ClipboardList,
  },
  {
    id: 'help',
    label: '帮助与咨询',
    description: '常见问题与在线客服',
    icon: HelpCircle,
  },
  {
    id: 'enterprise',
    label: '升级企业账号',
    description: '解锁团队协作与企业功能',
    icon: Building2,
  },
  {
    id: 'rules',
    label: '平台规则',
    description: '服务条款与平台使用规范',
    icon: FileText,
  },
];

const securityExpanded = ref(false);
const registrationExpanded = ref(false);
const helpExpanded = ref(false);
const rulesExpanded = ref(false);

const securityItems: { id: string; label: string; icon: LucideIcon }[] = [
  { id: 'password', label: '密码修改', icon: KeyRound },
  { id: 'phone', label: '手机号修改', icon: Smartphone },
  { id: 'deactivate', label: '注销', icon: UserX },
];

const registrationItems: { id: string; label: string; icon: LucideIcon }[] = [
  { id: 'basic', label: '注册信息', icon: UserCircle },
  { id: 'billing', label: '开票信息', icon: Banknote },
  { id: 'address', label: '地址信息', icon: MapPin },
];

const ruleItems = [
  '平台操作指导',
  '平台管理规定',
  '质量与技术标准',
  '信用服务考核制度',
  '服务标准和环境',
  '健康、安全、成品保护管理手册',
];

const emit = defineEmits<{
  'open-password-change': [];
  'open-phone-change': [];
  'open-deactivate': [];
  'open-billing-info': [];
  'open-basic-registration': [];
  'open-address-info': [];
  'open-enterprise-upgrade': [];
}>();

function handleSecurityItemClick(entryId: string) {
  if (entryId === 'password') {
    emit('open-password-change');
  }
  if (entryId === 'phone') {
    emit('open-phone-change');
  }
  if (entryId === 'deactivate') {
    emit('open-deactivate');
  }
}

function handleRegistrationItemClick(entryId: string) {
  if (entryId === 'basic') {
    emit('open-basic-registration');
  }
  if (entryId === 'billing') {
    emit('open-billing-info');
  }
  if (entryId === 'address') {
    emit('open-address-info');
  }
}

function handleItemClick(itemId: string) {
  if (itemId === 'enterprise') {
    emit('open-enterprise-upgrade');
    return;
  }

  const expandable = ['security', 'registration', 'help', 'rules'] as const;
  if (!expandable.includes(itemId as (typeof expandable)[number])) return;

  const next =
    itemId === 'security'
      ? !securityExpanded.value
      : itemId === 'registration'
        ? !registrationExpanded.value
        : itemId === 'help'
          ? !helpExpanded.value
          : !rulesExpanded.value;

  securityExpanded.value = false;
  registrationExpanded.value = false;
  helpExpanded.value = false;
  rulesExpanded.value = false;

  if (itemId === 'security') securityExpanded.value = next;
  if (itemId === 'registration') registrationExpanded.value = next;
  if (itemId === 'help') helpExpanded.value = next;
  if (itemId === 'rules') rulesExpanded.value = next;
}

function barRadiusClass(index: number, itemId: string) {
  const last = menuItems.length - 1;
  if (index === 0 && index === last) return 'rounded-3xl';
  if (index === 0) return 'rounded-t-3xl rounded-b-lg';
  if (index === last && itemId === 'rules' && rulesExpanded.value) {
    return 'rounded-t-lg rounded-b-lg';
  }
  if (index === last) return 'rounded-b-3xl rounded-t-lg';
  return 'rounded-lg';
}

function isItemExpanded(itemId: string) {
  if (itemId === 'security') return securityExpanded.value;
  if (itemId === 'registration') return registrationExpanded.value;
  if (itemId === 'help') return helpExpanded.value;
  if (itemId === 'rules') return rulesExpanded.value;
  return false;
}

function subBoxRadiusClass(index: number, total: number, withBottomLargeRadius = false) {
  if (index === 0) return 'rounded-t-lg rounded-b-lg';
  if (index === total - 1) {
    return withBottomLargeRadius ? 'rounded-b-3xl rounded-t-lg' : 'rounded-lg';
  }
  return 'rounded-lg';
}
</script>

<template>
  <div class="mx-auto flex w-full max-w-6xl flex-col gap-1">
    <template v-for="(item, index) in menuItems" :key="item.id">
      <button
        type="button"
        class="flex w-full items-center gap-4 border border-white/30 bg-white/80 px-5 py-5 text-left shadow-sm backdrop-blur-md transition-colors hover:bg-white sm:px-6 sm:py-6"
        :class="barRadiusClass(index, item.id)"
        @click="handleItemClick(item.id)"
      >
        <div
          class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-gray-600"
        >
          <component :is="item.icon" :size="20" stroke-width="1.75" />
        </div>

        <div class="min-w-0 flex-1">
          <p class="text-lg font-semibold text-gray-900">{{ item.label }}</p>
          <p class="mt-0.5 text-sm text-gray-500">{{ item.description }}</p>
        </div>

        <ChevronRight
          :size="18"
          class="shrink-0 text-gray-300 transition-transform duration-300 ease-out"
          :class="isItemExpanded(item.id) ? 'rotate-90' : ''"
        />
      </button>

      <Transition name="pc-dropdown">
        <div
          v-if="item.id === 'security' && securityExpanded"
          class="pc-dropdown-shell mx-auto w-[92%] max-w-full"
        >
          <div class="pc-dropdown-panel flex flex-col gap-1">
            <button
              v-for="(entry, entryIndex) in securityItems"
              :key="entry.id"
              type="button"
              class="flex w-full items-center gap-3 border border-white/30 bg-white/80 px-5 py-4 text-left text-sm font-semibold text-gray-900 shadow-sm backdrop-blur-md transition-colors hover:bg-white sm:gap-4 sm:px-6 sm:py-5 sm:text-base"
              :class="subBoxRadiusClass(entryIndex, securityItems.length)"
              @click="handleSecurityItemClick(entry.id)"
            >
              <component :is="entry.icon" :size="18" stroke-width="1.75" class="shrink-0 text-gray-600" />
              {{ entry.label }}
            </button>
          </div>
        </div>
      </Transition>

      <Transition name="pc-dropdown">
        <div
          v-if="item.id === 'registration' && registrationExpanded"
          class="pc-dropdown-shell mx-auto w-[92%] max-w-full"
        >
          <div class="pc-dropdown-panel flex flex-col gap-1">
            <button
              v-for="(entry, entryIndex) in registrationItems"
              :key="entry.id"
              type="button"
              class="flex w-full items-center gap-3 border border-white/30 bg-white/80 px-5 py-4 text-left text-sm font-semibold text-gray-900 shadow-sm backdrop-blur-md transition-colors hover:bg-white sm:gap-4 sm:px-6 sm:py-5 sm:text-base"
              :class="subBoxRadiusClass(entryIndex, registrationItems.length)"
              @click="handleRegistrationItemClick(entry.id)"
            >
              <component :is="entry.icon" :size="18" stroke-width="1.75" class="shrink-0 text-gray-600" />
              {{ entry.label }}
            </button>
          </div>
        </div>
      </Transition>

      <Transition name="pc-dropdown">
        <div
          v-if="item.id === 'help' && helpExpanded"
          class="pc-dropdown-shell mx-auto w-[92%] max-w-full"
        >
          <div
            class="pc-dropdown-panel flex flex-wrap items-center justify-center gap-x-12 gap-y-4 rounded-lg border border-white/30 bg-white/80 px-8 py-5 shadow-sm backdrop-blur-md sm:gap-x-16 sm:px-10 sm:py-6"
          >
            <div class="text-center">
              <p class="text-sm font-medium text-gray-500">客服邮箱</p>
              <a
                href="mailto:service@justpai.com"
                class="mt-1 block text-base font-bold text-gray-900 transition-colors hover:text-gray-700"
              >
                service@justpai.com
              </a>
            </div>
            <div class="text-center">
              <p class="text-sm font-medium text-gray-500">客服电话</p>
              <a
                href="tel:4006681997"
                class="mt-1 block text-base font-bold text-gray-900 transition-colors hover:text-gray-700"
              >
                400-668-1997
              </a>
            </div>
          </div>
        </div>
      </Transition>

      <Transition name="pc-dropdown">
        <div
          v-if="item.id === 'rules' && rulesExpanded"
          class="pc-dropdown-shell mx-auto w-[92%] max-w-full"
        >
          <div class="pc-dropdown-panel flex flex-col gap-1">
            <button
              v-for="(rule, ruleIndex) in ruleItems"
              :key="rule"
              type="button"
              class="w-full border border-white/30 bg-white/80 px-5 py-4 text-center text-sm font-semibold text-gray-900 shadow-sm backdrop-blur-md transition-colors hover:bg-white sm:px-6 sm:py-5 sm:text-base"
              :class="subBoxRadiusClass(ruleIndex, ruleItems.length, true)"
            >
              {{ rule }}
            </button>
          </div>
        </div>
      </Transition>
    </template>
  </div>
</template>

<style scoped>
.pc-dropdown-shell {
  display: grid;
  grid-template-rows: 1fr;
}

.pc-dropdown-panel {
  min-height: 0;
  overflow: hidden;
}

.pc-dropdown-enter-active,
.pc-dropdown-leave-active {
  transition:
    grid-template-rows 0.42s cubic-bezier(0.33, 1, 0.32, 1),
    opacity 0.34s cubic-bezier(0.4, 0, 0.2, 1);
}

.pc-dropdown-enter-active .pc-dropdown-panel,
.pc-dropdown-leave-active .pc-dropdown-panel {
  transition:
    transform 0.42s cubic-bezier(0.33, 1, 0.32, 1),
    opacity 0.34s cubic-bezier(0.4, 0, 0.2, 1);
}

.pc-dropdown-enter-from,
.pc-dropdown-leave-to {
  grid-template-rows: 0fr;
  opacity: 0;
}

.pc-dropdown-enter-to,
.pc-dropdown-leave-from {
  grid-template-rows: 1fr;
  opacity: 1;
}

.pc-dropdown-enter-from .pc-dropdown-panel,
.pc-dropdown-leave-to .pc-dropdown-panel {
  transform: translateY(-8px);
  opacity: 0.72;
}

.pc-dropdown-enter-to .pc-dropdown-panel,
.pc-dropdown-leave-from .pc-dropdown-panel {
  transform: translateY(0);
  opacity: 1;
}
</style>
