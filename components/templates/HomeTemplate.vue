<template>
  <v-container class="home-template py-10">
    <div class="home-template-title">{{ getTitle }}</div>

    <template v-if="!isLoadingEvents">
      <EventBannerList :events="events" />

      <v-row>
        <v-col cols="12" class="d-flex justify-center">
          <SeeMoreButton text="Ver mais eventos" :to="'/events'" />
        </v-col>
      </v-row>
    </template>

    <template v-else>
      <v-row>
        <v-col
          v-for="n in 3"
          :key="n"
          cols="12"
          md="4"
          sm="12"
          class="d-flex justify-center">
          <v-skeleton-loader width="100%" type="card" />
        </v-col>
      </v-row>
    </template>
  </v-container>
</template>

<script>
import { event } from '@/store';
export default {
  props: {
    events: { type: Array, required: true },
  },

  computed: {
    isLoadingEvents() {
      return event.$isLoading;
    },

    getTitle() {
      return 'Bem-vindo, ' + this.$cookies.get('username');
    },
  },
};
</script>

<style scoped>
.home-template-title {
  font-size: 40px;
  font-weight: 700;
  margin-bottom: 20px;
  color: var(--black-text);
  font-family: var(--font-family-poppins-bold);
}

@media (max-width: 360px) {
  .home-template-title {
    font-size: 16px;
  }
}

@media (min-width: 361px) and (max-width: 480px) {
  .home-template-title {
    font-size: 18px;
  }
}

.home-template {
  max-width: 1280px;
}
</style>
