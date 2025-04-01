<template>
  <div>
    <v-menu
      v-model="showFilters"
      :close-on-content-click="false"
      offset-y
      max-width="550">
      <template #activator="{ attrs: menuAttrs, on: menuOn }">
        <v-tooltip bottom>
          <template #activator="{ on: tooltipOn }">
            <v-btn
              icon
              color="primary"
              class="ml-2"
              v-bind="menuAttrs"
              v-on="{ ...menuOn, ...tooltipOn }">
              <v-icon size="24">mdi-filter</v-icon>

              <v-badge
                v-if="activeFiltersCount"
                :content="activeFiltersCount.toString()"
                color="error"
                offset-x="12"
                offset-y="-8"
                dot />
            </v-btn>
          </template>
          <span>Filtros</span>
        </v-tooltip>
      </template>

      <v-card>
        <v-card-text class="pt-4">
          <slot name="filter-content"></slot>

          <!-- Botão de limpar filtros -->
          <v-row v-if="showClearFilters" class="mt-4">
            <v-col class="text-right">
              <v-btn text color="primary" @click="$emit('clear-filters')">
                Limpar filtros
              </v-btn>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </v-menu>
  </div>
</template>

<script>
export default {

  props: {
    activeFiltersCount: {
      type: Number,
      default: 0,
    },
    showClearFilters: {
      type: Boolean,
      default: true,
    },
  },

  data() {
    return {
      showFilters: false,
    };
  },
};
</script>
