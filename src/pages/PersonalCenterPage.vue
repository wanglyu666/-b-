<script setup lang="ts">
import { ref } from 'vue';
import PersonalCenterProfileHeader from '../components/PersonalCenterProfileHeader.vue';
import PersonalCenterOptionsCard from '../components/PersonalCenterOptionsCard.vue';
import PasswordChangeView from '../components/PasswordChangeView.vue';
import PhoneChangeView from '../components/PhoneChangeView.vue';
import AccountDeactivationView from '../components/AccountDeactivationView.vue';
import BillingInfoView from '../components/BillingInfoView.vue';
import BasicRegistrationInfoView from '../components/BasicRegistrationInfoView.vue';
import AddressInfoView from '../components/AddressInfoView.vue';
import ProfileEditView, { type ProfileEditPayload } from '../components/ProfileEditView.vue';
import EnterpriseUpgradeView from '../components/EnterpriseUpgradeView.vue';

type ProfileSubView =
  | 'main'
  | 'password-change'
  | 'phone-change'
  | 'deactivate'
  | 'billing-info'
  | 'basic-registration'
  | 'address-info'
  | 'profile-edit'
  | 'enterprise-upgrade';

const subView = ref<ProfileSubView>('main');

const profileName = ref('管理员');
const profileEmail = ref('admin@justpai.com');
const profileAvatarUrl = ref('https://api.dicebear.com/7.x/avataaars/svg?seed=Cooper');

function handleProfileSave(payload: ProfileEditPayload) {
  profileName.value = payload.name;
  profileEmail.value = payload.email;
  profileAvatarUrl.value = payload.avatarUrl;
  subView.value = 'main';
}
</script>

<template>
  <div
    class="mx-auto flex min-h-screen max-w-[1600px] flex-col p-8 animate-in fade-in slide-in-from-bottom-4 duration-700"
  >
    <Transition name="pc-page" mode="out-in">
      <div v-if="subView === 'main'" key="profile" class="flex flex-1 flex-col">
        <PersonalCenterProfileHeader
          :name="profileName"
          :email="profileEmail"
          :avatar-url="profileAvatarUrl"
          @edit="subView = 'profile-edit'"
        />
        <PersonalCenterOptionsCard
          class="mt-6"
          @open-password-change="subView = 'password-change'"
          @open-phone-change="subView = 'phone-change'"
          @open-deactivate="subView = 'deactivate'"
          @open-billing-info="subView = 'billing-info'"
          @open-basic-registration="subView = 'basic-registration'"
          @open-address-info="subView = 'address-info'"
          @open-enterprise-upgrade="subView = 'enterprise-upgrade'"
        />

        <p class="mt-auto pt-10 text-center text-xs text-gray-400 sm:text-sm">
          点击查看这么派的
          <a
            href="#"
            class="text-gray-500 underline decoration-gray-400 underline-offset-2 transition-colors hover:text-gray-700"
          >
            服务协议
          </a>
          和
          <a
            href="#"
            class="text-gray-500 underline decoration-gray-400 underline-offset-2 transition-colors hover:text-gray-700"
          >
            隐私政策
          </a>
        </p>
      </div>

      <PasswordChangeView
        v-else-if="subView === 'password-change'"
        key="password-change"
        class="flex-1"
        @back="subView = 'main'"
      />

      <PhoneChangeView
        v-else-if="subView === 'phone-change'"
        key="phone-change"
        class="flex-1"
        @back="subView = 'main'"
      />

      <AccountDeactivationView
        v-else-if="subView === 'deactivate'"
        key="deactivate"
        class="flex-1"
        @back="subView = 'main'"
      />

      <BillingInfoView
        v-else-if="subView === 'billing-info'"
        key="billing-info"
        class="flex-1"
        @back="subView = 'main'"
      />

      <BasicRegistrationInfoView
        v-else-if="subView === 'basic-registration'"
        key="basic-registration"
        class="flex-1"
        @back="subView = 'main'"
      />

      <AddressInfoView
        v-else-if="subView === 'address-info'"
        key="address-info"
        class="flex-1"
        @back="subView = 'main'"
      />

      <ProfileEditView
        v-else-if="subView === 'profile-edit'"
        key="profile-edit"
        class="flex-1"
        :name="profileName"
        :email="profileEmail"
        :avatar-url="profileAvatarUrl"
        @back="subView = 'main'"
        @save="handleProfileSave"
      />

      <EnterpriseUpgradeView
        v-else-if="subView === 'enterprise-upgrade'"
        key="enterprise-upgrade"
        class="flex-1"
        @back="subView = 'main'"
        @submit="subView = 'main'"
      />
    </Transition>
  </div>
</template>

<style scoped>
.pc-page-enter-active,
.pc-page-leave-active {
  transition:
    opacity 0.35s cubic-bezier(0.4, 0, 0.2, 1),
    transform 0.35s cubic-bezier(0.33, 1, 0.32, 1);
}

.pc-page-enter-from,
.pc-page-leave-to {
  opacity: 0;
  transform: translateY(12px);
}

.pc-page-enter-to,
.pc-page-leave-from {
  opacity: 1;
  transform: translateY(0);
}
</style>
