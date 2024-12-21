<template>
  <v-container class="events-template py-10">
    <v-row class="d-flex align-center mb-4">
      <v-col cols="12" md="6" sm="12">
        <div class="events-template-title">Lista de Eventos</div>
      </v-col>
      <v-col cols="12" md="6" sm="12" class="d-flex justify-md-end justify-sm-start">
        <DefaultButton text="Criar um evento" :block="isMobile" to="/events/create" />
      </v-col>
    </v-row>
    <div class="actions">
      <DataSearch
        :search="search"
        place-holder="Encontre seu evento"
        @do-search="handleSearch" />
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
import { isMobileDevice } from '@/utils/utils';
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
        { text: 'Publicado', value: 'Publicado' },
        { text: 'Rascunho', value: 'Rascunho' },
        { text: 'Aguardando Aprovação', value: 'Aguardando Aprovação' },
      ],
    };
  },
  computed: {
    isMobile() {
      return isMobileDevice(this.$vuetify);
    },
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
    handleSearch(search) {
      this.search = search;
      this.$emit('update-search', search);
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
  color: var(--black-text);
  font-family: var(--font-family-poppins-bold);
}
.actions {
  margin-bottom: 20px;
}

@media (max-width: 360px) {
  .events-template-title {
    font-size: 22px;
  }
}

@media (min-width: 361px) and (max-width: 480px) {
  .events-template-title {
    font-size: 24px;
  }
}
</style>
