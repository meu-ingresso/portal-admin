<template>
  <v-app v-if="isValid">
    <NavigationDrawer
      :mini-variant="miniVariant"
      :drawer="drawer"
      @change-mini-variant="changeMiniVariant"
      @change-drawer="changeDrawer" />

    <v-app-bar
      color="primary"
      clipped-left
      dense
      fixed
      app
      :class="isMobile ? 'headerMobile' : 'header'">
      <div class="header-content">
        <MenuLogo
          class="header-img"
          :click-to-home="true"
          :mini-variant="miniVariant"
          :drawer="drawer"
          @change-drawer="changeDrawer"
          @change-miniVariant="changeMiniVariant" />

        <div class="content-menus">
          <div v-for="(item, index) in topBarItems" :key="index" class="topbar-item">
            <v-btn :to="item.to" class="topbar-button" :title="item.title" depressed plain tile>
              <v-icon left>{{ item.icon }}</v-icon> {{ item.title }}
            </v-btn>
          </div>
        </div>

        <v-spacer />

        <AccountMenu />
      </div>
    </v-app-bar>

    <v-main>
      <v-container>
        <Nuxt />
      </v-container>
    </v-main>
  </v-app>
</template>

<script>
import Vue from 'vue';
import { auth } from '@/store';
import { isMobileDevice } from '@/utils/utils';
import { defaultTopBar } from '@/utils/default-topbar';
import { eventTopBar } from '@/utils/event-topbar';

export default Vue.extend({
  name: 'LayoutDefault',
  middleware: 'auth',

  data() {
    return {
      drawer: false,
      miniVariant: true,
      isValid: false,
    };
  },

  computed: {
    getRoute() {
      return this.$route;
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

    currentPath() {
      return this.$route.path;
    },

    topBarItems() {
      const routePath = this.currentPath;

      if (routePath.startsWith('/events')) {
        return eventTopBar;
      }

      return defaultTopBar;
    },
  },

  mounted() {
    if (!this.getUserLogged || !this.getUserToken || this.getUserToken === '') {
      auth.login({ email: 'viniciusadrianomachado@gmail.com' });
      return;
    } else {
      this.$set(this, 'isValid', true);
    }

    if (this.isMobile) {
      this.$set(this, 'drawer', false);
      this.$set(this, 'miniVariant', true);
    } else {
      this.$set(this, 'drawer', true);
      this.$set(this, 'miniVariant', false);
    }
  },

  methods: {
    changeMiniVariant(value) {
      this.$set(this, 'miniVariant', value);
    },

    changeDrawer(value) {
      this.$set(this, 'drawer', value);
    },
  },
});
</script>

<style scoped>
.route {
  color: var(--black);
  font-size: 20px;
  font-style: normal;
  font-weight: 600;
  line-height: 100%;
}

.routeName {
  margin-left: 30px;
  margin-top: 30px;
}

.routeNameMobile {
  margin-left: 30px;
  margin-top: 0px;
}

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
</style>
