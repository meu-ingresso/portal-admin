<!-- eslint-disable vue/no-mutating-props -->
<template>
  <v-card>
    <v-card-text class="text--primary">
      <v-row>
        <v-col cols="1" md="1">
          <v-avatar :color="user.is_active ? 'grey' : 'red'" size="48">
            <div class="white--text">{{ getInitials(getUserName) }}</div>
          </v-avatar>
        </v-col>

        <v-col
          cols="8"
          md="8"
          class="mt-1 userInfos"
          :class="$vuetify.breakpoint.mobile ? 'ml-4' : 'ml-4'">
          <v-tooltip top>
            <template #activator="{ on, attrs }">
              <span
                v-bind="attrs"
                class="nameTitle"
                :class="user.is_active ? '' : 'inactive'"
                v-on="on"
                >{{ getUserName }}</span
              >
              <br />
            </template>
            <span> {{ user.email }}</span>
          </v-tooltip>

          <span v-if="user.is_active" class="nameSubtitle">{{ user.role.name }}</span>
          <span v-else class="nameSubtitle inactive"> INATIVO </span>
        </v-col>

        <v-spacer />

        <v-col cols="2" align="end">
          <v-icon
            class="chevronDown cursor-pointer"
            size="30"
            @click="isCollapsed = !isCollapsed">
            {{ isCollapsed ? 'mdi-chevron-down' : 'mdi-chevron-up' }}
          </v-icon>
        </v-col>
      </v-row>
    </v-card-text>

    <v-card-actions v-if="!isCollapsed">
      <v-row>
        <v-col cols="12" class="pl-6 pr-6 pt-2 pb-2 cardActions">
          <nuxtLink :to="`/user/edit/${user.id}`">
            <div class="cardButtons">
              <v-icon size="25" class="cardIcons">mdi-pencil</v-icon>
              <span class="actionTitle">Detalhes</span>
            </div>
          </nuxtLink>
        </v-col>

        <v-col cols="12" class="pl-6 pr-6 pt-2 pb-2 cardActions">
          <div class="cardButtons">
            <v-icon size="25" class="cardIcons">mdi-lock</v-icon>
            <span class="actionTitle">Alterar Senha</span>
          </div>
        </v-col>

        <v-col cols="12" class="pl-6 pr-6 pt-2 pb-2 cardActions">
          <div class="cardButtons">
            <v-switch v-model="user.is_active" label="Status" inset hide-details />
          </div>
        </v-col>

        <v-col cols="12" class="ma-0 pt-2 pb-2" />
      </v-row>
    </v-card-actions>
  </v-card>
</template>

<script lang="ts">
import Vue from 'vue';
export default Vue.extend({
  props: {
    user: {
      type: Object,
      default: () => {},
    },
  },
  data() {
    return {
      isCollapsed: true,
    };
  },

  computed: {
    getPhoto() {
      return '';
    },

    getUserName() {
      return this.user.first_name + ' ' + this.user.last_name;
    },
  },

  methods: {
    getInitials(name) {
      if (!name || name === '') return '';
      const names = name.split(' ');
      const firstInitial = names[0][0];
      const lastInitial = names[names.length - 1][0];
      return firstInitial + lastInitial;
    },

    changeCollapse() {
      this.isCollapsed = !this.isCollapsed;
    },

    userEdit(this: any, id: string): void {
      this.$router.replace('/user/edit/' + id);
    },
  },
});
</script>

<style scoped>
.chevronDown {
  background-color: var(--beige);
}

.cardButtons {
  width: 100%;
  border: solid 1px var(--gray3);
  height: 56px;
  padding: 12px 16px;
  justify-content: space-between;
  border-radius: 9px;
}

.cardActions,
.actionTitle,
.cardIcons {
  color: var(--primary) !important;
}

.actionTitle {
  font-size: 16px;
}

.nameTitle,
.nameSubtitle {
  margin-left: 10px;
}

.nameTitle {
  color: var(--black);
  font-size: 16px;
  font-style: normal;
  font-weight: 600;
  line-height: 100%;
  width: 100%;
}

.userInfos {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 100%;
}

.nameSubtitle {
  color: #868686;
  font-size: 14px;
  font-style: normal;
  font-weight: 400;
  line-height: 100%;
  width: 100%;
}

.inactive {
  color: var(--red) !important;
}
</style>
