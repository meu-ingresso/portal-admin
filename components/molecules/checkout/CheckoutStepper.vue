<template>
  <v-stepper v-model="internalCurrentStep" class="pdv-stepper">
    <v-stepper-header>
      <template v-for="(step, index) in steps">
        <v-stepper-step 
          :key="step.step" 
          :complete="internalCurrentStep > step.step" 
          :step="step.step">
          {{ step.title }}
        </v-stepper-step>
        
        <v-divider 
          v-if="index < steps.length - 1" 
          :key="`divider-${step.step}`">
        </v-divider>
      </template>
    </v-stepper-header>
  </v-stepper>
</template>

<script>
export default {
  props: {
    currentStep: {
      type: Number,
      required: true
    },
    steps: {
      type: Array,
      required: true
    }
  },
  
  data() {
    return {
      internalCurrentStep: this.currentStep
    };
  },
  
  watch: {
    currentStep(newVal) {
      this.internalCurrentStep = newVal;
    }
  }
};
</script>

<style scoped>
.pdv-stepper { box-shadow: none; }
</style> 