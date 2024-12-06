<template>
  <div class="event-details">
    <EventDetailsHeader
      :title="event.title"
      :status-text="event.statusText"
      :location="event.location"
      :date="event.date"
    />
    <EventStatistics :statistics="event.statistics" />
    <div class="event-details-title">Suas Vendas</div>
    <EventTickets :tickets="event.tickets" />
  </div>
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

.event-details-title {
  font-size: 40px;
  font-weight: 700;
  margin-bottom: 20px;
  color: var(--black-text);
  font-family: var(--font-family-poppins-bold);
}
</style>
