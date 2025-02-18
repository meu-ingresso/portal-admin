<template>
  <v-row class="mb-4">
    <v-col cols="12">
      <div class="d-flex justify-space-between">
        <div class="event-guests-title">Lista de Convidados</div>
        <DefaultButton
          v-if="guests.length > 0"
          text="Adicionar Convidado"
          :loading="isLoading"
          icon="mdi-plus"
          @click="openGuestForm" />
      </div>
    </v-col>
    <v-col cols="12" md="12" sm="12">
      <!-- Estado vazio -->
      <template v-if="guests.length === 0 && !isLoading">
        <EmptyState
          title="Ainda não há convidados"
          subtitle="Uma vez criados, seus convidados aparecerão aqui"
          icon="mdi-account-group-outline">
          <template #action>
            <DefaultButton
              text="Adicionar Convidado"
              icon="mdi-plus"
              class="mt-6"
              @click="openGuestForm" />
          </template>
        </EmptyState>
      </template>

      <!-- Tabela de convidados -->
      <template v-else>
        <v-data-table
          :headers="headers"
          :items="guests"
          :loading="isLoading"
          :server-items-length="meta.total"
          :options.sync="options"
          :footer-props="{
            itemsPerPageOptions: [50, 100, 200],
            itemsPerPageText: 'Convidados por página',
          }"
          class="elevation-1"
          @update:options="handleTableUpdate">
          <template #[`item.full_name`]="{ item }">
            {{ item.first_name }} {{ item.last_name }}
          </template>

          <template #[`item.actions`]="{ item }">
            <v-icon small class="mr-2" @click="removeGuest(item)"> mdi-delete </v-icon>
          </template>
        </v-data-table>
      </template>

      <!-- Dialog do formulário -->
      <v-dialog
        v-model="showGuestForm"
        max-width="720px"
        persistent
        :fullscreen="isMobile">
        <v-card :tile="isMobile">
          <v-card-title
            class="d-flex justify-space-between align-center guest-form-modal-title">
            <h3>{{ modalTitle }}</h3>
            <v-btn icon :disabled="isAddingGuests" @click="closeGuestForm">
              <v-icon>mdi-close</v-icon>
            </v-btn>
          </v-card-title>

          <v-card-text class="px-4 py-2">
            <v-form ref="form" v-model="isFormValid">
              <div
                v-for="(guest, index) in newGuests"
                :key="index"
                class="guest-form-row">
                <v-row>
                  <v-col cols="12" md="4" sm="12">
                    <v-text-field
                      v-model="guest.first_name"
                      label="Nome"
                      required
                      hide-details="auto"
                      :rules="validationRules.firstName"
                      dense
                      outlined />
                  </v-col>
                  <v-col cols="12" md="5" sm="12">
                    <v-text-field
                      v-model="guest.last_name"
                      label="Sobrenome"
                      required
                      hide-details="auto"
                      :rules="validationRules.lastName"
                      dense
                      outlined />
                  </v-col>
                  <v-col cols="12" md="2" sm="12">
                    <v-text-field
                      v-model="guest.quantity"
                      label="Qtd."
                      type="number"
                      min="1"
                      required
                      hide-details="auto"
                      :rules="validationRules.quantity"
                      dense
                      outlined />
                  </v-col>
                  <v-col cols="12" md="1" sm="12" class="d-flex align-center">
                    <v-btn icon small color="error" @click="removeGuestRow(index)">
                      <v-icon>mdi-delete</v-icon>
                    </v-btn>
                  </v-col>
                </v-row>
              </div>

              <!-- Botão para adicionar mais uma linha -->
              <div class="d-flex justify-center">
                <v-btn
                  :disabled="isAddingGuests"
                  text
                  color="primary"
                  class="mt-4"
                  @click="addNewGuestRow">
                  <v-icon left>mdi-plus</v-icon>
                  Novo convidado
                </v-btn>
              </div>
            </v-form>
          </v-card-text>

          <v-card-actions class="d-flex align-center justify-space-between py-5">
            <DefaultButton
              text="Cancelar"
              outlined
              :disabled="isAddingGuests"
              @click="closeGuestForm" />
            <DefaultButton
              :text="saveGuestButtonText"
              :is-loading="isAddingGuests"
              :disabled="newGuests.length === 0 || isLoading"
              @click="saveGuests" />
          </v-card-actions>
        </v-card>
      </v-dialog>

      <!-- Dialog de confirmação de remoção -->
      <ConfirmDialog
        v-model="showDeleteDialog"
        title="Remover Convidado"
        :message="`Deseja remover ${selectedGuest?.first_name} ${selectedGuest?.last_name} da lista de convidados?`"
        confirm-text="Excluir"
        :loading="isDeleting"
        @confirm="confirmDelete" />
    </v-col>
  </v-row>
</template>

<script>
import { isMobileDevice } from '@/utils/utils';
import { eventGuests, toast } from '@/store';

export default {
  data() {
    return {
      headers: [
        { text: 'Nome Completo', value: 'full_name', sortable: true },
        { text: 'Quantidade', value: 'quantity', sortable: true },
        { text: 'Ações', value: 'actions', sortable: false, align: 'center' },
      ],
      options: {
        page: 1,
        itemsPerPage: 50,
        sortBy: ['first_name'],
        sortDesc: [true],
      },
      showGuestForm: false,
      showDeleteDialog: false,
      selectedGuest: null,
      newGuests: [],
      isFormValid: true,
      isAddingGuests: false,
      validationRules: {
        firstName: [
          (v) => !!v || 'Primeiro nome é obrigatório',
          (v) => v.length <= 60 || 'Máximo de 60 caracteres',
        ],
        lastName: [
          (v) => !!v || 'Sobrenome é obrigatório',
          (v) => v.length <= 60 || 'Máximo de 60 caracteres',
        ],
        quantity: [
          (v) => !!v || 'Quantidade é obrigatória',
          (v) => v > 0 || 'Quantidade deve ser maior que zero',
          (v) => v <= 10 || 'Máximo de 10 convidados por pessoa',
        ],
      },
    };
  },

  computed: {
    isMobile() {
      return isMobileDevice(this.$vuetify);
    },

    modalTitle() {
      return `Novos convidados: ${this.newGuests.length}`;
    },

    saveGuestButtonText() {
      return this.newGuests.length === 1
        ? 'Adicionar convidado'
        : `Adicionar ${this.newGuests.length} convidados`;
    },

    meta() {
      return eventGuests.$meta;
    },

    guests() {
      return eventGuests.$guests;
    },
    isLoading() {
      return eventGuests.$isLoading;
    },
    isDeleting() {
      return eventGuests.$isDeleting;
    },
    userId() {
      return this.$cookies.get('user_id');
    },
    totalGuests() {
      return this.guests.length;
    },
  },

  methods: {
    removeGuestRow(index) {
      this.newGuests.splice(index, 1);
    },

    openGuestForm() {
      this.newGuests = [this.getEmptyGuest()];
      this.showGuestForm = true;
    },

    closeGuestForm() {
      this.showGuestForm = false;
      this.newGuests = [];
      if (this.$refs.form) {
        this.$refs.form.reset();
      }
    },

    getEmptyGuest() {
      return {
        first_name: '',
        last_name: '',
        quantity: 1,
      };
    },

    addNewGuestRow() {
      this.newGuests.push(this.getEmptyGuest());
    },

    async saveGuests() {
      if (!this.$refs.form.validate()) return;

      try {
        this.isAddingGuests = true;

        for (const guest of this.newGuests) {
          await eventGuests.createGuest({
            event_id: this.$route.params.id,
            first_name: guest.first_name,
            last_name: guest.last_name,
            quantity: parseInt(guest.quantity),
            guest_by: this.userId,
          });
        }

        await this.fetchGuests();
        this.closeGuestForm();

        toast.setToast({
          text: 'Convidados adicionados com sucesso!',
          type: 'success',
        });
      } catch (error) {
        toast.setToast({
          text: 'Erro ao adicionar convidados',
          type: 'error',
        });
      } finally {
        this.isAddingGuests = false;
      }
    },

    removeGuest(guest) {
      this.selectedGuest = guest;
      this.showDeleteDialog = true;
    },

    async confirmDelete() {
      if (!this.selectedGuest) return;

      try {
        await eventGuests.fetchDeleteGuest(this.selectedGuest.id);
        toast.setToast({
          text: 'Convidado removido com sucesso!',
          type: 'success',
        });
      } catch (error) {
        toast.setToast({
          text: 'Erro ao remover convidado',
          type: 'error',
        });
      } finally {
        this.fetchGuests();
        this.showDeleteDialog = false;
        this.selectedGuest = null;
      }
    },

    async fetchGuests() {
      const query = this.buildQueryParams();
      await eventGuests.fetchAndPopulateByQuery(query);
    },

    async handleTableUpdate(newOptions) {
      this.options = newOptions;
      await this.fetchGuests();
    },

    buildQueryParams() {
      const { sortBy, sortDesc, page, itemsPerPage } = this.options;

      let query = `where[event_id][v]=${this.$route.params.id}`;

      // Adiciona ordenação
      if (sortBy.length > 0) {
        const sortField = sortBy[0] === 'full_name' ? 'first_name' : sortBy[0];
        const sortOrder = sortDesc[0] ? 'desc' : 'asc';
        query += `&orderBy[]=${sortField}:${sortOrder}`;
      }

      // Adiciona paginação (ajustado para começar do 0)
      query += `&limit=${itemsPerPage}&page=${page - 1}`;

      return query;
    },
  },
};
</script>

<style scoped>
.event-guests-title {
  font-weight: 600;
  text-align: left;
  color: var(--black-text);
  font-family: var(--font-family-inter-bold);
  font-size: 26px;
}

@media (max-width: 360px) {
  .event-guests-title {
    font-size: 16px !important;
  }
}

@media (min-width: 361px) and (max-width: 480px) {
  .event-guests-title {
    font-size: 18px !important;
  }
}

/* Adicione se precisar de ajustes específicos para o empty state */
:deep(.empty-state) {
  border: 1px solid var(--grey-lighter);
}
</style>