<template>
  <EventsTemplate
    v-if="!isLoading"
    :events="events"
    @update-search="handleSearchEvents" />
  <Loading v-else />
</template>
<script>
import { event, loading } from '@/store';
export default {
  computed: {
    events() {
      return event.$eventList || [];
    },
    isLoading() {
      return loading.$isLoading;
    },
  },

  async mounted() {
    try {
      loading.setIsLoading(true);
      await event.fetchEvents({
        sortBy: ['name'],
        sortDesc: [false],
      });
      loading.setIsLoading(false);
    } catch (error) {
      console.error('Erro ao carregar eventos:', error);
    }
  },

  methods: {
    async handleSearchEvents(search) {
      try {
        await event.fetchEvents({
          sortBy: ['name'],
          sortDesc: [false],
          search,
        });
      } catch (error) {
        console.error('Erro ao carregar eventos:', error);
      }
    },
  },
};
</script>