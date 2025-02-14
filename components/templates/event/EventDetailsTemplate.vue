<template>
  <div v-if="getEvent" class="event-details">
    <EventDetailsHeader />

    <div class="event-details-wrapper">
      <EventStatistics :statistics="getStatistics" />

      <EventSales :sales="getSales" />

      <EventTickets
        v-if="hasTickets"
        disable-menu
        disable-hover
        :event-id="getEvent.id" />
    </div>
  </div>
</template>

<script>
import { eventGeneralInfo, eventTickets, eventCoupons } from '@/store';
import { formatRealValue } from '~/utils/formatters';

export default {
  computed: {
    getEvent() {
      return eventGeneralInfo.$info;
    },

    getStatistics() {
      if (!this.getEvent) return [];

      return [
        {
          title: 'Visualizações',
          value: `${
            this.getEvent.totalizers.totalViews === 0
              ? 'Nenhuma'
              : `${this.getEvent.totalizers.totalViews}`
          }`,
        },
        { title: 'Visibilidade', value: this.getEvent.availability },
        {
          title: 'Tipos de ingressos',
          value: `${
            this.getTickets.length === 0 ? 'Nenhum' : `${this.getTickets.length}`
          }`,
        },
        {
          title: 'Cupons de Desconto',
          value: `${
            this.getCoupons.length === 0 ? 'Nenhum' : `${this.getCoupons.length}`
          }`,
        },
      ];
    },

    getSales() {
      if (!this.getEvent) return [];

      const ticketSales = this.getTickets.filter((ticket) => ticket.total_sold > 0);

      return [
        { title: 'Ingressos Vendidos', value: ticketSales.length },
        {
          title: 'Vendas',
          value: formatRealValue(this.getEvent.totalizers.totalSalesAmount),
        },
      ];
    },

    getCoupons() {
      return eventCoupons.$coupons;
    },

    getTickets() {
      return eventTickets.$tickets;
    },

    hasTickets() {
      return this.getTickets.length > 0;
    },
  },
};
</script>

<style scoped>
.event-details {
  padding-top: 16px;
  max-width: 72rem;
  margin: 0 auto;
}
.event-details-wrapper {
  max-width: 1480px;
}
</style>
