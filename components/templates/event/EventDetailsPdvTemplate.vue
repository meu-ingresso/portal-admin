<template>
  <div class="event-details-wrapper">
    <!-- Estado vazio -->
    <template v-if="getPdvs?.length === 0">
      <EmptyState
        title="Ainda não há PDVs"
        subtitle="Uma vez criados, seus PDVs aparecerão aqui"
        icon="mdi-point-of-sale">
        <template #action>
          <DefaultButton
            text="Adicionar PDV"
            icon="mdi-plus"
            class="mt-6"
            @click="openAddPdvModal" />
        </template>
      </EmptyState>
    </template>

    <!-- Lista de PDVs -->
    <template v-else>
      <div class="d-flex justify-space-between align-center mb-4">
        <div>
          <h2 class="text-h5 font-weight-bold">PDVs</h2>
          <p class="text-body-2 text-medium-emphasis">Gerencie os Pontos de Venda para este evento</p>
        </div>
        <DefaultButton
          text="Adicionar PDV"
          icon="mdi-plus"
          @click="openAddPdvModal" />
      </div>

      <!-- Tabela de PDVs -->
      <v-card class="mb-6">
        <v-data-table
          :headers="headers"
          :items="getPdvs"
          :items-per-page="10"
          class="pdv-table"
          :loading="isLoading"
          no-data-text="Nenhum PDV encontrado"
          :footer-props="{
            'items-per-page-options': [5, 10, 15, 20],
            'items-per-page-text': 'PDVs por página',
          }">
          <template #[`item.name`]="{ item }">
            <div class="d-flex align-center">
              <v-icon class="mr-2" small>mdi-point-of-sale</v-icon>
              <span>{{ item.name }}</span>
            </div>
          </template>

          <template #[`item.status`]="{ item }">
            <v-chip
              small
              :color="item.status?.color || 'grey'"
              text-color="white">
              {{ item.status?.name || 'Status não definido' }}
            </v-chip>
          </template>

          <template #[`item.users`]="{ item }">
            <div>
              <template v-if="item.users && item.users.length > 0">
                <div v-for="(user, index) in item.users" :key="user.id" class="mb-1">
                  <span>{{ user.user?.people?.name || 'Usuário não identificado' }}</span>
                  <span v-if="index < item.users.length - 1">, </span>
                </div>
              </template>
              <span v-else class="text-medium-emphasis">Nenhum usuário associado</span>
            </div>
          </template>

          <template #[`item.tickets`]="{ item }">
            <div>
              <template v-if="item.tickets && item.tickets.length > 0">
                <div v-for="(ticket, index) in item.tickets" :key="ticket.id" class="mb-1">
                  <span>{{ ticket.ticket?.name || 'Ingresso não identificado' }}</span>
                  <span v-if="index < item.tickets.length - 1">, </span>
                </div>
              </template>
              <span v-else class="text-medium-emphasis">Nenhum ingresso associado</span>
            </div>
          </template>

          <template #[`item.actions`]="{ item }">
            <v-btn 
              icon 
              small 
              class="mr-2" 
              color="primary"
              @click="openEditPdvModal(item)">
              <v-icon small>mdi-pencil</v-icon>
            </v-btn>
            <v-btn 
              icon 
              small 
              color="error"
              @click="openDeletePdvModal(item)">
              <v-icon small>mdi-delete</v-icon>
            </v-btn>
          </template>
        </v-data-table>
      </v-card>
    </template>

    <!-- Modal para adicionar PDV -->
    <v-dialog v-model="addPdvModal" max-width="600px">
      <v-card>
        <v-card-title class="text-h5">
          Adicionar PDV
        </v-card-title>
        <v-card-text>
          <v-form ref="addPdvForm" v-model="addPdvFormValid" lazy-validation>
            <v-text-field
              v-model="newPdv.name"
              label="Nome do PDV"
              :rules="[v => !!v || 'Nome é obrigatório']"
              required
              outlined
              dense
            ></v-text-field>
            
            <v-autocomplete
              v-model="selectedUsers"
              :items="availableUsers"
              label="Usuários"
              multiple
              chips
              outlined
              dense
              item-text="name"
              item-value="id"
              return-object
            ></v-autocomplete>
            
            <v-autocomplete
              v-model="selectedTickets"
              :items="getTickets"
              label="Ingressos"
              multiple
              chips
              outlined
              dense
              item-text="name"
              item-value="id"
              return-object
            ></v-autocomplete>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="grey darken-1" text @click="closeAddPdvModal">
            Cancelar
          </v-btn>
          <v-btn color="primary" text :loading="isSubmitting" @click="savePdv">
            Salvar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Modal para editar PDV -->
    <v-dialog v-model="editPdvModal" max-width="600px">
      <v-card>
        <v-card-title class="text-h5">
          Editar PDV
        </v-card-title>
        <v-card-text>
          <v-form ref="editPdvForm" v-model="editPdvFormValid" lazy-validation>
            <v-text-field
              v-model="editingPdv.name"
              label="Nome do PDV"
              :rules="[v => !!v || 'Nome é obrigatório']"
              required
              outlined
              dense
            ></v-text-field>

            <v-select
              v-model="editingPdv.status_id"
              :items="availableStatuses"
              label="Status"
              outlined
              dense
              item-text="name"
              item-value="id"
            ></v-select>
            
            <div class="mb-4">
              <div class="d-flex justify-space-between align-center mb-2">
                <div class="text-subtitle-1">Usuários associados</div>
                <v-btn 
                  small
                  text
                  color="primary"
                  @click="openAddUserModal">
                  <v-icon small class="mr-1">mdi-plus</v-icon>
                  Adicionar
                </v-btn>
              </div>
              <v-list v-if="editingPdv.users && editingPdv.users.length > 0" dense>
                <v-list-item v-for="user in editingPdv.users" :key="user.id">
                  <v-list-item-content>
                    <v-list-item-title>{{ user.user?.people?.name || 'Usuário não identificado' }}</v-list-item-title>
                  </v-list-item-content>
                  <v-list-item-action>
                    <v-btn icon x-small @click="removeUserFromPdv(user.id)">
                      <v-icon x-small>mdi-close</v-icon>
                    </v-btn>
                  </v-list-item-action>
                </v-list-item>
              </v-list>
              <div v-else class="text-center py-3 grey lighten-3 rounded">
                <span class="text-medium-emphasis">Nenhum usuário associado</span>
              </div>
            </div>
            
            <div>
              <div class="d-flex justify-space-between align-center mb-2">
                <div class="text-subtitle-1">Ingressos associados</div>
                <v-btn 
                  small
                  text
                  color="primary"
                  @click="openAddTicketModal">
                  <v-icon small class="mr-1">mdi-plus</v-icon>
                  Adicionar
                </v-btn>
              </div>
              <v-list v-if="editingPdv.tickets && editingPdv.tickets.length > 0" dense>
                <v-list-item v-for="ticket in editingPdv.tickets" :key="ticket.id">
                  <v-list-item-content>
                    <v-list-item-title>{{ ticket.ticket?.name || 'Ingresso não identificado' }}</v-list-item-title>
                  </v-list-item-content>
                  <v-list-item-action>
                    <v-btn icon x-small @click="removeTicketFromPdv(ticket.id)">
                      <v-icon x-small>mdi-close</v-icon>
                    </v-btn>
                  </v-list-item-action>
                </v-list-item>
              </v-list>
              <div v-else class="text-center py-3 grey lighten-3 rounded">
                <span class="text-medium-emphasis">Nenhum ingresso associado</span>
              </div>
            </div>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="grey darken-1" text @click="closeEditPdvModal">
            Cancelar
          </v-btn>
          <v-btn color="primary" text :loading="isSubmitting" @click="updatePdv">
            Atualizar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Modal para adicionar usuário a um PDV -->
    <v-dialog v-model="addUserModal" max-width="500px">
      <v-card>
        <v-card-title class="text-h5">
          Adicionar Usuários
        </v-card-title>
        <v-card-text>
          <v-autocomplete
            v-model="userToAdd"
            :items="availableUsers"
            label="Selecione os usuários"
            multiple
            chips
            outlined
            dense
            item-text="name"
            item-value="id"
            return-object
          ></v-autocomplete>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="grey darken-1" text @click="closeAddUserModal">
            Cancelar
          </v-btn>
          <v-btn color="primary" text :loading="isSubmitting" @click="addUsersToPdv">
            Adicionar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Modal para adicionar ingresso a um PDV -->
    <v-dialog v-model="addTicketModal" max-width="500px">
      <v-card>
        <v-card-title class="text-h5">
          Adicionar Ingressos
        </v-card-title>
        <v-card-text>
          <v-autocomplete
            v-model="ticketToAdd"
            :items="getTickets"
            label="Selecione os ingressos"
            multiple
            chips
            outlined
            dense
            item-text="name"
            item-value="id"
            return-object
          ></v-autocomplete>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="grey darken-1" text @click="closeAddTicketModal">
            Cancelar
          </v-btn>
          <v-btn color="primary" text :loading="isSubmitting" @click="addTicketsToPdv">
            Adicionar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Modal para confirmação de exclusão -->
    <ConfirmDialog
      v-model="deleteConfirmDialog"
      title="Excluir PDV"
      :message="`Tem certeza que deseja excluir o PDV '${pdvToDelete?.name}'?`"
      confirm-text="Excluir"
      cancel-text="Cancelar"
      :loading="isDeleting"
      @confirm="deletePdv"
      @cancel="closeDeletePdvModal" />
  </div>
</template>

<script>
import { 
  eventTickets, 
  eventGeneralInfo,
  loading, 
  user,
  status 
} from '@/store';

// Como a store eventPdv foi criada recentemente, precisamos importá-la diretamente
import eventPdv from '@/store/eventPdv';

export default {
  data() {
    return {
      headers: [
        { text: 'Nome', value: 'name', sortable: true },
        { text: 'Status', value: 'status', sortable: false },
        { text: 'Usuários', value: 'users', sortable: false },
        { text: 'Ingressos', value: 'tickets', sortable: false },
        { text: 'Ações', value: 'actions', sortable: false, align: 'right' },
      ],
      addPdvModal: false,
      editPdvModal: false,
      addUserModal: false,
      addTicketModal: false,
      deleteConfirmDialog: false,
      addPdvFormValid: true,
      editPdvFormValid: true,
      isSubmitting: false,
      isDeleting: false,
      newPdv: {
        name: '',
        event_id: '',
        status_id: '',
      },
      editingPdv: {
        id: '',
        name: '',
        status_id: '',
        users: [],
        tickets: [],
      },
      pdvToDelete: null,
      selectedUsers: [],
      selectedTickets: [],
      userToAdd: [],
      ticketToAdd: [],
      availableUsers: [],
      availableStatuses: [],
    };
  },

  computed: {
    isLoading() {
      return eventPdv.$isLoading;
    },

    getPdvs() {
      return eventPdv.$pdvs;
    },

    getEvent() {
      return eventGeneralInfo.$info;
    },

    getTickets() {
      return eventTickets.$tickets;
    },

    eventId() {
      return this.$route.params.id;
    },
  },

  async created() {
    await this.fetchEventPdvs();
    await this.fetchAvailableUsers();
    await this.fetchAvailableStatuses();
  },

  methods: {
    async fetchEventPdvs() {
      loading.setIsLoading(true);
      await eventPdv.fetchAndPopulateByEventId(this.eventId);
      loading.setIsLoading(false);
    },

    async fetchAvailableUsers() {
      try {
        // Buscar todos os usuários/colaboradores disponíveis
        const response = await user.fetchUsers();
        if (response.success) {
          this.availableUsers = response.data.map(u => ({
            id: u.id,
            name: u.people?.name || u.email || 'Usuário sem nome',
            email: u.email
          }));
        }
      } catch (error) {
        console.error('Erro ao buscar usuários:', error);
      }
    },

    async fetchAvailableStatuses() {
      try {
        // Buscar status disponíveis para PDV
        const response = await status.fetchStatusByModule('pdv');
        if (response && response.success) {
          this.availableStatuses = response.data;
        }
      } catch (error) {
        console.error('Erro ao buscar status:', error);
      }
    },

    openAddPdvModal() {
      this.newPdv = {
        name: '',
        event_id: this.eventId,
        status_id: eventPdv.$statusDefault?.id || '',
      };
      this.selectedUsers = [];
      this.selectedTickets = [];
      this.addPdvModal = true;
    },

    closeAddPdvModal() {
      this.addPdvModal = false;
      this.$nextTick(() => {
        if (this.$refs.addPdvForm) {
          this.$refs.addPdvForm.reset();
        }
      });
    },

    openEditPdvModal(pdv) {
      this.editingPdv = {
        id: pdv.id,
        name: pdv.name,
        status_id: pdv.status_id,
        users: [...(pdv.users || [])],
        tickets: [...(pdv.tickets || [])],
      };
      this.editPdvModal = true;
    },

    closeEditPdvModal() {
      this.editPdvModal = false;
      this.$nextTick(() => {
        if (this.$refs.editPdvForm) {
          this.$refs.editPdvForm.reset();
        }
      });
    },

    openAddUserModal() {
      this.userToAdd = [];
      this.addUserModal = true;
    },

    closeAddUserModal() {
      this.addUserModal = false;
      this.userToAdd = [];
    },

    openAddTicketModal() {
      this.ticketToAdd = [];
      this.addTicketModal = true;
    },

    closeAddTicketModal() {
      this.addTicketModal = false;
      this.ticketToAdd = [];
    },

    openDeletePdvModal(pdv) {
      this.pdvToDelete = pdv;
      this.deleteConfirmDialog = true;
    },

    closeDeletePdvModal() {
      this.deleteConfirmDialog = false;
      this.pdvToDelete = null;
    },

    async savePdv() {
      if (!this.$refs.addPdvForm.validate()) return;

      try {
        this.isSubmitting = true;

        // Cria o PDV
        const response = await eventPdv.createPdv(this.newPdv);

        if (!response.success) {
          throw new Error('Erro ao criar PDV');
        }

        const newPdvId = response.data.id;

        // Associa usuários se houver
        if (this.selectedUsers.length > 0) {
          const userIds = this.selectedUsers.map(user => user.id);
          await eventPdv.associateUsers({
            pdvId: newPdvId,
            userIds
          });
        }

        // Associa ingressos se houver
        if (this.selectedTickets.length > 0) {
          const ticketIds = this.selectedTickets.map(ticket => ticket.id);
          await eventPdv.associateTickets({
            pdvId: newPdvId,
            ticketIds
          });
        }

        this.$toast.success('PDV criado com sucesso');
        this.closeAddPdvModal();
        await this.fetchEventPdvs();
      } catch (error) {
        console.error('Erro ao salvar PDV:', error);
        this.$toast.error('Erro ao criar PDV. Tente novamente.');
      } finally {
        this.isSubmitting = false;
      }
    },

    async updatePdv() {
      if (!this.$refs.editPdvForm.validate()) return;

      try {
        this.isSubmitting = true;

        const updateData = {
          id: this.editingPdv.id,
          data: {
            name: this.editingPdv.name,
            status_id: this.editingPdv.status_id
          }
        };

        const response = await eventPdv.updatePdv(updateData);

        if (!response.success) {
          throw new Error('Erro ao atualizar PDV');
        }

        this.$toast.success('PDV atualizado com sucesso');
        this.closeEditPdvModal();
        await this.fetchEventPdvs();
      } catch (error) {
        console.error('Erro ao atualizar PDV:', error);
        this.$toast.error('Erro ao atualizar PDV. Tente novamente.');
      } finally {
        this.isSubmitting = false;
      }
    },

    async deletePdv() {
      if (!this.pdvToDelete || !this.pdvToDelete.id) return;

      try {
        this.isDeleting = true;

        const response = await eventPdv.deletePdv(this.pdvToDelete.id);

        if (!response.success) {
          throw new Error('Erro ao excluir PDV');
        }

        this.$toast.success('PDV excluído com sucesso');
        this.closeDeletePdvModal();
      } catch (error) {
        console.error('Erro ao excluir PDV:', error);
        this.$toast.error('Erro ao excluir PDV. Tente novamente.');
      } finally {
        this.isDeleting = false;
      }
    },

    async addUsersToPdv() {
      if (!this.editingPdv.id || !this.userToAdd.length) return;

      try {
        this.isSubmitting = true;

        const userIds = this.userToAdd.map(user => user.id);
        
        const response = await eventPdv.associateUsers({
          pdvId: this.editingPdv.id,
          userIds
        });

        if (!response.success) {
          throw new Error('Erro ao adicionar usuários');
        }

        // Atualiza a lista de PDVs
        await this.fetchEventPdvs();
        
        // Atualiza os dados do PDV em edição
        const updatedPdv = eventPdv.$pdvs.find(p => p.id === this.editingPdv.id);
        if (updatedPdv) {
          this.editingPdv.users = updatedPdv.users || [];
        }

        this.$toast.success('Usuários adicionados com sucesso');
        this.closeAddUserModal();
      } catch (error) {
        console.error('Erro ao adicionar usuários:', error);
        this.$toast.error('Erro ao adicionar usuários. Tente novamente.');
      } finally {
        this.isSubmitting = false;
      }
    },

    async addTicketsToPdv() {
      if (!this.editingPdv.id || !this.ticketToAdd.length) return;

      try {
        this.isSubmitting = true;

        const ticketIds = this.ticketToAdd.map(ticket => ticket.id);
        
        const response = await eventPdv.associateTickets({
          pdvId: this.editingPdv.id,
          ticketIds
        });

        if (!response.success) {
          throw new Error('Erro ao adicionar ingressos');
        }

        // Atualiza a lista de PDVs
        await this.fetchEventPdvs();
        
        // Atualiza os dados do PDV em edição
        const updatedPdv = eventPdv.$pdvs.find(p => p.id === this.editingPdv.id);
        if (updatedPdv) {
          this.editingPdv.tickets = updatedPdv.tickets || [];
        }

        this.$toast.success('Ingressos adicionados com sucesso');
        this.closeAddTicketModal();
      } catch (error) {
        console.error('Erro ao adicionar ingressos:', error);
        this.$toast.error('Erro ao adicionar ingressos. Tente novamente.');
      } finally {
        this.isSubmitting = false;
      }
    },

    async removeUserFromPdv(pdvUserId) {
      try {
        this.isSubmitting = true;

        const response = await eventPdv.removeUserAssociation(pdvUserId);

        if (!response.success) {
          throw new Error('Erro ao remover usuário');
        }

        // Atualiza a lista de PDVs
        await this.fetchEventPdvs();
        
        // Atualiza os dados do PDV em edição
        const updatedPdv = eventPdv.$pdvs.find(p => p.id === this.editingPdv.id);
        if (updatedPdv) {
          this.editingPdv.users = updatedPdv.users || [];
        }

        this.$toast.success('Usuário removido com sucesso');
      } catch (error) {
        console.error('Erro ao remover usuário:', error);
        this.$toast.error('Erro ao remover usuário. Tente novamente.');
      } finally {
        this.isSubmitting = false;
      }
    },

    async removeTicketFromPdv(pdvTicketId) {
      try {
        this.isSubmitting = true;

        const response = await eventPdv.removeTicketAssociation(pdvTicketId);

        if (!response.success) {
          throw new Error('Erro ao remover ingresso');
        }

        // Atualiza a lista de PDVs
        await this.fetchEventPdvs();
        
        // Atualiza os dados do PDV em edição
        const updatedPdv = eventPdv.$pdvs.find(p => p.id === this.editingPdv.id);
        if (updatedPdv) {
          this.editingPdv.tickets = updatedPdv.tickets || [];
        }

        this.$toast.success('Ingresso removido com sucesso');
      } catch (error) {
        console.error('Erro ao remover ingresso:', error);
        this.$toast.error('Erro ao remover ingresso. Tente novamente.');
      } finally {
        this.isSubmitting = false;
      }
    }
  }
};
</script>

<style scoped>
.event-details-wrapper {
  margin-top: 16px;
}

.pdv-table :deep(th) {
  font-weight: bold !important;
}
</style> 