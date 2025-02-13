<template>
  <v-row class="mb-4">
    <v-col cols="12">
      <div class="event-statistics-title">Painel</div>
    </v-col>

    <v-col
      v-for="stat in statistics"
      :key="stat.title"
      cols="12"
      xl="4"
      lg="4"
      md="6"
      sm="12">
      <StatisticCard :title="stat.title" :value="stat.value" />
    </v-col>
  </v-row>
</template>

<script>
export default {
  props: {
    statistics: { type: Array, required: true },
  },
};
</script>

<style scoped>
.event-statistics-title {
  font-size: 40px;
  font-weight: 700;
  color: var(--black-text);
  font-family: var(--font-family-poppins-bold);
}

@media (max-width: 360px) {
  .event-statistics-title {
    font-size: 16px;
  }
}

@media (min-width: 361px) and (max-width: 480px) {
  .event-statistics-title {
    font-size: 18px;
  }
}
</style>
