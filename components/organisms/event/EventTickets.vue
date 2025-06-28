<template>
  <v-row class="mb-4">
    <v-col cols="12">
      <div class="d-flex justify-space-between">
        <div v-if="!disableTitle" class="event-tickets-title">
          {{ title }}
        </div>
        <DefaultButton v-if="!disableAddTicket" text="Adicionar" @click="handleAddTicket" />
      </div>
    </v-col>

    <v-col cols="12" md="12" sm="12">
      <Container v-if="!disableHover" :lock-axis="'y'" :non-drag-area-selector="'.is-swapping'" @drop="onDrop">
        <Draggable
v-for="ticket in displayedTickets" :key="ticket.id" class="pt-4 draggable-ticket"
          :class="{ 'is-swapping': isSwapping }">
          <TicketRow
:id="ticket.id" :disable-menu="disableMenu" :is-swapping="isSwapping" :name="ticket.name"
            :price="ticket.price" :status="ticket?.status?.name" :sold="ticket.total_sold"
            :total="ticket.total_quantity" :event-promoter="getEventPromoter" @click="handleEditTicket(ticket.id)"
            @delete="handleDeleteTicket" @duplicate="handleDuplicateTicket" @stop-sales="handleStopSales(ticket)" />
        </Draggable>

        <v-skeleton-loader v-if="isDuplicating" class="mx-auto" max-height="74" type="card"></v-skeleton-loader>
      </Container>
      <template v-else>
        <TicketRow
v-for="ticket in displayedTickets" :id="ticket.id" :key="ticket.id" class="mt-1"
          :disable-menu="disableMenu" :disable-hover="disableHover" :name="ticket.name" :price="ticket.price"
          :status="ticket?.status?.name" :sold="ticket.total_sold" :total="ticket.total_quantity"
          :event-promoter="getEventPromoter" @delete="handleDeleteTicket" @click="handleEditTicket(ticket.id)"
          @duplicate="handleDuplicateTicket" @stop-sales="handleStopSales(ticket)" />
      </template>
    </v-col>

    <!-- Modal de edição -->
    <v-dialog v-model="showEditDialog" max-width="900px" persistent :fullscreen="isMobile">
      <v-card :tile="isMobile">
        <v-card-title class="d-flex justify-space-between align-center">
          <h3>Editar Ingresso</h3>
          <v-btn icon :disabled="isLoading" @click="handleCloseEditDialog">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        <v-card-text class="px-4">
          <TicketForm
v-if="showEditDialog" ref="ticketEditForm" :edit-index="selectedTicketIndex" :event-id="eventId"
            :nomenclature="'Ingresso'" />
        </v-card-text>
        <v-card-actions class="d-flex align-center justify-space-between py-4 px-4">
          <DefaultButton outlined text="Cancelar" :disabled="isLoading" @click="handleCloseEditDialog" />
          <DefaultButton text="Salvar" :is-loading="isLoading" :disabled="isLoading" @click="submitEdit" />
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Modal de confirmação -->
    <v-dialog v-model="showConfirmDialog" max-width="500px" persistent :fullscreen="isMobile">
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
              <Lottie path="./animations/loading_default.json" height="130" width="200" class="teste" />
            </div>
          </template>
        </v-card-text>
        <v-card-actions v-if="!isLoading" class="d-flex align-center justify-space-between py-5">
          <DefaultButton outlined text="Cancelar" :disabled="isLoading" @click="handleCloseDialog" />
          <DefaultButton text="Excluir" :is-loading="isLoading" :disabled="isLoading" @click="confirmDelete" />
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-row>
</template>

<script>
import { Container, Draggable } from 'vue-smooth-dnd';
import { isMobileDevice } from '@/utils/utils';

export default {
  components: { Container, Draggable },

  props: {
    title: { type: String, required: false, default: 'Detalhamento das vendas' },
    disableTitle: { type: Boolean, required: false, default: false },
    disableMenu: { type: Boolean, required: false, default: false },
    disableAddTicket: { type: Boolean, required: false, default: false },
    eventId: { type: String, required: true },
    disableHover: { type: Boolean, required: false, default: false },
    customTickets: { type: Array, required: false, default: null },
  },
  data() {
    return {
      showConfirmDialog: false,
      showEditDialog: false,
      isLoading: false,
      isDuplicating: false,
      selectedTicketIndex: null,
      selectedTicket: null,
      isSwapping: false,
    };
  },

  computed: {
    isMobile() {
      return isMobileDevice(this.$vuetify);
    },
    getTickets() {
      return this.$store.getters['eventTickets/$tickets'];
    },
    getEventPromoter() {
      return this.$store.getters['eventGeneralInfo/$info']?.promoter_id;
    },
    // Use customTickets if provided, otherwise use all tickets
    displayedTickets() {
      return this.customTickets || this.getTickets;
    },
  },
  methods: {
    handleAddTicket() {
      this.$emit('add-ticket');
    },

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

        const newTicketId = await this.$store.dispatch('eventTickets/duplicateTicket', {
          ticketId,
          eventId: this.eventId,
        });

        if (newTicketId) {
          this.$store.dispatch('toast/setToast', {
            text: `Ingresso duplicado com sucesso!`,
            type: 'success',
            time: 5000,
          });

          await this.$store.dispatch('eventTickets/fetchAndPopulateByEventId', this.eventId);
        } else {
          this.$store.dispatch('toast/setToast', {
            text: `Falha ao duplicar ingresso. Tente novamente.`,
            type: 'danger',
            time: 5000,
          });
        }
      } catch (error) {
        this.$store.dispatch('toast/setToast', {
          text: `Falha ao duplicar ingresso. Tente novamente.`,
          type: 'danger',
          time: 5000,
        });
        console.error('Erro ao duplicar ingresso:', error);
      } finally {
        this.isDuplicating = false;
      }
    },

    async handleStopSales(ticket) {
      try {

        if (!ticket || !ticket.id || !ticket.name) {
          this.$store.dispatch('toast/setToast', {
            text: `Falha ao pausar venda do ingresso. Tente novamente.`,
            type: 'danger',
            time: 5000,
          });
          return;
        }

        console.log('[STOP SALES] - Ticket', ticket);
        await this.$store.dispatch('eventTickets/stopTicketSales', ticket.id);
        await this.$store.dispatch('eventTickets/fetchAndPopulateByEventId', this.eventId);
        this.$store.dispatch('toast/setToast', {
          text: `Venda do ingresso "${ticket.name}" pausada com sucesso!`,
          type: 'success',
          time: 5000,
        });
      } catch (error) {
        this.$store.dispatch('toast/setToast', {
          text: `Falha ao pausar venda do ingresso. Tente novamente.`,
          type: 'danger',
          time: 5000,
        });
        console.error('Erro ao pausar venda do ingresso:', error);
      }
    },

    async confirmDelete() {
      try {
        this.isLoading = true;
        await this.$store.dispatch('eventTickets/fetchDeleteTicket', this.selectedTicket.id);
        await this.$store.dispatch('eventTickets/fetchAndPopulateByEventId', this.eventId);
        this.$store.dispatch('toast/setToast', {
          text: `Ingresso excluído com sucesso!`,
          type: 'success',
          time: 5000,
        });
        this.handleCloseDialog();
      } catch (error) {
        this.$store.dispatch('toast/setToast', {
          text: `Falha ao excluir ingresso. Tente novamente.`,
          type: 'danger',
          time: 5000,
        });
        console.error('Erro ao excluir ingresso:', error);
      } finally {
        this.isLoading = false;
      }
    },

    async submitEdit() {
      this.isLoading = true;
      try {
        const ticketForm = this.$refs.ticketEditForm;
        const { success, error } = await ticketForm.handleSubmit(true);
        if (success) {
          this.showEditDialog = false;
          this.$store.dispatch('toast/setToast', {
            text: `Ingresso atualizado com sucesso!`,
            type: 'success',
            time: 5000,
          });
        } else {
          console.log('[EDIÇÃO - TicketForm] Erro de validação', error);
          this.$store.dispatch('toast/setToast', {
            text: `Erro ao atualizar ingresso`,
            type: 'error',
            time: 5000,
          });
        }
      } catch (error) {
        console.error('Erro ao enviar formulário:', error);
        this.$store.dispatch('toast/setToast', {
          text: `Erro ao atualizar ingresso`,
          type: 'error',
          time: 5000,
        });
      } finally {
        this.isLoading = false;
      }
    },

    async onDrop(dropResult) {
      // Se não houve remoção e adição real, não faz nada
      if (dropResult.removedIndex === null || dropResult.addedIndex === null) {
        return;
      }

      this.isSwapping = true;

      // Se estamos usando customTickets, precisamos mapear os índices para os tickets reais
      if (this.customTickets) {
        const removedTicket = this.customTickets[dropResult.removedIndex];
        const addedTicket = this.customTickets[dropResult.addedIndex];

        // Encontrar os índices reais no array completo de tickets
        const allTicketsRemovedIndex = this.getTickets.findIndex(t => t.id === removedTicket.id);
        const allTicketsAddedIndex = this.getTickets.findIndex(t => t.id === addedTicket.id);

        if (allTicketsRemovedIndex !== -1 && allTicketsAddedIndex !== -1) {
          await this.$store.dispatch('eventTickets/swapTicketsOrder', {
            removedIndex: allTicketsRemovedIndex,
            addedIndex: allTicketsAddedIndex,
            persist: true,
          });
        }
      } else {
        // Comportamento original
        await this.$store.dispatch('eventTickets/swapTicketsOrder', {
          removedIndex: dropResult.removedIndex,
          addedIndex: dropResult.addedIndex,
          persist: true,
        });
      }

      this.isSwapping = false;
    },
  },
};
</script>

<style scoped>
.event-tickets-title {
  font-size: 20px;
  font-weight: 700;
  color: var(--black-text);
  font-family: var(--font-family-inter-bold);
}

@media (max-width: 360px) {
  .event-tickets-title {
    font-size: 14px;
  }
}

@media (min-width: 361px) and (max-width: 480px) {
  .event-tickets-title {
    font-size: 16px;
  }
}
</style>
