<template>
  <v-menu bottom offset-y>
    <template #activator="{ on, attrs }">
      <span v-bind="attrs" v-on="on">
        <div :class="isMobile ? '' : 'avatar'">
          <v-avatar color="grey" :size="isMobile ? '32' : '48'">
            <div class="white--text">
              <template v-if="!isUpdatingUserName">
                {{ getInitials(getUsername) }}
              </template>
              <template v-else>
                <v-skeleton-loader type="avatar-circle" />
              </template>
            </div>
          </v-avatar>
          <v-icon class="chevronDown"> mdi-chevron-down </v-icon>
        </div>
      </span>
    </template>

    <v-list>
      <v-list-item>
        <v-list-item-title
          class="account-menu-items cursor-pointer"
          @click="userEdit(getUserId)">

          <template v-if="!isUpdatingUserName">
            <v-icon> mdi-account </v-icon>
            {{ getUsername }}
          </template>

          <template v-else>
            <v-skeleton-loader type="avatar-circle" />
          </template>

   
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
import { auth } from '@/store';
import { isMobileDevice } from '@/utils/utils';

export default Vue.extend({
  computed: {
    getUsername() {
      return this.$cookies.get('username');
    },

    getPhoto() {
      return '';
    },

    getUserId(): string {
      return this.$cookies.get('user_id');
    },

    isMobile() {
      return isMobileDevice(this.$vuetify);
    },

    isUpdatingUserName() {
      return auth.$isUpdatingUserName;
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

    onLogout() {
      auth.destroy();

      this.$router.replace('/login');
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
