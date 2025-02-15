<template>
  <v-row class="mb-4">
    <v-col cols="12">
      <div class="event-tickets-title" :style="{ 'font-size': titleSize }">
        {{ title }}
      </div>
    </v-col>

    <v-col cols="12" md="12" sm="12">
      <Container
        v-if="!disableHover"
        :lock-axis="'y'"
        :non-drag-area-selector="'.ticket-actions-menu'"
        @drop="onDrop">
        <Draggable v-for="ticket in getTickets" :key="ticket.id" class="pt-4">
          <TicketRow
            :id="ticket.id"
            :disable-menu="disableMenu"
            :name="ticket.name"
            :price="ticket.price"
            :status="ticket?.status?.name"
            :sold="ticket.total_sold"
            :total="ticket.total_quantity"
            :event-promoter="getEventPromoter"
            @delete="handleDeleteTicket"
            @edit="handleEditTicket"
            @duplicate="handleDuplicateTicket"
            @stop-sales="handleStopSales" />
        </Draggable>

        <v-skeleton-loader
          v-if="isDuplicating"
          class="mx-auto"
          max-height="74"
          type="card"></v-skeleton-loader>
      </Container>
      <template v-else>
        <TicketRow
          v-for="ticket in getTickets"
          :id="ticket.id"
          :key="ticket.id"
          :disable-menu="disableMenu"
          :disable-hover="disableHover"
          :name="ticket.name"
          :price="ticket.price"
          :status="ticket?.status?.name"
          :sold="ticket.total_sold"
          :total="ticket.total_quantity"
          :event-promoter="getEventPromoter"
          @delete="handleDeleteTicket"
          @edit="handleEditTicket"
          @duplicate="handleDuplicateTicket"
          @stop-sales="handleStopSales" />
      </template>
    </v-col>

    <!-- Modal de edição -->
    <v-dialog
      v-model="showEditDialog"
      max-width="900px"
      persistent
      :fullscreen="isMobile">
      <v-card :tile="isMobile">
        <v-card-title class="d-flex justify-space-between align-center">
          <h3>Editar Ingresso</h3>
          <v-btn icon :disabled="isLoading" @click="handleCloseEditDialog">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        <v-card-text>
          <TicketForm
            ref="ticketEditForm"
            :edit-index="selectedTicketIndex"
            :event-id="eventId"
            :nomenclature="'Ingresso'" />
        </v-card-text>
        <v-card-actions class="d-flex justify-end py-3 px-6">
          <DefaultButton
            outlined
            text="Cancelar"
            class="mr-4"
            :disabled="isLoading"
            @click="handleCloseEditDialog" />
          <DefaultButton
            text="Salvar"
            :is-loading="isLoading"
            :disabled="isLoading"
            @click="submitEdit" />
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Modal de confirmação -->
    <v-dialog
      v-model="showConfirmDialog"
      max-width="500px"
      persistent
      :fullscreen="isMobile">
      <v-card :tile="isMobile">
        <v-card-title v-if="!isLoading" class="d-flex justify-space-between align-center">
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
            <div class="text-center">
              <div class="pt-10">
                <h2 class="pt-10">Excluindo ingresso...</h2>
              </div>
              <Lottie
                path="./animations/loading_default.json"
                height="130"
                width="200"
                class="teste" />
            </div>
          </template>
        </v-card-text>
        <v-card-actions
          v-if="!isLoading"
          class="d-flex align-center justify-space-between py-5">
          <DefaultButton
            outlined
            text="Cancelar"
            :disabled="isLoading"
            @click="handleCloseDialog" />
          <DefaultButton
            text="Excluir"
            :is-loading="isLoading"
            :disabled="isLoading"
            @click="confirmDelete" />
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-row>
</template>

<script>
import { Container, Draggable } from 'vue-smooth-dnd';
import { isMobileDevice } from '@/utils/utils';
import { eventTickets, toast, eventGeneralInfo } from '@/store';
export default {
  components: { Container, Draggable },

  props: {
    title: { type: String, required: false, default: 'Detalhamento das vendas' },
    titleSize: { type: String, required: false, default: '26px' },
    disableMenu: { type: Boolean, required: false, default: false },
    eventId: { type: String, required: true },
    disableHover: { type: Boolean, required: false, default: false },
  },
  data() {
    return {
      showConfirmDialog: false,
      showEditDialog: false,
      isLoading: false,
      isDuplicating: false,
      selectedTicketIndex: null,
      selectedTicket: null,
    };
  },

  computed: {
    isMobile() {
      return isMobileDevice(this.$vuetify);
    },
    getTickets() {
      return eventTickets.$tickets;
    },
    getEventPromoter() {
      return eventGeneralInfo.$info?.promoter_id;
    },
  },
  methods: {
    handleCloseDialog() {
      if (!this.isLoading) {
        this.showConfirmDialog = false;
        this.selectedTicket = null;
      }
    },

    handleCloseEditDialog() {
      if (!this.isLoading) {
        this.showEditDialog = false;
        this.selectedTicketIndex = null;
      }
    },

    handleDeleteTicket(ticket) {
      this.selectedTicket = ticket;
      this.showConfirmDialog = true;
    },

    handleEditTicket(ticketId) {
      this.selectedTicketIndex = this.getTickets.findIndex(
        (ticket) => ticket.id === ticketId
      );
      this.showEditDialog = true;
    },

    async handleDuplicateTicket(ticketId) {
      try {
        this.isDuplicating = true;

        const newTicketId = await eventTickets.duplicateTicket({
          ticketId,
          eventId: this.eventId,
        });

        if (newTicketId) {
          toast.setToast({
            text: `Ingresso duplicado com sucesso!`,
            type: 'success',
            time: 5000,
          });

          await eventTickets.fetchAndPopulateByEventId(this.eventId);
        } else {
          toast.setToast({
            text: `Falha ao duplicar ingresso. Tente novamente.`,
            type: 'danger',
            time: 5000,
          });
        }
      } catch (error) {
        toast.setToast({
          text: `Falha ao duplicar ingresso. Tente novamente.`,
          type: 'danger',
          time: 5000,
        });
        console.error('Erro ao duplicar ingresso:', error);
      } finally {
        this.isDuplicating = false;
      }
    },

    async handleStopSales(ticketId) {
      try {
        await eventTickets.stopTicketSales(ticketId);

        toast.setToast({
          text: `Vendas interrompidas com sucesso!`,
          type: 'success',
          time: 5000,
        });
      } catch (error) {
        toast.setToast({
          text: `Falha ao interromper vendas do ingresso. Tente novamente.`,
          type: 'danger',
          time: 5000,
        });
        console.error('Erro ao interromper vendas do ingresso:', error);
      }
    },

    async submitEdit() {
      try {
        this.isLoading = true;

        const ticketEditForm = this.$refs.ticketEditForm;
        const { success } = await ticketEditForm.handleSubmit(true);

        if (success) {
          this.isLoading = false;

          this.handleCloseEditDialog();
          toast.setToast({
            text: `Ingresso atualizado com sucesso!`,
            type: 'success',
            time: 5000,
          });
        } else {
          console.log('[ATUALIZAÇÃO - TicketForm] Erro de validação');
        }
      } catch (error) {
        this.showEditDialog = false;
        this.isLoading = false;
        console.error('Erro ao atualizar ingresso:', error);
      } finally {
        this.isLoading = false;
      }
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

        await eventTickets.fetchAndPopulateByEventId(this.eventId);
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

    async onDrop({ removedIndex, addedIndex }) {
      if (removedIndex !== null && addedIndex !== null && removedIndex !== addedIndex) {
        try {
          await eventTickets.swapTicketsOrder({
            removedIndex,
            addedIndex,
            persist: true,
          });

          toast.setToast({
            text: `Ingressos reordenados com sucesso!`,
            type: 'success',
            time: 5000,
          });
        } catch (error) {
          console.error('Erro ao trocar ordem de exibição dos ingressos:', error);
          toast.setToast({
            text: `Falha ao reordenar ingressos. Tente novamente.`,
            type: 'danger',
            time: 5000,
          });
        }
      }
    },
  },
};
</script>

<style scoped>
.event-tickets-title {
  font-weight: 600;
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
