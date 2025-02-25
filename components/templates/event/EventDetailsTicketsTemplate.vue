<template>
  <div v-if="getEvent" class="event-details-tickets">
    <EventDetailsHeader />
    <div class="event-details-wrapper">
      <!-- Estado vazio -->
      <template v-if="getTickets?.length === 0">
        <EmptyState
          title="Ainda não há ingressos"
          subtitle="Uma vez criados, seus ingressos aparecerão aqui"
          icon="mdi-ticket">
          <template #action>
            <DefaultButton
              text="Adicionar ingresso"
              icon="mdi-plus"
              class="mt-6"
              @click="openAddTicketModal" />
          </template>
        </EmptyState>
      </template>

      <!-- Tabela de ingressos -->
      <template v-else>
        <StatisticList :statistics="getStatistics" title="Ingressos" />
        <EventTickets
          :event-id="getEvent.id"
          title="Lista de ingressos"
          @add-ticket="openAddTicketModal" />
      </template>
    </div>

    <!-- Modal de adição -->
    <v-dialog v-model="showAddDialog" max-width="900px" persistent :fullscreen="isMobile">
      <v-card :tile="isMobile">
        <v-card-title class="d-flex justify-space-between align-center">
          <h3>Adicionar ingresso</h3>
          <v-btn icon :disabled="isAddingTicket" @click="handleCloseAddDialog">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        <v-card-text class="px-4">
          <TicketForm
            v-if="showAddDialog"
            ref="ticketForm"
            :nomenclature="'Ingresso'"
            :event-id="getEvent.id" />
        </v-card-text>
        <v-card-actions class="d-flex align-center justify-space-between py-4 px-4">
          <DefaultButton
            outlined
            text="Cancelar"
            :disabled="isAddingTicket"
            @click="handleCloseAddDialog" />
          <DefaultButton
            text="Salvar"
            :is-loading="isAddingTicket"
            :disabled="isAddingTicket"
            @click="submitAdd" />
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { isMobileDevice } from '@/utils/utils';
import { eventGeneralInfo, eventTickets, toast } from '@/store';

export default {
  data() {
    return {
      showAddDialog: false,
      isAddingTicket: false,
    };
  },

  computed: {
    isMobile() {
      return isMobileDevice(this.$vuetify);
    },

    getEvent() {
      return eventGeneralInfo.$info;
    },

    getTickets() {
      return eventTickets.$tickets;
    },

    getStatistics() {
      if (!this.getEvent || !this.getTickets) return [];

      const totalSales = this.getTickets.reduce(
        (acc, ticket) => acc + Number(ticket.total_sold),
        0
      );

      const totalQuantity = this.getTickets.reduce(
        (acc, ticket) => acc + Number(ticket.total_quantity),
        0
      );

      const totalHasSales = this.getTickets.filter(
        (ticket) => Number(ticket.total_sold) > 0
      ).length;

      return [
        {
          title: 'Vendas / Limite',
          value: `${totalSales} / ${totalQuantity}`,
        },
        {
          title: 'Ingressos à venda',
          value: `${totalHasSales} / ${this.getTickets.length}`,
        },
      ];
    },
  },

  methods: {
    handleCloseAddDialog() {
      this.showAddDialog = false;
    },

    openAddTicketModal() {
      this.showAddDialog = true;
    },

    async submitAdd() {
      try {
        this.isAddingTicket = true;
        const ticketForm = this.$refs.ticketForm;
        const { success, error } = await ticketForm.handleSubmit(true);
        if (success) {
          this.showAddDialog = false;
          toast.setToast({
            text: `Ingresso adicionado com sucesso!`,
            type: 'success',
            time: 5000,
          });
        } else {
          console.log('[INSERÇÃO - TicketForm] Erro de validação', error);
          toast.setToast({
            text: `Erro ao adicionar ingresso`,
            type: 'error',
            time: 5000,
          });
        }
      } catch (error) {
        console.log('[INSERÇÃO - TicketForm] Erro de validação');
      } finally {
        this.isAddingTicket = false;
      }
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
