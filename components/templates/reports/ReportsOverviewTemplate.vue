<template>
  <div class="reports-overview">
    <v-card class="mb-6">
      <v-card-title class="headline primary--text">
        Visão Geral
      </v-card-title>
      
      <v-card-text>
        <v-row>
          <v-col cols="12" sm="6" md="3">
            <v-card elevation="2" class="summary-card">
              <v-card-text>
                <div class="text-subtitle-1 text-uppercase font-weight-medium">Ingressos Vendidos</div>
                <div class="text-h4 font-weight-bold primary--text">{{ totalTicketsSold }}</div>
                <div class="caption">de {{ totalTickets }} disponíveis</div>
              </v-card-text>
            </v-card>
          </v-col>
          
          <v-col cols="12" sm="6" md="3">
            <v-card elevation="2" class="summary-card">
              <v-card-text>
                <div class="text-subtitle-1 text-uppercase font-weight-medium">Receita Total</div>
                <div class="text-h4 font-weight-bold primary--text">{{ formattedTotalRevenue }}</div>
              </v-card-text>
            </v-card>
          </v-col>
          
          <v-col cols="12" sm="6" md="3">
            <v-card elevation="2" class="summary-card">
              <v-card-text>
                <div class="text-subtitle-1 text-uppercase font-weight-medium">Visualizações</div>
                <div class="text-h4 font-weight-bold primary--text">{{ totalViews }}</div>
              </v-card-text>
            </v-card>
          </v-col>
          
          <v-col cols="12" sm="6" md="3">
            <v-card elevation="2" class="summary-card">
              <v-card-text>
                <div class="text-subtitle-1 text-uppercase font-weight-medium">Taxa de Conversão</div>
                <div class="text-h4 font-weight-bold primary--text">{{ conversionRate }}%</div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
    
    <v-card v-if="getTickets && getTickets.length > 0" class="mb-6">
      <v-card-title class="headline primary--text">
        Vendas por Ingresso
      </v-card-title>
      
      <v-card-text>
        <v-data-table
          :headers="ticketsHeaders"
          :items="ticketsData"
          :items-per-page="5"
          class="elevation-1">
          <template #[`item.percentSold`]="{ item }">
            <v-tooltip top>
              <template #activator="{ on, attrs }">
                <v-progress-linear
                  v-bind="attrs"
                  :value="item.percentSold"
                  height="20"
                  color="primary"
                  striped
                  v-on="on"
                >
                  {{ item.percentSold }}%
                </v-progress-linear>
              </template>
              <span>{{ item.sold }} de {{ item.total }} vendidos</span>
            </v-tooltip>
          </template>
          
          <template #[`item.price`]="{ item }">
            {{ formatCurrency(item.price) }}
          </template>
          
          <template #[`item.revenue`]="{ item }">
            {{ formatCurrency(item.revenue) }}
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>
    
    <v-card>
      <v-card-title class="headline primary--text">
        Evolução de Vendas
      </v-card-title>
      
      <v-card-text>
        <v-row>
          <v-col cols="12">
            <div class="chart-container" style="height: 300px">
              <SalesEvolutionChart :orders="orders" />
            </div>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <v-card v-if="hasSessions" class="mt-6">
      <v-card-title class="headline primary--text">
        Visão Geral por Sessões
      </v-card-title>
      
      <v-card-text>
        <v-data-table
          :headers="sessionsHeaders"
          :items="sessionsData"
          :items-per-page="5"
          class="elevation-1">
          <template #[`item.date`]="{ item }">
            {{ formatDate(item.start_date) }}
          </template>
          
          <template #[`item.time`]="{ item }">
            {{ formatTime(item.start_date) }}
          </template>
          
          <template #[`item.totalRevenue`]="{ item }">
            {{ formatCurrency(item.totalRevenue) }}
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
      </v-card-text>
    </v-card>
  </div>
</template>

<script>
import { eventGeneralInfo, eventTickets } from '@/store';
import { formatDateToCustomString, formatHourToBr } from '@/utils/formatters';

export default {
  data() {
    return {
      ticketsHeaders: [
        { text: 'Ingresso', value: 'name' },
        { text: 'Preço', value: 'price' },
        { text: 'Disponíveis', value: 'total' },
        { text: 'Vendidos', value: 'sold' },
        { text: 'Progresso', value: 'percentSold' },
        { text: 'Receita', value: 'revenue' },
      ],
      sessionsHeaders: [
        { text: 'Data', value: 'date' },
        { text: 'Horário', value: 'time' },
        { text: 'Ingressos Vendidos', value: 'soldTickets' },
        { text: 'Ocupação', value: 'percentSold' },
        { text: 'Receita', value: 'totalRevenue' },
      ],
      orders: [
        // Seu array de orders aqui
        {"id":"bb4c4330-0a41-4380-a160-eacba5c9097d", "created_at":"2025-02-19T01:59:40.940+00:00", "tickets":[{"id":"ef5e968e-d5bf-4bdd-a37f-418b377d0e0d"}]},
        {"id":"cc759ca0-07af-4414-a627-54fb70a89d88", "created_at":"2025-03-07T23:19:21.123+00:00", "tickets":[{"id":"1e83942e-f362-46d3-bd1b-185b451b64cf"}]}
      ]
    };
  },
  
  computed: {
    getEvent() {
      return eventGeneralInfo.$info || {};
    },
    
    getTickets() {
      return eventTickets.$tickets || [];
    },
    
    totalTickets() {
      return this.getTickets.reduce((sum, ticket) => sum + (parseInt(ticket.total_quantity) || 0), 0);
    },
    
    totalTicketsSold() {
      return this.getTickets.reduce((sum, ticket) => sum + (parseInt(ticket.total_sold) || 0), 0);
    },
    
    totalRevenue() {
      return this.getTickets.reduce((sum, ticket) => {
        const price = parseFloat(ticket.price) || 0;
        const sold = parseInt(ticket.total_sold) || 0;
        return sum + (price * sold);
      }, 0);
    },
    
    formattedTotalRevenue() {
      return this.formatCurrency(this.totalRevenue);
    },
    
    totalViews() {
      return this.getEvent?.totalizers?.totalViews || '0';
    },
    
    conversionRate() {
      const views = parseInt(this.totalViews);
      if (!views) return '0';
      
      return ((this.totalTicketsSold / views) * 100).toFixed(1);
    },
    
    ticketsData() {
      return this.getTickets.map(ticket => {
        const price = parseFloat(ticket.price) || 0;
        const total = parseInt(ticket.total_quantity) || 0;
        const sold = parseInt(ticket.total_sold) || 0;
        const percentSold = total ? Math.round((sold / total) * 100) : 0;
        
        return {
          name: ticket.name,
          price,
          total,
          sold,
          percentSold,
          revenue: price * sold,
        };
      });
    },
    
    hasSessions() {
      if (this.getEvent.hasSessions) return true;
      
      if (this.getEvent.sessionIds && this.getEvent.sessionIds.length > 1) return true;
      
      if (this.getEvent.groups && this.getEvent.groups.length > 0) {
        const groupId = this.getEvent.groups[0].id;
        const eventsInGroup = eventGeneralInfo.$eventList.filter(event => 
          event.groups && 
          event.groups.length && 
          event.groups[0].id === groupId
        );
        
        return eventsInGroup.length > 1;
      }
      
      return false;
    },
    
    sessionsData() {
      if (!this.hasSessions) return [];
      
      // Obtém todas as sessões do evento atual
      let sessions = [];
      
      if (this.getEvent.sessionIds) {
        // Sessões definidas explicitamente
        sessions = this.getEvent.sessionIds.map(id => 
          eventGeneralInfo.$eventList.find(e => e.id === id)
        ).filter(Boolean);
      } else if (this.getEvent.groups && this.getEvent.groups.length > 0) {
        // Sessões definidas por grupo
        const groupId = this.getEvent.groups[0].id;
        sessions = eventGeneralInfo.$eventList.filter(event => 
          event.groups && 
          event.groups.length && 
          event.groups[0].id === groupId
        );
      }
      
      return sessions.map(session => {
        // Calcular totais por sessão
        const totalSold = session.totalizers?.totalSales || 0;
        const totalRevenue = session.totalizers?.totalSalesAmount || 0;
        const totalCapacity = 100; // Placeholder, idealmente calculado com base nos ingressos da sessão
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
    formatCurrency(value) {
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      }).format(value);
    },
    
    formatDate(dateString) {
      if (!dateString) return '';
      return formatDateToCustomString(dateString);
    },
    
    formatTime(dateString) {
      if (!dateString) return '';
      return formatHourToBr(dateString);
    }
  },
};
</script>

<style scoped>
.reports-overview {
  padding: 8px 0;
}

.summary-card {
  height: 100%;
  transition: transform 0.3s;
}

.summary-card:hover {
  transform: translateY(-5px);
}

.chart-container {
  width: 100%;
  min-height: 300px;
  border: 1px solid #eee;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style> 