<!-- eslint-disable vue/no-useless-template-attributes -->
<template>
  <div class="filter-buttons">
    <v-slide-group v-if="!isLoading" class="filter-slide-group" multiple show-arrows>
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
    <div v-else class="d-flex">
      <v-skeleton-loader v-for="n in 6" :key="n" width="64px" type="button" class="mr-2 filter-button-loading" />
    </div>
  </div>
</template>

<script>
export default {
  props: {
    filters: { type: Array, required: true },
    selected: { type: Object, required: true },
    isLoading: { type: Boolean, default: false },
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

.filter-button-loading{
  height: 32px;
  border-radius: 16px;
  margin-bottom: 16px;
  margin-top: 16px;
  width: 64px;
}
</style>
