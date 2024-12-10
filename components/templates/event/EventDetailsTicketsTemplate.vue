<template>
  <v-container class="event-details">
    <EventDetailsHeader
      :title="event.title"
      :status-text="event.statusText"
      :location="event.location"
      :date="event.date"
      :promoters="event.promoters"
    />
    <EventSales :sales="event.sales" />
    <EventTickets :tickets="event.tickets" />
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
