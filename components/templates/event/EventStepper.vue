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
          <StepGeneralInfo
            ref="step-1"
            :is-editing="isEditing"
            :categories="categories"
            :ratings="ratings"
            :class="{ 'fixed-height-component': isMobile }" />

          <StepActions :is-first-step="true" @previous="previousStep" @next="nextStep" />
        </v-stepper-content>

        <!-- Step 2: Tickets -->
        <v-stepper-content
          step="2"
          class="bg-white px-6 py-6"
          :class="{ 'fixed-height-content': isMobile }">
          <StepTickets
            ref="step-2"
            :is-editing="isEditing"
            :nomenclature="ticketStepperLabel"
            :class="{ 'fixed-height-component': isMobile }"
            @update:nomenclature="ticketStepperLabel = $event" />

          <StepActions @previous="previousStep" @next="nextStep" />
        </v-stepper-content>

        <!-- Step 3: Campos Personalizados -->
        <v-stepper-content
          step="3"
          class="bg-white px-6 py-6"
          :class="{ 'fixed-height-content': isMobile }">
          <StepCustomFields
            ref="step-3"
            :is-editing="isEditing"
            :class="{ 'fixed-height-component': isMobile }" />

          <StepActions @previous="previousStep" @next="nextStep" />
        </v-stepper-content>

        <!-- Step 4: Cupons -->
        <v-stepper-content
          step="4"
          class="bg-white px-6 py-6"
          :class="{ 'fixed-height-content': isMobile }">
          <StepCoupons
            ref="step-4"
            :is-editing="isEditing"
            :class="{ 'fixed-height-component': isMobile }" />

          <StepActions
            :is-last-step="true"
            :is-editing="isEditing"
            @previous="previousStep"
            @submit="submitData" />
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
      return loading.$isLoading;
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
  },

  async created() {
    await this.fetchCategoriesAndRatings();

    if (this.isEditing && this.eventId) {
      await this.loadEventData();
    }
  },

  methods: {
    async loadEventData() {
      await eventGeneralInfo.fetchAndPopulateByEventId(this.eventId);
      await eventTickets.fetchAndPopulateByEventId(this.eventId);
      await eventCustomFields.fetchAndPopulateByEventId(this.eventId);
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
      if (
        currentStepComponent &&
        typeof currentStepComponent[0]?.canProceed === 'function'
      ) {
        currentStepComponent[0].canProceed((_canProceed, flag, msg) => {
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
    async submitData() {
      this.showProgressDialog = true;

      try {
        await eventPrincipal.createEvent();

        toast.setToast({
          text: 'Evento publicado com sucesso!',
          type: 'success',
          time: 5000,
        });

        setTimeout(() => {
          this.$router.push({ name: 'Lista de Eventos' });
        }, 500);
      } catch (error) {
        console.error('Error', error);

        toast.setToast({
          text: 'Ocorreu um erro ao publicar o evento. Tente novamente.',
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
