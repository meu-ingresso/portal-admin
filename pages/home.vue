<template>
  <div>
    <HomeTemplate :events="events" />
    <Toast />
  </div>
</template>

<script>
import { event } from '@/store';
export default {
  name: 'HomePage',

  computed: {
    events() {
      return event.$eventList
    },
    isLoadingEvents() {
      return event.$isLoading
    }
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
