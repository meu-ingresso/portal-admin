<template>
  <v-container class="event-details">
    <EventDetailsHeader
      :title="event.title"
      :status-text="event.statusText"
      :location="event.location"
      :start-date="event.start_date"
      :end-date="event.end_date"
      :opening-hour="event.opening_hour"
      :ending-hour="event.ending_hour"
      :promoters="event.promoters" />

    <div class="event-details-wrapper">
      <EventStatistics :statistics="event.statistics" />

      <EventSales :sales="event.sales" />

      <EventTickets
        disable-menu
        :tickets="event.tickets.filter((ticket) => ticket.hasSales)" />
    </div>
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
.event-details-wrapper{
  max-width: 1480px;
}
</style>
