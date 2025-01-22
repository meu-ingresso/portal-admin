<template>
  <div class="event-details">
    <EventDetailsHeader
      :title="event.title"
      :status-text="event.statusText"
      :location="event.location"
      :start-date="event.start_date"
      :end-date="event.end_date"
      :promoters="event.promoters"
      :latitude="event.address.latitude"
      :longitude="event.address.longitude"
      :alias="event.alias" />

    <div class="event-details-wrapper">
      <EventStatistics :statistics="event.statistics" />

      <EventSales :sales="event.sales" />

      <EventTickets
        v-if="hasTickets"
        disable-menu
        :tickets="event.tickets.filter((ticket) => ticket.hasSales)" />
    </div>
  </div>
</template>

<script>
export default {
  props: {
    event: { type: Object, required: true },
  },

  computed: {
    hasTickets() {
      return this.event.tickets.some((ticket) => ticket.hasSales);
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
