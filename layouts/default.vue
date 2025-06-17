<template>
  <v-app v-if="isValid">
    <!-- Drawer in Mobile -->
    <v-navigation-drawer v-if="isMobile" v-model="drawer" clipped app class="navigation-drawer">
      <v-list dense nav>
        <v-list-item class="drawer-logo">
          <MobileLogo is-dark :click-to-home="true" />
        </v-list-item>
        <v-list-item
v-for="item in filteredInternalTopBarItems" :key="item.title" :to="item.to" router exact
          active-class="active-item">
          <v-list-item-icon>
            <v-icon>{{ item.icon }}</v-icon>
          </v-list-item-icon>

          <v-list-item-content>
            <v-list-item-title>{{ item.title }}</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-list-item
v-for="item in filteredExternalTopBarItems" :key="'ext-' + item.title" :href="item.to"
          :target="item.target" active-class="active-item">
          <v-list-item-icon>
            <v-icon>{{ item.icon }}</v-icon>
          </v-list-item-icon>

          <v-list-item-content>
            <v-list-item-title>{{ item.title }}</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>

    <v-app-bar color="primary" clipped-left fixed app class="header">
      <div class="header-content">
        <MenuLogo class="header-img" :click-to-home="true" @change-drawer="onChangeDrawer" />
        <v-spacer />
        <UserAccountMenu v-if="!isLogin" avatar-color="grey" />
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
      return this.$store.getters['loading/$isLoading'];
    },

    isAdminOrManager() {
      const userRole = this.$store.state.auth.user?.role;
      return userRole && (userRole.name === 'Admin' || userRole.name === 'Gerente');
    },

    isMobile() {
      return isMobileDevice(this.$vuetify);
    },

    getUserToken() {
      return this.$auth.token;
    },

    getUserLogged() {
      return this.$auth.loggedIn;
    },

    getUserId() {
      return this.$auth.user?.id;
    },

    getUserRole() {
      return this.$auth.user?.role;
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
    this.$set(this, 'isValid', true);
    await this.filterMenuItemsByPermissions();
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

        // Admin e Gerente têm acesso a tudo
        if (this.isAdminOrManager) {
          this.filteredItems = TopBar.filter(item =>
            // Se o item é 'Minha página' e o usuário é admin ou gerente, não mostrar
            !(item.title === 'Minha página' && this.isAdminOrManager)
          );
          return;
        }

        // Carregar as permissões do usuário se não existirem no cache ou se o cache expirou
        if (this.$store.getters['permissions/$permissions'].length === 0 || !this.$store.getters['permissions/$isCacheValid']) {
          await this.$store.dispatch('permissions/loadUserPermissions', {
            userId: this.getUserId,
            roleId: this.getUserRole.id
          });
        }

        // Se o usuário tem a permissão especial '*', permite tudo (exceto 'Minha página' para admin/gerente)
        if (this.$store.getters['permissions/$hasAllPermissions']) {
          this.filteredItems = TopBar.filter(item =>
            !(item.title === 'Minha página' && this.isAdminOrManager)
          );
          return;
        }

        // Filtra os itens baseado nas permissões do usuário
        this.filteredItems = TopBar.filter(item => {
          // Se tem permissões vazias, mostrar o item
          if (!item.permissions || item.permissions.length === 0) {
            return true;
          }

          // Se o item é 'Minha página' e o usuário é admin ou gerente, não mostrar
          if (item.title === 'Minha página' && this.isAdminOrManager) {
            return false;
          }

          // Verificar se o usuário tem pelo menos uma das permissões necessárias
          return item.permissions.some(permission =>
            this.$store.getters['permissions/$permissions'].includes(permission)
          );
        });
      } catch (error) {
        // console.error('Erro ao filtrar itens de menu:', error);
        this.filteredItems = [];
      }
    },
  },
};
</script>

<style scoped>
.header {
  height: 64px !important;
}

.header-content {
  display: flex;
  flex-direction: row;
  width: 100%;
  padding: 0 16px;
}

.header-img {
  display: flex;
  align-items: center;
}

:deep(.v-toolbar__content) {
  height: 64px !important;
  padding: 0 !important;
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
