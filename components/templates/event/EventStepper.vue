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
          <component :is="step.component" v-bind="step.props" :form.sync="form"/>

          <v-row justify="space-between" class="mt-4">
            <v-col cols="12">
              <DefaultButton
                v-if="index > 0"
                outlined
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
  </v-container>
</template>

<script>
import { category, rating, loading } from '@/store';

import StepGeneralInfo from '@/components/organisms/event/StepGeneralInfo.vue';
/* import StepTickets from '@/components/organisms/StepTickets.vue';
import StepCoupons from '@/components/organisms/StepCoupons.vue';
import StepSummary from '@/components/organisms/StepSummary.vue'; */

export default {
  data() {
    return {
      currentStep: 1,
      steps: [],
      form: {
        eventName: '',
        alias: '',
        description: '',
        category: '',
        startDate: '',
        startTime: '',
        endDate: '',
        endTime: '',
        rating: '',
        cep: '',
        complement: '',
        tickets: [],
        coupons: [],
      },
    };
  },

  computed: {
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
    ];

    loading.setIsLoading(false);
  },

  methods: {
    nextStep() {
      if (this.currentStep < this.steps.length) {
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
  max-width: 800px;
  margin: 0 auto;
}

.mt-4 {
  margin-top: 16px;
}
</style>
