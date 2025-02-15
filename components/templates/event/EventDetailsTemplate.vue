<template>
  <div v-if="getEvent" class="event-details">
    <EventDetailsHeader />

    <div class="event-details-wrapper">
      <StatisticList :statistics="getStatistics" title="Visão Geral" />

      <!-- <EventSales :sales="getSales" /> -->

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
          title: 'Vendas',
          value: `${
            this.getEvent.totalizers.totalSales === 0
              ? 'Nenhuma'
              : `${this.getEvent.totalizers.totalSales}`
          }`,
        },
        {
          title: 'Receita Total',
          value: `${
            this.getEvent.totalizers.totalSalesAmount === 0
              ? 'Nenhum'
              : `${formatRealValue(this.getEvent.totalizers.totalSalesAmount)}`
          }`,
        },
        {
          title: 'Taxa de conversão',
          value: `${
            this.getEvent.totalizers.totalViews === 0
              ? '0% (0 visitas)'
              : `${(
                  (this.getEvent.totalizers.totalSales /
                    this.getEvent.totalizers.totalViews) *
                  100
                ).toFixed(0)}% (${this.getEvent.totalizers.totalViews} ${
                  this.getEvent.totalizers.totalViews === 1 ? 'visita' : 'visitas'
                })`
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

  mounted() {
    console.log('this.getEvent.totalizers', JSON.stringify(this.getEvent));
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
