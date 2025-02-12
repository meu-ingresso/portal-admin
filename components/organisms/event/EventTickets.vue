<template>
  <v-row class="mb-4">
    <v-col cols="12">
      <div class="event-tickets-title" :style="{ 'font-size': titleSize }">
        {{ title }}
      </div>
    </v-col>

    <v-col cols="12" md="12" sm="12">
      <TicketRow
        v-for="ticket in nonDeletedTickets"
        :id="ticket.id"
        :key="ticket.id"
        :disable-menu="disableMenu"
        :name="ticket.name"
        :price="ticket.price"
        :status="ticket.status"
        :sold="ticket.sold"
        :total="ticket.total"
        :event-promoter="ticket.eventPromoter"
        @delete="handleDeleteTicket"
        @edit="handleEditTicket" />
    </v-col>

    <!-- Modal de confirmação -->
    <v-dialog
      v-model="showConfirmDialog"
      max-width="500px"
      persistent
      :fullscreen="isMobile">
      <v-card>
        <v-card-title class="d-flex justify-space-between align-center">
          <h3>Confirmar Exclusão</h3>
          <v-btn icon :disabled="isLoading" @click="handleCloseDialog">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        <v-card-text>
          <template v-if="!isLoading">
            Tem certeza que deseja excluir o ingresso "{{ selectedTicket?.name }}"? Esta
            ação não pode ser desfeita.
          </template>
          <template v-else>
            <div class="d-flex align-center">
              <v-progress-circular
                indeterminate
                color="primary"
                size="24"
                width="2"
                class="mr-3"></v-progress-circular>
              <span>Excluindo ingresso...</span>
            </div>
          </template>
        </v-card-text>
        <v-card-actions class="d-flex align-center justify-space-between py-5">
          <DefaultButton
            outlined
            text="Cancelar"
            :disabled="isLoading"
            @click="handleCloseDialog" />
          <DefaultButton
            text="Excluir"
            :loading="isLoading"
            :disabled="isLoading"
            @click="confirmDelete" />
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-row>
</template>

<script>
import { isMobileDevice } from '@/utils/utils';
import { eventTickets, toast, event } from '@/store';
export default {
  props: {
    tickets: { type: Array, required: true },
    title: { type: String, required: false, default: 'Ingressos Vendidos' },
    titleSize: { type: String, required: false, default: '40px' },
    disableMenu: { type: Boolean, required: false, default: false },
    eventId: { type: String, required: true },
  },
  data() {
    return {
      showConfirmDialog: false,
      isLoading: false,
      selectedTicket: null,
    };
  },

  computed: {
    isMobile() {
      return isMobileDevice(this.$vuetify);
    },
    nonDeletedTickets() {
      return this.tickets.filter((ticket) => !ticket.deleted_at);
    },
  },
  methods: {
    handleCloseDialog() {
      if (!this.isLoading) {
        this.showConfirmDialog = false;
        this.selectedTicket = null;
      }
    },

    handleDeleteTicket(ticket) {
      this.selectedTicket = ticket;
      this.showConfirmDialog = true;
    },

    handleEditTicket(ticketId) {
      this.$emit('edit', ticketId);
    },

    async confirmDelete() {
      if (!this.selectedTicket) return;

      try {
        this.isLoading = true;

        await eventTickets.fetchDeleteTicket(this.selectedTicket.id);
        this.$emit('deleted', this.selectedTicket.id);
        this.handleCloseDialog();

        // Notifica o usuário
        toast.setToast({
          text: `Ingresso "${this.selectedTicket.name}" removido com sucesso!`,
          type: 'success',
          time: 5000,
        });

        await event.fetchEventTickets(this.eventId);
      } catch (error) {
        console.error('Erro ao remover ingresso:', error);
        toast.setToast({
          text: `Falha ao remover ingresso. Tente novamente.`,
          type: 'danger',
          time: 5000,
        });
      } finally {
        this.isLoading = false;
        this.showConfirmDialog = false;
      }
    },
  },
};
</script>

<style scoped>
.event-tickets-title {
  font-weight: 700;
  text-align: left;
  color: var(--black-text);
  font-family: var(--font-family-poppins-bold);
}

@media (max-width: 360px) {
  .event-tickets-title {
    font-size: 16px !important;
  }
}

@media (min-width: 361px) and (max-width: 480px) {
  .event-tickets-title {
    font-size: 18px !important;
  }
}
</style>
