<template>
  <div v-if="currentEvent" class="event-details">
    <EventDetailsHeader />
    <div class="event-details-wrapper">
      <TicketStatistics :statistics="statistics" />
      <EventTickets
        :tickets="currentEvent.tickets"
        title="Tipos de ingressos"
        title-size="16px" />
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

    statistics() {
      if (!this.currentEvent?.tickets) return [];

      const totalSales = this.currentEvent.tickets.reduce(
        (acc, ticket) => acc + (ticket.total_quantity - ticket.remaining_quantity),
        0
      );

      const totalQuantity = this.currentEvent.tickets.reduce(
        (acc, ticket) => acc + ticket.total_quantity,
        0
      );

      const totalHasSales = this.currentEvent.tickets.filter(
        (ticket) => ticket.hasSales
      ).length;

      return [
        {
          title: 'Limite de vendas',
          value: `${totalSales === 0 ? totalQuantity : totalSales}`,
        },
        {
          title: 'Ingressos à venda',
          value: `${totalHasSales} / ${this.currentEvent.tickets.length}`,
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
.event-details-wrapper {
  max-width: 1480px;
}
</style>
