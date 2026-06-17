<script setup lang="ts">
import { computed, onUnmounted, ref } from 'vue';
import { ArrowLeft, Eye, EyeOff } from 'lucide-vue-next';
import checkMarkImg from '../../image asset/check mark.png';

const emit = defineEmits<{
  back: [];
}>();

type Step = 'verify' | 'password' | 'success';

const step = ref<Step>('verify');
const phone = ref('');
const verificationCode = ref('');
const newPassword = ref('');
const confirmPassword = ref('');
const showNewPassword = ref(false);
const showConfirmPassword = ref(false);
const countdown = ref(0);
const passwordMismatchError = ref(false);
const passwordRuleError = ref(false);
const shakeKey = ref(0);
const codeRequested = ref(false);
const codeError = ref(false);
const codeShakeKey = ref(0);

let countdownTimer: ReturnType<typeof setInterval> | null = null;

const phoneDigits = computed(() => phone.value.replace(/\D/g, ''));

const canGetCode = computed(() => phoneDigits.value.length === 11 && countdown.value === 0);

const getCodeLabel = computed(() => (countdown.value > 0 ? `${countdown.value}s` : '获取'));

const canProceed = computed(() => verificationCode.value.replace(/\D/g, '').length === 6);

const canConfirm = computed(
  () => newPassword.value.length > 0 && confirmPassword.value.length > 0,
);

function isValidPassword(value: string) {
  return value.length >= 9 && /\d/.test(value) && /[a-zA-Z]/.test(value);
}

function clearCountdownTimer() {
  if (countdownTimer) {
    clearInterval(countdownTimer);
    countdownTimer = null;
  }
}

function startCountdown() {
  clearCountdownTimer();
  countdown.value = 60;
  countdownTimer = setInterval(() => {
    if (countdown.value <= 1) {
      countdown.value = 0;
      clearCountdownTimer();
      return;
    }
    countdown.value -= 1;
  }, 1000);
}

function onPhoneInput(event: Event) {
  const input = event.target as HTMLInputElement;
  const digits = input.value.replace(/\D/g, '').slice(0, 11);
  phone.value = digits;
  input.value = digits;
}

function onCodeInput(event: Event) {
  const input = event.target as HTMLInputElement;
  const digits = input.value.replace(/\D/g, '').slice(0, 6);
  verificationCode.value = digits;
  input.value = digits;
  codeError.value = false;
}

function onConfirmPasswordInput() {
  passwordMismatchError.value = false;
}

function onNewPasswordInput() {
  passwordRuleError.value = false;
}

function handleGetCode() {
  if (!canGetCode.value) return;
  codeRequested.value = true;
  startCountdown();
}

function handleNextStep() {
  if (!canProceed.value) return;

  if (verificationCode.value.replace(/\D/g, '') === '222222') {
    codeError.value = true;
    codeShakeKey.value += 1;
    return;
  }

  step.value = 'password';
}

function handleConfirm() {
  if (!canConfirm.value) return;

  passwordRuleError.value = false;
  passwordMismatchError.value = false;

  if (newPassword.value !== confirmPassword.value) {
    passwordMismatchError.value = true;
    shakeKey.value += 1;
    return;
  }

  if (!isValidPassword(newPassword.value)) {
    passwordRuleError.value = true;
    return;
  }

  step.value = 'success';
}

function resetPasswordForm() {
  newPassword.value = '';
  confirmPassword.value = '';
  showNewPassword.value = false;
  showConfirmPassword.value = false;
  passwordMismatchError.value = false;
  passwordRuleError.value = false;
}

function handleBack() {
  if (step.value === 'success') {
    emit('back');
    return;
  }
  if (step.value === 'password') {
    step.value = 'verify';
    resetPasswordForm();
    return;
  }
  emit('back');
}

onUnmounted(() => {
  clearCountdownTimer();
});
</script>

<template>
  <div
    class="mx-auto flex w-full max-w-6xl flex-1 flex-col animate-in fade-in slide-in-from-bottom-2 duration-500"
  >
    <button
      type="button"
      class="mb-4 inline-flex w-fit items-center gap-2 rounded-lg px-2 py-1.5 text-sm font-medium text-gray-600 transition-colors hover:bg-white/50 hover:text-gray-900"
      @click="handleBack"
    >
      <ArrowLeft :size="18" />
      返回
    </button>

    <div
      class="flex min-h-[calc(100vh-10rem)] flex-1 flex-col overflow-hidden rounded-3xl border border-white/20 bg-white/70 shadow-sm backdrop-blur-md"
    >
      <Transition name="pc-step" mode="out-in">
        <div v-if="step === 'verify'" key="verify" class="flex min-h-0 flex-1 flex-col">
          <div
            class="flex flex-1 flex-col items-center px-6 pb-6 pt-32 sm:px-10 sm:pt-36 md:pt-40"
          >
            <div
              class="w-full max-w-[18em] text-center text-[clamp(1.65rem,4.2vw,2.85rem)] font-bold leading-[1.32] tracking-tight text-gray-800 text-balance sm:max-w-[16em] md:text-[clamp(1.85rem,3.6vw,3.1rem)]"
            >
              <p>请输入手机号后获取验证码</p>
              <p class="mt-2 sm:mt-3">并进行验证</p>
            </div>

            <div class="mt-6 w-full max-w-md space-y-3.5 text-left sm:mt-7">
              <div>
                <label for="password-change-phone" class="mb-2 block text-sm font-medium text-gray-600">
                  手机号
                </label>
                <div class="flex items-center gap-2">
                  <input
                    id="password-change-phone"
                    :value="phone"
                    type="tel"
                    inputmode="numeric"
                    autocomplete="tel"
                    maxlength="11"
                    placeholder="请输入手机号"
                    class="w-full max-w-sm shrink-0 rounded-xl border border-gray-200/80 bg-white/90 px-4 py-3 text-base text-gray-900 outline-none transition focus:border-transparent focus:ring-2 focus:ring-[#9FE870]/80"
                    @input="onPhoneInput"
                  />
                  <button
                    type="button"
                    class="shrink-0 rounded-xl px-4 py-3 text-sm font-bold transition-colors"
                    :class="
                      canGetCode
                        ? 'bg-[#FFE600] text-[#260A2F] shadow-[0_0_12px_rgba(255,230,0,0.25)] hover:bg-[#e6cf00]'
                        : 'cursor-not-allowed bg-[#FFE600]/35 text-[#260A2F]/45'
                    "
                    :disabled="!canGetCode"
                    @click="handleGetCode"
                  >
                    {{ getCodeLabel }}
                  </button>
                </div>
              </div>

              <div>
                <label for="password-change-code" class="mb-2 block text-sm font-medium text-gray-600">
                  验证码
                </label>
                <input
                  id="password-change-code"
                  :value="verificationCode"
                  type="text"
                  inputmode="numeric"
                  autocomplete="one-time-code"
                  maxlength="6"
                  placeholder="请输入验证码"
                  :disabled="!codeRequested"
                  class="w-[68%] max-w-[220px] rounded-xl border border-gray-200/80 bg-white/90 px-4 py-3 text-base text-gray-900 outline-none transition focus:border-transparent focus:ring-2 focus:ring-[#9FE870]/80 disabled:cursor-not-allowed disabled:bg-gray-100/90 disabled:text-gray-400 sm:w-[62%]"
                  @input="onCodeInput"
                />
                <p
                  v-if="codeError"
                  :key="codeShakeKey"
                  class="code-shake mt-1.5 text-xs text-red-500"
                >
                  验证码输入错误，请重新输入
                </p>
              </div>
            </div>
          </div>

          <div class="flex justify-center px-6 pb-10 sm:pb-12">
            <button
              type="button"
              class="min-w-[140px] rounded-xl px-10 py-3 text-sm font-bold transition-colors sm:min-w-[160px] sm:text-base"
              :class="
                canProceed
                  ? 'bg-[#FFE600] text-[#260A2F] shadow-[0_0_12px_rgba(255,230,0,0.25)] hover:bg-[#e6cf00]'
                  : 'cursor-not-allowed bg-[#FFE600]/35 text-[#260A2F]/45'
              "
              :disabled="!canProceed"
              @click="handleNextStep"
            >
              下一步
            </button>
          </div>
        </div>

        <div v-else-if="step === 'password'" key="password" class="flex min-h-0 flex-1 flex-col">
          <div
            class="flex flex-1 flex-col items-center px-6 pb-6 pt-32 sm:px-10 sm:pt-36 md:pt-40"
          >
            <div
              class="w-full max-w-[18em] text-center text-[clamp(1.65rem,4.2vw,2.85rem)] font-bold leading-[1.32] tracking-tight text-gray-800 text-balance sm:max-w-[16em] md:text-[clamp(1.85rem,3.6vw,3.1rem)]"
            >
              <p>请输入新的密码</p>
              <p class="mt-2 sm:mt-3">并再次输入确认</p>
            </div>

            <div class="mt-6 w-full max-w-md space-y-3.5 text-left sm:mt-7 ml-10 sm:ml-16">
              <div>
                <label for="password-change-new" class="mb-2 block text-sm font-medium text-gray-600">
                  新密码
                </label>
                <div class="relative w-full max-w-sm">
                  <input
                    id="password-change-new"
                    v-model="newPassword"
                    :type="showNewPassword ? 'text' : 'password'"
                    autocomplete="new-password"
                    placeholder="请输入新密码"
                    class="w-full rounded-xl border border-gray-200/80 bg-white/90 py-3 pl-4 pr-11 text-base text-gray-900 outline-none transition focus:border-transparent focus:ring-2 focus:ring-[#9FE870]/80"
                    @input="onNewPasswordInput"
                  />
                  <button
                    type="button"
                    class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 transition-colors hover:text-gray-600"
                    :aria-label="showNewPassword ? '隐藏密码' : '显示密码'"
                    @click="showNewPassword = !showNewPassword"
                  >
                    <EyeOff v-if="showNewPassword" :size="18" />
                    <Eye v-else :size="18" />
                  </button>
                </div>
                <p
                  class="mt-1.5 text-xs text-gray-400"
                  :class="{ 'text-red-500': passwordRuleError }"
                >
                  密码需在9位及以上，包含数字和字母
                </p>
              </div>

              <div>
                <label for="password-change-confirm" class="mb-2 block text-sm font-medium text-gray-600">
                  确认密码
                </label>
                <div class="relative w-full max-w-sm">
                  <input
                    id="password-change-confirm"
                    v-model="confirmPassword"
                    :type="showConfirmPassword ? 'text' : 'password'"
                    autocomplete="new-password"
                    placeholder="请再次输入新密码"
                    class="w-full rounded-xl border border-gray-200/80 bg-white/90 py-3 pl-4 pr-11 text-base text-gray-900 outline-none transition focus:border-transparent focus:ring-2 focus:ring-[#9FE870]/80"
                    @input="onConfirmPasswordInput"
                  />
                  <button
                    type="button"
                    class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 transition-colors hover:text-gray-600"
                    :aria-label="showConfirmPassword ? '隐藏密码' : '显示密码'"
                    @click="showConfirmPassword = !showConfirmPassword"
                  >
                    <EyeOff v-if="showConfirmPassword" :size="18" />
                    <Eye v-else :size="18" />
                  </button>
                </div>
                <p
                  v-if="passwordMismatchError"
                  :key="shakeKey"
                  class="password-shake mt-1.5 text-xs text-red-500"
                >
                  两次密码输入不一致，请重新输入
                </p>
              </div>
            </div>
          </div>

          <div class="flex justify-center px-6 pb-10 sm:pb-12">
            <button
              type="button"
              class="min-w-[140px] rounded-xl px-10 py-3 text-sm font-bold transition-colors sm:min-w-[160px] sm:text-base"
              :class="
                canConfirm
                  ? 'bg-[#FFE600] text-[#260A2F] shadow-[0_0_12px_rgba(255,230,0,0.25)] hover:bg-[#e6cf00]'
                  : 'cursor-not-allowed bg-[#FFE600]/35 text-[#260A2F]/45'
              "
              :disabled="!canConfirm"
              @click="handleConfirm"
            >
              确认
            </button>
          </div>
        </div>

        <div
          v-else
          key="success"
          class="flex min-h-0 flex-1 flex-col items-center justify-center px-6 py-16 animate-in zoom-in-95 duration-500"
        >
          <img :src="checkMarkImg" alt="" class="mb-6 h-48 w-72 object-contain" />
          <div class="text-center">
            <h3 class="mb-2 text-3xl font-bold tracking-tight text-gray-900">已完成提交</h3>
            <p class="text-gray-500">您的密码已成功修改</p>
          </div>
          <button
            type="button"
            class="mt-12 rounded-xl border border-gray-200/80 bg-white/80 px-8 py-3 text-sm font-bold text-gray-800 transition-colors hover:bg-white"
            @click="emit('back')"
          >
            返回个人中心
          </button>
        </div>
      </Transition>
    </div>
  </div>
</template>

<style scoped>
.pc-step-enter-active,
.pc-step-leave-active {
  transition:
    opacity 0.32s cubic-bezier(0.4, 0, 0.2, 1),
    transform 0.32s cubic-bezier(0.33, 1, 0.32, 1);
}

.pc-step-enter-from,
.pc-step-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

.pc-step-enter-to,
.pc-step-leave-from {
  opacity: 1;
  transform: translateY(0);
}

@keyframes password-shake {
  0%,
  100% {
    transform: translateX(0);
  }
  20% {
    transform: translateX(-7px);
  }
  40% {
    transform: translateX(7px);
  }
  60% {
    transform: translateX(-5px);
  }
  80% {
    transform: translateX(5px);
  }
}

.password-shake {
  animation: password-shake 0.45s ease-in-out;
}

.code-shake {
  animation: password-shake 0.45s ease-in-out;
}
</style>
