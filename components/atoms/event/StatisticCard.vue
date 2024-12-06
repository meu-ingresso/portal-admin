<template>
  <v-card flat tile outlined class="statistic-card">
    <v-card-title class="statistic-card-title">{{ title }}</v-card-title>
    <v-card-subtitle class="statistic-card-subtitle">{{ value }}</v-card-subtitle>
  </v-card>
</template>

<script>
export default {
  props: {
    title: { type: String, required: true },
    value: { type: [String, Number], required: true },
  },
};
</script>

<style scoped>
.statistic-card {
  padding: 24px !important;
  border-radius: 8px !important;
  background-color: var(--tertiary);
  border: 0px !important;
}
.statistic-card-title{
  font-size: 24px;
  font-weight: 700;
  color: var(--black-text);
  font-family: var(--font-family-inter-bold);
}

.statistic-card-subtitle {
  font-size: 16px;
  font-weight: 400;
  color: var(--black-text);
  font-family: var(--font-family);
}
</style>
