<template>
  <v-container class="step-tickets py-0 px-0">
    <v-row>
      <v-col cols="12">
        <template v-if="isMobile">
          <h3>{{ getNomenclature }}</h3>
          <p class="subtitle-2">
            Adicione {{ nomenclature?.toLowerCase() }} para o evento.
          </p>
        </template>
        <ButtonWithIcon
          class="mt-2"
          :text="getNomenclature"
          direction="left"
          @click="openNewTicketModal" />
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12">
        <template v-if="getNonDeletedTickets.length">
          <!-- Estrutura de Tabela Desktop -->
          <div v-if="!isMobile" class="table-container">
            <!-- Cabeçalho -->
            <div class="table-header">
              <div class="table-cell hover-header"></div>
              <div class="table-cell">Nome</div>
              <div class="table-cell">Categoria</div>
              <div class="table-cell">Preço</div>
              <div class="table-cell">Ações</div>
            </div>

            <!-- Linhas Reordenáveis -->
            <Container
              :lock-axis="'y'"
              :non-drag-area-selector="'.actions'"
              @drop="onDrop">
              <Draggable
                v-for="(ticket, index) in getNonDeletedTickets"
                :key="index"
                class="table-row">
                <div class="table-cell hover-icon">
                  <v-icon>mdi-drag-vertical</v-icon>
                </div>
                <div class="table-cell">{{ ticket.name ? ticket.name : '-' }}</div>
                <div class="table-cell">
                  {{ ticket.category ? ticket.category.text : '-' }}
                </div>
                <div class="table-cell">
                  {{ ticket.price ? `R$ ${formattedPrice(ticket.price)}` : '-' }}
                </div>
                <div class="table-cell actions">
                  <ActionsMenu
                    :index="index"
                    :show-edit="true"
                    :show-duplicate="true"
                    :show-delete="true"
                    @edit="openEditModal(index)"
                    @duplicate="duplicateTicket"
                    @delete="handleRemoveTicket" />
                </div>
              </Draggable>
            </Container>
          </div>

          <!-- Estrutura de Tabela Celular -->
          <div v-else class="table-container">
            <!-- Cabeçalho -->
            <div class="table-header">
              <div class="table-cell">Nome</div>
              <div class="table-cell">Ações</div>
            </div>

            <!-- Linhas Reordenáveis -->
            <Container
              :lock-axis="'y'"
              :non-drag-area-selector="'.actions'"
              @drop="onDrop">
              <Draggable
                v-for="(ticket, index) in tickets"
                :key="index"
                class="table-row">
                <div class="table-cell">{{ ticket.name ? ticket.name : '-' }}</div>
                <div class="table-cell actions">
                  <ActionsMenu
                    :index="index"
                    :show-edit="true"
                    :show-duplicate="true"
                    :show-delete="true"
                    @edit="openEditModal(ticket, $event)"
                    @duplicate="duplicateTicket"
                    @delete="handleRemoveTicket" />
                </div>
              </Draggable>
            </Container>
          </div>
        </template>
      </v-col>
    </v-row>

    <!-- Modal de Novo Ingresso -->
    <v-dialog
      v-model="newTicketModal"
      max-width="960px"
      :fullscreen="isMobile"
      persistent>
      <v-card :tile="isMobile">
        <v-card-title class="d-flex justify-space-between align-center">
          <h3>{{ getNewItemModalTitle }}</h3>
          <v-btn icon @click="newTicketModal = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        <v-card-text class="px-4 py-2">
          <TicketForm
            v-if="newTicketModal"
            ref="newTicketForm"
            :nomenclature="getNomenclature" />
        </v-card-text>
        <v-card-actions class="d-flex align-center py-5">
          <v-spacer />

          <DefaultButton outlined text="Cancelar" @click="newTicketModal = false" />
          <DefaultButton text="Salvar" @click="saveNewTicket" />
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Modal de Edição -->
    <v-dialog v-model="editModal" max-width="960px" :fullscreen="isMobile" persistent>
      <v-card :tile="isMobile">
        <v-card-title class="d-flex justify-space-between align-center">
          <h3>Editar {{ getNomenclature }}</h3>
          <v-btn icon @click="editModal = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        <v-card-text class="px-4 py-2">
          <TicketForm
            v-if="editModal"
            ref="editTicketForm"
            :nomenclature="getNomenclature"
            :edit-index="selectedTicketIndex" />
        </v-card-text>
        <v-card-actions class="d-flex align-center justify-space-between py-5">
          <DefaultButton outlined text="Cancelar" @click="editModal = false" />
          <DefaultButton text="Salvar" @click="saveEditedTicket" />
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Dialog de Confirmação -->
    <v-dialog v-model="confirmDialog" max-width="500" :fullscreen="isMobile" persistent>
      <v-card :tile="isMobile">
        <v-card-title class="d-flex justify-space-between align-center">
          <h3>Confirmar exclusão</h3>
          <v-btn icon @click="confirmDialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        <v-card-text>
          {{ confirmMessage }}
        </v-card-text>
        <v-card-actions class="d-flex justify-space-between align-center">
          <DefaultButton outlined text="Cancelar" @click="confirmDialog = false" />
          <DefaultButton text="Excluir" @click="confirmRemoveTicket" />
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
import { Container, Draggable } from 'vue-smooth-dnd';
import { isMobileDevice } from '@/utils/utils';
import { toast, eventTickets, eventCustomFields, eventCoupons } from '@/store';
import { formatPrice } from '@/utils/formatters';

export default {
  components: { Container, Draggable },
  props: {
    nomenclature: {
      type: String,
      required: true,
    },
  },

  data() {
    return {
      confirmDialog: false,
      confirmMessage: '',
      ticketIdxToRemove: null,
      ticketNameToRemove: null,
      editModal: false,
      selectedTicketIndex: null,
      newTicketModal: false,
      newTicket: {
        name: '',
        category: {
          id: null,
          value: '',
          text: '',
        },
        price: '',
        max_quantity: '',
        min_purchase: '',
        max_purchase: '',
        open_date: '',
        start_time: '',
        close_date: '',
        end_time: '',
        visible: true,
        availability: '',
      },
    };
  },

  computed: {
    isMobile() {
      return isMobileDevice(this.$vuetify);
    },
    getNomenclature() {
      switch (this.nomenclature) {
        case 'Ingressos':
          return 'Ingresso';
        case 'Inscrição':
          return 'Inscrição';
        case 'Doação':
          return 'Doação';
        default:
          return 'Ingresso';
      }
    },
    getNewItemModalTitle() {
      if (this.getNomenclature === 'Ingresso') {
        return `Novo ${this.getNomenclature}`;
      }
      return `Nova ${this.getNomenclature}`;
    },

    getCoupons() {
      return eventCoupons.$coupons;
    },

    getNonDeletedTickets() {
      return eventTickets.$tickets.filter((ticket) => !ticket._deleted);
    },

    getDeletedTickets() {
      return eventTickets.$tickets.filter((ticket) => ticket._deleted);
    },

    getCustomFields() {
      return eventCustomFields.$customFields;
    },

    getDeletedCategories() {
      return eventTickets.$deletedCategories;
    },

    getNonDeletedCategories() {
      return eventTickets.$ticketCategories;
    },
  },

  methods: {
    formattedPrice(price) {
      return formatPrice(price);
    },

    canProceed(callback) {
      callback(null, true);
    },

    duplicateTicket(index) {
      const ticketToDuplicate = { ...this.getNonDeletedTickets[index] };
      const baseName = `Cópia de ${ticketToDuplicate.name}`;
      let newName = baseName;

      if (this.getNonDeletedTickets.some((ticket) => ticket.name === baseName)) {
        let counter = 2;
        while (this.getNonDeletedTickets.some((ticket) => ticket.name === newName)) {
          newName = `${baseName} (${counter})`;
          counter++;
        }
      }

      ticketToDuplicate.name = newName;

      eventTickets.addTicket({
        ...ticketToDuplicate,
        id: '-1',
        display_order: ticketToDuplicate.display_order
          ? ticketToDuplicate.display_order + 1
          : null,
      });

      toast.setToast({
        text: `Ingresso "${newName}" duplicado com sucesso!`,
        type: 'success',
        time: 5000,
      });
    },

    handleUpdateTicket(ticket, index) {
      eventTickets.updateTicket({ index, ticket });
    },

    confirmRemoveTicket() {
      const removedTicket = this.getNonDeletedTickets[this.ticketIdxToRemove];
      eventTickets.updateTicket({
        index: this.ticketIdxToRemove,
        ticket: {
          ...removedTicket,
          _deleted: true,
        },
      });

      const relatedFields = this.getRelatedCustomFields(removedTicket.name);
      const hasReletedFields = relatedFields.length > 0;
      if (hasReletedFields) {
        this.removeCustomFieldsLinkedToTicket(removedTicket.name);
      }

      const relatedCoupons = this.getRelatedCoupons(removedTicket.name);
      const hasReletedCoupons = relatedCoupons.length > 0;
      if (hasReletedCoupons) {
        this.removeCouponsLinkedToTicket(removedTicket.name);
      }

      toast.setToast({
        text: hasReletedFields
          ? 'Ingresso e seus respectivos campos/cupons removidos com sucesso'
          : 'Ingresso removido com sucesso.',
        type: 'success',
        time: 5000,
      });
      this.confirmDialog = false;
    },

    handleRemoveTicket(index) {
      this.ticketIdxToRemove = index;
      this.ticketNameToRemove =
        this.getNonDeletedTickets[index]?.name || `Ingresso ${index + 1}`;
      const relatedFields = this.getRelatedCustomFields(this.ticketNameToRemove);

      if (relatedFields.length > 0) {
        this.confirmMessage = `O ingresso "${this.ticketNameToRemove}" está vinculado a campos personalizados. Deseja removê-los também?`;
      } else {
        this.confirmMessage = `Tem certeza de que deseja excluir "${this.ticketNameToRemove}"?`;
      }

      this.confirmDialog = true;
    },

    openNewTicketModal() {
      this.newTicketModal = true;
    },

    updateNewTicketFields(updatedTicket) {
      this.newTicket = updatedTicket;
    },

    saveNewTicket() {
      const ticketForm = this.$refs.newTicketForm;
      if (ticketForm.handleSubmit()) {
        this.newTicketModal = false;
      } else {
        console.log('[INSERÇÃO - TicketForm] Erro de validação');
      }
    },

    openEditModal(index) {
      this.selectedTicketIndex = index;
      this.editModal = true;
    },
    saveEditedTicket() {
      if (this.selectedTicketIndex !== null) {
        const ticketForm = this.$refs.editTicketForm;

        const ticket = this.getNonDeletedTickets[this.selectedTicketIndex];
        const relatedFields = this.getRelatedCustomFields(ticket.name);
        const relatedCoupons = this.getRelatedCoupons(ticket.name);
        const hasReletedFields = relatedFields.length > 0;
        const hasReletedCoupons = relatedCoupons.length > 0;

        if (ticketForm.handleSubmit()) {
          // Mesmo index porém atualizado
          const updatedTicket = this.getNonDeletedTickets[this.selectedTicketIndex];

          this.editModal = false;
          this.selectedTicketIndex = null;

          if (hasReletedFields) {
            relatedFields.forEach((field, indexField) => {
              const index = field.tickets.indexOf(ticket.name);
              if (index !== -1) {
                field.tickets.splice(index, 1);
                field.tickets.push(updatedTicket.name);
                eventCustomFields.updateField({ indexField, field });
              }
            });
          }

          if (hasReletedCoupons) {
            relatedCoupons.forEach((coupon, indexCoupon) => {
              const index = coupon.tickets.indexOf(ticket.name);
              if (index !== -1) {
                coupon.tickets.splice(index, 1);
                coupon.tickets.push(updatedTicket.name);
                eventCoupons.updateCoupon({ indexCoupon, coupon });
              }
            });
          }
        } else {
          console.log('[EDIÇÃO - TicketForm] Erro de validação');
        }
      }
    },

    getRelatedCustomFields(ticketName) {
      return this.getCustomFields.filter((field) => field?.tickets.includes(ticketName));
    },

    getRelatedCoupons(ticketName) {
      return this.getCoupons.filter((coupon) => coupon?.tickets.includes(ticketName));
    },

    removeCustomFieldsLinkedToTicket(ticketName) {
      this.getCustomFields.forEach((field) => {
        const index = field.tickets.indexOf(ticketName);
        if (index !== -1) {
          const deletedTicket = field.tickets[index];

          eventCustomFields.updateField({
            index,
            field: {
              ...field,
              tickets: [
                ...field.tickets.filter((ticket) => ticket !== deletedTicket),
                {
                  ...deletedTicket,
                  _deleted: true,
                },
              ],
            },
          });
        }
      });

      /*       const filteredFields = this.getCustomFields.filter(
        (field) =>
          field.tickets.filter((ticket) => !ticket._deleted).length > 0 ||
          field.is_default
      );

      eventCustomFields.setFields(filteredFields); */
    },

    removeCouponsLinkedToTicket(ticketName) {
      this.getCoupons.forEach((coupon) => {
        const index = coupon.tickets.indexOf(ticketName);
        if (index !== -1) {
          const deletedTicket = coupon.tickets[index];

          eventCoupons.updateCoupon({
            index,
            coupon: {
              ...coupon,
              tickets: [
                ...coupon.tickets.filter((ticket) => ticket !== deletedTicket),
                {
                  ...deletedTicket,
                  _deleted: true,
                },
              ],
            },
          });
        }
      });

      /*       const filteredCoupons = this.getCoupons.filter(
        (coupon) => coupon.tickets.filter((ticket) => !ticket._deleted).length > 0
      );
      eventCoupons.setCoupons(filteredCoupons); */
    },

    onDrop({ removedIndex, addedIndex }) {
      if (removedIndex !== null && addedIndex !== null) {
        const movedTicket = this.getNonDeletedTickets.splice(removedIndex, 1)[0];
        this.getNonDeletedTickets.splice(addedIndex, 0, movedTicket);
      }
    },
  },
};
</script>

<style scoped>
.step-tickets {
  margin: 0 auto;
}
.tax-container {
  max-width: 200px;
}

.table-container {
  display: flex;
  flex-direction: column;
  border: 1px solid var(--tertiary);
  border-radius: 8px;
}

.table-header,
.table-row {
  display: flex !important;
}

.table-cell {
  flex: 1;
  align-items: center;
  display: flex;
  padding: 12px;
  border-bottom: 1px solid #ddd;
}

.table-cell.hover-icon {
  cursor: grab;
  justify-content: center;
  max-width: 60px;
}

.table-cell.hover-header {
  max-width: 60px;
}

.table-header .table-cell {
  font-size: 14px;
}

.table-row .table-cell {
  font-size: 12px;
}

.table-header {
  background-color: #f4f4f4;
  font-weight: bold;
  font-size: 16px;
}

.table-row:hover {
  background-color: #f9f9f9;
}

.table-cell:last-child {
  text-align: right;
  justify-content: end;
}

.table-row {
  cursor: grab;
}

.table-row:active {
  cursor: grabbing;
}
</style>
