<template>
  <v-container class="event-stepper">
    <Lottie
      v-if="isLoading"
      path="./animations/loading_default.json"
      height="300"
      width="300" />

    <v-stepper v-else v-model="currentStep">
      <v-stepper-header>
        <v-stepper-step
          v-for="(step, index) in steps"
          :key="index"
          :step="index + 1"
          :complete="currentStep > index + 1">
          {{ step.label }}
        </v-stepper-step>

        <v-divider></v-divider>
      </v-stepper-header>

      <v-stepper-items>
        <v-stepper-content v-for="(step, index) in steps" :key="index" :step="index + 1">
          <component
            :is="step.component"
            v-bind="step.props"
            :ref="'step-' + (index + 1)"
            :form.sync="form" />

          <v-row justify="space-between" class="mt-4">
            <v-col cols="12" class="d-flex justify-end">
              <DefaultButton
                v-if="index > 0"
                outlined
                class="mr-2"
                text="Voltar"
                @click="previousStep" />

              <DefaultButton
                v-if="index < steps.length - 1"
                outlined
                text="Próximo"
                @click="nextStep" />

              <DefaultButton
                v-if="index === steps.length - 1"
                text="Finalizar"
                @click="submitData" />
            </v-col>
          </v-row>
        </v-stepper-content>
      </v-stepper-items>
    </v-stepper>
    <Toast />
  </v-container>
</template>

<script>
import { category, rating, loading, toast, eventForm } from '@/store';

import StepGeneralInfo from '@/components/organisms/event/StepGeneralInfo.vue';
import StepTickets from '@/components/organisms/event/StepTickets.vue';
import StepCoupons from '@/components/organisms/event/StepCoupons.vue';

export default {
  data() {
    return {
      currentStep: 1,
      steps: [],
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

    isLoading() {
      return loading.$isLoading;
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
      }));
    },
  },

  async mounted() {
    loading.setIsLoading(true);

    const promises = [
      category.fetchCategories({ sortBy: ['name'], sortDesc: [false] }),
      rating.fetchRatings({ sortBy: ['name'], sortDesc: [false] }),
    ];
    await Promise.all(promises);

    this.steps = [
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
        label: 'Ingressos',
        component: StepTickets,
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
            if (this.currentStep < this.steps.length) {
              this.currentStep++;
            }
          }
        });
      } else if (this.currentStep < this.steps.length) {
        this.currentStep++;
      }
    },
    previousStep() {
      if (this.currentStep > 1) {
        this.currentStep--;
      }
    },
    submitData() {},
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
</style>
