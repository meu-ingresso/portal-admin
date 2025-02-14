<template>
  <div v-if="getEvent" class="event-details-tickets">
    <div class="d-flex justify-space-between">
      <EventDetailsHeader />
      <div style="padding-top: 12px">
        <DefaultButton text="Adicionar ingresso" @click="openAddTicketModal" />
      </div>
    </div>
    <div class="event-details-wrapper">
      <TicketStatistics :statistics="getStatistics" />
      <EventTickets
        :event-id="getEvent.id"
        title="Tipos de ingressos"
        title-size="16px" />
    </div>

    <!-- Modal de adição -->
    <v-dialog v-model="showAddDialog" max-width="900px" persistent :fullscreen="isMobile">
      <v-card :tile="isMobile">
        <v-card-title class="d-flex justify-space-between align-center">
          <h3>Adicionar ingresso</h3>
          <v-btn icon @click="handleCloseAddDialog">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        <v-card-text>
          <TicketForm
            ref="ticketForm"
            :nomenclature="'Ingresso'"
            :event-id="getEvent.id" />
        </v-card-text>
        <v-card-actions class="d-flex justify-end py-3 px-6">
          <DefaultButton
            outlined
            text="Cancelar"
            class="mr-4"
            @click="handleCloseAddDialog" />
          <DefaultButton text="Salvar" @click="submitAdd" />
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

  methods: {
    handleCloseAddDialog() {
      this.showAddDialog = false;
    },

    openAddTicketModal() {
      this.showAddDialog = true;
    },

    async submitAdd() {
      const ticketForm = this.$refs.ticketForm;
      const ticketId = await ticketForm.handleSubmit(true);
      if (ticketId) {
        this.showAddDialog = false;
        toast.setToast({
          text: `Ingresso adicionado com sucesso!`,
          type: 'success',
          time: 5000,
        });
      } else {
        console.log('[INSERÇÃO - TicketForm] Erro de validação');
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
