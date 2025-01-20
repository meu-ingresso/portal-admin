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
            :form.sync="form"
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
                v-if="index > 0"
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

    <v-dialog v-model="showProgressDialog" persistent max-width="600">
      <v-card>
        <v-card-text class="text-center">
          <h2 class="py-4">{{ progressTitle }}</h2>
          <Lottie path="./animations/loading_default.json" height="200" width="500" />
        </v-card-text>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
import { category, rating, loading, toast, eventForm, event } from '@/store';
import { isMobileDevice } from '@/utils/utils';
import StepGeneralInfo from '@/components/organisms/event/StepGeneralInfo.vue';
import StepTickets from '@/components/organisms/event/StepTickets.vue';
import StepCustomFields from '@/components/organisms/event/StepCustomFields.vue';
import StepCoupons from '@/components/organisms/event/StepCoupons.vue';

export default {
  data() {
    return {
      currentStep: 1,
      steps: [],
      ticketStepperLabel: 'Ingressos',
      showProgressDialog: false,
    };
  },

  computed: {
    form: {
      get() {
        return eventForm.$form;
      },
      set(value) {
        console.log('Setting form', value);
        eventForm.updateForm(value);
      },
    },

    isMobile() {
      return isMobileDevice(this.$vuetify);
    },

    isLoading() {
      return loading.$isLoading;
    },

    isSaving() {
      return event.$isSaving;
    },

    progressTitle() {
      return event.$progressTitle;
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

    getSteps() {
      return [
        {
          label: 'Informações Gerais',
          component: StepGeneralInfo,
          props: {
            form: this.form,
            categories: this.categories,
            ratings: this.ratings,
          },
        },
        {
          label: this.ticketStepperLabel,
          component: StepTickets,
          props: {
            form: this.form,
            nomenclature: this.ticketStepperLabel,
          },
        },
        {
          label: 'Campos Personalizados',
          component: StepCustomFields,
          props: {
            form: this.form,
          },
        },
        {
          label: 'Cupons de Desconto',
          component: StepCoupons,
          props: {
            form: this.form,
          },
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
              this.currentStep++;
            }
          }
        });
      } else if (this.currentStep < this.getSteps.length) {
        this.currentStep++;
      }
    },
    previousStep() {
      if (this.currentStep > 1) {
        this.currentStep--;
      }
    },
    async submitData() {
      console.log('Submitting data', this.form);

      this.showProgressDialog = true;

      try {
        await event.postEvent(this.form);

        toast.setToast({
          text: 'Evento publicado com sucesso!',
          type: 'success',
          time: 5000,
        });

        setTimeout(() => {
          this.$router.push({ name: 'Lista de Eventos' });
        }, 1500);
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
</style>
