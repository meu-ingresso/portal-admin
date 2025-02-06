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
            </v-list>
          </v-menu>
        </div>
      </v-list-item>

      <div v-for="(item, i) in getSidebar" :key="i">
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
  </v-navigation-drawer>

  <v-select
    v-else-if="getSelectItems && isMobile"
    v-model="selectedItem"
    outlined
    return-object
    hide-details
    :items="getSelectItems" />
</template>

<script>
import { loading } from '@/store';
import { eventsSideBar } from '@/utils/events-sidebar';
import { isMobileDevice } from '@/utils/utils';

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
    eventData: {
      type: Object,
      default: null,
    },
  },

  data() {
    return {
      selectedItem: null,
      cachedBanner: null,
      showMenu: false,
      menuX: 0,
      menuY: 0,
    };
  },

  computed: {
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
      if (!this.eventData) return this.cachedBanner?.url || null;

      const banner = this.eventData.attachments.find(
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
      return this.getSidebar.map((item) => {
        return {
          text: item.title,
          value: item.to,
        };
      });
    },

    getSidebar() {
      if (this.isLoading) return null;

      const eventId = this.routerParams.id;

      return eventsSideBar.map((item) => {
        return {
          ...item,
          to: item.to.replace(':id', eventId),
        };
      });
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

    'eventData.id': {
      handler(newId) {
        if (!newId) return;

        if (this.selectedEventBanner) {
          this.cachedBanner = {
            eventId: newId,
            url: this.selectedEventBanner,
          };
        }
      },
    },
  },

  methods: {
    getCurrentBannerUrl() {
      if (!this.eventData) return null;

      const banner = this.eventData.attachments.find(
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
  font-display: var(--font-family-poppins-bold) !important;
}

.navigationMobile {
  height: 105vh !important;
  top: 0px !important;
}

.active-item {
  background-color: var(--primary) !important;
  border-top-right-radius: 38px;
  border-bottom-right-radius: 38px;
  color: white;
  font-size: 16px !important;
  font-display: var(--font-family-poppins-bold) !important;
}

.active-item::before {
  opacity: 0 !important;
}

.image-container {
  position: relative;
  width: 100%;
  height: 100%;
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
  margin: 8px;
  padding: 0;
  height: 200px;
  overflow: hidden;

  .v-image {
    height: 100%;
    width: 100%;
    object-fit: cover;
  }
}
</style>
