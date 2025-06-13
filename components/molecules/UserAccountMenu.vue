<template>
  <v-menu bottom left offset-y min-width="250" max-width="250" transition="slide-y-transition">
    <template #activator="{ on, attrs }">
      <v-btn icon :class="buttonClass" v-bind="attrs" v-on="on">
        <MUserProfile variant="avatar" :avatar-color="avatarColor" :avatar-size="isMobile ? '32' : '48'" />
      </v-btn>
    </template>

    <v-list dense>
      <v-list-item class="px-3 py-2">
        <MUserProfile variant="card" :avatar-color="avatarColor" avatar-size="40" name-class="font-weight-medium"
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
      default: 'grey'
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

    isMobile() {
      return isMobileDevice(this.$vuetify);
    },

    menuItems(): MenuItemOrDivider[] {
      const items: MenuItemOrDivider[] = [
        {
          title: 'Minha conta',
          icon: 'mdi-account-circle',
          action: () => this.userEdit(this.getUserId)
        }
      ];

      // Add vitrine link if enabled
      if (this.showVitrineLink) {
        items.push({
          title: 'Home',
          icon: 'mdi-storefront',
          action: this.goToVitrine,
          external: true
        });
      }

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
  margin-top: 4px !important;
  margin-bottom: 4px !important;
}
</style>
