<template>
  <v-navigation-drawer
    v-if="getSidebar && !isMobile"
    v-model="$_drawer"
    :mini-variant="$_miniVariant"
    clipped
    app
    :class="$vuetify.breakpoint.mobile ? 'navigationMobile' : 'navigation'">
    <v-list class="py-0">
      <v-list-item class="event-detail-image">
        <div class="image-container">
          <v-img
            v-if="selectedEventBanner || cachedBanner?.url"
            class="image"
            :src="selectedEventBanner || cachedBanner?.url">
          </v-img>

          <div
            v-else
            class="d-flex justify-center align-center"
            :style="{ margin: '0 auto', height: '100%', width: '100%' }">
            <v-progress-circular
              indeterminate
              color="primary"
              size="48"
              class="progress-circular" />
          </div>

          <!-- Botão de edição -->
          <v-btn
            v-if="canEditEvent"
            icon
            small
            color="white"
            class="edit-button"
            @click="showEditMenu">
            <v-icon>mdi-cog</v-icon>
          </v-btn>

          <!-- Menu de opções -->
          <v-menu
            v-model="showMenu"
            :position-x="menuX"
            :position-y="menuY"
            absolute
            offset-y>
            <v-list>
              <v-list-item @click="editEvent">
                <v-list-item-icon class="mr-2">
                  <v-icon>mdi-pencil</v-icon>
                </v-list-item-icon>
                <v-list-item-title>Editar evento</v-list-item-title>
              </v-list-item>

              <v-list-item v-if="canRequestPublication" @click="requestPublication">
                <v-list-item-icon class="mr-2">
                  <v-icon>mdi-rocket</v-icon>
                </v-list-item-icon>
                <v-list-item-title>Solicitar publicação</v-list-item-title>
              </v-list-item>

              <v-list-item>
                <v-list-item-icon class="mr-2">
                  <v-icon>mdi-content-copy </v-icon>
                </v-list-item-icon>
                <v-list-item-title>Duplicar evento</v-list-item-title>
              </v-list-item>

              <v-list-item @click="confirmCancelEvent">
                <v-list-item-icon class="mr-2">
                  <v-icon>mdi-delete </v-icon>
                </v-list-item-icon>
                <v-list-item-title>Cancelar evento</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
        </div>
      </v-list-item>

      <div v-for="(item, i) in getSidebar" :key="i" class="event-drawer-item">
        <v-tooltip v-if="$_miniVariant" right>
          <template #activator="{ on, attrs }">
            <v-list-item
              :to="item.to"
              router
              exact
              :class="{ 'active-item': item.to === currentPath }">
              <v-list-item-action v-if="item.icon" class="text-center">
                <v-icon
                  v-if="$route.meta.prefix === item.to || $route.path === item.to"
                  v-bind="attrs"
                  v-on="on"
                  >{{ item.iconActive }}</v-icon
                >

                <v-icon v-else v-bind="attrs" v-on="on">{{ item.icon }}</v-icon>
              </v-list-item-action>

              <v-list-item-content>
                <v-list-item-title> {{ item.title }} </v-list-item-title>
              </v-list-item-content>
            </v-list-item>
          </template>
          <span> {{ item.title }} </span>
        </v-tooltip>

        <v-list-item
          v-if="!$_miniVariant"
          :to="item.to"
          router
          exact
          :class="{ 'active-item': item.to === currentPath }">
          <v-list-item-action v-if="item.icon" class="text-center">
            <v-icon v-if="$route.meta.prefix === item.to || $route.path === item.to">{{
              item.iconActive
            }}</v-icon>
            <v-icon v-else>{{ item.icon }}</v-icon>
          </v-list-item-action>

          <v-list-item-content>
            <v-list-item-title>
              {{ item.title }}
            </v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </div>
    </v-list>

    <ConfirmDialog
      v-model="confirmationDialog.visible"
      :title="confirmationDialog.title"
      :message="confirmationDialog.message"
      confirm-text="Confirmar"
      :loading="isChangingStatus"
      @confirm="handleConfirmation"
      @cancel="confirmationDialog.visible = false" />
  </v-navigation-drawer>

  <v-select
    v-else-if="getSelectItems && isMobile"
    v-model="selectedItem"
    outlined
    dense
    return-object
    hide-details
    :items="getSelectItems" />
</template>

<script>
import { loading, eventGeneralInfo, toast } from '@/store';
import { eventsSideBar } from '@/utils/events-sidebar';
import { isMobileDevice } from '@/utils/utils';
import { checkMenuItemsPermissions } from '@/utils/permissions-util';

export default {
  props: {
    miniVariant: {
      type: Boolean,
      default: false,
    },

    drawer: {
      type: Boolean,
      default: false,
    },
  },

  data() {
    return {
      selectedItem: null,
      cachedBanner: null,
      showMenu: false,
      menuX: 0,
      menuY: 0,
      confirmationDialog: {
        visible: false,
        title: '',
        message: '',
      },
      isChangingStatus: false,
      filteredSidebar: [],
    };
  },

  computed: {
    canRequestPublication() {
      return (
        this.getEvent.status.name !== 'Publicado' &&
        this.getEvent.status.name !== 'Em análise'
      );
    },
    getEvent() {
      return eventGeneralInfo.$info;
    },

    isMobile() {
      return isMobileDevice(this.$vuetify);
    },

    canEditEvent() {
      return this.selectedEventBanner || this.cachedBanner?.url;
    },

    currentPath() {
      return this.$route.path;
    },

    currentRouteMetaName() {
      return this.$route.meta.name;
    },

    selectedEventBanner() {
      if (!this.getEvent) return this.cachedBanner?.url || null;

      const banner = this.getEvent.attachments.find(
        (attach) => attach.type === 'image' && attach.name === 'banner'
      );

      return banner && banner.url
        ? banner.url
        : require(`~/assets/images/default_banner.png`);
    },

    routerParams() {
      return this.$route.params;
    },

    isLoading() {
      return loading.$isLoading;
    },

    getSelectItems() {
      if (this.isLoading) return null;
      return this.filteredSidebar.map((item) => {
        return {
          text: item.title,
          value: item.to,
        };
      });
    },

    getSidebar() {
      if (this.isLoading) return null;
      return this.filteredSidebar;
    },

    getUsername() {
      return this.$cookies.get('username');
    },

    $_miniVariant: {
      get() {
        return this.miniVariant;
      },
      set(val) {
        this.$emit('change-miniVariant', val);
      },
    },

    $_drawer: {
      get() {
        return this.drawer;
      },
      set(val) {
        this.$emit('change-drawer', val);
      },
    },
  },

  watch: {
    currentPath: {
      immediate: true,
      handler() {
        if (!this.getSelectItems) return;
        const foundItem = this.getSelectItems.find(
          (item) => item.value === this.currentPath
        );
        if (foundItem) this.selectedItem = foundItem;
      },
    },

    selectedItem: {
      immediate: true,
      handler() {
        if (!this.selectedItem) return;

        if (this.currentPath !== this.selectedItem.value) {
          this.$router.push(this.selectedItem.value);
        }
      },
    },

    getSelectItems: {
      immediate: true,
      handler() {
        if (!this.getSelectItems) return;
        const foundItem = this.getSelectItems.find(
          (item) => item.value === this.currentPath
        );
        if (foundItem) this.selectedItem = foundItem;
      },
    },

    'getEvent.id': {
      handler(newId) {
        if (!newId) return;

        if (this.selectedEventBanner) {
          this.cachedBanner = {
            eventId: newId,
            url: this.selectedEventBanner,
          };
        }
        
        this.updateSidebar();
      },
    },
  },

  async mounted() {
    await this.updateSidebar();
  },

  methods: {
    async updateSidebar() {
      const eventId = this.routerParams.id;
      const userId = this.$cookies.get('user_id');
      const userRole = this.$cookies.get('user_role');

      if (!eventId || !userId || !userRole) {
        this.filteredSidebar = [];
        return;
      }

      // Mapear os itens do sidebar com os caminhos atualizados
      const items = eventsSideBar.map((item) => ({
        ...item,
        to: item.to.replace(':id', eventId),
      }));

      // Verificar todas as permissões de uma vez
      const permissionsResults = await checkMenuItemsPermissions(
        userRole,
        userId,
        items,
        eventId
      );

      // Filtrar os itens baseado nos resultados das permissões
      this.filteredSidebar = items.filter((_, index) => permissionsResults[index]);
    },

    async requestPublication() {
      const response = await eventGeneralInfo.updateEventStatus({
        eventId: this.getEvent.id,
        statusName: 'Em análise',
      });

      if (response.length > 0) {
        toast.setToast({
          text: 'Solicitação de publicação enviada com sucesso!',
          type: 'success',
          time: 5000,
        });
      } else {
        toast.setToast({
          text: 'Erro ao solicitar publicação!',
          type: 'error',
          time: 5000,
        });
      }
    },

    getCurrentBannerUrl() {
      if (!this.getEvent) return null;

      const banner = this.getEvent.attachments.find(
        (attach) => attach.type === 'image' && attach.name === 'banner'
      );

      return banner ? banner.url : require(`~/assets/images/default_banner.png`);
    },

    showEditMenu(e) {
      e.stopPropagation();
      this.menuX = e.clientX;
      this.menuY = e.clientY;
      this.showMenu = true;
    },

    editEvent() {
      this.showMenu = false;

      const eventId = this.routerParams.id;
      this.$router.push(`/events/${eventId}/edit`);
    },

    confirmCancelEvent() {
      this.showMenu = false;
      this.confirmationDialog = {
        visible: true,
        title: 'Cancelar Evento',
        message:
          'Tem certeza que deseja cancelar este evento? Esta ação não poderá ser desfeita.',
      };
    },

    async handleConfirmation() {
      this.confirmationDialog.visible = false;

      try {
        this.isChangingStatus = true;

        await eventGeneralInfo.updateEventStatus({
          eventId: this.getEvent.id,
          statusName: 'Cancelado',
        });

        this.isChangingStatus = false;

        toast.setToast({
          text: 'Evento cancelado com sucesso!',
          type: 'success',
          time: 5000,
        });

        await this.refresh();
      } catch (error) {
        console.error(error);
        this.isChangingStatus = false;

        toast.setToast({
          text: 'Falha ao cancelar o evento. Tente novamente.',
          type: 'danger',
          time: 5000,
        });
      }
    },

    async refresh() {
      try {
        await eventGeneralInfo.fetchEventInfo(this.getEvent.id);
      } catch (error) {
        console.error('Erro ao carregar evento:', error);
      }
    },
  },
};
</script>

<style scoped lang="scss">
.text-support {
  color: white;
}

.navigation {
  height: 100vh !important;
  top: 80px !important;
  background-color: var(--tertiary) !important;
  color: var(--black-text) !important;
  font-weight: 400 !important;
  font-size: 16px !important;
  font-family: var(--font-family) !important;
}

.navigationMobile {
  height: 105vh !important;
  top: 0px !important;
}

.active-item {
  background-color: var(--primary) !important;
  border-radius: 8px; 
  color: white;
  font-size: 16px !important;
  font-family: var(--font-family) !important;
}

.active-item::before {
  opacity: 0 !important;
}

.image-container {
  position: relative;
  max-width: 100%;
  max-height: 100%;
  width: 540px;
  height: auto;
}

.image {
  max-width: 100%;
  max-height: 100%;
  object-fit: cover;
  height: auto;
}

.edit-button {
  position: absolute;
  top: 8px;
  right: 8px;
  background-color: rgba(0, 0, 0, 0.5) !important;

  &:hover {
    background-color: rgba(0, 0, 0, 0.7) !important;
  }
}

.event-detail-image {
  margin: 0px;
  margin-bottom: 8px;
  padding: 0;
  overflow: hidden;
}

.event-drawer-item {
  padding-right: 8px;
  padding-left: 8px;
  margin-bottom: 2px;
}

.event-drawer-item:hover {
  background-color: var(--tertiary);
  border-radius: 8px;
}

.event-drawer-item a:hover {
  background-color: transparent;
}

.event-drawer-item a:hover::before {
  background-color: transparent;
  opacity: 0;
}
</style>
