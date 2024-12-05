<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div>
    <Loading v-if="loading" />

    <div v-else class="background">
      <v-form ref="form" v-model="valid" class="pb-3" @submit.prevent="validate(false)">
        <BobForm :is-editing="isEditing" :duplicate-bob="duplicateBobInfo" />

        <v-row v-if="!$isLoading" :class="isMobile ? 'text-center ' : 'mt-5'">
          <v-col cols="12" md="4" :align="!isMobile ? 'end' : ''">
            <v-btn
              text
              class="btnForm btnBack"
              :class="isMobile ? 'btnMobile' : ''"
              @click="back">
              Voltar
            </v-btn>
          </v-col>

          <v-col cols="12" md="4" :align="!isMobile ? 'center' : ''">
            <v-btn
              text
              class="btnForm btnSuccess"
              :class="isMobile ? 'btnMobile' : ''"
              @click="validate(false)">
              Salvar
            </v-btn>
          </v-col>

          <v-col cols="12" md="4" :align="!isMobile ? 'start' : ''">
            <v-btn
              text
              class="btnForm btnSuccess"
              :class="isMobile ? 'btnMobile' : ''"
              @click="validate(true)">
              Salvar e cadastrar outro
            </v-btn>
          </v-col>
        </v-row>
      </v-form>
    </div>
  </div>
</template>

<script lang="ts">
/* eslint-disable vue/prop-name-casing */
import Vue from 'vue';
import { updateBob, isMobileDevice } from '@/utils/utils';
import { bob, toast, loading } from '@/store';

export default Vue.extend({
  props: {
    isEditing: {
      type: Boolean,
      default: false,
    },

    bobId: {
      type: String,
      default: '',
    },
  },

  data: () => ({
    loading: false,
    valid: true,
    duplicateBobInfo: {},
  }),

  computed: {
    getUserId() {
      return this.$cookies.get('user_id');
    },

    $isLoading(): any {
      return loading.$isLoading;
    },

    $bob() {
      return bob.$bob;
    },

    isMobile() {
      return isMobileDevice(this.$vuetify);
    },
  },

  created() {
    if (!this.isEditing && Object.keys(this.$route.query).length <= 0) {
      this.resetBob();
      this.$set(this, 'duplicateBobInfo', {});
    }
  },

  methods: {
    back(): void {
      this.$router.replace('/bobs');
      setTimeout(() => {
        this.resetBob();
        this.$set(this, 'duplicateBobInfo', {});
      }, 300);
    },

    resetBob(this: any): void {
      bob.reset();
    },

    duplicateBob(): void {
      this.$set(this, 'duplicateBobInfo', {
        customer: this.$bob.customer,
        trade: this.$bob.trade,
        origin: this.$bob.origin,
        destiny: this.$bob.destiny,
        product: this.$bob.product,
        container_id: this.$bob.container_id,
        seller_freetime_origin: this.$bob.seller_freetime_origin,
        seller_freetime_destiny: this.$bob.seller_freetime_destiny,
        year_effective: this.$bob.year_effective,
        month_effective: this.$bob.month_effective,
      });
    },

    validate(saveAndNew: Boolean): void {
      loading.setIsLoading(true);
      this.$refs.form.validate();

      if (this.valid) this.isEditing ? this.onUpdate() : this.onCreate(saveAndNew);
      else {
        toast.setToast({
          text: 'Existem campos obrigatórios',
          type: 'danger',
          time: 3000,
        });

        loading.setIsLoading(false);
      }
    },

    async onCreate(saveAndNew: Boolean): Promise<void> {
      if (typeof bob.$bob.month_effective !== 'string') {
        bob.$bob.month_effective = bob.$bob.month_effective.value;
      }

      bob.$bob.seller_id = this.getUserId;
      bob.$bob.modal_id = '121013ff-7f09-4dbf-bea9-ac518f5de5f1';

      bob.$bob.year_effective = bob.$bob.year_effective.toString();
      bob.$bob.month_effective = bob.$bob.month_effective.toString();

      const response = await bob.create(bob.$bob);

      if (response.body && response.body.code === 'CREATE_SUCCESS') {
        toast.setToast({
          text: 'BOB cadastrado com sucesso!',
          type: 'success',
          time: 2000,
        });

        if (!saveAndNew) {
          this.$router.replace('/bobs');
        } else {
          await this.duplicateBob();
        }

        await this.resetBob();
      } else {
        toast.setToast({
          text: 'Ocorreu um erro ao cadastrar o BOB',
          type: 'danger',
          time: 3000,
        });
      }

      loading.setIsLoading(false);
    },

    async onUpdate(): Promise<void> {
      await updateBob(this.getUserId, '');

      loading.setIsLoading(false);

      this.$set(this, 'loading', false);
    },

    formatString(inputString) {
      const words = inputString.split(' ');

      const formattedWords = words.map((word) => {
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      });

      const resultString = formattedWords.join('');

      return resultString;
    },
  },
});
</script>

<style lang="scss" scoped>
.background {
  background-color: var(--white);
}

.container {
  padding: 2rem;
  background-color: var(--white);
  border-radius: 4px;
}

.btnMobile {
  width: 200px;
}
</style>
