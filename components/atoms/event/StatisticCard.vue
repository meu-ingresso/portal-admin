<template>
  <v-card class="statistic-card">
    <v-card-title>{{ title }}</v-card-title>
    <v-card-subtitle>{{ value }}</v-card-subtitle>
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
  padding: 24px;
  border-radius: 8px;
  background-color: var(--tertiary);
}
</style>
