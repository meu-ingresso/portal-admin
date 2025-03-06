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
            text="Adicionar"
            icon="mdi-plus"
            class="mt-6"
            @click="openAddPdvModal" />
        </template>
      </EmptyState>
    </template>

    <!-- Lista de PDVs -->
    <template v-else>
      <div class="d-flex justify-space-between align-center mb-4">
        <div class="pdv-list-title">
          PDVs
        </div>
        <DefaultButton
          text="Adicionar"
          icon="mdi-plus"
          @click="openAddPdvModal" />
      </div>

      <!-- Tabela de PDVs -->
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
        }"
        @click:row="(item) => openEditPdvModal(item)">

        <template #[`item.status`]="{ item }">
          <span>{{ item.status?.name || 'Status não definido' }}</span>
        </template>

        <template #[`item.users`]="{ item }">
          <div>
            <template v-if="item.users && item.users.length > 0">
              <div v-for="(user, index) in item.users" :key="user.id" class="mb-1">
                <span>{{ user.user?.people?.first_name || 'Usuário não identificado' }}</span>
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
          <v-tooltip bottom>
            <template #activator="{ on }">
              <v-btn 
                icon 
                color="error"
                @click="openDeletePdvModal(item)"
                v-on="on">
                <v-icon>mdi-delete</v-icon>
              </v-btn>
            </template>
            Excluir PDV
          </v-tooltip>
        </template>
      </v-data-table>
    </template>

    <!-- Modal para adicionar PDV -->
    <v-dialog v-model="addPdvModal" max-width="600px" :fullscreen="isMobile">
      <v-card>
        <v-card-title class="d-flex justify-space-between align-center">
          <h3 class="modalTitle">Adicionar PDV</h3>
          <v-btn icon @click="closeAddPdvModal">
            <v-icon>mdi-close</v-icon>
          </v-btn>
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
         <v-card-actions class="d-flex align-center justify-space-between py-4 px-4">
          <DefaultButton
            text="Cancelar"
            outlined
            @click="closeAddPdvModal"
          />
          <DefaultButton
            text="Salvar"
            color="primary"
            :loading="isSubmitting"
            @click="savePdv"
          />
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Modal para editar PDV -->
    <v-dialog v-model="editPdvModal" max-width="600px">
      <v-card>
        <v-card-title class="d-flex justify-space-between align-center">
          <h3 class="modalTitle">Editar PDV</h3>
          <v-btn icon @click="closeEditPdvModal">
            <v-icon>mdi-close</v-icon>
          </v-btn>
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
                    <v-list-item-title>{{ user.user?.people?.first_name + ' ' + user.user?.people?.last_name || 'Usuário não identificado' }}</v-list-item-title>
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
        <v-card-actions class="d-flex align-center justify-space-between py-4 px-4">
          <DefaultButton
            text="Cancelar"
            outlined
            @click="closeEditPdvModal"
          />
          <DefaultButton
            text="Atualizar"
            color="primary"
            :loading="isSubmitting"
            @click="updatePdv"
          />
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
         <v-card-actions class="d-flex align-center justify-space-between py-4 px-4">
          <DefaultButton
            text="Cancelar"
            outlined
            @click="closeAddUserModal"
          />
          <DefaultButton
            text="Adicionar"
            color="primary"
            :loading="isSubmitting"
            @click="addUsersToPdv"
          />
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
        <v-card-actions class="d-flex align-center justify-space-between py-4 px-4">
          <DefaultButton
            text="Cancelar"
            outlined
            @click="closeAddTicketModal"
          />
          <DefaultButton
            text="Adicionar"
            color="primary"
            :loading="isSubmitting"
            @click="addTicketsToPdv"
          />
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
import { isMobileDevice } from '@/utils/utils';
import { 
  eventTickets, 
  eventGeneralInfo,
  eventPdv,
  user,
} from '@/store';


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
      availableStatuses: [],
    };
  },

  computed: {
    isLoading() {
      return eventPdv.$isLoading;
    },

    isMobile() {
      return isMobileDevice(this.$vuetify);
    },

    availableUsers() {
      return user.$userList.map(user => ({
        id: user.id,
        name: user.people?.first_name + ' ' + user.people?.last_name || user.email || 'Usuário sem nome',
        email: user.email
      }));
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

  methods: {
    async fetchEventPdvs() {
      await eventPdv.fetchAndPopulateByEventId(this.eventId);
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
          data: {
            id: this.editingPdv.id,
            name: this.editingPdv.name,
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
.pdv-list-title{
  font-weight: 600;
  font-size: 26px;
  color: var(--black-text);
  font-family: var(--font-family-inter-bold);
}

.pdv-table :deep(th) {
  font-weight: bold !important;
}

.pdv-table :deep(td) {
  cursor: pointer;
}
</style> 