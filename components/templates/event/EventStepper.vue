<template>
  <v-container class="event-stepper">
    <Lottie
      v-if="isLoading"
      path="./animations/loading_default.json"
      height="300"
      width="300" />

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
        <v-stepper-content
          step="1"
          class="bg-white px-6 py-6"
          :class="{ 'fixed-height-content': isMobile }">
          <Lottie
            v-if="isLoadingGeneralInfo"
            path="./animations/loading_default.json"
            height="300"
            width="300" />

          <template v-else>
            <StepGeneralInfo
              ref="step-1"
              :is-editing="isEditing"
              :categories="categories"
              :ratings="ratings"
              :class="{ 'fixed-height-component': isMobile }" />
            <StepActions
              :is-first-step="true"
              :is-editing="isEditing"
              @previous="previousStep"
              @next="nextStep" />
          </template>
        </v-stepper-content>

        <!-- Step 2: Tickets -->
        <v-stepper-content
          step="2"
          class="bg-white px-6 py-6"
          :class="{ 'fixed-height-content': isMobile }">
          <Lottie
            v-if="isLoadingTickets"
            path="./animations/loading_default.json"
            height="300"
            width="300" />

          <template v-else>
            <StepTickets
              ref="step-2"
              :is-editing="isEditing"
              :nomenclature="ticketStepperLabel"
              :class="{ 'fixed-height-component': isMobile }"
              @update:nomenclature="ticketStepperLabel = $event" />

            <StepActions
              :is-editing="isEditing"
              @previous="previousStep"
              @next="nextStep" />
          </template>
        </v-stepper-content>

        <!-- Step 3: Campos Personalizados -->
        <v-stepper-content
          step="3"
          class="bg-white px-6 py-6"
          :class="{ 'fixed-height-content': isMobile }">
          <Lottie
            v-if="isLoadingCustomFields"
            path="./animations/loading_default.json"
            height="300"
            width="300" />

          <template v-else>
            <StepCustomFields
              ref="step-3"
              :is-editing="isEditing"
              :class="{ 'fixed-height-component': isMobile }" />

            <StepActions
              :is-editing="isEditing"
              @previous="previousStep"
              @next="nextStep" />
          </template>
        </v-stepper-content>

        <!-- Step 4: Cupons -->
        <v-stepper-content
          step="4"
          class="bg-white px-6 py-6"
          :class="{ 'fixed-height-content': isMobile }">
          <Lottie
            v-if="isLoadingCoupons"
            path="./animations/loading_default.json"
            height="300"
            width="300" />

          <template v-else>
            <StepCoupons
              ref="step-4"
              :is-editing="isEditing"
              :class="{ 'fixed-height-component': isMobile }" />

            <StepActions
              :is-last-step="true"
              :is-editing="isEditing"
              @previous="previousStep"
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

          <Lottie
            path="./animations/loading_default.json"
            height="130"
            width="200"
            class="teste" />
        </v-card-text>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
import { isMobileDevice } from '@/utils/utils';
import {
  category,
  rating,
  loading,
  toast,
  eventTickets,
  eventCustomFields,
  eventPrincipal,
  eventGeneralInfo,
  eventCoupons,
} from '@/store';

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
    isMobile() {
      return isMobileDevice(this.$vuetify);
    },

    ticketStepperLabel() {
      return eventGeneralInfo.$info.sale_type;
    },

    isLoading() {
      return loading.$isLoading || this.isLoadingGeneralInfo;
    },

    isLoadingGeneralInfo() {
      return eventGeneralInfo.$isLoading;
    },

    isLoadingTickets() {
      return eventTickets.$isLoading;
    },

    isLoadingCustomFields() {
      return eventCustomFields.$isLoading;
    },

    isLoadingCoupons() {
      return eventCoupons.$isLoading;
    },

    isSaving() {
      return eventPrincipal.$isSaving;
    },

    progressTitle() {
      return eventPrincipal.$progressTitle;
    },

    categories() {
      return category.$categoryList.map((category) => ({
        value: category.id,
        text: category.name,
      }));
    },

    ratings() {
      return rating.$ratingList.map((rating) => ({
        value: rating.id,
        text: rating.description,
        img: rating.image,
      }));
    },

    getTickets() {
      return eventTickets.$tickets;
    },

    getCustomFields() {
      return eventCustomFields.$customFields;
    },

    hasOnlyDefaultCustomFields() {
      return eventCustomFields.$customFields.every((field) => field.is_default);
    },
  },

  created() {
    console.log('[EventStepper] created');
    this.resetStores();
  },

  async mounted() {
    console.log('[EventStepper] mounted');

    await this.fetchCategoriesAndRatings();

    if (this.isEditing && this.eventId) {
      console.log('[EventStepper] isEditing && eventId');
      await this.loadEventData();
    }
  },

  methods: {
    resetStores() {
      eventGeneralInfo.reset();
      eventTickets.reset();
      eventCustomFields.reset();
      eventCoupons.reset();
    },

    async loadEventData() {
      const promises = [
        eventGeneralInfo.fetchAndPopulateByEventId(this.eventId),
        eventTickets.fetchAndPopulateByEventId(this.eventId),
        eventCoupons.fetchAndPopulateByEventId(this.eventId),
        eventCustomFields.fetchAndPopulateByEventId(this.eventId),
      ];

      await Promise.all(promises);
    },

    async fetchCategoriesAndRatings() {
      loading.setIsLoading(true);
      const promises = [
        category.fetchCategories({ sortBy: ['name'], sortDesc: [false] }),
        rating.fetchRatings({ sortBy: ['name'], sortDesc: [false] }),
      ];
      await Promise.all(promises);
      loading.setIsLoading(false);
    },

    nextStep() {
      const currentStepComponent = this.$refs[`step-${this.currentStep}`];
      if (currentStepComponent && typeof currentStepComponent.canProceed === 'function') {
        currentStepComponent.canProceed((_canProceed, flag, msg) => {
          if (msg) {
            toast.setToast({
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
        this.$router.replace('/events');
      } else if (this.currentStep > 1) {
        if (this.currentStep === 4 && this.getTickets.length === 0) {
          this.currentStep = 2;
        } else {
          this.currentStep--;
        }
      }
    },
    async submitData(status) {
      this.showProgressDialog = true;

      try {
        if (this.isEditing) {
          // eventGeneralInfo.setEventStatus('');

          await eventGeneralInfo.updateEventBase(this.eventId);
          await eventTickets.updateTickets(this.eventId);

          if (!this.hasOnlyDefaultCustomFields) {
            await eventCustomFields.updateEventCustomFields({
              eventId: this.eventId,
              tickets: this.getTickets,
            });
          }

          await eventCoupons.updateEventCoupons(this.eventId);

          toast.setToast({
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
          eventGeneralInfo.setEventStatus(status);

          await eventPrincipal.createEvent();

          const message =
            status === 'draft'
              ? 'Evento salvo em rascunho com sucesso!'
              : 'Evento enviado para aprovação!';

          toast.setToast({
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

        toast.setToast({
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
