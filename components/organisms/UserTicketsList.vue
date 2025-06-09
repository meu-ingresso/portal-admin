<template>
  <div>
    <v-skeleton-loader v-if="isLoading" type="card, card, card" :loading="isLoading"></v-skeleton-loader>

    <div v-else>


      <EmptyState v-if="tickets.length === 0" title="Você ainda não comprou ingressos"
        subtitle="Quando você comprar ingressos, eles aparecerão aqui." icon="mdi-ticket-outline" />

      <div v-else>
        <v-card v-for="ticket in tickets" :key="ticket.id" class="mb-4 ticket-card" outlined>
          <div class="d-flex flex-column flex-md-row">
            <div class="ticket-image-container">
              <v-img :src="ticket.event.cover_image || require('@/assets/images/default_banner.png')" height="150"
                cover>
                <template #placeholder>
                  <v-skeleton-loader type="image" />
                </template>
              </v-img>
            </div>

            <div class="ticket-details pa-4 flex-grow-1">
              <div class="d-flex justify-space-between align-center">
                <h3 class="text-h6 primary--text font-weight-bold">{{ ticket.event.name }}</h3>
                <v-chip small :color="getStatusColor(ticket.status)" text-color="white">
                  {{ ticket.status }}
                </v-chip>
              </div>

              <div class="mt-2 text-subtitle-2 grey--text text--darken-1">
                <v-icon small class="mr-1">mdi-calendar</v-icon>
                {{ formatDate(ticket.event.start_date) }} às {{ formatTime(ticket.event.start_time) }}
              </div>

              <div class="mt-1 text-subtitle-2 grey--text text--darken-1">
                <v-icon small class="mr-1">mdi-map-marker</v-icon>
                {{ ticket.event.location }}
              </div>

              <div class="mt-1 text-subtitle-2 grey--text text--darken-1">
                <v-icon small class="mr-1">mdi-ticket-confirmation</v-icon>
                {{ ticket.ticket_type.name }} - R$ {{ formatPrice(ticket.ticket_type.price) }}
              </div>

              <div class="mt-4 d-flex justify-end">
                <v-btn color="primary" small text @click="viewTicketDetails(ticket)">
                  <v-icon small left>mdi-eye</v-icon>
                  Ver detalhes
                </v-btn>

                <v-btn v-if="ticket.status === 'Confirmado'" color="success" small text class="ml-2"
                  @click="downloadTicket(ticket)">
                  <v-icon small left>mdi-download</v-icon>
                  Baixar
                </v-btn>
              </div>
            </div>
          </div>
        </v-card>

        <div class="text-center mt-4">
          <v-pagination v-if="totalPages > 1" v-model="currentPage" :length="totalPages"
            @input="fetchTickets"></v-pagination>
        </div>
      </div>
    </div>

    <!-- Dialog para detalhes do ingresso -->
    <v-dialog v-model="showTicketDialog" max-width="600">
      <v-card v-if="selectedTicket">
        <v-card-title class="primary white--text">
          Detalhes do Ingresso
        </v-card-title>

        <v-card-text class="pt-4">
          <div v-if="selectedTicket.qr_code" class="text-center mb-4">
            <img :src="selectedTicket.qr_code" alt="QR Code" class="qr-code">
          </div>

          <v-list-item two-line>
            <v-list-item-content>
              <v-list-item-title class="text-h6 font-weight-bold">{{ selectedTicket.event.name }}</v-list-item-title>
              <v-list-item-subtitle>{{ formatDateFull(selectedTicket.event.start_date) }}</v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>

          <v-divider class="my-3"></v-divider>

          <v-list dense>
            <v-list-item>
              <v-list-item-icon>
                <v-icon>mdi-ticket</v-icon>
              </v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title>Tipo de Ingresso</v-list-item-title>
                <v-list-item-subtitle>{{ selectedTicket.ticket_type.name }}</v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>

            <v-list-item>
              <v-list-item-icon>
                <v-icon>mdi-cash</v-icon>
              </v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title>Valor</v-list-item-title>
                <v-list-item-subtitle>R$ {{ formatPrice(selectedTicket.ticket_type.price) }}</v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>

            <v-list-item>
              <v-list-item-icon>
                <v-icon>mdi-information</v-icon>
              </v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title>Status</v-list-item-title>
                <v-list-item-subtitle>
                  <v-chip small :color="getStatusColor(selectedTicket.status)" text-color="white">
                    {{ selectedTicket.status }}
                  </v-chip>
                </v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>

            <v-list-item>
              <v-list-item-icon>
                <v-icon>mdi-barcode</v-icon>
              </v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title>Código</v-list-item-title>
                <v-list-item-subtitle>{{ selectedTicket.code }}</v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>

            <v-list-item>
              <v-list-item-icon>
                <v-icon>mdi-calendar</v-icon>
              </v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title>Data de Compra</v-list-item-title>
                <v-list-item-subtitle>{{ formatDateTime(selectedTicket.created_at) }}</v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
          </v-list>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn v-if="selectedTicket.status === 'Confirmado'" color="success" text
            @click="downloadTicket(selectedTicket)">
            <v-icon left>mdi-download</v-icon>
            Baixar
          </v-btn>
          <v-btn color="grey darken-1" text @click="showTicketDialog = false">
            Fechar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
export default {

  data() {
    return {
      isLoading: false,
      tickets: [],
      currentPage: 1,
      totalPages: 1,
      totalItems: 0,
      itemsPerPage: 10,
      showTicketDialog: false,
      selectedTicket: null
    };
  },

  computed: {
    userId() {
      // Buscar userId através do AuthHelper ou store user
      const user = this.$store.getters['user/$user'];
      return user?.id;
    }
  },

  created() {
    this.fetchTickets();
  },

  methods: {
    formatDate(date) {
      if (!date) return '';
      return new Date(date).toLocaleDateString('pt-BR');
    },

    formatTime(time) {
      if (!time) return '';
      return time.substring(0, 5); // Formato HH:MM
    },

    formatDateTime(dateTime) {
      if (!dateTime) return '';
      const date = new Date(dateTime);
      return date.toLocaleDateString('pt-BR') + ' ' + date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    },

    formatDateFull(date) {
      if (!date) return '';
      const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
      return new Date(date).toLocaleDateString('pt-BR', options);
    },

    formatPrice(price) {
      return Number(price).toFixed(2).replace('.', ',');
    },

    getStatusColor(status) {
      const statusColors = {
        'Confirmado': 'success',
        'Pendente': 'warning',
        'Cancelado': 'error',
        'Utilizado': 'grey darken-1'
      };

      return statusColors[status] || 'grey';
    },


    async fetchTickets() {
      try {
        this.isLoading = true;

        if (!this.userId) {
          throw new Error('Usuário não encontrado. Por favor, faça login novamente.');
        }

        // Buscar ingressos do usuário através da API
        const response = await this.$axios.$get('/customer-tickets', {
          params: {
            'whereHas[payment][user_id][v]': this.userId,
            'preloads[]': ['ticket', 'ticket:event', 'ticket:ticket_type', 'payment'],
            'page': this.currentPage - 1,
            'limit': this.itemsPerPage,
            'orderBy[]': 'created_at:desc'
          }
        });

        if (response.body && response.body.code === 'SEARCH_SUCCESS') {
          this.tickets = response.body.result.data || [];
          this.totalItems = response.body.result.meta?.total || 0;
          this.totalPages = response.body.result.meta?.lastPage || 1;
        } else {
          this.tickets = [];
          this.totalItems = 0;
          this.totalPages = 1;
        }

      } catch (error) {
        console.error('Erro ao buscar ingressos:', error);

        this.$store.dispatch('toast/setToast', {
          text: 'Erro ao carregar seus ingressos. Tente novamente.',
          type: 'error',
          time: 5000,
        });
      } finally {
        this.isLoading = false;
      }
    },

    viewTicketDetails(ticket) {
      this.selectedTicket = ticket;
      this.showTicketDialog = true;
    },


    downloadTicket(ticket) {
      // Aqui você implementaria a lógica para download do ingresso
      console.log('Download ticket:', ticket.id);

      this.$store.dispatch('toast/setToast', {
        text: 'Baixando seu ingresso...',
        type: 'info',
        time: 3000,
      });

      // Exemplo de chamada para download
      // window.open(ticket.pdf_url, '_blank');
    }
  }
}
</script>

<style scoped>
.ticket-card {
  transition: all 0.3s ease;
}

.ticket-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.ticket-image-container {
  min-width: 150px;
  max-width: 150px;
}

.qr-code {
  max-width: 200px;
  max-height: 200px;
}

@media (max-width: 599px) {
  .ticket-image-container {
    width: 100%;
    max-width: none;
  }
}
</style>