<template>
  <EventsTemplate :events="events"/>
</template>
<script>
import { event } from '@/store';
export default {
  computed: {
    events() {
      return event.$eventList;
    },
    isLoadingEvents() {
      return event.$isLoading;
    },
  },

  async mounted() {
    try {
      await event.getAll();
    } catch (error) {
      console.error('Erro ao carregar eventos:', error);
    }
  },
};
</script>