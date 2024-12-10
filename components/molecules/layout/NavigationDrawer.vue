<template>
  <v-navigation-drawer
    v-if="getSidebar"
    v-model="$_drawer"
    :mini-variant="$_miniVariant"
    clipped
    app
    :class="$vuetify.breakpoint.mobile ? 'navigationMobile' : 'navigation'">
    <v-list class="py-0">
      <v-list-item v-if="inEventDetail" class="event-detail-image">
        <v-img :src="selectedEventBanner"></v-img>
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
          :class="{ 'active-item': item.to === currentPath }">
          <v-list-item-action v-if="item.icon" class="text-center">
            <v-icon v-if="$route.meta.prefix === item.to || $route.path === item.to">{{
              item.iconActive
            }}</v-icon>
            <v-icon v-else>{{ item.icon }}</v-icon>
          </v-list-item-action>

          <v-list-item-content>
            <v-list-item-title v-text="item.title" />
          </v-list-item-content>
        </v-list-item>
      </div>
    </v-list>
  </v-navigation-drawer>
</template>

<script>
import { event } from '@/store';
import { eventsSideBar } from '@/utils/events-sidebar';
import { monthlyMovementsSideBar } from '@/utils/monthly-movement-sidebar';

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

  computed: {
    currentPath() {
      return this.$route.path;
    },

    currentRouteMetaName() {
      return this.$route.meta.name;
    },

    inEventDetail() {
      return this.currentRouteMetaName.startsWith('eventsDetails');
    },

    selectedEventBanner() {
      const selectedEvent = event.$selectedEvent;
      if (!selectedEvent) return null;

      const banner = selectedEvent.attachments.find(
        (attach) => attach.type === 'image' && attach.name === 'banner'
      );
      return banner ? banner.image_url : '';
    },

    routerParams() {
      return this.$route.params;
    },

    getSidebar() {
      const routePath = this.currentPath;
      const routeMetaName = this.currentRouteMetaName;

      if (routeMetaName.startsWith('eventsDetails')) {
        const eventId = this.routerParams.id;

        return eventsSideBar.map((item) => {
          if (item.to === '/events/:id') {
            return {
              ...item,
              to: `/events/${eventId}`,
            };
          } else if (item.to === '/events/:id/tickets') {
            return {
              ...item,
              to: `/events/${eventId}/tickets`,
            };
          }

          return item;
        });
      } else if (routePath.startsWith('/reports')) {
        return monthlyMovementsSideBar;
      }

      return null;
    },

    getUsername() {
      return this.$cookies.get('username');
    },

    getUserPermissions() {
      return this.$cookies.get('user_permissions');
    },

    getUserId() {
      return this.$cookies.get('user_id');
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

  methods: {},
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

.event-detail-image {
  margin: 8px;
  padding: 0;
}
</style>
