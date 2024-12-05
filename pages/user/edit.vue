<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div v-if="!isLoading">
    <UserEditTemplate
      v-if="!userInvalid && !isLoading"
      :user_invalid="userInvalid"
      :user-id="getUser" />

    <ValueNoExists v-if="userInvalid" text="Acesso negado" />

    <Toast />
  </div>

  <Lottie
    v-else
    path="./animations/loading_bar.json"
    :height="isMobile ? '200' : '300'"
    :width="isMobile ? '200' : '300'" />
</template>

<script lang="ts">
import Vue from 'vue';
import { user } from '@/store';
import { isMobileDevice } from '~/utils/utils';

export default Vue.extend({
  data() {
    return {
      isLoading: true,
      userInvalid: false,
    };
  },

  computed: {
    getUser(): string {
      if (this.$route.params && this.$route.params.id) return this.$route.params.id;
      return '';
    },

    isMobile() {
      return isMobileDevice(this.$vuetify);
    },
  },

  async mounted() {
    await this.userExists();
  },

  methods: {
    async userExists(): Promise<void> {
      this.$set(this, 'isLoading', true);

      const response = await user.get(this.getUser);

      if (response.body && response.body.code !== 'SEARCH_SUCCESS') {
        this.$set(this, 'userInvalid', true);
      } else {
        this.$set(this, 'userInvalid', false);
      }

      this.$set(this, 'isLoading', false);
    },
  },
});
</script>
