<script setup lang="ts">
import { computed, onUnmounted, ref } from 'vue';
import { ArrowLeft } from 'lucide-vue-next';
import checkMarkImg from '../../image asset/check mark.png';

const emit = defineEmits<{
  back: [];
}>();

type Step = 'verify' | 'confirm' | 'success';

const step = ref<Step>('verify');

const phone = ref('');
const verificationCode = ref('');
const countdown = ref(0);
const codeRequested = ref(false);
const codeError = ref(false);
const codeShakeKey = ref(0);

let countdownTimer: ReturnType<typeof setInterval> | null = null;

const phoneDigits = computed(() => phone.value.replace(/\D/g, ''));

const canGetCode = computed(() => phoneDigits.value.length === 11 && countdown.value === 0);

const getCodeLabel = computed(() => (countdown.value > 0 ? `${countdown.value}s` : '获取'));

const canProceed = computed(() => verificationCode.value.replace(/\D/g, '').length === 6);

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

  step.value = 'confirm';
}

function handleCancelDeactivate() {
  emit('back');
}

function handleConfirmDeactivate() {
  step.value = 'success';
}

function handleBack() {
  if (step.value === 'confirm') {
    step.value = 'verify';
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
      v-if="step !== 'success'"
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
                <label for="deactivate-phone" class="mb-2 block text-sm font-medium text-gray-600">
                  手机号
                </label>
                <div class="flex items-center gap-2">
                  <input
                    id="deactivate-phone"
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
                <label for="deactivate-code" class="mb-2 block text-sm font-medium text-gray-600">
                  验证码
                </label>
                <input
                  id="deactivate-code"
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

        <div
          v-else-if="step === 'confirm'"
          key="confirm"
          class="flex min-h-0 flex-1 flex-col items-center justify-center px-6 py-16"
        >
          <div
            class="w-full max-w-lg text-center text-[clamp(1.65rem,4.2vw,2.85rem)] font-bold leading-[1.32] tracking-tight text-gray-800 text-balance md:text-[clamp(1.85rem,3.6vw,3.1rem)]"
          >
            <p class="ml-8 sm:ml-12">您确定注销账户吗？</p>
            <p class="mt-2 sm:mt-3">此操作不可撤回</p>
          </div>

          <div class="mt-12 w-full max-w-xs space-y-3 sm:max-w-sm">
            <button
              type="button"
              class="w-full rounded-xl bg-gray-200/90 py-3 text-sm font-bold text-gray-700 transition-colors hover:bg-gray-300/90 sm:text-base"
              @click="handleCancelDeactivate"
            >
              取消
            </button>
            <button
              type="button"
              class="w-full rounded-xl bg-red-500 py-3 text-sm font-bold text-white transition-colors hover:bg-red-600 sm:text-base"
              @click="handleConfirmDeactivate"
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
            <p class="text-gray-500">您的账户已成功注销</p>
          </div>
          <button
            type="button"
            class="mt-12 rounded-xl border border-gray-200/80 bg-white/80 px-8 py-3 text-sm font-bold text-gray-800 transition-colors hover:bg-white"
          >
            前往门户首页
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

@keyframes code-shake {
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

.code-shake {
  animation: code-shake 0.45s ease-in-out;
}
</style>
