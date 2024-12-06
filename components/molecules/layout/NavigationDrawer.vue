<template>
  <v-navigation-drawer
    v-if="getSidebar"
    v-model="$_drawer"
    :mini-variant="$_miniVariant"
    clipped
    app
    :class="$vuetify.breakpoint.mobile ? 'navigationMobile' : 'navigation'">
    <v-list>
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
import Vue from 'vue';
import { eventsSideBar } from '@/utils/events-sidebar';
import { monthlyMovementsSideBar } from '@/utils/monthly-movement-sidebar';

export default Vue.extend({
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

    getSidebar() {
      const routePath = this.currentPath;
      const routeMetaName = this.currentRouteMetaName;

      if (routeMetaName === 'event-id') {
        return eventsSideBar;
      } else if (routePath.startsWith('/monthly-movement')) {
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
});
</script>

<style scoped lang="scss">
.text-support {
  color: white;
}

.navigation {
  height: 100vh !important;
  top: 80px !important;
  background-color: #7c28c60d;
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
}

.active-item::before {
  opacity: 0 !important;
}
</style>
