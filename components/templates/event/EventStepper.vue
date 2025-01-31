<template>
  <v-container class="event-stepper">
    <Lottie
      v-if="isLoading"
      path="./animations/loading_default.json"
      height="300"
      width="300" />

    <v-stepper v-else v-model="currentStep" flat class="bg-beige">
      <v-stepper-header class="bg-white no-box-shadow">
        <v-stepper-step
          v-for="(step, index) in getSteps"
          :key="index"
          :step="index + 1"
          :complete="currentStep > index + 1">
          {{ step.label }}
        </v-stepper-step>
      </v-stepper-header>

      <v-stepper-items class="pt-8">
        <v-stepper-content
          v-for="(step, index) in getSteps"
          :key="index"
          :step="index + 1"
          class="bg-white px-6 py-6"
          :class="{ 'fixed-height-content': isMobile }">
          <component
            :is="step.component"
            v-bind="step.props"
            :ref="'step-' + (index + 1)"
            :class="{ 'fixed-height-component': isMobile }"
            @update:nomenclature="ticketStepperLabel = $event" />

          <v-row
            justify="space-between"
            class="mt-4"
            :class="{ 'fixed-actions px-2': isMobile }">
            <v-col
              cols="12"
              class="d-flex"
              :class="{
                'justify-end': !isMobile || index === 0,
                'justify-space-between': isMobile && index > 0,
              }">
              <DefaultButton
                outlined
                :disabled="isSaving"
                class="mr-2"
                text="Voltar"
                @click="previousStep" />

              <DefaultButton
                v-if="index < getSteps.length - 1"
                text="Próximo"
                :disabled="isSaving"
                @click="nextStep" />

              <DefaultButton
                v-if="index === getSteps.length - 1"
                text="Publicar Evento"
                :disabled="isSaving"
                @click="submitData" />
            </v-col>
          </v-row>
          <Toast />
        </v-stepper-content>
      </v-stepper-items>
    </v-stepper>

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
import StepGeneralInfo from '../../organisms/event/StepGeneralInfo.vue';
import StepTickets from '../../organisms/event/StepTickets.vue';
import StepCustomFields from '../../organisms/event/StepCustomFields.vue';
import StepCoupons from '../../organisms/event/StepCoupons.vue';
import { isMobileDevice } from '@/utils/utils';
import {
  category,
  rating,
  loading,
  toast,
  eventTickets,
  eventCustomFields,
  eventPrincipal,
} from '@/store';

export default {
  data() {
    return {
      currentStep: 2,
      steps: [],
      ticketStepperLabel: 'Ingressos',
      showProgressDialog: false,
    };
  },

  computed: {

    isMobile() {
      return isMobileDevice(this.$vuetify);
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

    getSteps() {
      return [
        {
          label: 'Informações Gerais',
          component: StepGeneralInfo,
          props: {
            categories: this.categories,
            ratings: this.ratings,
          },
        },
        {
          label: this.ticketStepperLabel,
          component: StepTickets,
          props: {
            nomenclature: this.ticketStepperLabel,
          },
        },
        {
          label: 'Campos Personalizados',
          component: StepCustomFields,
        },
        {
          label: 'Cupons de Desconto',
          component: StepCoupons,
        },
      ];
    },
  },

  async mounted() {
    loading.setIsLoading(true);

    const promises = [
      category.fetchCategories({ sortBy: ['name'], sortDesc: [false] }),
      rating.fetchRatings({ sortBy: ['name'], sortDesc: [false] }),
    ];
    await Promise.all(promises);

    loading.setIsLoading(false);
  },

  methods: {
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
            if (this.currentStep < this.getSteps.length) {
              // Se estou nos ingressos e dei próximo sem ingressos = CUPOM
              if (this.currentStep === 2 && this.getTickets.length === 0) {
                this.currentStep = 4;
              } else {
                this.currentStep++;
              }
            }
          }
        });
      } else if (this.currentStep < this.getSteps.length) {
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
