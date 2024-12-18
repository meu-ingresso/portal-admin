<template>
  <div class="event-details">
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
      <TicketStatistics :statistics="statistics" />
      <EventTickets
        :tickets="event.tickets"
        title="Tipos de ingressos"
        title-size="16px" />
    </div>
  </div>
</template>

<script>
export default {
  props: {
    event: { type: Object, required: true },
  },

  computed: {
    statistics() {
      if (!this.event) return [];

      const totalSales = this.event.tickets.reduce(
        (acc, ticket) => acc + (ticket.total_quantity - ticket.remaining_quantity),
        0
      );

      const totalHasSales = this.event.tickets.filter((ticket) => ticket.hasSales).length;

      return [
        {
          title: 'Limite de vendas',
          value: `${totalSales} / ${this.event.max_capacity}`,
        },
        {
          title: 'Ingressos à venda',
          value: `${totalHasSales} / ${this.event.tickets.length}`,
        },
      ];
    },
  },
};
</script>

<style scoped>
.event-details {
  padding-top: 16px;
}
.event-details-wrapper{
  max-width: 1480px;
}
</style>
