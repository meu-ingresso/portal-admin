<template>
  <v-dialog
    v-model="$_dialog"
    min-width="300"
    max-width="700"
    class="modal"
    persistent
    :fullscreen="isMobile">
    <v-card>
      <v-card-title :class="isMobile ? 'text-title-mobile' : 'text-title'">
        <v-row>
          <v-col cols="10" md="11"> Enviar Relatório </v-col>

          <v-col cols="1" md="1" align="end" class="text-center">
            <v-icon class="close-button" @click="close"> mdi-close </v-icon>
          </v-col>
        </v-row>
      </v-card-title>

      <v-divider />

      <v-card-text>
        <v-row class="text-center">
          <v-col v-if="isLoading" cols="12" class="mt-4">
            <Loading />

            <h3>Enviando e-mail, aguarde...</h3>
          </v-col>

          <v-col v-else cols="12" class="mt-4">
            <h3>
              Selecione abaixo os responsáveis por receber o relatório deste
              acompanhamento
            </h3>
          </v-col>
        </v-row>

        <v-row v-if="!isLoading">
          <v-col v-if="!isMobile" cols="1" />

          <v-col cols="12" md="10">
            <v-autocomplete
              v-model="users"
              :items="getUserList"
              :rules="[validationRequired]"
              label="Destinatários*"
              hide-details="auto"
              persistent-hint
              outlined
              multiple
              chips
              clearable
              dense
              return-object
              :search-input.sync="searchInput.users"
              @input="searchInput.users = null" />
          </v-col>

          <v-col v-if="!isMobile" cols="1" />
        </v-row>
      </v-card-text>

      <v-card-actions v-if="!isLoading" :class="isMobile ? 'text-center' : 'mt-8'">
        <v-spacer v-if="!isMobile" />
        <v-btn
          text
          class="btnDialog btnBack"
          :class="isMobile ? 'btnMobile' : ''"
          @click="close">
          Voltar
        </v-btn>

        <v-btn
          :disabled="!users.length"
          text
          class="btnDialog btnSuccess btnSend"
          :class="isMobile ? 'btnMobile' : ''"
          @click="sendFollowUpEmail">
          Enviar
        </v-btn>
      </v-card-actions>
    </v-card>

    <Toast />
  </v-dialog>
</template>

<script lang="ts">
import Vue from 'vue';
import { toast, user, headSoft } from '@/store';
import { isMobileDevice } from '@/utils/utils';
import { formatDateToBr } from '@/utils/formatters';

export default Vue.extend({
  props: {
    dialog: {
      type: Boolean,
      default: false,
    },

    followUp: {
      type: Object,
      default: () => ({}),
    },
  },

  data() {
    return {
      valid: false,
      users: [],
      isLoading: false,
      searchInput: {
        users: null,
      },
    };
  },

  computed: {
    $_dialog: {
      get(this: any): boolean {
        return this.dialog;
      },
      set(val): void {
        this.$emit('update-ia-dialog', val);
      },
    },

    isMobile() {
      return isMobileDevice(this.$vuetify);
    },

    getUserList() {
      const currentUserEmail = this.$cookies.get('user_email');

      return user.$userList
        .filter((element: any) => element.is_active && element.email !== currentUserEmail)
        .map((item: any) => ({
          value: item.email,
          text: `${item.first_name} ${item.last_name}`,
        }));
    },

    $customerData() {
      return headSoft.$customerData;
    },
  },

  async mounted() {},

  methods: {
    validationRequired(value: any): Boolean | String {
      if ((value && value.length === 0) || value === 0) {
        return 'Campo Obrigatório.';
      }

      return !!value || 'Campo Obrigatório.';
    },

    close(): void {
      this.$emit('update-dialog', false);
    },

    formatDate(param) {
      return formatDateToBr(param);
    },

    async sendFollowUpEmail() {
      this.$set(this, 'isLoading', true);

      const to = this.users.map((item: any) => item.value).join(',');

      const currentUser = this.$cookies.get('user_email');

      const payload = {
        to: `${currentUser},${to}`,
        seller: this.followUp.IdResponsavel.text,
        client: this.$customerData.Nome,
        followDate: this.formatDate(this.followUp.Data),
        followTitle: this.followUp.Titulo,
        followDescription: this.followUp.Descricao,
        followType: this.followUp.IdGrupo_Tarefa.text,
        followUser: this.followUp.IdResponsavel.text,
      };

      const res = await headSoft.sendFollowUpMail(payload);

      if (res && res !== 'E-mail enviado com sucesso') {
        toast.setToast({
          text: 'Ocorreu um erro ao enviar o e-mail',
          type: 'danger',
          time: 3000,
        });
      } else {
        toast.setToast({
          text: 'E-mail enviado com sucesso',
          type: 'success',
          time: 3000,
        });

        this.$emit('send-follow-email', false);
      }

      this.isLoading = false;
    },
  },
});
</script>

<style scoped scss>
.is-favorite {
  color: #ffc107 !important;
}

.text-title {
  font-size: 18px !important;
}

.text-title-mobile {
  font-size: 15px !important;
}

::v-deep .v-sheet.v-card {
  border-radius: 0 !important;
}

::v-deep.v-card__title {
  background-color: var(--primary) !important;
  color: white !important;
}

.close-button {
  color: white !important;
}

.bg-tabs {
  height: 48px !important;
  background-color: var(--light);
}

.v-tab--active,
.bg-tabs:hover {
  background-color: rgba(2, 63, 136, 0.2);
  border-bottom: 0px;
}

.theme--light.v-tabs > .v-tabs-bar {
  background-color: rgba(2, 63, 136, 0.2);
}

.v-tabs-slider-wrapper {
  height: 0px !important;
  width: 0px !important;
}

.v-tab:before {
  background-color: black;
}

.modal {
  height: 50vh !important;
}

.btnMobile {
  width: 200px;
}

.theme--light.v-btn.v-btn--disabled {
  color: white !important;
}
</style>
