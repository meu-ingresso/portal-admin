<template>
  <div class="event-details-wrapper">
    <StatisticList :statistics="getStatistics" title="Visão geral" />
    <EventSessionsTable :sessions="getSessions" />
  </div>
</template>

<script>
import { formatRealValue } from '~/utils/formatters';

export default {

  computed: {
    getEvent() {
      return this.$store.getters['eventGeneralInfo/$info'];
    },

    getSessions() {
      return this.$store.getters['eventGeneralInfo/$eventList'];
    },

    getStatistics() {
      if (!this.getEvent) return [];

      return [
        {
          title: 'Vendas',
          value: `${this.getEvent.totalizers.totalSales === 0
              ? 'Nenhuma'
              : `${this.getEvent.totalizers.totalSales}`
            }`,
        },
        {
          title: 'Receita total',
          value: `${this.getEvent.totalizers.totalSalesAmount === 0
              ? 'Nenhuma'
              : `${formatRealValue(this.getEvent.totalizers.totalSalesAmount)}`
            }`,
        },
        {
          title: 'Taxa de conversão',
          value: `${this.getEvent.totalizers.totalViews === 0
              ? '0% (0 visitas)'
              : `${(
                (this.getEvent.totalizers.totalSales /
                  this.getEvent.totalizers.totalViews) *
                100
              ).toFixed(0)}% (${this.getEvent.totalizers.totalViews} ${this.getEvent.totalizers.totalViews === 1 ? 'visita' : 'visitas'
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
      return this.$store.getters['eventCoupons/$coupons'];
    },

    getTickets() {
      return this.$store.getters['eventTickets/$tickets'];
    },

    hasTickets() {
      return this.getTickets.length > 0;
    },
  },

};
</script>

<style scoped>
.event-details-wrapper {
  max-width: 1480px;
}
</style>
