<template>
  <v-menu bottom left offset-y min-width="250" max-width="250" transition="slide-y-transition">
    <template #activator="{ on, attrs }">
      <v-btn icon :class="buttonClass" v-bind="attrs" v-on="on">
        <MUserProfile variant="avatar" :avatar-color="avatarColor" :avatar-size="32" />
      </v-btn>
    </template>

    <v-list dense class="user-menu">
      <v-list-item class="px-3 py-2">
        <MUserProfile
variant="card" :avatar-color="avatarColor" avatar-size="40" name-class="font-weight-medium"
          email-class="text-caption" />
      </v-list-item>

      <v-divider class="my-1"></v-divider>

      <template v-for="(item, index) in menuItems">
        <v-divider v-if="isDivider(item)" :key="`divider-${index}`" class="my-1"></v-divider>
        <v-list-item v-else :key="item.title" link class="menu-item" @click="item.action">
          <v-list-item-icon class="mr-3">
            <v-icon size="20">{{ item.icon }}</v-icon>
          </v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title class="menu-item-title">{{ item.title }}</v-list-item-title>
          </v-list-item-content>
          <!-- Show external link icon if item is external
          <v-list-item-action v-if="item.external" class="menu-external-icon">
            <v-icon size="16" class="ml-1">mdi-open-in-new</v-icon>
          </v-list-item-action>
           -->
        </v-list-item>
      </template>
    </v-list>
  </v-menu>
</template>

<script lang="ts">
import Vue from 'vue';
import { isMobileDevice } from '@/utils/utils';

interface MenuItem {
  title: string;
  icon: string;
  action: () => void;
  external?: boolean;
}

interface MenuDivider {
  divider: true;
}

type MenuItemOrDivider = MenuItem | MenuDivider;

export default Vue.extend({
  name: 'UserAccountMenu',

  props: {
    // Avatar customization
    avatarColor: {
      type: String,
      default: 'secondary'
    },
    buttonClass: {
      type: String,
      default: ''
    },
    // Show vitrine link
    showVitrineLink: {
      type: Boolean,
      default: true
    }
  },

  computed: {
    getUserId(): string {
      return this.$store.state.auth.user?.id || '';
    },

    getUserRole() {
      return this.$store.state.auth.user?.role;
    },

    isAdmin() {
      return this.getUserRole?.name === 'Admin';
    },

    isProducer() {
      return this.getUserRole?.name === 'Produtor';
    },

    isMobile() {
      return isMobileDevice(this.$vuetify);
    },

    menuItems(): MenuItemOrDivider[] {
      const items: MenuItemOrDivider[] = [];

      // Vitrine sempre será a primeira opção
      if (this.showVitrineLink) {
        items.push({
          title: 'Início',
          icon: 'mdi-storefront',
          action: this.goToVitrine,
          external: true
        });
      }

      // Opções comuns para todos os usuários
      items.push(
        {
          title: 'Minha conta',
          icon: 'mdi-account-circle',
          action: () => this.userEdit(this.getUserId)
        },
        {
          title: 'Meus ingressos',
          icon: 'mdi-ticket-confirmation',
          action: this.goToTickets
        }
      );

      // Opções específicas baseadas no role
      if (this.isProducer) {
        items.push(
          { divider: true },
          {
            title: 'Meus eventos',
            icon: 'mdi-calendar-star',
            action: this.goToMyEvents
          },
          {
            title: 'Relatórios',
            icon: 'mdi-chart-bar',
            action: this.goToReports
          },
          {
            title: 'Minha página',
            icon: 'mdi-web',
            action: this.goToMyPage
          },
          {
            title: 'Configurações',
            icon: 'mdi-cog',
            action: this.goToConfig
          },
          { divider: true },
          {
            title: 'Ajuda',
            icon: 'mdi-help-circle',
            action: this.goToHelp
          }
        );
      } else if (this.isAdmin) {
        items.push(
          { divider: true },
          {
            title: 'Relatórios',
            icon: 'mdi-chart-bar',
            action: this.goToReports
          },
          {
            title: 'Eventos',
            icon: 'mdi-calendar-star',
            action: this.goToMyEvents
          },
          {
            title: 'Configurações',
            icon: 'mdi-cog',
            action: this.goToConfig
          },
          { divider: true },
          {
            title: 'Ajuda',
            icon: 'mdi-help-circle',
            action: this.goToHelp
          }
        );
      } else {
        // Usuário comum
        items.push(
          { divider: true },
          {
            title: 'Publicar evento',
            icon: 'mdi-calendar-plus',
            action: this.goToCreateEvent
          },
          { divider: true },
          {
            title: 'Ajuda',
            icon: 'mdi-help-circle',
            action: this.goToHelp
          }
        );
      }

      // Sair sempre será a última opção
      items.push(
        { divider: true },
        {
          title: 'Sair',
          icon: 'mdi-logout',
          action: this.onLogout
        }
      );

      return items;
    }
  },

  methods: {
    isDivider(item: MenuItemOrDivider): item is MenuDivider {
      return 'divider' in item;
    },

    userEdit(id: string): void {
      this.$router.push(`/user/profile/${id}`);
    },

    goToVitrine(): void {
      const vitrineUrl = this.getVitrineUrl();
      window.location.href = vitrineUrl;
    },

    getVitrineUrl(): string {
      // Check current environment to determine vitrine URL
      const isLocal = typeof window !== 'undefined' &&
        (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

      if (isLocal) {
        return 'http://localhost:3535';
      } else {
        return 'https://vitrine.meuingresso.com.br';
      }
    },

    goToTickets(): void {
      // TODO: Implementar página de ingressos do usuário
      alert('Página "Meus ingressos" em desenvolvimento');
    },

    goToMyEvents(): void {
      this.$router.push('/');
    },

    goToMyPage(): void {
      this.$router.push('/my-page');
    },

    goToCreateEvent(): void {
      this.$router.push('/events/create');
    },

    goToReports(): void {
      this.$router.push('/reports');
    },

    goToConfig(): void {
      const userId = this.getUserId;
      this.$router.push(`/user/profile/${userId}?tab=settings`);
    },

    goToHelp(): void {
      // TODO: Implementar página de ajuda
      alert('Página de "Ajuda" em desenvolvimento');
    },

    async onLogout() {
      try {
        await this.$auth.logout();
        this.$router.replace('/login');
      } catch (error) {
        // console.error('Erro no logout:', error);
        this.$router.replace('/login');
      }
    }
  }
});
</script>

<style scoped>
/* Estilos para o menu do usuário */
:deep(.v-menu__content) {
  border-radius: 12px !important;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12) !important;
  border: 1px solid rgba(0, 0, 0, 0.06) !important;
  margin-top: 8px !important;
}

.menu-item {
  min-height: 34px !important;
  transition: background-color 0.2s ease !important;
}

.menu-item:hover {
  background-color: rgba(82, 31, 142, 0.05) !important;
}

.menu-item .menu-item-title {
  font-size: 0.875rem !important;
  font-weight: 500 !important;
  color: #333 !important;
}

.menu-item .v-list-item__icon {
  color: #666 !important;
  margin-right: 12px !important;
}

.menu-external-icon {
  margin: 0 !important;
}

.menu-external-icon .v-icon {
  color: #999 !important;
}

:deep(.v-list-item__subtitle) {
  font-size: 0.8rem;
}

:deep(.v-divider) {
  margin-top: 0px !important;
  margin-bottom: 0px !important;
  background-color: rgba(0, 0, 0, 0.06) !important;
  opacity: 0.5 !important;
}

.user-menu {
  padding-bottom: 0px !important;
}
</style>
