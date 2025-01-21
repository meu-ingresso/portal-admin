<template>
  <div class="filter-buttons">
    <v-slide-group class="filter-slide-group" multiple show-arrows>
      <v-slide-item v-for="filter in filters" :key="filter.name" v-slot="{ active }">
        <v-btn
          color="primary"
          :input-value="active"
          class="filter-button mr-2"
          depressed
          :elevation="0"
          rounded
          :outlined="selected.name !== filter.name"
          @click="$emit('filter-selected', filter)">
          {{ filter.name }}
        </v-btn>
      </v-slide-item>
    </v-slide-group>
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

.filter-slide-group > .v-slide-group__next, .v-slide-group__prev {
  min-width: 32px !important;
}

.filter-buttons {
  margin-bottom: 16px;
}
.filter-button{
  font-size: 12px;
}
</style>
