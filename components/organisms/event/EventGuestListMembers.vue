<template>
  <v-row class="mb-4">
    <template v-if="isLoading">
      <Lottie path="./animations/loading_default.json" height="300" width="300" />
    </template>
    <template v-else>
      <v-col v-if="members.length > 0 && !isMobile" cols="12">
        <div class="d-flex justify-space-between">
          <div class="template-title">Convidados - {{ currentGuestList.name }}</div>
          <DefaultButton text="Adicionar" icon="mdi-plus" @click="openMemberForm" />
        </div>
      </v-col>
      <v-col v-if="members.length > 0 && isMobile" cols="12">
        <DefaultButton text="Adicionar" icon="mdi-plus" block @click="openMemberForm" />
      </v-col>
      <v-col cols="12" md="12" sm="12">
        <!-- Estado vazio -->
        <template v-if="members.length === 0">
          <EmptyState title="Ainda não há convidados nesta lista"
            subtitle="Uma vez adicionados, seus convidados aparecerão aqui" icon="mdi-account-group-outline">
            <template #action>
              <DefaultButton text="Adicionar Convidado" icon="mdi-plus" class="mt-6" @click="openMemberForm" />
            </template>
          </EmptyState>
        </template>

        <!-- Listagem de membros -->
        <template v-else>
          <v-data-table :headers="headers" :items="members" :server-items-length="meta.total" :options.sync="options"
            :footer-props="{
              itemsPerPageOptions: [50, 100, 200],
              itemsPerPageText: 'Convidados por página',
              pageText: '{0}-{1} de {2}',
              itemsPerPageAllText: 'Todos',
            }" :no-data-text="'Nenhum registro encontrado'" :no-results-text="'Nenhum registro encontrado'"
            :loading-text="'Carregando...'" class="guest-table" @update:options="handleTableUpdate">
            <!-- Nome completo -->
            <template #[`item.full_name`]="{ item }">
              {{ item.first_name }} {{ item.last_name }}
            </template>

            <!-- Ações -->
            <template #[`item.actions`]="{ item }">
              <v-btn icon small color="error" @click="deleteMember(item)">
                <v-icon>mdi-delete</v-icon>
              </v-btn>
            </template>
          </v-data-table>
        </template>

        <!-- Dialog do formulário -->
        <v-dialog v-model="showForm" max-width="720px" persistent :fullscreen="isMobile">
          <v-card :tile="isMobile" class="form-card">
            <!-- Header -->
            <v-card-title class="d-flex justify-space-between align-center form-header">
              <h3>{{ modalTitle }}</h3>
              <v-btn icon :disabled="isSaving" @click="closeForm">
                <v-icon>mdi-close</v-icon>
              </v-btn>
            </v-card-title>

            <!-- Conteúdo scrollável -->
            <v-card-text class="form-content">
              <v-form v-if="showForm" ref="form" v-model="isFormValid">
                <div v-for="(guest, index) in newGuests" :key="index" class="guest-form-row"
                  :class="{ 'guest-form-row--even': index % 2 === 0 }">
                  <v-row>
                    <!-- Nome -->
                    <v-col cols="12" md="5" sm="12">
                      <v-text-field v-model="guest.first_name" label="Nome" required hide-details="auto"
                        :rules="validationRules.firstName" dense outlined />
                    </v-col>

                    <!-- Sobrenome -->
                    <v-col cols="12" md="4" sm="12">
                      <v-text-field v-model="guest.last_name" label="Sobrenome" required hide-details="auto"
                        :rules="validationRules.lastName" dense outlined />
                    </v-col>

                    <!-- Quantidade -->
                    <v-col cols="9" md="2" sm="9">
                      <v-text-field v-model="guest.quantity" label="Qtd." type="number" required hide-details="auto"
                        :rules="validationRules.quantity" dense outlined />
                    </v-col>

                    <!-- Botão de remover -->
                    <v-col cols="3" md="1" sm="3" class="d-flex align-center">
                      <v-btn icon small color="error" @click="removeGuestRow(index)">
                        <v-icon>mdi-delete</v-icon>
                      </v-btn>
                    </v-col>
                  </v-row>
                </div>
              </v-form>

              <!-- Botão para adicionar mais uma linha -->
              <div class="d-flex justify-center mt-4 mb-6">
                <v-btn text color="primary" :disabled="isSaving" @click="addNewGuestRow">
                  <v-icon left>mdi-plus</v-icon>
                  Novo convidado
                </v-btn>
              </div>
            </v-card-text>

            <!-- Footer -->
            <div :class="['form-actions', { 'form-actions--mobile': isMobile }]">
              <div class="d-flex align-center justify-space-between py-4 px-4 w-100">
                <DefaultButton text="Cancelar" outlined :disabled="isSaving" @click="closeForm" />
                <DefaultButton text="Adicionar" :is-loading="isSaving" :disabled="isSaving || !isFormValid"
                  @click="saveMembers" />
              </div>
            </div>
          </v-card>
        </v-dialog>

        <!-- Dialog de confirmação de remoção -->
        <ConfirmDialog v-model="showDeleteDialog" title="Remover convidado"
          :message="`Deseja remover ${selectedMember?.first_name} ${selectedMember?.last_name} da lista?`"
          confirm-text="Excluir" :loading="isDeleting" @confirm="confirmDelete" />
      </v-col>
    </template>
  </v-row>
</template>

<script>
import { isMobileDevice } from '@/utils/utils';
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
      currentQuery: '',
      forceUpdate: false,
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

    currentGuestList() {
      return this.$store.getters['eventGuests/$guestLists'].find((list) => list.id === this.listId);
    },

    members() {
      return this.$store.getters['eventGuests/$guestListMembers'];
    },

    meta() {
      return this.$store.getters['eventGuests/$metaGuestListMember'];
    },

    isLoading() {
      return this.$store.getters['eventGuests/$isLoading'];
    },

    isDeleting() {
      return this.$store.getters['eventGuests/$isDeleting'];
    },

    totalGuests() {
      return this.guests.length;
    },

    userId() {
      return this.$store.state.auth.user?.id;
    },
  },

  async created() {
    await this.fetchMembers();
  },

  beforeDestroy() {
    this.$store.dispatch('eventGuests/resetGuestListMembers');
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
          await this.$store.dispatch('eventGuests/createGuestListMember', {
            ...guest,
            guest_list_id: this.listId,
            added_by: this.userId,
          });
        }

        this.$store.dispatch('toast/setToast', {
          text: 'Convidados adicionados com sucesso!',
          type: 'success',
        });

        this.closeForm();

        // Reset para primeira página e atualiza a tabela
        this.options = {
          ...this.options,
          page: 1,
        };

        await this.fetchMembers(true);
      } catch (error) {
        this.$store.dispatch('toast/setToast', {
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
        await this.$store.dispatch('eventGuests/fetchDeleteGuestListMember', this.selectedMember.id);
        this.$store.dispatch('toast/setToast', {
          text: 'Convidado removido com sucesso!',
          type: 'success',
        });
        this.fetchMembers(true);
      } catch (error) {
        this.$store.dispatch('toast/setToast', {
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

    isQueryDifferent(newQuery, force = false) {
      // Se forceUpdate está ativo, permite a atualização
      if (force || !this.currentQuery) {
        this.currentQuery = newQuery;
        return true;
      }

      if (this.currentQuery !== newQuery) {
        this.currentQuery = newQuery;
        return true;
      }

      return false;
    },

    async fetchMembers(force = false) {
      const query = this.buildQueryParams();
      if (this.isQueryDifferent(query, force)) {
        await this.$store.dispatch('eventGuests/fetchGuestListMemberAndPopulateByQuery', query);
      }
    },

    handleTableUpdate(newOptions) {
      if (JSON.stringify(this.options) !== JSON.stringify(newOptions)) {
        this.options = newOptions;
        this.fetchMembers(false);
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.form-card {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.form-header {
  flex-shrink: 0;
  border-bottom: 1px solid var(--grey-lighter);
}

.form-content {
  flex-grow: 1;
  overflow-y: auto;
}

.guest-form-row {
  padding: 16px;
  margin: 8px 0;
  border-radius: 8px;
}

.guest-form-row--even {
  background-color: var(--tertiary);
}

.form-actions {
  border-top: 1px solid var(--grey-lighter);
  background: white;
}

/* Estilos específicos para mobile */
.form-actions--mobile {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 1;
}

@media (max-width: 600px) {
  .form-card {
    height: 100vh;
  }

  .form-content {
    padding-bottom: 100px !important;
  }

  .guest-form-row {
    padding: 12px;
    margin: 4px 0;
  }

  .form-actions--mobile {
    padding-bottom: env(safe-area-inset-bottom);
  }
}
</style>
