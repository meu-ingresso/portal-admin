<template>
  <div v-if="hasPermission">
    <PermissionList />
  </div>

  <div v-else>
    <ValueNoExists text="Acesso negado" />
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { userHasPermissions } from '@/utils/utils';

export default Vue.extend({
  computed: {
    hasPermission() {
      return userHasPermissions(
        this.$cookies.get('user_permissions'),
        this.$route.meta.prefix.slice(1)
      );
    },
  },
});
</script>
