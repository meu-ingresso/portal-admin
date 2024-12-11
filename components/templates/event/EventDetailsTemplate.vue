<template>
  <v-container class="event-details">
    <EventDetailsHeader
      :title="event.title"
      :status-text="event.statusText"
      :location="event.location"
      :start-date="event.date"
      :end-date="event.end_date"
      :opening-hour="event.opening_hour"
      :promoters="event.promoters" />

    <EventStatistics :statistics="event.statistics" />

    <EventSales :sales="event.sales" />

    <EventTickets :tickets="event.tickets.filter((ticket) => ticket.hasSales)" />
  </v-container>
</template>

<script>
export default {
  props: {
    event: { type: Object, required: true },
  },
};
</script>

<style scoped>
.event-details {
  padding: 16px;
}
</style>
