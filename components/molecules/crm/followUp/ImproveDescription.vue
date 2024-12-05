<template>
  <v-dialog
    v-model="$_dialog"
    min-width="300"
    max-width="1000"
    class="modal"
    persistent
    :fullscreen="isMobile">
    <v-card>
      <v-card-title :class="isMobile ? 'text-title-mobile' : 'text-title'">
        <v-row>
          <v-col cols="10" md="11"> Melhorando com IAccess </v-col>

          <v-col v-if="!isImproving" cols="1" md="1" align="end" class="text-center">
            <v-icon class="close-button" @click="close"> mdi-close </v-icon>
          </v-col>
        </v-row>
      </v-card-title>

      <v-divider />

      <v-card-text>
        <v-row class="pa-5">
          <v-col cols="12" class="text-center">
            <h4>Descrição Antiga</h4>
          </v-col>

          <v-col cols="12">
            <span
              v-if="isExpanded"
              class="preformatted-description"
              v-html="formattedDescription">
            </span>

            <span v-else>{{ truncatedDescription }}</span>

            <v-tooltip top>
              <template #activator="{ on, attrs }">
                <v-icon
                  v-if="isDescriptionLong"
                  size="25"
                  color="primary"
                  v-bind="attrs"
                  class="cursor-pointer ml-0"
                  v-on="on"
                  @click="toggleDescription">
                  {{ isExpanded ? 'mdi-chevron-up' : 'mdi-chevron-down' }}
                </v-icon>
              </template>
              <span>{{ isExpanded ? 'Retrair' : 'Expandir' }}</span>
            </v-tooltip>
          </v-col>

          <v-col v-if="isImproving" cols="12">
            <Lottie
              path="./animations/ia_loading.json"
              :height="isMobile ? '160' : '160'"
              width="300" />
          </v-col>

          <v-col v-if="!isImproving && suggestion !== ''">
            <v-divider />

            <v-row class="mt-2">
              <v-col cols="12" class="text-center">
                <h4>Sugestão IAccess</h4>
              </v-col>

              <v-col cols="12">
                <v-textarea
                  v-model="suggestion"
                  label="Descrição"
                  placeholder="Descreva aqui seu acompanhamento"
                  dense
                  outlined
                  :row-height="getTextAreaHeight"
                  :rows="getTextAreaHeight"
                  hide-details="auto" />
              </v-col>
            </v-row>
          </v-col>
        </v-row>
      </v-card-text>

      <v-card-actions v-if="!isImproving" :class="isMobile ? 'text-center' : ''">
        <v-spacer v-if="!isMobile" />
        <v-btn
          text
          class="btnDialog btnBack"
          :class="isMobile ? 'btnMobile' : ''"
          @click="close">
          Rejeitar
        </v-btn>

        <v-btn
          text
          class="btnDialog btnSuccess"
          :class="isMobile ? 'btnMobile' : ''"
          @click="updateFollowUp">
          Aceitar Sugestão
        </v-btn>
      </v-card-actions>
    </v-card>

    <Toast />
  </v-dialog>
</template>

<script lang="ts">
import Vue from 'vue';
import { headSoft, toast } from '@/store';
import { isMobileDevice } from '@/utils/utils';

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
      isExpanded: false,
      valid: false,
      isImproving: true,
      isLoading: false,
      suggestion: '',
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

    isDescriptionLong() {
      return this.followUp.Descricao.length > 250;
    },

    truncatedDescription() {
      return this.followUp.Descricao.length > 250
        ? this.followUp.Descricao.substr(0, 250) + '...'
        : this.followUp.Descricao;
    },

    formattedDescription() {
      return this.element.Descricao.trim()
        .replace(/\n\s*\n/g, '<br><br>')
        .replace(/\n/g, '<br>');
    },

    $customerData() {
      return headSoft.$customerData;
    },

    getTextAreaHeight() {
      const descriptionLength = this.followUp.Descricao
        ? this.followUp.Descricao.length
        : 0;

      if (descriptionLength < 100) return '2';
      if (descriptionLength < 250) return '4';
      if (descriptionLength < 500) return '6';
      if (descriptionLength < 800) return '8';
      if (descriptionLength < 1000) return '10';
      if (descriptionLength < 1200) return '15';
      if (descriptionLength < 1500) return '18';
      if (descriptionLength < 2000) return '20';
      if (descriptionLength < 2500) return '25';

      return '30';
    },
  },

  async mounted() {
    this.$set(this, 'isImproving', true);

    const response = await headSoft.improveFollowUp(this.followUp.Descricao);

    if (response.body && response.body.code === 'CREATE_SUCCESS') {
      this.$set(this, 'suggestion', response.body.result);
    } else {
      toast.setToast({
        text: 'Ocorreu um erro ao gerar sugestão',
        type: 'danger',
        time: 3000,
      });
    }

    this.$set(this, 'isImproving', false);
  },

  methods: {
    toggleDescription() {
      this.isExpanded = !this.isExpanded;
    },

    close(): void {
      this.$emit('update-ia-dialog', false);
    },

    async updateFollowUp() {
      this.$set(this, 'isLoading', true);

      headSoft.setLoaderFollow(true);

      const payload = {
        IdAcompanhamento: this.followUp.IdAcompanhamento,
        Descricao: this.suggestion,
      };

      const response = await headSoft.updateFollowUp(payload);

      if (response.body && response.body.code === 'UPDATE_SUCCESS') {
        toast.setToast({
          text: 'Acompanhamento atualizado com sucesso!',
          type: 'success',
          time: 3000,
        });
      } else {
        toast.setToast({
          text: 'Ocorreu um erro ao atualizar o acompanhamento',
          type: 'danger',
          time: 3000,
        });
      }
      this.$set(this, 'isLoading', false);

      await headSoft.getCustomerFollowups(this.$customerData.IdPessoa[0]);

      headSoft.setLoaderFollow(false);

      this.close();
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

.preformatted-description {
  white-space: normal;
  display: inline;
  font-family: 'Roboto', sans-serif;
}
</style>
