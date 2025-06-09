<template>
  <v-menu bottom offset-y>
    <template #activator="{ on, attrs }">
      <span v-bind="attrs" v-on="on">
        <div :class="isMobile ? '' : 'avatar'">
          <v-avatar color="grey" :size="isMobile ? '32' : '48'">
            <div class="white--text">
              {{ getInitials(getUsername) }}
            </div>
          </v-avatar>
          <v-icon class="chevronDown"> mdi-chevron-down </v-icon>
        </div>
      </span>
    </template>

    <v-list>
      <v-list-item>
        <v-list-item-title class="account-menu-items cursor-pointer" @click="userEdit(getUserId)">
          <v-icon> mdi-account </v-icon>
          {{ getUsername }}
        </v-list-item-title>
      </v-list-item>
      <v-list-item>
        <v-list-item-title class="account-menu-items cursor-pointer" @click="onLogout">
          <v-icon> mdi-logout </v-icon>
          Sair
        </v-list-item-title>
      </v-list-item>
    </v-list>
  </v-menu>
</template>

<script lang="ts">
import Vue from 'vue';

import { isMobileDevice } from '@/utils/utils';

export default Vue.extend({
  computed: {
    getUsername() {
      const user = this.$store.state.auth.user;
      if (!user?.auth?.people) return 'Sem nome';

      const people = user.auth.people;
      const personType = people.person_type;

      if (personType === 'PF') {
        const fullName = `${people.first_name} ${people.last_name}`;
        return fullName !== 'null null' ? fullName : 'Sem nome';
      } else {
        const fullName = `${people.social_name} ${people.fantasy_name}`;
        return fullName !== 'null null' ? fullName : 'Sem nome';
      }
    },

    getPhoto() {
      return '';
    },

    getUserId(): string {
      return this.$store.state.auth.user?.auth?.id || '';
    },

    isMobile() {
      return isMobileDevice(this.$vuetify);
    },
  },

  methods: {
    userEdit(id: string): void {
      this.$router.push(`/user/profile/${id}`);
    },

    getInitials(name) {
      const names = name.split(' ');
      const firstInitial = names[0][0];
      const lastInitial = names[names.length - 1][0];

      return firstInitial + lastInitial;
    },

    async onLogout() {
      try {
        await this.$auth.logout();
        this.$router.replace('/login');
      } catch (error) {
        // console.error('Erro no logout:', error);
        this.$router.replace('/login');
      }
    },
  },
});
</script>

<style scoped>
.cursor-pointer {
  cursor: pointer;
}

v::deep.theme--light.v-icon {
  color: var(--black) !important;
}

.chevronDown {
  margin-left: -5px;
  color: white;
}
</style>
