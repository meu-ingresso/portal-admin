<template>
  <v-card flat tile outlined class="sale-card">
    <v-card-title class="sale-card-title mb-4">{{ title }}</v-card-title>
    <v-card-subtitle class="sale-card-subtitle">{{ value }}</v-card-subtitle>
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
.sale-card {
  padding: 24px !important;
  border-radius: 8px !important;
  background-color: var(--tertiary);
  border: 0px !important;
}
.sale-card-title{
  font-size: 24px;
  font-weight: 700;
  color: var(--black-text);
  font-family: var(--font-family-inter-bold);
}

.sale-card-subtitle {
  font-size: 40px;
  font-weight: 700;
  color: var(--black-text);
  font-family: var(--font-family-inter-bold);
}
</style>
