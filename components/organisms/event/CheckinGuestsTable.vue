<template>
  <div class="checkin-guests-table">
    <!-- Visão por Lista -->
    <CheckinGuestsListsTable v-if="viewMode === 'lists'" :lists="guestLists" :loading="isLoading"
      :total-items="guestListsMeta.total" :options="listOptions" :search="listSearch" :is-mobile="isMobile"
      @search="handleListSearch" @update:options="handleListOptionsUpdate" @row-click="handleListRowClick">
      <template #toolbar>
        <v-row class="align-center">
          <v-col :cols="isMobile ? 12 : 6">
            <v-text-field v-model="listSearch"
              :label="viewMode === 'lists' ? 'Buscar por nome da lista' : 'Buscar por nome do convidado'"
              prepend-inner-icon="mdi-magnify" clearable hide-details="auto" @input="handleListSearch" />
          </v-col>

          <v-col :cols="isMobile ? 12 : 6" class="d-flex justify-end align-center">
            <DefaultButton color="error" class="mr-2" text="Limpar Check-ins" is-text
              @click="showClearCheckinModal = true" />
            <TableFilter :active-filters-count="activeFiltersCount" :show-clear-filters="false">
              <template #filter-content>
                <v-row>
                  <v-col cols="12">
                    <v-select v-model="viewMode" :items="viewModeOptions" label="Modo de Visualização" outlined dense
                      hide-details="auto" @change="handleViewModeChange" />
                  </v-col>
                </v-row>
              </template>
            </TableFilter>
          </v-col>
        </v-row>
      </template>
    </CheckinGuestsListsTable>

    <!-- Visão por Convidados -->
    <CheckinGuestsMembersTable v-else :members="guestListMembers" :loading="isLoading"
      :total-items="guestListMembersMeta.total" :options="memberOptions" :search="memberSearch" :is-mobile="isMobile"
      @search="handleMemberSearch" @update:options="handleMemberOptionsUpdate" @check-in="handleCheckIn">
      <template #toolbar>
        <v-row class="align-center">
          <v-col :cols="isMobile ? 12 : 6">
            <v-text-field v-model="memberSearch"
              :label="viewMode === 'lists' ? 'Buscar por nome da lista' : 'Buscar por nome do convidado'"
              prepend-inner-icon="mdi-magnify" clearable hide-details="auto" class="mr-4" @input="handleMemberSearch" />
          </v-col>

          <v-col :cols="isMobile ? 12 : 6" class="d-flex justify-end align-center">
            <DefaultButton color="error" class="mr-2" text="Limpar Check-ins" is-text
              @click="showClearCheckinModal = true" />
            <TableFilter :active-filters-count="activeFiltersCount" :show-clear-filters="false">
              <template #filter-content>
                <v-row>
                  <v-col cols="12">
                    <v-select v-model="viewMode" :items="viewModeOptions" label="Modo de Visualização" outlined dense
                      hide-details="auto" @change="handleViewModeChange" />
                  </v-col>
                </v-row>
              </template>
            </TableFilter>
          </v-col>
        </v-row>
      </template>
    </CheckinGuestsMembersTable>

    <!-- Modal para listar membros da lista de convidados (usado apenas na visão por lista) -->
    <CheckinGuestListMembersModal v-if="viewMode === 'lists'" :show.sync="showMembersModal"
      :title="selectedGuestList ? selectedGuestList.name : 'Convidados'" :members="guestListMembers"
      :loading="isLoadingMembers" :total-items="guestListMembersMeta.total" :is-mobile="isMobile"
      @search="handleModalSearch" @update:options="handleModalOptionsUpdate" @check-in="handleCheckIn"
      @close="handleClose" />

    <!-- Modal para limpar check-ins -->
    <ClearCheckinModal :show.sync="showClearCheckinModal" :items="guestLists" :loading="isLoading" mode="guests"
      @clear="handleClearCheckins" />
  </div>
</template>

<script>
import { formatDateTimeWithTimezone } from '@/utils/formatters';
import { isMobileDevice } from '@/utils/utils';

export default {
  data: () => ({
    viewMode: 'members',
    showMembersModal: false,
    showClearCheckinModal: false,
    selectedGuestList: null,
    listOptions: {
      page: 1,
      itemsPerPage: 10,
      sortBy: ['name'],
      sortDesc: [false],
    },
    memberOptions: {
      page: 1,
      itemsPerPage: 10,
      sortBy: ['full_name'],
      sortDesc: [false],
    },
    listSearch: '',
    memberSearch: '',
  }),

  computed: {
    guestLists() {
      return this.$store.getters['eventGuests/$guestLists'].filter(list => !list.deleted_at);
    },

    guestListsMeta() {
      return this.$store.getters['eventGuests/$metaGuestList'];
    },

    guestListMembers() {
      return this.$store.getters['eventGuests/$guestListMembers'];
    },

    guestListMembersMeta() {
      return this.$store.getters['eventGuests/$metaGuestListMember'];
    },

    isLoading() {
      return this.$store.getters['eventGuests/$isLoading'];
    },

    isLoadingMembers() {
      return this.$store.getters['eventGuests/$isLoading'];
    },

    isMobile() {
      return isMobileDevice(this.$vuetify);
    },

    viewModeOptions() {
      return [
        { text: 'Visão por Convidados', value: 'members', icon: 'mdi-account-group' },
        { text: 'Visão por Lista', value: 'lists', icon: 'mdi-format-list-bulleted' }
      ];
    },

    activeFiltersCount() {
      return 0;
    },
  },

  watch: {
    viewMode: {
      handler(newMode) {
        if (newMode === 'members') {
          this.loadAllMembers();
        } else {
          this.loadGuestLists();
        }
      },
      immediate: true,
    },
  },

  methods: {
    formatDateTimeWithTimezone,

    buildListQueryParams() {
      const { sortBy, sortDesc, page, itemsPerPage } = this.listOptions;
      const eventId = this.$route.params.id;

      let query = `where[event_id][v]=${eventId}`;

      if (sortBy.length > 0) {
        const sortOrder = sortDesc[0] ? 'desc' : 'asc';
        query += `&orderBy[]=${sortBy[0]}:${sortOrder}`;
      }

      if (this.listSearch) {
        query += `&search[name][o]=_LIKE_`;
        query += `&search[name][v]=${encodeURIComponent(String(this.listSearch))}`;
      }

      query += `&limit=${itemsPerPage}&page=${page}`;
      query += `&preloads[]=members:guestListMemberValidated`;

      return query;
    },

    buildAllMembersQueryParams() {
      const { sortBy, sortDesc, page, itemsPerPage } = this.memberOptions;
      const eventId = this.$route.params.id;

      let query = `whereHas[guestList][event_id][v]=${eventId}`;

      if (sortBy.length > 0) {
        const sortField = sortBy[0] === 'full_name' ? 'first_name' : sortBy[0];
        const sortOrder = sortDesc[0] ? 'desc' : 'asc';
        query += `&orderBy[]=${sortField}:${sortOrder}`;
      }

      if (this.memberSearch) {
        query += `&search[first_name][o]=_LIKE_`;
        query += `&search[first_name][v]=${encodeURIComponent(String(this.memberSearch))}`;
        query += `&search[last_name][o]=_LIKE_`;
        query += `&search[last_name][v]=${encodeURIComponent(String(this.memberSearch))}`;
      }

      query += `&limit=${itemsPerPage}&page=${page}`;
      query += `&preloads[]=guestList:members:guestListMemberValidated`;

      return query;
    },

    async loadGuestLists() {
      try {
        const queryParams = this.buildListQueryParams();
        await this.$store.dispatch('eventGuests/fetchGuestListAndPopulateByQuery', queryParams);
      } catch (error) {
        console.error('Erro ao carregar listas de convidados:', error);
        this.$toast.error('Erro ao carregar listas de convidados');
      }
    },

    async loadAllMembers() {
      try {
        const queryParams = this.buildAllMembersQueryParams();
        await this.$store.dispatch('eventGuests/fetchGuestListMemberAndPopulateByQuery', queryParams);
      } catch (error) {
        console.error('Erro ao carregar convidados:', error);
        this.$toast.error('Erro ao carregar convidados');
      }
    },

    handleListSearch(search) {
      this.listSearch = search;
      this.loadGuestLists();
    },

    handleMemberSearch(search) {
      this.memberSearch = search;
      this.loadAllMembers();
    },

    handleListOptionsUpdate(options) {
      this.listOptions = options;
      this.loadGuestLists();
    },

    handleMemberOptionsUpdate(options) {
      this.memberOptions = options;
      this.loadAllMembers();
    },

    async handleListRowClick(guestList) {
      this.selectedGuestList = guestList;
      this.showMembersModal = true;

      try {
        // Limpar dados anteriores antes de buscar novos
        this.$store.dispatch('eventGuests/clearGuestListMembers');

        await this.fetchMembers({
          page: 1,
          itemsPerPage: 10,
          sortBy: ['full_name'],
          sortDesc: [false],
          search: ''
        });
      } catch (error) {
        console.error('Erro ao carregar membros da lista:', error);
        this.$toast.error('Erro ao carregar membros da lista');
      }
    },

    handleClose() {
      this.showMembersModal = false;
      this.selectedGuestList = null;
    },

    async handleCheckIn(validation) {
      try {
        const response = await this.$store.dispatch('eventGuests/validateGuestListMember', [validation]);

        if (response) {
          this.$store.dispatch('toast/setToast', {
            text: 'Check-in realizado com sucesso!',
            type: 'success',
            time: 5000,
          });

          // Recarregar dados gerais
          if (this.viewMode === 'lists') {
            await this.loadGuestLists();

            // Se o modal estiver aberto e a validação veio do modal
            if (validation.refreshModalData && this.showMembersModal && this.selectedGuestList) {
              await this.fetchMembers({
                page: this.options?.page || 1,
                itemsPerPage: this.options?.itemsPerPage || 10,
                sortBy: this.options?.sortBy || ['full_name'],
                sortDesc: this.options?.sortDesc || [false],
                search: ''
              });
            }
          } else {
            await this.loadAllMembers();
          }
        } else {
          throw new Error('Falha ao realizar check-in');
        }
      } catch (error) {
        console.error('Erro ao realizar check-in:', error);
        this.$store.dispatch('toast/setToast', {
          text: 'Erro ao realizar check-in',
          type: 'error',
          time: 5000,
        });
      }
    },

    handleModalSearch(options) {
      this.fetchMembers(options);
    },

    handleModalOptionsUpdate(options) {
      this.fetchMembers(options);
    },

    async fetchMembers(options) {
      const queryParams = this.buildQueryParams(options);
      await this.$store.dispatch('eventGuests/fetchGuestListMemberAndPopulateByQuery', queryParams);
    },

    buildQueryParams(options) {
      const { sortBy, sortDesc, page, itemsPerPage, search } = options;

      let query = `where[guest_list_id][v]=${this.selectedGuestList.id}`;

      if (sortBy.length > 0) {
        const sortField = sortBy[0] === 'full_name' ? 'first_name' : sortBy[0];
        const sortOrder = sortDesc[0] ? 'desc' : 'asc';
        query += `&orderBy[]=${sortField}:${sortOrder}`;
      }

      if (search) {
        query += `&search[first_name][o]=_LIKE_`;
        query += `&search[first_name][v]=${encodeURIComponent(String(search))}`;
        query += `&search[last_name][o]=_LIKE_`;
        query += `&search[last_name][v]=${encodeURIComponent(String(search))}`;
      }

      query += `&preloads[]=guestListMemberValidated`;
      query += `&limit=${itemsPerPage}&page=${page}`;

      return query;
    },

    handleViewModeChange() {
      if (this.viewMode === 'members') {
        this.loadAllMembers();
      } else {
        this.loadGuestLists();
      }
    },

    async handleClearCheckinsFromViewLists(payload) {
      try {
        const { mode, items } = payload;
        const toDelete = [];

        if (mode === 'all') {

          this.guestLists.forEach(list => {
            list.members.forEach(member => {
              member.guestListMemberValidated.forEach(validation => {

                if (toDelete.includes(validation.id)) {
                  return;
                }

                toDelete.push(validation.id);
              });
            });
          });

          if (toDelete.length > 0) {
            const promises = toDelete.map(id => this.$store.dispatch('eventGuests/deleteGuestListMemberValidated', id));
            await Promise.all(promises);

            this.$store.dispatch('toast/setToast', {
              text: 'Check-ins limpos com sucesso!',
              type: 'success',
              time: 5000,
            });

          } else {
            this.$store.dispatch('toast/setToast', {
              text: 'Nenhum check-in para limpar!',
              type: 'info',
              time: 5000,
            });
          }
        } else {

          items.forEach(item => {
            const filteredLists = this.guestLists.filter(list => list.name === item.name);

            filteredLists.forEach(list => {
              list.members.forEach(member => {
                member.guestListMemberValidated.forEach(validation => {
                  if (toDelete.includes(validation.id)) {
                    return;
                  }
                  toDelete.push(validation.id);
                });
              });
            });
          });

          if (toDelete.length > 0) {
            const promises = toDelete.map(id => this.$store.dispatch('eventGuests/deleteGuestListMemberValidated', id));
            await Promise.all(promises);

            this.$store.dispatch('toast/setToast', {
              text: 'Check-ins limpos com sucesso!',
              type: 'success',
              time: 5000,
            });

          } else {
            this.$store.dispatch('toast/setToast', {
              text: 'Nenhum check-in para limpar!',
              type: 'info',
              time: 5000,
            });
          }

        }
      } catch (error) {
        throw new Error('Erro ao limpar check-ins de listas:', error);
      }

    },

    async handleClearCheckinsFromViewMembers(payload) {
      try {
        const { mode, items } = payload;
        const toDelete = [];

        if (mode === 'all') {

          this.guestListMembers.forEach(member => {
            if (member.guestList) {
              member.guestList.members.forEach(member => {
                member.guestListMemberValidated.forEach(validation => {

                  if (toDelete.includes(validation.id)) {
                    return;
                  }

                  toDelete.push(validation.id);
                });
              });
            }
          });

          if (toDelete.length > 0) {
            const promises = toDelete.map(id => this.$store.dispatch('eventGuests/deleteGuestListMemberValidated', id));
            await Promise.all(promises);

            this.$store.dispatch('toast/setToast', {
              text: 'Check-ins limpos com sucesso!',
              type: 'success',
              time: 5000,
            });

          } else {
            this.$store.dispatch('toast/setToast', {
              text: 'Nenhum check-in para limpar!',
              type: 'info',
              time: 5000,
            });
          }
        } else {

          items.forEach(item => {
            const filteredLists = this.guestListMembers.filter(member => member.guestList.name === item.name);

            filteredLists.forEach(list => {
              list.guestList.members.forEach(member => {
                member.guestListMemberValidated.forEach(validation => {
                  if (toDelete.includes(validation.id)) {
                    return;
                  }
                  toDelete.push(validation.id);
                });
              });
            });
          });

          if (toDelete.length > 0) {
            const promises = toDelete.map(id => this.$store.dispatch('eventGuests/deleteGuestListMemberValidated', id));
            await Promise.all(promises);

            this.$store.dispatch('toast/setToast', {
              text: 'Check-ins limpos com sucesso!',
              type: 'success',
              time: 5000,
            });

          } else {
            this.$store.dispatch('toast/setToast', {
              text: 'Nenhum check-in para limpar!',
              type: 'info',
              time: 5000,
            });
          }

        }
      } catch (error) {
        throw new Error('Erro ao limpar check-ins de membros:', error);
      }
    },

    async handleClearCheckins(payload) {
      try {

        if (this.viewMode === 'lists') {
          await this.handleClearCheckinsFromViewLists(payload);
        } else {
          await this.handleClearCheckinsFromViewMembers(payload);
        }

      } catch (error) {
        console.error('Erro ao limpar check-ins:', error);
        this.$store.dispatch('toast/setToast', {
          text: 'Erro ao limpar check-ins',
          type: 'error',
          time: 5000,
        });
      } finally {
        if (this.viewMode === 'lists') {
          await this.loadGuestLists();
        } else {
          await this.loadAllMembers();
        }
      }
    },
  },
};
</script>