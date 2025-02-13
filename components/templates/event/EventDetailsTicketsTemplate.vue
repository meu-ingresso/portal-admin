<template>
  <div v-if="getEvent" class="event-details-tickets">
    <EventDetailsHeader />
    <div class="event-details-wrapper">
      <TicketStatistics :statistics="getStatistics" />
      <EventTickets
        :event-id="getEvent.id"
        title="Tipos de ingressos"
        title-size="16px" />
    </div>
  </div>
</template>

<script>
import { eventGeneralInfo, eventTickets } from '@/store';

export default {
  computed: {
    getEvent() {
      return eventGeneralInfo.$info;
    },

    getTickets() {
      return eventTickets.$tickets;
    },

    getStatistics() {
      if (!this.getEvent || !this.getTickets) return [];

      const totalSales = this.getTickets.reduce(
        (acc, ticket) => acc + ticket.total_sold,
        0
      );

      const totalQuantity = this.getTickets.reduce(
        (acc, ticket) => acc + ticket.total_quantity,
        0
      );

      const totalHasSales = this.getTickets.filter(
        (ticket) => ticket.total_sold > 0
      ).length;

      return [
        {
          title: 'Limite de vendas',
          value: `${totalSales === 0 ? totalQuantity : totalQuantity - totalSales}`,
        },
        {
          title: 'Ingressos à venda',
          value: `${totalHasSales} / ${this.getTickets.length}`,
        },
      ];
    },
  },
};
</script>

<style scoped>
.event-details-tickets {
  padding-top: 16px;
  max-width: 72rem;
  margin: 0 auto;
}
.event-details-wrapper {
  max-width: 1480px;
}
</style>
