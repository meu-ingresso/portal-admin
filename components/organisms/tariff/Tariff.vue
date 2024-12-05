<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div>
    <Loading v-if="loading" />

    <div v-else class="background">
      <v-form ref="form" v-model="valid" class="pb-3" @submit.prevent="validate">
        <UserForm :is-editing="isEditing" />

        <v-row :class="isMobile ? 'text-center' : ''" class="mt-5">
          <v-col cols="12" md="6" :align="!isMobile ? 'end' : ''">
            <v-btn
              text
              class="btnForm btnBack"
              :class="isMobile ? 'btnMobile' : ''"
              @click="back">
              Voltar
            </v-btn>
          </v-col>

          <v-col cols="12" md="6" :align="!isMobile ? 'start' : ''">
            <v-btn
              text
              class="btnForm btnSuccess"
              :class="isMobile ? 'btnMobile' : ''"
              @click="validate">
              {{ isEditing ? 'Salvar' : 'Cadastrar' }}
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
import { user, toast } from '~/store';
import { isMobileDevice } from '@/utils/utils';

export default Vue.extend({
  props: {
    isEditing: {
      type: Boolean,
      default: false,
    },

    userId: {
      type: String,
      default: '',
    },
  },

  data: () => ({
    loading: false,
    valid: true,
  }),

  computed: {
    getAdmin() {
      return this.$cookies.get('user_role') === 'Administrador';
    },

    isMobile() {
      return isMobileDevice(this.$vuetify);
    },

    getUserId() {
      return this.$cookies.get('user_id');
    },
  },

  created() {
    if (!this.isEditing) {
      this.resetUser();
    }
  },

  methods: {
    formatPayload() {
      user.$user.cellphone =
        user.$user.cellphone && user.$user.cellphone !== ''
          ? this.formatPhoneNumber(user.$user.cellphone)
          : user.$user.cellphone;
    },

    formatPhoneNumber(cellphone: string): string {
      const cleaned = cellphone.replace(/\D/g, '');

      return cleaned.startsWith('0') ? cleaned.slice(1) : cleaned;
    },

    back(): void {
      const routeToBack = this.getAdmin ? '/users' : '/';

      this.$router.replace(routeToBack);
      setTimeout(() => {
        this.resetUser();
      }, 800);
    },

    resetUser(this: any): void {
      user.reset();
    },

    validate(this: any): void {
      this.$refs.form.validate();

      if (this.valid) this.isEditing ? this.onUpdate() : this.onCreate();
      else {
        toast.setToast({
          text: 'Existem campos obrigatórios',
          type: 'danger',
          time: 3000,
        });
      }
    },

    async onCreate(): Promise<void> {
      await this.formatPayload();

      const response = await user.create(user.$user);

      if (response.body && response.body.code === 'CREATE_SUCCESS') {
        toast.setToast({
          text: 'Usuário cadastrado com sucesso!',
          type: 'success',
          time: 2000,
        });
        this.$router.replace('/user/edit/' + response.body.result.id);
      } else {
        toast.setToast({
          text: 'Ocorreu um erro ao cadastrar o Usuário',
          type: 'danger',
          time: 3000,
        });
      }
    },

    async onUpdate(): Promise<void> {
      this.$set(this, 'loading', true);
      await this.formatPayload();

      const response = await user.update();

      if (response.body.code === 'UPDATE_SUCCESS') {
        toast.setToast({
          text: 'Usuário atualizado com sucesso!',
          type: 'success',
          time: 2000,
        });
      } else {
        toast.setToast({
          text: 'Ocorreu um erro ao atualizar o Usuário',
          type: 'danger',
          time: 3000,
        });
      }

      await user.get(this.userId);

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
