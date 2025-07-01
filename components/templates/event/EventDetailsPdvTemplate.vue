<template>
  <div class="event-details-wrapper">
    <!-- Estado vazio -->
    <template v-if="getPdvs?.length === 0">
      <EmptyState
title="Ainda não há PDVs" subtitle="Uma vez criados, seus PDVs aparecerão aqui"
        icon="mdi-point-of-sale">
        <template #action>
          <DefaultButton text="Adicionar" icon="mdi-plus" class="mt-6" @click="openAddPdvModal" />
        </template>
      </EmptyState>
    </template>

    <!-- Lista de PDVs -->
    <template v-else>
      <div class="d-flex justify-space-between align-center mb-4">
        <div class="template-title">
          PDVs
        </div>
        <DefaultButton text="Adicionar" icon="mdi-plus" @click="openAddPdvModal" />
      </div>

      <!-- Tabela de PDVs -->
      <v-data-table
:headers="headers" :items="getPdvs" :items-per-page="10" class="pdv-table" :loading="isLoading"
        no-data-text="Nenhum PDV encontrado" :footer-props="{
          'items-per-page-options': [5, 10, 15, 20],
          'items-per-page-text': 'PDVs por página',
        }" @click:row="(item) => openEditPdvModal(item)">

        <template #[`item.status`]="{ item }">
          <span>{{ item.status?.name || 'Status não definido' }}</span>
        </template>

        <template #[`item.users`]="{ item }">
          <template v-if="item.users && item.users.length > 0">
            <v-menu offset-y>
              <template #activator="{ on, attrs }">
                <div class="menu-activator" v-bind="attrs" v-on="on">
                  <span>{{ item.users.length }} usuário{{ item.users.length > 1 ? 's' : '' }}</span>
                  <v-icon small>mdi-chevron-down</v-icon>
                </div>
              </template>
              <v-card class="menu-popup pa-4" max-width="300">
                <div class="menu-header mb-2">Usuários associados:</div>
                <div class="menu-list">
                  <div v-for="user in item.users" :key="user.id" class="menu-item">
                    <v-icon small class="mr-1">mdi-account</v-icon>
                    {{ user.user?.people?.first_name || 'Usuário não identificado' }}
                    {{ user.user?.people?.last_name || '' }}
                  </div>
                </div>
              </v-card>
            </v-menu>
          </template>
          <template v-else>
            <span class="text-medium-emphasis">Nenhum usuário associado</span>
          </template>
        </template>

        <template #[`item.tickets`]="{ item }">
          <template v-if="item.tickets && item.tickets.length > 0">
            <v-menu offset-y>
              <template #activator="{ on, attrs }">
                <div class="menu-activator" v-bind="attrs" v-on="on">
                  <span>{{ item.tickets.length }} ingresso{{ item.tickets.length > 1 ? 's' : '' }}</span>
                  <v-icon small>mdi-chevron-down</v-icon>
                </div>
              </template>
              <v-card class="menu-popup pa-4" max-width="300">
                <div class="menu-header mb-2">Ingressos associados:</div>
                <div class="menu-list">
                  <div v-for="ticket in item.tickets" :key="ticket.id" class="menu-item">
                    <v-icon small class="mr-1">mdi-ticket</v-icon>
                    {{ ticket.ticket?.name || 'Ingresso não identificado' }}
                  </div>
                </div>
              </v-card>
            </v-menu>
          </template>
          <template v-else>
            <span class="text-medium-emphasis">Nenhum ingresso associado</span>
          </template>
        </template>

        <template #[`item.actions`]="{ item }">
          <div class="d-flex justify-center">
            <v-tooltip bottom>
              <template #activator="{ on }">
                <v-btn
icon color="primary" class="mr-2" :loading="item.isLoading" @click.stop="togglePdvStatus(item)"
                  v-on="on">
                  <v-icon>{{ getPdvStatusIcon(item) }}</v-icon>
                </v-btn>
              </template>
              {{ getPdvStatusTooltip(item) }}
            </v-tooltip>

            <v-tooltip bottom>
              <template #activator="{ on }">
                <v-btn icon color="error" @click.stop="openDeletePdvModal(item)" v-on="on">
                  <v-icon>mdi-delete</v-icon>
                </v-btn>
              </template>
              Excluir PDV
            </v-tooltip>
          </div>
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
v-model="newPdv.name" label="Nome do PDV" :rules="[v => !!v || 'Nome é obrigatório']" required
              outlined dense></v-text-field>

            <AdvancedAutocomplete
v-model="selectedUsers" :items="availableUsers"
              :disabled-tooltip-text="`Este usuário já está associado a outro PDV`" label="Usuários (opcional)"
              item-text="name" item-value="id" item-subtitle="email" more-label="usuários" />

            <AdvancedAutocomplete
v-model="selectedTickets" :items="getTickets" label="Ingressos (opcional)"
              item-text="name" item-value="id" more-label="ingressos" />
          </v-form>
        </v-card-text>
        <v-card-actions class="d-flex align-center justify-space-between py-4 px-4">
          <DefaultButton text="Cancelar" outlined @click="closeAddPdvModal" />
          <DefaultButton text="Salvar" color="primary" :loading="isSubmitting" @click="savePdv" />
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Modal para editar PDV -->
    <v-dialog v-model="editPdvModal" max-width="600px">
      <v-card>
        <v-card-title class="d-flex justify-space-between align-center mb-4">
          <h3 class="modalTitle">Editar PDV</h3>
          <v-btn icon @click="closeEditPdvModal">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        <v-card-text>
          <v-form ref="editPdvForm" v-model="editPdvFormValid" lazy-validation>
            <v-row>
              <v-col cols="12" md="12">
                <v-text-field
v-model="editingPdv.name" label="Nome do PDV" :rules="[v => !!v || 'Nome é obrigatório']"
                  required outlined dense />
              </v-col>

              <v-col cols="12" md="12">
                <AdvancedAutocomplete
v-model="editUserSelection" :items="availableUsers"
                  :disabled-tooltip-text="`Este usuário já está associado a outro PDV`" label="Usuários associados"
                  item-text="name" item-value="id" item-subtitle="email" more-label="usuários" />
              </v-col>

              <v-col cols="12" md="12">
                <AdvancedAutocomplete
v-model="editTicketSelection" :items="getTickets" label="Ingressos associados"
                  item-text="name" item-value="id" more-label="ingressos" />
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
        <v-card-actions class="d-flex align-center justify-space-between py-4 px-4">
          <DefaultButton text="Cancelar" outlined @click="closeEditPdvModal" />
          <DefaultButton text="Atualizar" color="primary" :loading="isSubmitting" @click="updatePdv" />
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
          <AdvancedAutocomplete
v-model="userToAdd" :items="availableUsers"
            :disabled-tooltip-text="`Este usuário já está associado a outro PDV`" label="Selecione os usuários"
            item-text="name" item-value="id" item-subtitle="email" more-label="usuários" />
        </v-card-text>
        <v-card-actions class="d-flex align-center justify-space-between py-4 px-4">
          <DefaultButton text="Cancelar" outlined @click="closeAddUserModal" />
          <DefaultButton text="Adicionar" color="primary" :loading="isSubmitting" @click="addUsersToPdv" />
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
          <AdvancedAutocomplete
v-model="ticketToAdd" :items="getTickets" label="Selecione os ingressos"
            item-text="name" item-value="id" more-label="ingressos" />
        </v-card-text>
        <v-card-actions class="d-flex align-center justify-space-between py-4 px-4">
          <DefaultButton text="Cancelar" outlined @click="closeAddTicketModal" />
          <DefaultButton text="Adicionar" color="primary" :loading="isSubmitting" @click="addTicketsToPdv" />
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Modal para confirmação de exclusão -->
    <ConfirmDialog
v-model="deleteConfirmDialog" title="Excluir PDV"
      :message="`Tem certeza que deseja excluir o PDV '${pdvToDelete?.name}'?`" confirm-text="Excluir"
      cancel-text="Cancelar" :loading="isDeleting" @confirm="deletePdv" @cancel="closeDeletePdvModal" />
  </div>
</template>

<script>
import { isMobileDevice } from '@/utils/utils';
import { PDV_ROLE, ADMIN_ROLE, MANAGER_ROLE } from '@/utils/permissions-config';

export default {

  data() {
    return {
      headers: [
        { text: 'Nome', value: 'name', sortable: true },
        { text: 'Status', value: 'status', sortable: false },
        { text: 'Usuários', value: 'users', sortable: false },
        { text: 'Ingressos', value: 'tickets', sortable: false },
        { text: 'Ações', value: 'actions', sortable: false, align: 'center' },
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
        originalName: '',
        status_id: '',
        users: [],
        tickets: [],
      },
      pdvToDelete: null,
      selectedUsers: [],
      selectedTickets: [],
      userToAdd: [],
      ticketToAdd: [],
      editUserSelection: [],
      editTicketSelection: [],
      availableStatuses: [],
      statusAvailable: null,
      statusClosed: null,
    };
  }, computed: {
    isLoading() {
      return this.$store.getters['eventPdv/$isLoading'];
    },

    isMobile() {
      return isMobileDevice(this.$vuetify);
    },

    availableUsers() {
      // Apenas usuários admin e gerente e colaboradores do evento com permissão de PDV
      const adminAndGerenteUsers = this.$store.getters['user/$userList'].filter(user => user?.role?.name === ADMIN_ROLE || user?.role?.name === MANAGER_ROLE);

      const collaboratorsWithPdvPermission = this.$store.getters['eventCollaborators/$collaborators'].filter(
        collaborator => collaborator?.role?.name === PDV_ROLE ||
          collaborator?.role?.name === ADMIN_ROLE ||
          collaborator?.role?.name === MANAGER_ROLE
      );

      // Remover duplicatas
      const uniqueCollaborators = collaboratorsWithPdvPermission.filter(collaborator => !adminAndGerenteUsers.some(admin => admin.id === collaborator.user_id));

      const usersWithPdvPermission = [...adminAndGerenteUsers, ...uniqueCollaborators.map(collaborator => collaborator.user)];

      const mappedUsers = usersWithPdvPermission.map(user => ({
        id: user.id,
        name: user.people?.first_name + ' ' + user.people?.last_name || user.email || 'Usuário sem nome',
        email: user.email,
        _disabled: this.$store.getters['eventPdv/$pdvs'].some(pdv => pdv?.users?.some(u => u.user_id === user.id && u.pdv_id !== this.editingPdv?.id))
      }));

      return mappedUsers;
    },

    getPdvs() {
      return this.$store.getters['eventPdv/$pdvs'];
    },

    getEvent() {
      return this.$store.getters['eventGeneralInfo/$info'];
    },

    getTickets() {
      return this.$store.getters['eventTickets/$tickets'];
    },

    eventId() {
      return this.$route.params.id;
    },
  },

  watch: {
    editPdvModal(isOpen) {
      if (isOpen && this.editingPdv) {
        this.populateEditSelections();
      }
    }
  },

  async created() {
    await this.fetchInitialData();
    await this.fetchAndSetupStatuses();
  },

  methods: {
    async fetchInitialData() {
      try {
        await this.$store.dispatch('eventPdv/fetchAndPopulateByEventId', this.eventId);
        if (!this.$store.getters['user/$userList'].length) {
          await this.$store.dispatch('user/fetchUsers');
        }
        if (!this.$store.getters['eventTickets/$tickets'].length) {
          await this.$store.dispatch('eventTickets/fetchByEventId', this.eventId);
        }
      } catch (error) {
        console.error('Erro ao carregar dados iniciais:', error);
        this.$store.dispatch('toast/setToast', {
          text: 'Erro ao carregar dados iniciais:',
          type: 'error',
          time: 5000,
        });
      }
    },

    async fetchAndSetupStatuses() {
      try {
        if (this.$store.getters['eventPdv/$statuses'] && this.$store.getters['eventPdv/$statuses'].length > 0) {
          this.availableStatuses = this.$store.getters['eventPdv/$statuses'];

          const availableStatus = this.availableStatuses.find(s =>
            s.name.toLowerCase() === 'disponível' ||
            s.name.toLowerCase() === 'disponivel');

          const closedStatus = this.availableStatuses.find(s =>
            s.name.toLowerCase() === 'fechado');

          if (availableStatus) {
            this.statusAvailable = availableStatus.id;
          }

          if (closedStatus) {
            this.statusClosed = closedStatus.id;
          }
        } else {
          const statuses = await this.$store.dispatch('eventPdv/fetchStatuses');
          this.availableStatuses = statuses;

          const availableStatus = this.availableStatuses.find(s =>
            s.name.toLowerCase() === 'disponível' ||
            s.name.toLowerCase() === 'disponivel');

          const closedStatus = this.availableStatuses.find(s =>
            s.name.toLowerCase() === 'fechado');

          if (availableStatus) {
            this.statusAvailable = availableStatus.id;
          }

          if (closedStatus) {
            this.statusClosed = closedStatus.id;
          }
        }
      } catch (error) {
        console.error('Erro ao carregar status de PDV:', error);
      }
    },

    async fetchEventPdvs() {
      await this.$store.dispatch('eventPdv/fetchAndPopulateByEventId', this.eventId);
    },

    openAddPdvModal() {
      this.newPdv = {
        name: '',
        event_id: this.eventId,
        status_id: this.$store.getters['eventPdv/$statusDefault']?.id || '',
      };
      this.selectedUsers = [];
      this.selectedTickets = [];
      this.addPdvModal = true;

      this.$nextTick(() => {
        if (!Array.isArray(this.selectedUsers)) this.selectedUsers = [];
        if (!Array.isArray(this.selectedTickets)) this.selectedTickets = [];
      });
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
        originalName: pdv.name,
        status_id: pdv.status_id,
        users: [...(pdv.users || [])],
        tickets: [...(pdv.tickets || [])],
      };
      this.editPdvModal = true;
    },

    populateEditSelections() {
      if (!this.editingPdv || !this.editingPdv.id) return;

      this.editUserSelection = this.editingPdv.users
        .filter(u => u.user && u.user.id)
        .map(u => {
          const userData = this.availableUsers.find(au => au.id === u.user.id);
          if (userData) return userData;

          return {
            id: u.user.id,
            name: u.user.people?.first_name + ' ' + (u.user.people?.last_name || '') || u.user.email || 'Usuário sem nome',
            email: u.user.email
          };
        });

      this.editTicketSelection = this.editingPdv.tickets
        .filter(t => t.ticket && t.ticket.id)
        .map(t => {
          const ticketData = this.getTickets.find(gt => gt.id === t.ticket.id);
          if (ticketData) return ticketData;

          return {
            id: t.ticket.id,
            name: t.ticket.name || 'Ingresso sem nome'
          };
        });
    },

    closeEditPdvModal() {
      this.editPdvModal = false;
      this.editUserSelection = [];
      this.editTicketSelection = [];
      this.$nextTick(() => {
        if (this.$refs.editPdvForm) {
          this.$refs.editPdvForm.reset();
        }
      });
      this.clearEditingPdv();
    },

    clearEditingPdv() {
      this.editingPdv = {
        id: '',
        name: '',
        originalName: '',
        status_id: '',
        users: [],
        tickets: [],
      };
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

        if (!this.newPdv.name || !this.newPdv.event_id) {
          throw new Error('Nome do PDV e evento são obrigatórios');
        }

        const response = await this.$store.dispatch('eventPdv/createPdv', this.newPdv);

        if (!response.success) {
          throw new Error('Erro ao criar PDV');
        }

        const newPdvId = response.data.id;

        if (this.selectedUsers && this.selectedUsers.length > 0) {
          try {
            const userIds = this.selectedUsers.map(user => user.id);
            await this.$store.dispatch('eventPdv/associateUsers', {
              pdvId: newPdvId,
              userIds
            });
          } catch (userError) {
            console.error('Erro ao associar usuários, mas o PDV foi criado:', userError);
          }
        }

        if (this.selectedTickets && this.selectedTickets.length > 0) {
          try {
            const ticketIds = this.selectedTickets.map(ticket => ticket.id);
            await this.$store.dispatch('eventPdv/associateTickets', {
              pdvId: newPdvId,
              ticketIds
            });
          } catch (ticketError) {
            console.error('Erro ao associar ingressos, mas o PDV foi criado:', ticketError);
          }
        }

        this.$store.dispatch('toast/setToast', {
          text: 'PDV criado com sucesso',
          type: 'success',
          time: 5000,
        });
        this.closeAddPdvModal();
        await this.fetchEventPdvs();
      } catch (error) {
        console.error('Erro ao salvar PDV:', error);
        this.$store.dispatch('toast/setToast', {
          text: 'Erro ao criar PDV. Tente novamente.',
          type: 'error',
          time: 5000,
        });
      } finally {
        this.isSubmitting = false;
      }
    },

    async updatePdv() {
      if (!this.$refs.editPdvForm.validate()) return;

      try {
        this.isSubmitting = true;

        const updatePromises = [];

        if (this.editingPdv.name !== this.editingPdv.originalName) {
          const updateData = {
            data: {
              id: this.editingPdv.id,
              name: this.editingPdv.name,
            }
          };

          const response = await this.$store.dispatch('eventPdv/updatePdv', updateData);

          if (!response.success) {
            throw new Error('Erro ao atualizar nome do PDV');
          }
        }

        const currentUserIds = this.editingPdv.users
          .filter(u => u.user && u.user.id)
          .map(u => u.user.id);

        const selectedUserIds = this.editUserSelection.map(u => u.id);

        const usersToRemove = this.editingPdv.users.filter(
          u => u.user && u.user.id && !selectedUserIds.includes(u.user.id)
        );

        const userIdsToAdd = this.editUserSelection
          .filter(u => !currentUserIds.includes(u.id))
          .map(u => u.id);

        usersToRemove.forEach(userAssoc => {
          updatePromises.push(this.$store.dispatch('eventPdv/removeUserAssociation', userAssoc.id));
        });

        if (userIdsToAdd.length > 0) {
          updatePromises.push(this.$store.dispatch('eventPdv/associateUsers', {
            pdvId: this.editingPdv.id,
            userIds: userIdsToAdd
          }));
        }

        const currentTicketIds = this.editingPdv.tickets
          .filter(t => t.ticket && t.ticket.id)
          .map(t => t.ticket.id);

        const selectedTicketIds = this.editTicketSelection.map(t => t.id);

        const ticketsToRemove = this.editingPdv.tickets.filter(
          t => t.ticket && t.ticket.id && !selectedTicketIds.includes(t.ticket.id)
        );

        const ticketIdsToAdd = this.editTicketSelection
          .filter(t => !currentTicketIds.includes(t.id))
          .map(t => t.id);

        ticketsToRemove.forEach(ticketAssoc => {
          updatePromises.push(this.$store.dispatch('eventPdv/removeTicketAssociation', ticketAssoc.id));
        });

        if (ticketIdsToAdd.length > 0) {
          updatePromises.push(this.$store.dispatch('eventPdv/associateTickets', {
            pdvId: this.editingPdv.id,
            ticketIds: ticketIdsToAdd
          }));
        }

        if (updatePromises.length > 0) {
          await Promise.all(updatePromises);
        }

        this.$store.dispatch('toast/setToast', {
          text: 'PDV atualizado com sucesso',
          type: 'success',
          time: 5000,
        });
        this.closeEditPdvModal();
        await this.fetchEventPdvs();
      } catch (error) {
        console.error('Erro ao atualizar PDV:', error);
        this.$store.dispatch('toast/setToast', {
          text: 'Erro ao atualizar PDV. Tente novamente.',
          type: 'error',
          time: 5000,
        });
      } finally {
        this.isSubmitting = false;
      }
    },

    async deletePdv() {
      if (!this.pdvToDelete || !this.pdvToDelete.id) return;

      try {
        this.isDeleting = true;

        const response = await this.$store.dispatch('eventPdv/deletePdv', this.pdvToDelete.id);

        if (!response.success) {
          throw new Error('Erro ao excluir PDV');
        }

        this.$store.dispatch('toast/setToast', {
          text: 'PDV excluído com sucesso',
          type: 'success',
          time: 5000,
        });
        this.closeDeletePdvModal();
      } catch (error) {
        console.error('Erro ao excluir PDV:', error);
        this.$store.dispatch('toast/setToast', {
          text: 'Erro ao excluir PDV. Tente novamente.',
          type: 'error',
          time: 5000,
        });
      } finally {
        this.isDeleting = false;
      }
    },

    async addUsersToPdv() {
      if (!this.editingPdv.id || !this.userToAdd.length) return;

      try {
        this.isSubmitting = true;

        const userIds = this.userToAdd.map(user => user.id);

        const response = await this.$store.dispatch('eventPdv/associateUsers', {
          pdvId: this.editingPdv.id,
          userIds
        });

        if (!response.success) {
          throw new Error('Erro ao adicionar usuários');
        }

        await this.fetchEventPdvs();

        const updatedPdv = this.$store.getters['eventPdv/$pdvs'].find(p => p.id === this.editingPdv.id);
        if (updatedPdv) {
          this.editingPdv.users = updatedPdv.users || [];
          this.populateEditSelections();
        }

        this.$store.dispatch('toast/setToast', {
          text: 'Usuários adicionados com sucesso',
          type: 'success',
          time: 5000,
        });
        this.closeAddUserModal();
      } catch (error) {
        console.error('Erro ao adicionar usuários:', error);
        this.$store.dispatch('toast/setToast', {
          text: 'Erro ao adicionar usuários. Tente novamente.',
          type: 'error',
          time: 5000,
        });
      } finally {
        this.isSubmitting = false;
      }
    },

    async addTicketsToPdv() {
      if (!this.editingPdv.id || !this.ticketToAdd.length) return;

      try {
        this.isSubmitting = true;

        const ticketIds = this.ticketToAdd.map(ticket => ticket.id);

        const response = await this.$store.dispatch('eventPdv/associateTickets', {
          pdvId: this.editingPdv.id,
          ticketIds
        });

        if (!response.success) {
          throw new Error('Erro ao adicionar ingressos');
        }

        await this.fetchEventPdvs();

        const updatedPdv = this.$store.getters['eventPdv/$pdvs'].find(p => p.id === this.editingPdv.id);
        if (updatedPdv) {
          this.editingPdv.tickets = updatedPdv.tickets || [];
          this.populateEditSelections();
        }

        this.$store.dispatch('toast/setToast', {
          text: 'Ingressos adicionados com sucesso',
          type: 'success',
          time: 5000,
        });
        this.closeAddTicketModal();
      } catch (error) {
        console.error('Erro ao adicionar ingressos:', error);
        this.$store.dispatch('toast/setToast', {
          text: 'Erro ao adicionar ingressos. Tente novamente.',
          type: 'error',
          time: 5000,
        });
      } finally {
        this.isSubmitting = false;
      }
    },

    async removeUserFromPdv(pdvUserId) {
      try {
        this.isSubmitting = true;

        const response = await this.$store.dispatch('eventPdv/removeUserAssociation', pdvUserId);

        if (!response.success) {
          throw new Error('Erro ao remover usuário');
        }

        await this.fetchEventPdvs();

        const updatedPdv = this.$store.getters['eventPdv/$pdvs'].find(p => p.id === this.editingPdv.id);
        if (updatedPdv) {
          this.editingPdv.users = updatedPdv.users || [];
          this.populateEditSelections();
        }

        this.$store.dispatch('toast/setToast', {
          text: 'Usuário removido com sucesso',
          type: 'success',
          time: 5000,
        });
      } catch (error) {
        console.error('Erro ao remover usuário:', error);
        this.$store.dispatch('toast/setToast', {
          text: 'Erro ao remover usuário. Tente novamente.',
          type: 'error',
          time: 5000,
        });
      } finally {
        this.isSubmitting = false;
      }
    },

    async removeTicketFromPdv(pdvTicketId) {
      try {
        this.isSubmitting = true;

        const response = await this.$store.dispatch('eventPdv/removeTicketAssociation', pdvTicketId);

        if (!response.success) {
          throw new Error('Erro ao remover ingresso');
        }

        await this.fetchEventPdvs();

        const updatedPdv = this.$store.getters['eventPdv/$pdvs'].find(p => p.id === this.editingPdv.id);
        if (updatedPdv) {
          this.editingPdv.tickets = updatedPdv.tickets || [];
          this.populateEditSelections();
        }

        this.$store.dispatch('toast/setToast', {
          text: 'Ingresso removido com sucesso',
          type: 'success',
          time: 5000,
        });
      } catch (error) {
        console.error('Erro ao remover ingresso:', error);
        this.$store.dispatch('toast/setToast', {
          text: 'Erro ao remover ingresso. Tente novamente.',
          type: 'error',
          time: 5000,
        });
      } finally {
        this.isSubmitting = false;
      }
    },

    getPdvStatusColor(pdv) {
      const statusName = pdv.status?.name?.toLowerCase() || '';

      if (statusName.includes('disponível') || statusName.includes('disponivel')) {
        return 'success';
      } else if (statusName.includes('fechado')) {
        return 'warning';
      }

      return 'grey';
    },

    getPdvStatusIcon(pdv) {
      const statusName = pdv.status?.name?.toLowerCase() || '';

      if (statusName.includes('disponível') || statusName.includes('disponivel')) {
        return 'mdi-lock-open-variant';
      } else if (statusName.includes('fechado')) {
        return 'mdi-lock';
      }

      return 'mdi-help-circle';
    },

    getPdvStatusTooltip(pdv) {
      const statusName = pdv.status?.name?.toLowerCase() || '';

      if (statusName.includes('disponível') || statusName.includes('disponivel')) {
        return 'Fechar PDV';
      } else if (statusName.includes('fechado')) {
        return 'Abrir PDV';
      }

      return 'Alterar status';
    },

    async togglePdvStatus(pdv) {
      try {
        this.isSubmitting = true;

        pdv.isLoading = true;

        const currentStatusName = pdv.status?.name?.toLowerCase() || '';
        let newStatusId = null;

        if (currentStatusName.includes('disponível') || currentStatusName.includes('disponivel')) {
          newStatusId = this.statusClosed;
        } else if (currentStatusName.includes('fechado')) {
          newStatusId = this.statusAvailable;
        } else {
          newStatusId = this.statusAvailable;
        }

        if (!newStatusId) {
          throw new Error('Não foi possível determinar o novo status do PDV');
        }

        const updateData = {
          data: {
            id: pdv.id,
            status_id: newStatusId,
          }
        };

        const response = await this.$store.dispatch('eventPdv/updatePdv', updateData);

        if (!response.success) {
          throw new Error('Erro ao atualizar status do PDV');
        }

        await this.fetchEventPdvs();

        const newStatus = newStatusId === this.statusAvailable ? 'disponível' : 'fechado';
        this.$store.dispatch('toast/setToast', {
          text: `PDV agora está ${newStatus}`,
          type: 'success',
          time: 5000,
        });
      } catch (error) {
        console.error('Erro ao alternar status do PDV:', error);
        this.$store.dispatch('toast/setToast', {
          text: 'Erro ao alternar status do PDV. Tente novamente.',
          type: 'error',
          time: 5000,
        });
      } finally {
        this.isSubmitting = false;
        pdv.isLoading = false;
      }
    },
  }
};
</script>

<style scoped>
.pdv-table :deep(th) {
  font-weight: bold !important;
}

.pdv-table :deep(td) {
  cursor: pointer;
}

.menu-activator {
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.menu-activator:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

.menu-activator .v-icon {
  margin-left: 4px;
  font-size: 16px;
}

.menu-popup {
  border-radius: 8px;
}

.menu-header {
  font-weight: 600;
  font-size: 14px;
  color: var(--black-text);
}

.menu-list {
  max-height: 200px;
  overflow-y: auto;
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 4px 0;
  color: var(--black-text);
  font-size: 14px;
}

.menu-empty {
  color: var(--grey-text);
  font-size: 14px;
  font-style: italic;
}
</style>