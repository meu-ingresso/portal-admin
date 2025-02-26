<template>
  <div class="checkin-guests-table">
    <!-- Visão por Lista -->
    <CheckinGuestsListsTable
      v-if="viewMode === 'lists'"
      :lists="guestLists"
      :loading="isLoading"
      :total-items="guestListsMeta.total"
      :options="listOptions"
      :search="listSearch"
      @search="handleListSearch"
      @update:options="handleListOptionsUpdate"
      @row-click="handleListRowClick"
    >
      <template #toolbar>
        <v-row>
          <v-col cols="6">
            <v-text-field
              v-model="listSearch"
              :label="viewMode === 'lists' ? 'Buscar por nome da lista' : 'Buscar por nome do convidado'"
              prepend-inner-icon="mdi-magnify"
              clearable
              hide-details="auto"
              @input="handleListSearch"
            />
          </v-col>
          <v-col cols="6" class="d-flex justify-end align-center">
            <div class="view-buttons">
              <v-btn
                text
                :class="{ 'view-btn': true, 'active': viewMode === 'lists' }"
                @click="viewMode = 'lists'"
              >
                <v-icon left size="18">mdi-format-list-bulleted</v-icon>
                <span>Visão por Lista</span>
              </v-btn>
              <v-btn
                text
                :class="{ 'view-btn': true, 'active': viewMode === 'members' }"
                @click="viewMode = 'members'"
              >
                <v-icon left size="18">mdi-account-group</v-icon>
                <span>Visão por Convidados</span>
              </v-btn>
            </div>
          </v-col>
        </v-row>
      </template>
    </CheckinGuestsListsTable>

    <!-- Visão por Convidados -->
    <CheckinGuestsMembersTable
      v-else
      :members="guestListMembers"
      :loading="isLoading"
      :total-items="guestListMembersMeta.total"
      :options="memberOptions"
      :search="memberSearch"
      @search="handleMemberSearch"
      @update:options="handleMemberOptionsUpdate"
      @check-in="handleCheckIn"
    >
      <template #toolbar>
        <v-row>
          <v-col cols="6">
            <v-text-field
              v-model="memberSearch"
              :label="viewMode === 'lists' ? 'Buscar por nome da lista' : 'Buscar por nome do convidado'"
              prepend-inner-icon="mdi-magnify"
              clearable
              hide-details="auto"
              @input="handleMemberSearch"
            />
          </v-col>
          <v-col cols="6" class="d-flex justify-end align-center">
            <div class="view-buttons">
              <v-btn
                text
                :class="{ 'view-btn': true, 'active': viewMode === 'lists' }"
                @click="viewMode = 'lists'"
              >
                <v-icon left size="18">mdi-format-list-bulleted</v-icon>
                <span>Visão por Lista</span>
              </v-btn>
              <v-btn
                text
                :class="{ 'view-btn': true, 'active': viewMode === 'members' }"
                @click="viewMode = 'members'"
              >
                <v-icon left size="18">mdi-account-group</v-icon>
                <span>Visão por Convidados</span>
              </v-btn>
            </div>
          </v-col>
        </v-row>
      </template>
    </CheckinGuestsMembersTable>

    <!-- Modal para listar membros da lista de convidados (usado apenas na visão por lista) -->
    <CheckinGuestListMembersModal
      v-if="viewMode === 'lists'"
      :show.sync="showMembersModal"
      :title="selectedGuestList ? selectedGuestList.name : 'Convidados'"
      :members="guestListMembers"
      :loading="isLoadingMembers"
      :total-items="guestListMembersMeta.total"
      @search="handleModalSearch"
      @update:options="handleModalOptionsUpdate"
      @check-in-all="handleCheckInAll"
      @close="handleClose"
    />
  </div>
</template>

<script>
import { eventGuests, toast } from '@/store';
import { formatDateTimeWithTimezone } from '@/utils/formatters';

export default {
  data: () => ({
    viewMode: 'lists',
    showMembersModal: false,
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
      return eventGuests.$guestLists.filter(list => !list.deleted_at);
    },

    guestListsMeta() {
      return eventGuests.$metaGuestList;
    },

    guestListMembers() {
      return eventGuests.$guestListMembers;
    },

    guestListMembersMeta() {
      return eventGuests.$metaGuestListMember;
    },

    isLoading() {
      return eventGuests.$isLoading;
    },

    isLoadingMembers() {
      return eventGuests.$isLoading;
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
        await eventGuests.fetchGuestListAndPopulateByQuery(queryParams);
      } catch (error) {
        console.error('Erro ao carregar listas de convidados:', error);
        this.$toast.error('Erro ao carregar listas de convidados');
      }
    },

    async loadAllMembers() {
      try {
        const queryParams = this.buildAllMembersQueryParams();
        await eventGuests.fetchGuestListMemberAndPopulateByQuery(queryParams);
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

        const response = await eventGuests.validateGuestListMember([validation]);

        if (response) {
          toast.setToast({
            text: 'Check-in realizado com sucesso!',
            type: 'success',
            time: 5000,
          });

          if (this.viewMode === 'lists') {
            await this.loadGuestLists();
          } else {
            await this.loadAllMembers();
          }
        } else {
          throw new Error('Falha ao realizar check-in');
        }
      } catch (error) {
        console.error('Erro ao realizar check-in:', error);
        toast.setToast({
          text: 'Erro ao realizar check-in',
          type: 'error',
          time: 5000,
        });
      }
    },

    async handleCheckInAll(validations) {
      try {
        const response = await eventGuests.validateGuestListMember(validations);

        if (response) {
          toast.setToast({
            text: 'Check-in realizado com sucesso para todos os convidados!',
            type: 'success',
            time: 5000,
          });

          this.handleClose();
          await this.loadGuestLists();
        } else {
          throw new Error('Falha ao realizar check-in');
        }
      } catch (error) {
        console.error('Erro ao realizar check-in:', error);
        toast.setToast({
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
      await eventGuests.fetchGuestListMemberAndPopulateByQuery(queryParams);
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
  },
};
</script>

<style lang="scss" scoped>
.checkin-guests-table {
  width: 100%;

  .view-buttons {
    display: flex;
    gap: 24px;

    .view-btn {
      text-transform: none;
      letter-spacing: normal;
      font-weight: 400;
      color: rgba(var(--v-primary-base), 0.7) !important;
      padding: 0;
      min-width: 0;
      position: relative;

      &:hover {
        color: var(--v-primary-base) !important;
        background: none;
      }

      &.active {
        span {
          text-decoration: underline !important;
          font-weight: 500;
        }

        &::after {
          content: '';
          position: absolute;
          bottom: -4px;
          left: 0;
          right: 0;
          height: 2px;
          background-color: var(--v-primary-base);
          border-radius: 2px;
        }
      }

      .v-icon {
        margin-right: 8px;
        font-size: 18px;
      }
    }
  }
}
</style>