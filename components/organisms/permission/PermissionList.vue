<template>
  <div class="container">
    <div v-if="$isLoading">
      <Lottie path="./animations/loading_ship.json" height="300" width="300" />
    </div>
    <div v-else>
      <v-data-table
        :headers="getHeaders"
        :items="getItems"
        class="elevation-1"
        hide-default-footer
        item-key="role_name"
        fixed-header>
        <template #[`item.role_name`]="{ item }">
          <v-tooltip top>
            <template #activator="{ on, attrs }">
              <span v-bind="attrs" v-on="on">{{ item.role_name }}</span>
              <br />
            </template>
            <span> {{ item.short_description }}</span>
          </v-tooltip>
        </template>

        <template
          v-for="permission in $permissionList"
          #[`item.${permission.id}`]="{ item }">
          <v-simple-checkbox
            :key="`${item.role_name}-${permission.id}`"
            v-model="item[permission.id]"
            color="primary"
            :disabled="isUpdating"
            @input="onPermissionChange(permission.id, item.role_name)" />
        </template>
      </v-data-table>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { loading, role, permission, rolePermission } from '@/store';
import { isMobileDevice } from '@/utils/utils';
import { capitalizeFirstLetters } from '@/utils/formatters';

export default Vue.extend({
  data() {
    return {
      isLoadingGrid: true,
      selectedPermissions: {},
      isUpdating: false,
    };
  },

  computed: {
    getUserId() {
      return this.$cookies.get('user_id');
    },

    $isLoading() {
      return loading.$isLoading;
    },

    $permissionList() {
      return permission.$permissionList;
    },

    $roleList() {
      return role.$roleList;
    },

    $rolePermissionList() {
      return rolePermission.$rolePermissionList;
    },

    isMobile() {
      return isMobileDevice(this.$vuetify);
    },

    getHeaders() {
      return [
        {
          text: '',
          value: 'role_name',
          sortable: false,
          width: '10rem',
        },
        ...this.$permissionList.map((permission) => ({
          text: permission.module_name,
          value: permission.id,
          sortable: false,
          width: '10rem',
        })),
      ];
    },

    getItems() {
      return this.$roleList.map((role) => ({
        role_name: role.name,
        short_description: role.short_description,
        ...this.$permissionList.reduce((acc, permission) => {
          acc[permission.id] =
            this.selectedPermissions[permission.id]?.[role.id] || false;
          return acc;
        }, {}),
      }));
    },
  },

  async mounted() {
    loading.setIsLoading(true);

    await Promise.all([role.getAll(), permission.getAll(), rolePermission.getAll()]);

    if (this.$rolePermissionList && this.$rolePermissionList.length) {
      this.$permissionList.forEach((permission) => {
        this.selectedPermissions[permission.id] = {};
        this.$roleList.forEach((role) => {
          const rolePermissionExists = this.$rolePermissionList.some(
            (rolePermission) =>
              rolePermission.permission_id === permission.id &&
              rolePermission.role_id === role.id
          );

          this.selectedPermissions[permission.id][role.id] = rolePermissionExists;
        });
      });
    }

    loading.setIsLoading(false);
  },

  methods: {
    capitalizeLetters(value: string): string {
      return capitalizeFirstLetters(value);
    },

    async onPermissionChange(permissionId, roleName) {
      const role = this.$roleList.find((role) => role.name === roleName);

      this.$set(this, 'isUpdating', true);

      const rolePermissionExists = this.$rolePermissionList.find(
        (item: any) => item.permission_id === permissionId && item.role_id === role.id
      );

      if (rolePermissionExists) {
        await rolePermission.update({ id: rolePermissionExists.id });
      } else {
        await rolePermission.create({ permission_id: permissionId, role_id: role.id });
      }

      await rolePermission.getAll();
      this.$set(this, 'isUpdating', false);
    },
  },
});
</script>

<style scoped></style>
