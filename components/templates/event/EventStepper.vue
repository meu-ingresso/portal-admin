<template>
  <v-container class="event-stepper">
    <Lottie v-if="isLoading" path="./animations/loading_default.json" height="300" width="300" />

    <v-stepper v-else v-model="currentStep" flat class="bg-beige">
      <v-stepper-header class="bg-white no-box-shadow">
        <v-stepper-step :step="1" :complete="currentStep > 1">
          Informações Gerais
        </v-stepper-step>

        <v-stepper-step :step="2" :complete="currentStep > 2">
          {{ ticketStepperLabel }}
        </v-stepper-step>

        <v-stepper-step :step="3" :complete="currentStep > 3">
          Campos Personalizados
        </v-stepper-step>

        <v-stepper-step :step="4" :complete="currentStep > 4">
          Cupons de Desconto
        </v-stepper-step>
      </v-stepper-header>

      <v-stepper-items class="pt-8">
        <!-- Step 1: Informações Gerais -->
        <v-stepper-content step="1" class="bg-transparent px-0 py-0"
          :class="{ 'fixed-height-content': isMobile, 'bg-beige px-6 py-6': currentStep > 1 }">
          <Lottie v-if="isLoadingGeneralInfo" path="./animations/loading_default.json" height="300" width="300" />

          <template v-else>
            <StepGeneralInfo ref="step-1" :is-editing="isEditing" :categories="categories" :ratings="ratings"
              :class="{ 'fixed-height-component': isMobile }" />
            <StepActions :is-first-step="true" :is-editing="isEditing" @previous="previousStep" @next="nextStep" />
          </template>
        </v-stepper-content>

        <!-- Step 2: Tickets -->
        <v-stepper-content step="2" class="bg-white px-6 py-6" :class="{ 'fixed-height-content': isMobile }">
          <Lottie v-if="isLoadingTickets" path="./animations/loading_default.json" height="300" width="300" />

          <template v-else>
            <StepTickets ref="step-2" :is-editing="isEditing" :nomenclature="ticketStepperLabel"
              :class="{ 'fixed-height-component': isMobile }" @update:nomenclature="ticketStepperLabel = $event" />

            <StepActions :is-editing="isEditing" @previous="previousStep" @next="nextStep" />
          </template>
        </v-stepper-content>

        <!-- Step 3: Campos Personalizados -->
        <v-stepper-content step="3" class="bg-white px-6 py-6" :class="{ 'fixed-height-content': isMobile }">
          <Lottie v-if="isLoadingCustomFields" path="./animations/loading_default.json" height="300" width="300" />

          <template v-else>
            <StepCustomFields ref="step-3" :is-editing="isEditing" :class="{ 'fixed-height-component': isMobile }" />

            <StepActions :is-editing="isEditing" @previous="previousStep" @next="nextStep" />
          </template>
        </v-stepper-content>

        <!-- Step 4: Cupons -->
        <v-stepper-content step="4" class="bg-white px-6 py-6" :class="{ 'fixed-height-content': isMobile }">
          <Lottie v-if="isLoadingCoupons" path="./animations/loading_default.json" height="300" width="300" />

          <template v-else>
            <StepCoupons ref="step-4" :is-editing="isEditing" :class="{ 'fixed-height-component': isMobile }" />

            <StepActions :is-last-step="true" :is-editing="isEditing"
              :has-submitted-documents="hasRequiredDocuments && hasPixInfo && hasFiscalInfo" @previous="previousStep"
              @submit="submitData" />
          </template>
        </v-stepper-content>
      </v-stepper-items>
    </v-stepper>

    <Toast />

    <v-dialog v-model="showProgressDialog" persistent max-width="450">
      <v-card>
        <v-card-text class="text-center">
          <div class="pt-10">
            <h2 class="pt-10">{{ progressTitle }}</h2>
          </div>

          <Lottie path="./animations/loading_default.json" height="130" width="200" class="teste" />
        </v-card-text>
      </v-card>
    </v-dialog>

  </v-container>
</template>

<script>
import { isMobileDevice } from '@/utils/utils';

export default {
  props: {
    isEditing: {
      type: Boolean,
      default: false,
    },
    eventId: {
      type: String,
      default: '',
    },
  },

  data() {
    return {
      currentStep: 1,
      showProgressDialog: false,
    };
  },

  computed: {

    userId() {
      return this.$store.state.auth.user?.auth?.id;
    },

    isMobile() {
      return isMobileDevice(this.$vuetify);
    },

    ticketStepperLabel() {
      return this.$store.getters['eventGeneralInfo/$info'].sale_type;
    },

    isLoading() {
      return this.$store.getters['loading/$isLoading'] || this.isLoadingGeneralInfo;
    },

    isLoadingGeneralInfo() {
      return this.$store.getters['eventGeneralInfo/$isLoading'];
    },

    isLoadingTickets() {
      return this.$store.getters['eventTickets/$isLoading'];
    },

    isLoadingCustomFields() {
      return this.$store.getters['eventCustomFields/$isLoading'];
    },

    isLoadingCoupons() {
      return this.$store.getters['eventCoupons/$isLoading'];
    },

    isSaving() {
      return this.$store.getters['eventPrincipal/$isSaving'];
    },

    progressTitle() {
      return this.$store.getters['eventPrincipal/$progressTitle'];
    },

    categories() {
      return this.$store.getters['category/$categoryList'].map((category) => ({
        value: category.id,
        text: category.name,
      }));
    },

    ratings() {
      return this.$store.getters['rating/$ratingList'].map((rating) => ({
        value: rating.id,
        text: rating.description,
        img: rating.image,
      }));
    },

    getTickets() {
      return this.$store.getters['eventTickets/$tickets'];
    },

    getCustomFields() {
      return this.$store.getters['eventCustomFields/$customFields'];
    },

    hasOnlyDefaultCustomFields() {
      return this.$store.getters['eventCustomFields/$customFields'].every((field) => field.is_default);
    },

    hasRequiredDocuments() {
      return this.$store.getters['userDocuments/$hasRequiredDocuments'];
    },

    hasPixInfo() {
      return this.$store.getters['userDocuments/$hasPixInfo'];
    },

    hasFiscalInfo() {
      return this.$store.getters['userDocuments/$hasFiscalInfo'];
    },

    hasDocumentInfo() {
      return this.$store.getters['userDocuments/$documentInfo'];
    },
  },

  created() {
    this.resetStores();
  },

  async mounted() {
    await this.fetchCategoriesAndRatings();

    if (this.isEditing && this.eventId) {
      await this.loadEventData();
    }

    await this.checkDocumentStatus();
  },

  methods: {
    resetStores() {
      this.$store.dispatch('eventGeneralInfo/reset');
      this.$store.dispatch('eventTickets/reset');
      this.$store.dispatch('eventCustomFields/reset');
      this.$store.dispatch('eventCoupons/reset');
    },

    async loadEventData() {
      const promises = [
        this.$store.dispatch('eventGeneralInfo/fetchAndPopulateByEventId', this.eventId),
        this.$store.dispatch('eventTickets/fetchAndPopulateByEventId', this.eventId),
        this.$store.dispatch('eventCoupons/fetchAndPopulateByEventId', this.eventId),
        this.$store.dispatch('eventCustomFields/fetchAndPopulateByEventId', this.eventId),
      ];

      await Promise.all(promises);
    },

    async fetchCategoriesAndRatings() {
      this.$store.dispatch('loading/setIsLoading', true);
      const promises = [
        this.$store.dispatch('category/fetchCategories', { sortBy: ['name'], sortDesc: [false] }),
        this.$store.dispatch('rating/fetchRatings', { sortBy: ['name'], sortDesc: [false] }),
      ];
      await Promise.all(promises);
      this.$store.dispatch('loading/setIsLoading', false);
    },

    nextStep() {
      const currentStepComponent = this.$refs[`step-${this.currentStep}`];
      if (currentStepComponent && typeof currentStepComponent.canProceed === 'function') {
        currentStepComponent.canProceed((_canProceed, flag, msg) => {
          if (msg) {
            this.$store.dispatch('toast/setToast', {
              text: msg,
              type: 'danger',
              time: 5000,
            });
          }

          if (flag) {
            if (this.currentStep < 4) {
              // Se estou nos ingressos e dei próximo sem ingressos = CUPOM
              if (this.currentStep === 2 && this.getTickets.length === 0) {
                this.currentStep = 4;
              } else {
                this.currentStep++;
              }
            }
          }
        });
      } else if (this.currentStep < 4) {
        this.currentStep++;
      }
    },
    previousStep() {
      if (this.currentStep === 1) {
        this.$router.replace(this.isEditing ? `/events/${this.eventId}` : '/');
      } else if (this.currentStep > 1) {
        if (this.currentStep === 4 && this.getTickets.length === 0) {
          this.currentStep = 2;
        } else {
          this.currentStep--;
        }
      }
    },
    async checkDocumentStatus() {
      try {
        if (this.userId) {
          await this.$store.dispatch('userDocuments/fetchDocumentStatus', this.userId);
        } else {
          console.warn('Usuário não encontrado para verificar status de documentação');
        }
      } catch (error) {
        console.error('Erro ao verificar status de documentação:', error);
        this.$store.dispatch('toast/setToast', {
          text: 'Não foi possível verificar seu status de documentação',
          type: 'danger',
          time: 5000,
        });
      }
    },


    async submitData(status) {
      this.showProgressDialog = true;

      try {
        if (this.isEditing) {
          // this.$store.dispatch('eventGeneralInfo/setEventStatus', '');

          await this.$store.dispatch('eventGeneralInfo/updateEventBase', this.eventId);
          await this.$store.dispatch('eventTickets/updateTickets', this.eventId);

          if (!this.hasOnlyDefaultCustomFields) {
            await this.$store.dispatch('eventCustomFields/updateEventCustomFields', {
              eventId: this.eventId,
              tickets: this.getTickets,
            });
          }

          await this.$store.dispatch('eventCoupons/updateEventCoupons', this.eventId);

          this.$store.dispatch('toast/setToast', {
            text: 'Evento atualizado com sucesso!',
            type: 'success',
            time: 5000,
          });

          setTimeout(() => {
            this.$router.push({
              name: 'Detalhe de Eventos',
              params: { id: this.eventId },
            });
          }, 500);
        } else {

          if (status !== 'draft' && (!this.hasRequiredDocuments || !this.hasPixInfo || !this.hasFiscalInfo)) {
            this.$store.dispatch('eventGeneralInfo/setEventStatus', 'Aguardando');
          } else {
            this.$store.dispatch('eventGeneralInfo/setEventStatus', status);
          }

          const createdEventResults = await this.$store.dispatch('eventPrincipal/createEvent');

          console.log('createdEventResults', createdEventResults);

          // Migrar imagens da descrição de userDocuments para eventAttachments
          if (this.$refs['step-1'] && this.$refs['step-1'].hasPendingUserDocuments()) {
            console.log('Migrando imagens da descrição para o evento criado...');
            try {
              const mainEventId = createdEventResults.eventIds[0];
              if (mainEventId) {
                console.log('mainEventId', mainEventId);
                await this.$refs['step-1'].migrateDescriptionImages(mainEventId);
              }
            } catch (error) {
              this.$store.dispatch('toast/setToast', {
                text: `Erro ao migrar imagens da descrição: ${error.message}`,
                type: 'error',
                time: 5000,
              });
              console.error('Erro na migração de imagens da descrição:', error);
            }
          }

          let message = 'Evento salvo com sucesso!';
          if (status === 'draft') {
            message = 'Evento salvo em rascunho com sucesso!';
          } else if (!this.hasRequiredDocuments || !this.hasPixInfo || !this.hasFiscalInfo) {
            message = 'Evento salvo com status "Aguardando". Complete sua documentação para publicação.';
          } else {
            message = 'Evento enviado para aprovação!';
          }

          this.$store.dispatch('toast/setToast', {
            text: message,
            type: 'success',
            time: 5000,
          });

          setTimeout(() => {
            this.$router.push({ name: 'Lista de Eventos' });
          }, 500);
        }
      } catch (error) {
        console.error('Error', error);

        // Limpar imagens temporárias em caso de erro na criação
        if (!this.isEditing && this.$refs['step-1'] && this.$refs['step-1'].hasTemporaryImages()) {
          try {
            await this.$refs['step-1'].cancelDescriptionImages();
            console.log('Imagens temporárias limpas após erro na criação do evento');
          } catch (cleanupError) {
            console.error('Erro na limpeza de imagens após falha:', cleanupError);
          }
        }

        this.$store.dispatch('toast/setToast', {
          text: 'Ocorreu um erro ao salvar o evento. Tente novamente.',
          type: 'danger',
          time: 5000,
        });
      } finally {
        this.showProgressDialog = false;
      }
    },
  },
};
</script>

<style scoped>
.event-stepper {
  max-width: 1280px;
  margin: 0 auto;
}

.mt-4 {
  margin-top: 16px;
}

.fixed-height-content {
  height: calc(100vh - 240px);
  padding-top: 16px;
  padding-bottom: 16px;
  padding-left: 16px;
  padding-right: 16px;
}

.fixed-height-content .v-stepper-content {
  height: 100%;
}

.fixed-height-component {
  max-height: calc(100vh - 340px);
  height: calc(100vh - 340px);
  overflow-y: scroll;
  overflow-x: hidden;
}

.fixed-actions {
  border-top: 1px solid var(--tertiary);
}

.teste {
  margin-top: -10% !important;
}

.progress-title {
  margin-top: 10% !important;
}
</style>
