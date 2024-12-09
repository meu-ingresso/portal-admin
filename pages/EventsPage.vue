<template>
  <EventsTemplate v-if="isLoading" :events="events"/>
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
      await event.getAll();
      loading.setIsLoading(false);
    } catch (error) {
      console.error('Erro ao carregar eventos:', error);
    }
  },
};
</script>