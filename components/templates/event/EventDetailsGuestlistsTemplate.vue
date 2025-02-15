<template>
  <div class="event-details-guestlists">
    <!-- Cabeçalho com título e botão de adicionar -->

    <div class="d-flex justify-space-between">
      <EventDetailsHeader />
      <div style="padding-top: 12px">
        <DefaultButton
          text="Adicionar Convidado"
          :loading="isLoading"
          icon="mdi-plus"
          @click="openGuestForm" />
      </div>
    </div>

    <!-- Tabela de convidados -->
    <v-data-table
      :headers="headers"
      :items="guests"
      :loading="isLoading"
      :server-items-length="totalGuests"
      :options.sync="options"
      :footer-props="{
        itemsPerPageOptions: [10, 25, 50],
        itemsPerPageText: 'Convidados por página',
      }"
      class="elevation-1">
      <template #[`item.actions`]="{ item }">
        <v-icon small class="mr-2" @click="removeGuest(item)"> mdi-delete </v-icon>
      </template>
      <template #[`item.created_at`]="{ item }">
        {{ formatDateTimeToBr(item.created_at) }}
      </template>
    </v-data-table>

    <!-- Dialog do formulário -->
    <v-dialog v-model="showGuestForm" max-width="720px" persistent :fullscreen="isMobile">
      <v-card :tile="isMobile">
        <v-card-title
          class="d-flex justify-space-between align-center guest-form-modal-title">
          <h3>{{ modalTitle }}</h3>
          <v-btn icon @click="closeGuestForm">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>

        <v-card-text class="px-4 py-2">
          <v-form ref="form" v-model="isFormValid">
            <div v-for="(guest, index) in newGuests" :key="index" class="guest-form-row">
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
              <v-btn text color="primary" class="mt-2" block @click="addNewGuestRow">
                <v-icon left>mdi-plus</v-icon>
                Adicionar convidado
              </v-btn>
            </div>
          </v-form>
        </v-card-text>

        <v-card-actions class="d-flex align-center justify-space-between py-5">
          <DefaultButton
            text="Cancelar"
            outlined
            :disabled="isLoading"
            @click="closeGuestForm" />
          <DefaultButton
            :text="saveGuestButtonText"
            :loading="isLoading"
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
      :loading="isLoading"
      @confirm="confirmDelete" />
  </div>
</template>

<script>
import { formatDateTimeToBr } from '@/utils/formatters';
import { isMobileDevice } from '@/utils/utils';
import { eventGuests, toast } from '@/store';
export default {
  data() {
    return {
      headers: [
        { text: 'Nome', value: 'first_name', sortable: true },
        { text: 'Sobrenome', value: 'last_name', sortable: true },
        { text: 'Quantidade', value: 'quantity', sortable: true },
        { text: 'Data de Criação', value: 'created_at', sortable: true },
        { text: 'Ações', value: 'actions', sortable: false, align: 'center' },
      ],
      options: {
        page: 1,
        itemsPerPage: 10,
        sortBy: ['created_at'],
        sortDesc: [true],
      },
      showGuestForm: false,
      showDeleteDialog: false,
      selectedGuest: null,
      newGuests: [],
      isFormValid: true,
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

    guests() {
      return eventGuests.$guests;
    },
    isLoading() {
      return eventGuests.$isLoading;
    },
    userId() {
      return this.$cookies.get('user_id');
    },
    totalGuests() {
      return this.guests.length;
    },
  },

  async created() {
    await this.fetchGuests();
  },

  methods: {
    formatDateTimeToBr,

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
        await this.fetchGuests();

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
        this.showDeleteDialog = false;
        this.selectedGuest = null;
      }
    },

    async fetchGuests() {
      await eventGuests.fetchAndPopulateByEventId(this.$route.params.id);
    },
  },
};
</script>

<style scoped>
.event-details-guestlists {
  padding-top: 16px;
  max-width: 72rem;
  margin: 0 auto;
}

.guest-form-row {
  border-bottom: 1px solid var(--grey-lighter);
  padding-bottom: 16px;
  margin-bottom: 4px;
}

.guest-form-row:last-child {
  border-bottom: none;
}

.guest-form-modal-title {
  padding-right: 16px !important;
  padding-left: 20px !important;
}
</style>
