<template>
  <div v-if="currentEvent" class="event-details">
    <EventDetailsHeader />

    <div class="event-details-wrapper">
      <EventStatistics :statistics="currentEvent.statistics" />

      <EventSales :sales="currentEvent.sales" />

      <EventTickets
        v-if="hasTickets"
        disable-menu
        :tickets="currentEvent.tickets.filter((ticket) => ticket.hasSales)" />
    </div>
  </div>
</template>

<script>
import { event } from '@/store';

export default {
  computed: {
    currentEvent() {
      return event.$selectedEvent;
    },

    hasTickets() {
      return this.currentEvent?.tickets?.some((ticket) => ticket.hasSales) || false;
    },
  },
};
</script>

<style scoped>
.event-details {
  padding-top: 16px;
}
.event-details-wrapper {
  max-width: 1480px;
}
</style>
