<template>
  <v-row class="mb-4">
      <v-col cols="12">
        <div class="template-title">Desempenho das vendas</div>
      </v-col>

      <v-col cols="12" md="12" sm="12">
        <v-data-table
          :headers="sessionsHeaders"
          :items="sessionsData"
          hide-default-footer
          class="session-table">
          <template #[`item.date`]="{ item }">
            {{ formatDateToCustomString(item.start_date) }}
          </template>
          
          <template #[`item.time`]="{ item }">
            {{ formatHourToBr(item.start_date) }}
          </template>
          
          <template #[`item.totalRevenue`]="{ item }">
            {{ formatRealValue(item.totalRevenue) }}
          </template>
          
          <template #[`item.percentSold`]="{ item }">
            <v-progress-linear
              :value="item.percentSold"
              height="20"
              color="primary"
              striped>
              <template #default>
                {{ item.percentSold }}%
              </template>
            </v-progress-linear>
          </template>
        </v-data-table>
      </v-col>
    </v-row>
</template>

<script>
import { formatRealValue, formatDateToCustomString, formatHourToBr } from '~/utils/formatters';

export default {
  props: {
    sessions: {
      type: Array,
      required: true,
    },
  },

  data() {
    return {
      sessionsHeaders: [
        { text: 'Data', value: 'date' },
        { text: 'Horário', value: 'time' },
        { text: 'Ingressos Vendidos', value: 'soldTickets' },
        { text: 'Ocupação', value: 'percentSold' },
        { text: 'Receita', value: 'totalRevenue' },
      ],
    }
  },

  computed: {
    getSessions() {
      return this.sessions;
    },

    sessionsData() {
      if (!this.getSessions) return [];
      
      return this.getSessions.map(session => {
        // Calcular totais por sessão
        const totalSold = session.totalizers?.totalSales || 0;
        const totalRevenue = session.totalizers?.totalSalesAmount || 0;
        const totalCapacity = session?.tickets?.reduce((acc, ticket) => acc + ticket.total_quantity, 0) || 0;
        const percentSold = Math.min(100, Math.round((totalSold / totalCapacity) * 100));
        
        return {
          id: session.id,
          name: session.name,
          start_date: session.start_date,
          soldTickets: totalSold,
          totalRevenue,
          percentSold,
        };
      }).sort((a, b) => new Date(a.start_date) - new Date(b.start_date));
    },
  },

  methods: {
    formatDateToCustomString,
    formatHourToBr,
    formatRealValue,
  },
};
</script>

<style scoped>
.session-table {
  max-width: 1480px;
}

.session-table-title {
  font-size: 20px;
  font-weight: 700;
  color: var(--black-text);
  font-family: var(--font-family-inter-bold);
}

@media (max-width: 360px) {
  .session-table-title {
    font-size: 14px;
  }
}

@media (min-width: 361px) and (max-width: 480px) {
  .session-table-title {
    font-size: 16px;
  }
}
</style>