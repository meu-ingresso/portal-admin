<template>
  <div v-if="!isLoading">
    <v-row class="pa-5">
      <v-col class="pr-1" cols="12" md="3">
        <v-text-field
          v-model="$user.first_name"
          :rules="[validationRequired]"
          label="Primeiro Nome*"
          dense
          outlined
          type="text"
          hide-details="auto" />
      </v-col>
      <v-col class="pr-1" cols="12" md="3">
        <v-text-field
          v-model="$user.last_name"
          :rules="[validationRequired]"
          label="Sobrenome*"
          dense
          outlined
          type="text"
          hide-details="auto" />
      </v-col>
      <v-col class="pr-1" cols="12" md="3">
        <v-text-field
          v-model="$user.email"
          :rules="[validationEmail]"
          label="E-mail*"
          dense
          outlined
          type="email"
          hide-details="auto" />
      </v-col>
      <v-col class="pr-1" cols="12" md="3">
        <v-text-field
          v-model="$user.password"
          :rules="!isEditing ? [validationRequired] : []"
          label="Senha*"
          dense
          outlined
          :type="showPassword ? 'text' : 'password'"
          :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
          hide-details="auto"
          @click:append="showPassword = !showPassword" />
      </v-col>
      <v-col class="pr-1" cols="12" md="3">
        <v-text-field
          :value="formatCellphone($user.cellphone)"
          label="Celular*"
          :rules="!isEditing ? [validationRequired] : []"
          dense
          outlined
          type="text"
          hide-details="auto"
          @change="
            ($event) => {
              $user.cellphone = $event;
            }
          " />
      </v-col>

      <v-col v-if="getAdmin" class="pr-1" cols="12" md="3">
        <v-text-field
          v-model="$user.id_erp"
          label="ID HeadCargo"
          dense
          outlined
          type="text"
          hide-details="auto" />
      </v-col>

      <v-col v-if="getAdmin" class="pr-1" cols="12" md="3">
        <v-autocomplete
          v-model="$user.hiring_mode"
          :rules="[validationRequired]"
          :items="hiringItems"
          label="Modelo de Contratação"
          hide-details="auto"
          dense
          outlined
          :search-input.sync="searchInput.hiringModes"
          @input="searchInput.hiringModes = null" />
      </v-col>

      <v-col v-if="getAdmin" class="pr-1" cols="12" md="3">
        <v-autocomplete
          v-model="$user.role_id"
          :items="getRoles"
          :rules="[validationRequired]"
          label="Cargo*"
          hide-details="auto"
          dense
          outlined
          :search-input.sync="searchInput.roles"
          @input="searchInput.roles = null" />
      </v-col>

      <v-col v-if="getAdmin" class="pr-1" cols="12" md="6">
        <v-autocomplete
          v-if="!isLoading"
          v-model="$user.sellers"
          :items="getUserList"
          label="Vendedores*"
          hide-details="auto"
          multiple
          dense
          outlined
          :search-input.sync="searchInput.sellers"
          @input="searchInput.sellers = null" />
      </v-col>

      <v-col v-if="getAdmin" cols="12" md="3">
        <v-switch v-model="$user.is_active" label="Status" inset hide-details />
      </v-col>
    </v-row>
  </div>

  <div v-else>
    <Loading />
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { user, toast, role } from '@/store';
import { onFormatCellphone } from '@/utils/formatters';

export default Vue.extend({
  props: {
    isEditing: {
      type: Boolean,
      default: false,
    },
  },

  data: () => ({
    searchInput: {
      hiringModes: null,
      roles: null,
      sellers: null,
    },
    valid: true,
    options: {},
    menu: false,
    isLoading: false,
    showPassword: false,
    hiringItems: ['CLT', 'PJ'],
  }),

  computed: {
    $user(): any {
      return user.$user;
    },

    getAdmin() {
      return this.$cookies.get('user_role') === 'Administrador';
    },

    getUserId() {
      return this.$cookies.get('user_id');
    },

    getRoles() {
      return role.$roleList.map((item: any) => ({
        value: item.id,
        text: item.name,
      }));
    },

    getUserList() {
      return user.$userList
        .filter((item: any) => item.id !== user.$user.id && item.is_active)
        .map((item: any) => ({
          value: item.id,
          text: item.first_name + ' ' + item.last_name,
        }));
    },

    getSellers() {
      return this.$cookies.get('sellers');
    },

    isMultiTenant() {
      return (
        this.$cookies.get('user_role') === 'Administrador' ||
        this.$cookies.get('user_role') === 'Coordenador/Gestor' ||
        this.$cookies.get('user_role') === 'Diretoria'
      );
    },
  },

  async mounted() {
    this.$set(this, 'isLoading', true);

    await Promise.all([
      role.getAll(),

      user.getUsers({
        page: 1,
        limit: 99999999,
        search: this.search,
        sortBy: ['first_name'],
        sortDesc: [false],
      }),
    ]);

    if (this.$user.groupMainUser) {
      this.$user.sellers = this.getUserList.filter((item: any) =>
        this.$user.groupMainUser.map((seller: any) => seller.user_id).includes(item.value)
      );
    }

    this.$set(this, 'isLoading', false);
  },

  methods: {
    copyToClipboard(text) {
      navigator.clipboard.writeText(text);

      toast.setToast({
        text: 'Link copiado para área de transferência.',
        type: 'success',
        time: 2000,
      });
    },

    formatCellphone(value: string): String {
      return onFormatCellphone(value);
    },

    validationRequired(value: any): Boolean | String {
      if ((value && value.length === 0) || value === 0) {
        return 'Campo Obrigatório.';
      }
      return !!value || 'Campo Obrigatório.';
    },

    validationEmail(value: any): Boolean | String {
      const emailRegex =
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

      if (!emailRegex.test(value)) {
        return 'O formato do e-mail não é válido.';
      }
      return !!value || 'O formato do e-mail não é válido.';
    },
  },
});
</script>

<style scoped lang="scss">
::v-deep {
  .v-input--selection-controls {
    margin-top: 0px !important;
  }
}
</style>
