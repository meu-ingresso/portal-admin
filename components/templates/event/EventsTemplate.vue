<template>
  <v-container class="events-template py-10">
    <v-row class="d-flex align-center mb-4">
      <v-col cols="12" md="6" sm="12">
        <div class="events-template-title">Lista de Eventos</div>
      </v-col>
      <v-col cols="12" md="6" sm="12" class="d-flex justify-md-end justify-sm-start">
        <ButtonWithIcon
          text="Ver calendário"
          icon="mdi-calendar"
          class="mr-2"
          @click="showCalendar = true"
        />
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
      :filters="statusList"
      :selected="selectedFilter"
      :is-loading="isLoadingStatus"
      @filter-selected="handleFilterChange" />

    <v-divider class="mb-8 mt-8"></v-divider>

    <EventList :events="filteredEvents" :show-sessions-indicator="showSessionsIndicator" />

    <v-row v-if="filteredEvents.length > 0">
      <v-col cols="12" class="text-center">
        <v-btn color="primary" text>Ver mais...</v-btn>
      </v-col>
    </v-row>

    <EventCalendarModal
      v-model="showCalendar"
      :events="events"
    />
  </v-container>
</template>

<script>
import { status } from '@/store';
import { isMobileDevice } from '@/utils/utils';
export default {
  props: {
    groupedEvents: { type: Array, required: true },
    events: { type: Array, required: true },
    showSessionsIndicator: { type: Boolean, default: false },
  },
  data() {
    return {
      search: '',
      selectedFilter: { name: 'Todos' },
      showCalendar: false,
    };
  },
  computed: {
    isMobile() {
      return isMobileDevice(this.$vuetify);
    },

    isLoadingStatus() {
      return status.$isLoading;
    },

    statusList() {
      return [
        { name: 'Todos' },
        ...status.$getStatusByModule('event'),
        { name: 'Excluído' },
      ];
    },

    selectedAll() {
      return this.selectedFilter.name === 'Todos';
    },

    selectedDeleted() {
      return this.selectedFilter.name === 'Excluído';
    },

    filteredEvents() {
      if (this.selectedDeleted) {
        return this.groupedEvents.filter((event) => event.deleted_at !== null);
      }

      return this.groupedEvents.filter(
        (event) =>
          (this.selectedAll || event.status.name === this.selectedFilter.name) &&
          event.name.toLowerCase().includes(this.search.toLowerCase())
      );
    },
  },

  async mounted() {
    await this.handleFetchFilterStatus();
  },

  methods: {
    handleFilterChange(filter) {
      this.selectedFilter = filter;
    },
    handleSearch(search) {
      this.search = search;
      this.$emit('update-search', search);
    },
    async handleFetchFilterStatus() {
      try {
        await status.fetchStatusByModule('event');
      } catch (error) {
        console.error('Erro ao carregar lista de status de eventos', error);
      }
    },
  },
};
</script>

<style scoped>
.events-template {
  max-width: 1280px;
}
.events-template-title {
  font-size: 26px;
  font-weight: 700;
  color: var(--black-text);
  font-family: var(--font-family-inter-bold);
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
