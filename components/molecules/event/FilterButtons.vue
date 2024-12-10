<template>
  <div class="filter-buttons">
    <v-btn
      v-for="filter in filters"
      :key="filter.text"
      color="primary"
      class="mr-2 mb-2"
      depressed
      :elevation="0"
      rounded
      :outlined="selected !== filter.value"
      @click="$emit('filter-selected', filter.value)">
      {{ filter.text }}
    </v-btn>
  </div>
</template>

<script>
export default {
  props: {
    filters: { type: Array, required: true },
    selected: { type: String, required: true },
  },
};
</script>

<style scoped>
.filter-buttons {
  gap: 16px;
  margin-bottom: 16px;
  margin-right: 8px;
  margin-left: 8px;
}
</style>
