<script setup lang="ts">
import { computed, onUnmounted, ref } from 'vue';
import { ArrowLeft } from 'lucide-vue-next';
import checkMarkImg from '../../image asset/check mark.png';

const emit = defineEmits<{
  back: [];
}>();

type Step = 'verify' | 'new-phone' | 'success';

const step = ref<Step>('verify');

const phone = ref('');
const verificationCode = ref('');
const countdown = ref(0);

const newPhone = ref('');
const newVerificationCode = ref('');
const newCountdown = ref(0);

const codeRequested = ref(false);
const codeError = ref(false);
const codeShakeKey = ref(0);
const newCodeRequested = ref(false);
const newCodeError = ref(false);
const newCodeShakeKey = ref(0);

let countdownTimer: ReturnType<typeof setInterval> | null = null;
let newCountdownTimer: ReturnType<typeof setInterval> | null = null;

const phoneDigits = computed(() => phone.value.replace(/\D/g, ''));
const newPhoneDigits = computed(() => newPhone.value.replace(/\D/g, ''));

const canGetCode = computed(() => phoneDigits.value.length === 11 && countdown.value === 0);
const canGetNewCode = computed(() => newPhoneDigits.value.length === 11 && newCountdown.value === 0);

const getCodeLabel = computed(() => (countdown.value > 0 ? `${countdown.value}s` : '获取'));
const getNewCodeLabel = computed(() => (newCountdown.value > 0 ? `${newCountdown.value}s` : '获取'));

const canProceed = computed(() => verificationCode.value.replace(/\D/g, '').length === 6);
const canConfirm = computed(() => newVerificationCode.value.replace(/\D/g, '').length === 6);

function clearCountdownTimer() {
  if (countdownTimer) {
    clearInterval(countdownTimer);
    countdownTimer = null;
  }
}

function clearNewCountdownTimer() {
  if (newCountdownTimer) {
    clearInterval(newCountdownTimer);
    newCountdownTimer = null;
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

function startNewCountdown() {
  clearNewCountdownTimer();
  newCountdown.value = 60;
  newCountdownTimer = setInterval(() => {
    if (newCountdown.value <= 1) {
      newCountdown.value = 0;
      clearNewCountdownTimer();
      return;
    }
    newCountdown.value -= 1;
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

function onNewPhoneInput(event: Event) {
  const input = event.target as HTMLInputElement;
  const digits = input.value.replace(/\D/g, '').slice(0, 11);
  newPhone.value = digits;
  input.value = digits;
}

function onNewCodeInput(event: Event) {
  const input = event.target as HTMLInputElement;
  const digits = input.value.replace(/\D/g, '').slice(0, 6);
  newVerificationCode.value = digits;
  input.value = digits;
  newCodeError.value = false;
}

function handleGetCode() {
  if (!canGetCode.value) return;
  codeRequested.value = true;
  startCountdown();
}

function handleGetNewCode() {
  if (!canGetNewCode.value) return;
  newCodeRequested.value = true;
  startNewCountdown();
}

function handleNextStep() {
  if (!canProceed.value) return;

  if (verificationCode.value.replace(/\D/g, '') === '222222') {
    codeError.value = true;
    codeShakeKey.value += 1;
    return;
  }

  step.value = 'new-phone';
}

function handleConfirm() {
  if (!canConfirm.value) return;

  if (newVerificationCode.value.replace(/\D/g, '') === '222222') {
    newCodeError.value = true;
    newCodeShakeKey.value += 1;
    return;
  }

  step.value = 'success';
}

function resetNewPhoneForm() {
  newPhone.value = '';
  newVerificationCode.value = '';
  newCountdown.value = 0;
  newCodeRequested.value = false;
  newCodeError.value = false;
  clearNewCountdownTimer();
}

function handleBack() {
  if (step.value === 'success') {
    emit('back');
    return;
  }
  if (step.value === 'new-phone') {
    step.value = 'verify';
    resetNewPhoneForm();
    return;
  }
  emit('back');
}

onUnmounted(() => {
  clearCountdownTimer();
  clearNewCountdownTimer();
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
                <label for="phone-change-phone" class="mb-2 block text-sm font-medium text-gray-600">
                  手机号
                </label>
                <div class="flex items-center gap-2">
                  <input
                    id="phone-change-phone"
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
                <label for="phone-change-code" class="mb-2 block text-sm font-medium text-gray-600">
                  验证码
                </label>
                <input
                  id="phone-change-code"
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

        <div v-else-if="step === 'new-phone'" key="new-phone" class="flex min-h-0 flex-1 flex-col">
          <div
            class="flex flex-1 flex-col items-center px-6 pb-6 pt-32 sm:px-10 sm:pt-36 md:pt-40"
          >
            <div
              class="mx-auto w-full max-w-[22em] text-center text-[clamp(1.65rem,4.2vw,2.85rem)] font-bold leading-[1.32] tracking-tight text-gray-800 text-balance sm:max-w-[20em] md:text-[clamp(1.85rem,3.6vw,3.1rem)]"
            >
              <p>请输入新的手机号后获取验证码</p>
              <p class="mt-2 sm:mt-3">并进行验证</p>
            </div>

            <div class="mt-6 w-full max-w-md space-y-3.5 text-left sm:mt-7">
              <div>
                <label for="phone-change-new-phone" class="mb-2 block text-sm font-medium text-gray-600">
                  手机号
                </label>
                <div class="flex items-center gap-2">
                  <input
                    id="phone-change-new-phone"
                    :value="newPhone"
                    type="tel"
                    inputmode="numeric"
                    autocomplete="tel"
                    maxlength="11"
                    placeholder="请输入手机号"
                    class="w-full max-w-sm shrink-0 rounded-xl border border-gray-200/80 bg-white/90 px-4 py-3 text-base text-gray-900 outline-none transition focus:border-transparent focus:ring-2 focus:ring-[#9FE870]/80"
                    @input="onNewPhoneInput"
                  />
                  <button
                    type="button"
                    class="shrink-0 rounded-xl px-4 py-3 text-sm font-bold transition-colors"
                    :class="
                      canGetNewCode
                        ? 'bg-[#FFE600] text-[#260A2F] shadow-[0_0_12px_rgba(255,230,0,0.25)] hover:bg-[#e6cf00]'
                        : 'cursor-not-allowed bg-[#FFE600]/35 text-[#260A2F]/45'
                    "
                    :disabled="!canGetNewCode"
                    @click="handleGetNewCode"
                  >
                    {{ getNewCodeLabel }}
                  </button>
                </div>
              </div>

              <div>
                <label for="phone-change-new-code" class="mb-2 block text-sm font-medium text-gray-600">
                  验证码
                </label>
                <input
                  id="phone-change-new-code"
                  :value="newVerificationCode"
                  type="text"
                  inputmode="numeric"
                  autocomplete="one-time-code"
                  maxlength="6"
                  placeholder="请输入验证码"
                  :disabled="!newCodeRequested"
                  class="w-[68%] max-w-[220px] rounded-xl border border-gray-200/80 bg-white/90 px-4 py-3 text-base text-gray-900 outline-none transition focus:border-transparent focus:ring-2 focus:ring-[#9FE870]/80 disabled:cursor-not-allowed disabled:bg-gray-100/90 disabled:text-gray-400 sm:w-[62%]"
                  @input="onNewCodeInput"
                />
                <p
                  v-if="newCodeError"
                  :key="newCodeShakeKey"
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
            <p class="text-gray-500">您的手机号已成功修改</p>
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
