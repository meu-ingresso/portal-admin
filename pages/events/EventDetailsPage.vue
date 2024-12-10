<template>
  <div v-if="selectedEvent">
    <EventDetailsTemplate v-if="inDetails" :event="selectedEvent" />

    <EventDetailsTicketsTemplate v-if="inDetailsTickets" :event="selectedEvent" />
  </div>

  <Lottie v-else path="./animations/loading_default.json" height="300" width="300" />
</template>

<script>
import { event, loading } from '@/store';
export default {
  computed: {
    selectedEvent() {
      return event.$selectedEvent;
    },

    isLoadingEvents() {
      return event.$isLoading;
    },

    inDetails() {
      return this.$route.meta.name === 'eventsDetails';
    },

    inDetailsTickets() {
      return this.$route.meta.name === 'eventsDetailsTickets';
    },
  },

  async mounted() {
    if (this.selectedEvent && this.selectedEvent.id === this.$route.params.id) {
      return;
    }

    loading.setIsLoading(true);

    await event.getById(this.$route.params.id);

    loading.setIsLoading(false);
  },
};
</script>
