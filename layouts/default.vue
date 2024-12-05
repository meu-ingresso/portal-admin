<template>
  <v-app v-if="isValid">
    <v-app-bar
      color="white"
      clipped-left
      dense
      fixed
      app
      :class="isMobile ? 'headerMobile' : 'header'">
      <MenuLogo
        :mini-variant="miniVariant"
        :drawer="drawer"
        @change-drawer="changeDrawer"
        @change-miniVariant="changeMiniVariant" />

      <menu-chevron
        :mini-variant="miniVariant"
        :drawer="drawer"
        @change-mini-variant="changeMiniVariant"
        @change-drawer="changeDrawer" />

      <!-- NOME DA ROTA -->
      <span
        v-if="getRoute && !getRoute.meta.isEdit"
        :class="isMobile ? 'routeNameMobile' : 'routeName'"
        class="route">
        {{ getRoute.name }}
      </span>
      <!-- FIM NOME DA ROTA -->

      <v-spacer />

      <AccountMenu />
    </v-app-bar>

    <NavigationDrawer
      :mini-variant="miniVariant"
      :drawer="drawer"
      @change-mini-variant="changeMiniVariant"
      @change-drawer="changeDrawer" />

    <v-main>
      <v-container>
        <Nuxt />
      </v-container>
    </v-main>
  </v-app>
</template>

<script>
import Vue from 'vue';
import { isMobileDevice } from '@/utils/utils';

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
  },

  mounted() {
    if (!this.getUserLogged || !this.getUserToken || this.getUserToken === '') {
      this.$router.push('/login');
      return;
    } else {
      this.$set(this, 'isValid', true);
    }

    if (this.isMobile) {
      this.$set(this, 'drawer', false);
      this.$set(this, 'miniVariant', true);
    } else {
      this.$set(this, 'drawer', true);
      this.$set(this, 'miniVariant', true);
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

.headerMobile {
  height: 50px !important;
}

.header {
  height: 80px !important;
}
</style>
