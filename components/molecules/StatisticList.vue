<template>
  <v-row class="mb-4">
    <v-col cols="12">
      <div class="statistics-title">{{ title }}</div>
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
    title: { type: String, required: true },
  },
};
</script>
<style scoped>
.statistics-title {
  font-size: 26px;
  font-weight: 700;
  color: var(--black-text);
  font-family: var(--font-family-poppins-bold);
}

@media (max-width: 360px) {
  .statistics-title {
    font-size: 16px;
  }
}

@media (min-width: 361px) and (max-width: 480px) {
  .statistics-title {
    font-size: 18px;
  }
}
</style>
