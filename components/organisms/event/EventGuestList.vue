<template>
  <v-row class="mb-4">
    <template v-if="isLoading">
      <Lottie path="./animations/loading_default.json" height="300" width="300" />
    </template>

    <template v-else>
      <v-col v-if="guestLists.length > 0" cols="12">
        <div class="d-flex justify-space-between">
          <div class="template-title">Lista de Convidados</div>
          <DefaultButton text="Adicionar" icon="mdi-plus" @click="openGuestListForm" />
        </div>
      </v-col>

      <v-col cols="12" md="12" sm="12">
        <!-- Estado vazio -->
        <template v-if="guestLists.length === 0">
          <EmptyState title="Ainda não há listas de convidados"
            subtitle="Uma vez criadas, suas listas de convidados aparecerão aqui" icon="mdi-account-group-outline">
            <template #action>
              <DefaultButton text="Adicionar" icon="mdi-plus" class="mt-6" @click="openGuestListForm" />
            </template>
          </EmptyState>
        </template>

        <!-- Listas de convidados -->
        <template v-else>
          <div class="guest-lists-container">
            <div v-for="list in guestLists" :key="list.id" class="guest-list-card" @click="navigateToMembers(list.id)">
              <div class="guest-list-content">
                <div class="guest-list-main">
                  <h3 class="guest-list-name">{{ list.name }}</h3>
                  <p class="guest-list-meta">
                    Última alteração: {{ formatDateTimeWithTimezone(list.updated_at) }}
                  </p>
                </div>

                <div class="guest-list-actions">
                  <div class="guest-list-counter">
                    <span class="counter-text">CHECKED IN</span>
                    <span class="counter-numbers">
                      {{ getValidatedCount(list) }} / {{ getTotalMembers(list) }}
                    </span>
                  </div>
                  <ActionsMenu :show-duplicate="false" :show-stop-sales="false" :show-edit="true" :show-delete="true"
                    @edit="() => editGuestList(list)" @delete="() => deleteGuestList(list)" />
                </div>
              </div>
            </div>
          </div>
        </template>

        <template v-if="isSaving">
          <v-skeleton-loader class="mx-auto" max-height="74" type="card"></v-skeleton-loader>
        </template>

        <!-- Dialog do formulário -->
        <v-dialog v-model="showForm" max-width="720px" persistent :fullscreen="isMobile">
          <v-card :tile="isMobile">
            <v-card-title class="d-flex justify-space-between align-center">
              <h3 class="modalTitle">
                {{ isEditing ? 'Atualizar uma' : 'Criar' }} lista de convidados
              </h3>
              <v-btn icon :disabled="isSaving" @click="closeForm">
                <v-icon>mdi-close</v-icon>
              </v-btn>
            </v-card-title>
            <v-card-subtitle v-if="!isEditing">
              Adicione participantes ao seu evento sem afetar a quantidade de ingressos
              disponível.
            </v-card-subtitle>

            <v-card-text class="px-4 py-2">
              <v-form v-if="showForm" ref="form" v-model="isFormValid">
                <v-text-field v-model="formData.name" label="Nome da lista"
                  placeholder="Exemplo: Família, Amigos, Trabalho, etc." required hide-details="auto"
                  :rules="validationRules.name" dense outlined />
              </v-form>
            </v-card-text>

            <v-card-actions class="d-flex align-center justify-space-between py-5">
              <DefaultButton text="Cancelar" outlined :disabled="isSaving" @click="closeForm" />
              <DefaultButton :text="isEditing ? 'Atualizar' : 'Criar lista'" :is-loading="isSaving"
                :disabled="isSaving || !isFormValid" @click="saveGuestList" />
            </v-card-actions>
          </v-card>
        </v-dialog>

        <!-- Dialog de confirmação de remoção -->
        <ConfirmDialog v-model="showDeleteDialog" title="Remover lista de convidados"
          :message="`Deseja remover a lista '${selectedList?.name}'?`" confirm-text="Excluir" :loading="isDeleting"
          @confirm="confirmDelete" />
      </v-col>
    </template>
  </v-row>
</template>

<script>
import { isMobileDevice } from '@/utils/utils';
import { formatDateTimeWithTimezone } from '@/utils/formatters';
export default {
  data() {
    return {
      showForm: false,
      showDeleteDialog: false,
      isEditing: false,
      isSaving: false,
      isFormValid: true,
      selectedList: null,
      formData: {
        name: '',
      },
      validationRules: {
        name: [
          (v) => !!v || 'Nome da lista é obrigatório',
          (v) => v.length <= 60 || 'Máximo de 60 caracteres',
        ],
      },
    };
  },

  computed: {
    isMobile() {
      return isMobileDevice(this.$vuetify);
    },
    guestLists() {
      return this.$store.getters['eventGuests/$guestLists'];
    },
    isLoading() {
      return this.$store.getters['eventGuests/$isLoading'];
    },
    isDeleting() {
      return this.$store.getters['eventGuests/$isDeleting'];
    },
    userId() {
      return this.$store.state.auth.user?.id;
    },
  },

  mounted() {
    this.fetchGuestLists();
  },

  methods: {
    formatDateTimeWithTimezone,

    getValidatedCount(list) {
      return list.members?.reduce((acc, member) => acc + (member.guestListMemberValidated?.reduce((acc, validated) => acc + validated.quantity, 0) || 0), 0) || 0;
    },

    getTotalMembers(list) {
      return list.members?.reduce((acc, member) => acc + member.quantity, 0) || 0;
    },

    navigateToMembers(listId) {
      this.$router.push({
        name: 'eventsDetailsGuestlistsMembers',
        params: {
          id: this.$route.params.id,
          listId,
        },
      });
    },

    openGuestListForm() {
      this.isEditing = false;
      this.formData = { name: '' };
      this.showForm = true;
    },

    editGuestList(list) {
      this.isEditing = true;
      this.formData = { ...list };
      this.showForm = true;
    },

    closeForm() {
      this.formData = { name: '' };
      this.isEditing = false;
      if (this.$refs.form) {
        this.$refs.form.resetValidation();
        this.$refs.form.reset();
      }
      this.showForm = false;
    },

    deleteGuestList(list) {
      this.selectedList = list;
      this.showDeleteDialog = true;
    },

    async saveGuestList() {
      if (!this.$refs.form.validate()) return;

      try {
        this.isSaving = true;
        if (this.isEditing) {
          await this.$store.dispatch('eventGuests/fetchUpdateGuestList', {
            id: this.formData.id,
            name: this.formData.name,
          });
          this.$store.dispatch('toast/setToast', {
            text: 'Lista atualizada com sucesso!',
            type: 'success',
          });
        } else {
          await this.$store.dispatch('eventGuests/createGuestList', {
            event_id: this.$route.params.id,
            name: this.formData.name,
            created_by: this.userId,
          });
          this.$store.dispatch('toast/setToast', {
            text: 'Lista criada com sucesso!',
            type: 'success',
          });
        }
        this.closeForm();
        this.fetchGuestLists();
      } catch (error) {
        this.$store.dispatch('toast/setToast', {
          text: `Erro ao ${this.isEditing ? 'atualizar' : 'criar'} lista`,
          type: 'error',
        });
      } finally {
        this.isSaving = false;
      }
    },

    async confirmDelete() {
      if (!this.selectedList) return;

      try {
        await this.$store.dispatch('eventGuests/fetchDeleteGuestList', this.selectedList.id);
        this.$store.dispatch('toast/setToast', {
          text: 'Lista excluída com sucesso!',
          type: 'success',
        });
        this.fetchGuestLists();
      } catch (error) {
        this.$store.dispatch('toast/setToast', {
          text: 'Erro ao excluir lista',
          type: 'error',
        });
      } finally {
        this.showDeleteDialog = false;
        this.selectedList = null;
      }
    },

    async fetchGuestLists() {
      await this.$store.dispatch('eventGuests/fetchGuestListAndPopulateByQuery',
        `where[event_id][v]=${this.$route.params.id}&preloads[]=members:guestListMemberValidated`
      );
    },
  },
};
</script>

<style scoped>
.guest-lists-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.guest-list-card {
  padding: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  background-color: var(--tertiary);
  border-radius: 8px;
}

.guest-list-card:hover {
  border-color: var(--primary);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.guest-list-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.guest-list-name {
  color: var(--primary);
  font-size: 16px;
  font-weight: 700;
  margin-bottom: 4px;
  font-family: var(--font-family-inter-bold);
}

.guest-list-meta {
  font-size: 14px;
  color: var(--grey-dark);
  margin: 0;
}

.guest-list-main {
  flex: 1 1 0% !important;
}

.guest-list-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

.guest-list-counter {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.counter-text {
  font-size: 12px;
  color: var(--grey-dark);
  font-weight: 500;
}

.counter-numbers {
  font-size: 16px;
  font-weight: 600;
  color: var(--black-text);
}

@media (max-width: 600px) {

  .guest-list-name {
    font-size: 16px;
  }

  .guest-list-meta {
    font-size: 12px;
  }

  .guest-list-actions {
    margin-left: 10px;
  }
}
</style>
