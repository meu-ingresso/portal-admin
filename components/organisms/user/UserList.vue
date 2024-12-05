<template>
  <div class="container">
    <div>
      <v-row :class="isMobile ? 'searchSessionMobile' : 'searchSession'">
        <v-col cols="12" md="9" :class="!isMobile ? 'content' : ''">
          <DataSearch
            :search="search"
            label="Buscar por Nome"
            @update-search="updateSearch" />
        </v-col>

        <v-spacer v-if="!isMobile && !$isLoading" />

        <v-col
          v-if="!$isLoading"
          cols="12"
          md="3"
          :class="!isMobile ? 'content' : 'contentMobile'"
          :align="!isMobile ? 'end' : ''">
          <AddButton url="/user/create" text="Cadastrar Usuário" />
        </v-col>
      </v-row>

      <v-row v-if="!$isLoading" class="mt-10">
        <v-row>
          <v-col v-for="(item, idx) in $userList" :key="idx" cols="12" md="4" lg="4">
            <UserCard :user="item" />
          </v-col>
        </v-row>
      </v-row>
    </div>

    <div v-if="$isLoading">
      <Lottie path="./animations/loading_ship.json" height="300" width="300" />
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { loading, user } from '@/store';
import { isMobileDevice } from '@/utils/utils';

export default Vue.extend({
  data() {
    return {
      search: '',
      isLoadingList: true,
      options: {
        groupBy: [],
        groupDesc: [],
        itemsPerPage: 100,
        multiSort: false,
        mustSort: false,
        page: 1,
        sortBy: [],
        sortDesc: [],
      },
      total: 0,
      userData: [],
      dialog: false,
      dialogDelete: false,
      footerProps: {
        'items-per-page-options': [100, 200, 500, 1000, 2000, 5000],
        'items-per-page-all-text': 'Todos',
        'items-per-page-text': 'Registros por Página',
      },
    };
  },

  computed: {
    $isLoading() {
      return loading.$isLoading;
    },

    $user() {
      return user.$user;
    },

    $userList() {
      return user.$userList;
    },

    isMobile() {
      return isMobileDevice(this.$vuetify);
    },
  },

  watch: {
    options: {
      handler() {
        this.getUsers();
      },
      deep: true,
    },

    search() {
      this.debounced();
      this.$set(this.options, 'page', 1);
    },

    isMobile(val) {
      if (val) {
        this.getUsers();
      }
    },
  },

  mounted() {
    this.getUsers();
  },

  created() {
    this.resetUser();
  },

  methods: {
    async getUsers() {
      loading.setIsLoading(true);
      const startTime = new Date().getTime();

      const { sortBy, sortDesc } = this.options;

      const response = await user.getUsers({
        page: 1,
        limit: 99999999,
        search: this.search,
        sortBy: sortBy.length ? sortBy : ['first_name'],
        sortDesc: sortDesc.length ? sortDesc : [false],
      });

      if (response && response.code === 'SEARCH_SUCCESS') {
        const elapsedTime = new Date().getTime() - startTime;
        const timeoutDuration = Math.max(2000 - elapsedTime, 0);

        setTimeout(() => {
          loading.setIsLoading(false);
        }, timeoutDuration);
      } else {
        loading.setIsLoading(false);
      }
    },

    resetUser(this: any): void {
      user.reset();
    },

    debounced(this: any) {
      clearTimeout(this._timer);

      this._timer = setTimeout(() => {
        this.getUsers();
      }, 500);
    },

    updateSearch(value: string): void {
      this.$set(this, 'search', value);
    },

    userEdit(this: any, id: string): void {
      this.$router.replace('/user/edit/' + id);
    },
  },
});
</script>

<style scoped>
.searchSession {
  border-radius: 12px;
  height: 95px;
  background-color: var(--white) !important;
}

.searchSessionMobile {
  border-radius: 12px;
  height: 150px;
  background-color: var(--white) !important;
}

.content {
  margin-top: 10px;
}

.contentMobile {
  margin-top: -45px;
  margin-left: 45px;
}
</style>
