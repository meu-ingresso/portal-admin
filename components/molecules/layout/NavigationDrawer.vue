<template>
  <v-navigation-drawer
    v-model="$_drawer"
    :mini-variant="$_miniVariant"
    clipped
    app
    :class="$vuetify.breakpoint.mobile ? 'navigationMobile' : 'navigation'">
    <v-list>
      <div v-for="(item, i) in getSidebar" :key="i">
        <v-tooltip v-if="$_miniVariant" right>
          <template #activator="{ on, attrs }">
            <v-list-item :to="item.to" router exact>
              <v-list-item-action class="text-center">
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

        <v-list-item v-if="!$_miniVariant" :to="item.to">
          <v-list-item-action class="text-center">
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
import { sidebar } from '@/utils/menu-sidebar';

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
    getSidebar() {
      const permissionPrefixes = this.getUserPermissions.map(
        (perm) => perm.module_prefix
      );

      return sidebar.filter((item) => {
        if (item.needPermissions) {
          const itemPrefix = item.to.slice(1);
          return permissionPrefixes.includes(itemPrefix);
        }
        return true;
      });
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
::v-deep {
  .theme--light.v-icon {
    color: var(--primary);
  }
}
.text-support {
  color: white;
}

.navigation {
  height: 105vh !important;
  top: 74px !important;
}

.navigationMobile {
  height: 105vh !important;
  top: 0px !important;
}
</style>
