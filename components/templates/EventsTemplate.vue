<template>
  <v-container class="events-template">
    <div class="events-template-title">Lista de Eventos</div>
    <v-divider class="mb-4 mt-4"></v-divider>
    <div class="actions">
      <DataSearch :search="search" place-holder="Encontre seu evento" />
    </div>
    <FilterButtons
      :filters="filters"
      :selected="selectedFilter"
      @filter-selected="handleFilterChange" />
    <v-divider class="mb-8 mt-8"></v-divider>
    <EventList :events="filteredEvents" />

    <v-row>
      <v-col cols="12" class="text-center">
        <v-btn color="primary" text>Ver mais...</v-btn>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  props: {
    events: { type: Array, required: true },
  },
  data() {
    return {
      search: '',
      selectedFilter: 'all',
      filters: [
        { text: 'Todos', value: 'all' },
        { text: 'Ativos', value: 'Ativo' },
        { text: 'Inativos', value: 'Inativo' },
      ],
    };
  },
  computed: {
    filteredEvents() {
      return this.events.filter(
        (event) =>
          (this.selectedFilter === 'all' || event.status.name === this.selectedFilter) &&
          event.name.toLowerCase().includes(this.search.toLowerCase())
      );
    },
  },
  methods: {
    handleFilterChange(filter) {
      this.selectedFilter = filter;
    },
  },
};
</script>

<style scoped>
.events-template {
  max-width: 1280px;
}
.events-template-title {
  font-size: 40px;
  font-weight: 700;
  margin-bottom: 20px;
  color: var(--black-text);
}
.actions {
  margin-bottom: 20px;
}
</style>