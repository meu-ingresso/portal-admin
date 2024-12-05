<template>
  <div v-if="!$isLoading">
    <BobCommercialForm :duplicate-bob-info="$duplicateBob" :is-editing="isEditing" />

    <v-divider v-if="isEditing" />

    <BobPricingForm v-if="isEditing" :is-editing="isEditing" class="mt-5" />
  </div>

  <div v-else>
    <Lottie path="./animations/deal.json" height="300" width="300" />
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { bob, modal, shipowner, container, loading } from '@/store';

export default Vue.extend({
  props: {
    isEditing: {
      type: Boolean,
      default: false,
    },

    duplicateBob: {
      type: Object,
      default: () => ({}),
    },
  },

  data: () => ({
    valid: true,
    options: {},
    menu: false,
  }),

  computed: {
    $bob(): any {
      return bob.$bob;
    },

    $isLoading(): any {
      return loading.$isLoading;
    },

    $duplicateBob(): any {
      return this.duplicateBob;
    },
  },

  async created() {
    loading.setIsLoading(true);
    const startTime = new Date().getTime();

    try {
      await Promise.all([modal.getAll(), container.getAll(), shipowner.getAll()]);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      if (this.isEditing) {
        const elapsedTime = new Date().getTime() - startTime;
        const timeoutDuration = Math.max(1000 - elapsedTime, 0);

        setTimeout(() => {
          loading.setIsLoading(false);
        }, timeoutDuration);
      } else {
        loading.setIsLoading(false);
      }
    }
  },
});
</script>
