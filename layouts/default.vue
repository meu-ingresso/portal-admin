<template>
  <v-app v-if="isValid">
    <!-- Drawer in Mobile -->
    <v-navigation-drawer
      v-if="isMobile"
      v-model="drawer"
      clipped
      app
      class="navigation-drawer">
      <v-list dense nav>
        <v-list-item class="drawer-logo">
          <MobileLogo is-dark :click-to-home="true" />
        </v-list-item>
        <v-list-item
          v-for="item in filteredInternalTopBarItems"
          :key="item.title"
          :to="item.to"
          router
          exact
          active-class="active-item">
          <v-list-item-icon>
            <v-icon>{{ item.icon }}</v-icon>
          </v-list-item-icon>

          <v-list-item-content>
            <v-list-item-title>{{ item.title }}</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-list-item
          v-for="item in filteredExternalTopBarItems"
          :key="'ext-'+item.title"
          :href="item.to"
          :target="item.target"
          active-class="active-item">
          <v-list-item-icon>
            <v-icon>{{ item.icon }}</v-icon>
          </v-list-item-icon>

          <v-list-item-content>
            <v-list-item-title>{{ item.title }}</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>

    <v-app-bar color="primary" clipped-left dense fixed app class="header">
      <div class="header-content">
        <MenuLogo
          class="header-img"
          :click-to-home="true"
          @change-drawer="onChangeDrawer" />

        <!-- Desktop -->
        <div v-if="!isMobile" class="content-menus">
          <div v-for="(item, index) in filteredInternalTopBarItems" :key="index" class="topbar-item">
            <v-btn
              :to="item.to"
              class="topbar-button"
              :title="item.title"
              depressed
              plain
              tile>
              <v-icon left>{{ item.icon }}</v-icon> {{ item.title }}
            </v-btn>
          </div>
          <div v-for="(item, index) in filteredExternalTopBarItems" :key="'ext-'+index" class="topbar-item">
            <v-btn
              :href="item.to"
              :target="item.target"
              class="topbar-button"
              :title="item.title"
              depressed
              plain
              tile>
              <v-icon left>{{ item.icon }}</v-icon> {{ item.title }}
            </v-btn>
          </div>
        </div>
        <v-spacer />
        <AccountMenu v-if="!isLogin" />
      </div>
    </v-app-bar>

    <v-main>
      <Nuxt />
    </v-main>
  </v-app>
</template>

<script>
import { isMobileDevice } from '@/utils/utils';
import { TopBar } from '~/utils/topbar';
import { loading } from '@/store';
import { checkMenuItemsPermissions } from '~/utils/permissions-util';

export default {
  name: 'LayoutDefault',
  data() {
    return {
      isValid: false,
      isLogin: false,
      drawer: false,
      filteredItems: [],
    };
  },

  computed: {
    isLoading() {
      return loading.$isLoading;
    },

    isMobile() {
      return isMobileDevice(this.$vuetify);
    },

    getUserToken() {
      return this.$cookies.get('token');
    },

    getUserLogged() {
      return !!this.$cookies.get('user_logged');
    },
    
    getUserId() {
      return this.$cookies.get('user_id');
    },
    
    getUserRole() {
      return this.$cookies.get('user_role');
    },

    topBarItems() {
      if (!this.getUserLogged) {
        return [];
      }
      return this.filteredItems.length > 0 ? this.filteredItems : [];
    },

    filteredInternalTopBarItems() {
      return this.topBarItems.filter(item => !item.target);
    },

    filteredExternalTopBarItems() {
      return this.topBarItems.filter(item => item.target);
    },
  },

  async mounted() {
    if (!this.getUserLogged || !this.getUserToken || this.getUserToken === '') {
      this.$router.push('/login');
    } else {
      this.$set(this, 'isValid', true);
      await this.filterMenuItemsByPermissions();
    }
  },

  methods: {
    onChangeDrawer() {
      this.drawer = !this.drawer;
    },
    
    async filterMenuItemsByPermissions() {
      try {
        if (!this.getUserId || !this.getUserRole) {
          this.filteredItems = [];
          return;
        }

        // Verificar permissões diretamente para todos os itens
        const permissionsResult = await checkMenuItemsPermissions(
          this.getUserRole,
          this.getUserId,
          TopBar
        );
        
        // Aplicar resultados
        this.filteredItems = TopBar.filter((item, index) => {
          // Se tem permissões vazias, mostrar o item
          if (!item.permissions || item.permissions.length === 0) {
            return true;
          }
          return permissionsResult[index];
        });
      } catch (error) {
        console.error('Erro ao filtrar itens de menu:', error);
        this.filteredItems = [];
      }
    },
  },
};
</script>

<style scoped>
.header-content {
  display: flex;
  flex-direction: row;
  width: 100%;
  margin-top: 12px;
  align-items: center;
}

.header-img {
  width: 230px;
  display: flex;
  justify-content: center;
}

.content-menus {
  display: flex;
  flex-direction: row;
  align-items: center;
}

.topbar-item {
  margin-right: 16px;
}

.topbar-button {
  color: white;
}

.navigation-drawer {
  color: var(--black-text) !important;
  font-weight: 400 !important;
  font-size: 16px !important;
  border-radius: 0px !important;
  font-family: var(--font-family-inter-bold) !important;
}

.active-item::before {
  opacity: 0 !important;
}

.active-item {
  background-color: var(--primary) !important;
  color: white;
  border-radius: 0px !important;
  font-size: 16px !important;
  font-display: var(--font-family-inter-bold) !important;
}
</style>
