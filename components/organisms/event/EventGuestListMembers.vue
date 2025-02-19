<template>
  <v-row class="mb-4">
    <template v-if="isLoading">
      <Lottie path="./animations/loading_default.json" height="300" width="300" />
    </template>
    <template v-else>
      <v-col v-if="members.length > 0" cols="12">
        <div class="d-flex justify-space-between">
          <div class="members-title">Convidados</div>
          <DefaultButton
            text="Adicionar Convidado"
            icon="mdi-plus"
            @click="openMemberForm" />
        </div>
      </v-col>
      <v-col cols="12" md="12" sm="12">
        <!-- Estado vazio -->
        <template v-if="members.length === 0">
          <EmptyState
            title="Ainda não há convidados nesta lista"
            subtitle="Uma vez adicionados, seus convidados aparecerão aqui"
            icon="mdi-account-group-outline">
            <template #action>
              <DefaultButton
                text="Adicionar Convidado"
                icon="mdi-plus"
                class="mt-6"
                @click="openMemberForm" />
            </template>
          </EmptyState>
        </template>

        <!-- Listagem de membros -->
        <template v-else>
          <v-data-table
            :headers="headers"
            :items="members"
            :server-items-length="meta.total"
            :options.sync="options"
            :footer-props="{
              itemsPerPageOptions: [50, 100, 200],
              itemsPerPageText: 'Convidados por página',
            }"
            @update:options="handleTableUpdate">
            <!-- Data de criação -->
            <template #[`item.created_at`]="{ item }">
              {{ formatDateTimeWithTimezone(item.created_at) }}
            </template>

            <!-- Nome completo -->
            <template #[`item.full_name`]="{ item }">
              {{ item.first_name }} {{ item.last_name }}
            </template>

            <!-- Ações -->
            <template #[`item.actions`]="{ item }">
              <v-icon small class="mr-2" @click="deleteMember(item)"> mdi-delete </v-icon>
            </template>
          </v-data-table>
        </template>

        <!-- Dialog do formulário -->
        <v-dialog v-model="showForm" max-width="720px" persistent :fullscreen="isMobile">
          <v-card :tile="isMobile">
            <v-card-title class="d-flex justify-space-between align-center">
              <h3>{{ modalTitle }}</h3>
              <v-btn icon :disabled="isSaving" @click="closeForm">
                <v-icon>mdi-close</v-icon>
              </v-btn>
            </v-card-title>

            <v-card-text class="px-4 py-2">
              <v-form v-if="showForm" ref="form" v-model="isFormValid">
                <div
                  v-for="(guest, index) in newGuests"
                  :key="index"
                  class="guest-form-row">
                  <v-row>
                    <v-col cols="12" md="5" sm="12">
                      <v-text-field
                        v-model="guest.first_name"
                        label="Nome"
                        required
                        hide-details="auto"
                        :rules="validationRules.firstName"
                        dense
                        outlined />
                    </v-col>
                    <v-col cols="12" md="4" sm="12">
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
                        label="Quantidade"
                        type="number"
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
                    :disabled="isSaving"
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
                :disabled="isSaving"
                @click="closeForm" />
              <DefaultButton
                :text="saveGuestButtonText"
                :is-loading="isSaving"
                :disabled="isSaving || !isFormValid"
                @click="saveMembers" />
            </v-card-actions>
          </v-card>
        </v-dialog>

        <!-- Dialog de confirmação de remoção -->
        <ConfirmDialog
          v-model="showDeleteDialog"
          title="Remover convidado"
          :message="`Deseja remover ${selectedMember?.first_name} ${selectedMember?.last_name} da lista?`"
          confirm-text="Excluir"
          :loading="isDeleting"
          @confirm="confirmDelete" />
      </v-col>
    </template>
  </v-row>
</template>

<script>
import { isMobileDevice } from '@/utils/utils';
import { eventGuests, toast } from '@/store';
import { formatDateTimeWithTimezone } from '@/utils/formatters';

export default {
  props: {
    listId: {
      type: String,
      required: true,
    },
  },

  data() {
    return {
      headers: [
        {
          text: 'Nome Completo',
          align: 'start',
          value: 'full_name',
          sortable: true,
        },
        {
          text: 'Quantidade',
          align: 'center',
          value: 'quantity',
          sortable: true,
        },
        {
          text: 'Data de Adição',
          align: 'center',
          value: 'created_at',
          sortable: true,
        },
        {
          text: 'Ações',
          align: 'center',
          value: 'actions',
          sortable: false,
        },
      ],
      showForm: false,
      showDeleteDialog: false,
      isSaving: false,
      isFormValid: true,
      selectedMember: null,
      options: {
        page: 1,
        itemsPerPage: 50,
        sortBy: ['first_name'],
        sortDesc: [true],
      },
      newGuests: [],
      validationRules: {
        firstName: [
          (v) => !!v || 'Nome é obrigatório',
          (v) => v?.length <= 60 || 'Máximo de 60 caracteres',
        ],
        lastName: [
          (v) => !!v || 'Sobrenome é obrigatório',
          (v) => v?.length <= 60 || 'Máximo de 60 caracteres',
        ],
        quantity: [
          (v) => !!v || 'Quantidade é obrigatória',
          (v) => v > 0 || 'Quantidade deve ser maior que zero',
          (v) => v <= 10 || 'Máximo de 10 convidados',
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

    members() {
      return eventGuests.$guestListMembers;
    },

    meta() {
      return eventGuests.$metaGuestListMember;
    },

    isLoading() {
      return eventGuests.$isLoading;
    },

    isDeleting() {
      return eventGuests.$isDeleting;
    },

    totalGuests() {
      return this.guests.length;
    },

    userId() {
      return this.$cookies.get('user_id');
    },
  },

  async created() {
    await this.fetchMembers();
  },

  beforeDestroy() {
    eventGuests.resetGuestListMembers();
  },

  methods: {
    formatDateTimeWithTimezone,

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

    removeGuestRow(index) {
      this.newGuests.splice(index, 1);
    },

    openMemberForm() {
      this.newGuests = [this.getEmptyGuest()];
      this.showForm = true;
    },

    closeForm() {
      this.showForm = false;
      this.newGuests = [];
      if (this.$refs.form) {
        this.$refs.form.reset();
      }
    },

    async saveMembers() {
      if (!this.isFormValid) return;

      try {
        this.isSaving = true;

        for (const guest of this.newGuests) {
          await eventGuests.createGuestListMember({
            ...guest,
            guest_list_id: this.listId,
            added_by: this.userId,
          });
        }

        toast.setToast({
          text: 'Convidados adicionados com sucesso!',
          type: 'success',
        });

        this.closeForm();

        // Reset para primeira página e atualiza a tabela
        this.options = {
          ...this.options,
          page: 1,
        };

        await this.fetchMembers();
      } catch (error) {
        toast.setToast({
          text: 'Erro ao adicionar convidados',
          type: 'error',
        });
      } finally {
        this.isSaving = false;
      }
    },

    deleteMember(member) {
      this.selectedMember = member;
      this.showDeleteDialog = true;
    },

    async confirmDelete() {
      if (!this.selectedMember) return;

      try {
        await eventGuests.fetchDeleteGuestListMember(this.selectedMember.id);
        toast.setToast({
          text: 'Convidado removido com sucesso!',
          type: 'success',
        });
        this.fetchMembers();
      } catch (error) {
        toast.setToast({
          text: 'Erro ao remover convidado',
          type: 'error',
        });
      } finally {
        this.showDeleteDialog = false;
        this.selectedMember = null;
      }
    },

    buildQueryParams() {
      const { sortBy, sortDesc, page, itemsPerPage } = this.options;

      let query = `where[guest_list_id][v]=${this.listId}`;

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

    async fetchMembers() {
      const query = this.buildQueryParams();
      await eventGuests.fetchGuestListMemberAndPopulateByQuery(query);
    },

    handleTableUpdate(newOptions) {
      if (this.options !== newOptions) {
        this.options = newOptions;
        this.fetchMembers();
      }
    },
  },
};
</script>

<style scoped>
.members-title {
  font-weight: 600;
  font-size: 26px;
  color: var(--black-text);
  font-family: var(--font-family-inter-bold);
}

@media (max-width: 600px) {
  .members-title {
    font-size: 20px;
  }
}
</style>