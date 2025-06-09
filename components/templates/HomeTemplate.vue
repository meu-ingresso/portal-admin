<template>
  <v-container class="home-template py-10">
    <div class="home-template-title">{{ getTitle }}</div>

    <template v-if="!isLoadingEvents">
      <EventBannerList :events="events" />

      <v-row v-if="events.length > 0">
        <v-col cols="12" class="d-flex justify-center">
          <SeeMoreButton text="Ver mais eventos" :to="'/events'" />
        </v-col>
      </v-row>
      <v-row v-else>
        <v-col cols="12" class="d-flex justify-center">
          <EmptyState title="Nenhum evento cadastrado" subtitle="Quando criados, eles vão aparecer aqui">
            <template v-if="userHasPermission" #action>
              <DefaultButton text="Criar evento" icon="mdi-plus" class="mt-6" @click="handleCreateEvent" />
            </template>
          </EmptyState>
        </v-col>
      </v-row>
    </template>

    <template v-else>
      <v-row>
        <v-col v-for="n in 3" :key="n" cols="12" md="4" sm="12" class="d-flex justify-center">
          <v-skeleton-loader width="100%" type="card" />
        </v-col>
      </v-row>
    </template>
  </v-container>
</template>

<script>
export default {
  props: {
    events: { type: Array, required: true },
  },

  computed: {
    isLoadingEvents() {
      return this.$store.getters['event/$isLoading'];
    },

    getTitle() {
      const user = this.$store.state.auth.user;
      if (!user?.auth?.people) return 'Bem-vindo';

      const people = user.auth.people;
      const personType = people.person_type;

      let name = 'Usuário';
      if (personType === 'PF') {
        name = people.first_name || 'Usuário';
      } else {
        name = people.social_name || people.fantasy_name || 'Usuário';
      }

      return `Bem-vindo, ${name}`;
    },

    userRole() {
      return this.$store.state.auth.user?.auth?.role;
    },

    userHasPermission() {
      return this.userRole && (this.userRole.name === 'Admin' || this.userRole.name === 'Gerente');
    },
  },

  methods: {
    handleCreateEvent() {
      this.$router.push('/events/create');
    },
  },
};
</script>

<style scoped>
.home-template-title {
  font-size: 26px;
  font-weight: 700;
  margin-bottom: 20px;
  color: var(--black-text);
  font-family: var(--font-family-inter-bold);
}

@media (max-width: 360px) {
  .home-template-title {
    font-size: 16px;
  }
}

@media (min-width: 361px) and (max-width: 480px) {
  .home-template-title {
    font-size: 18px;
  }
}

.home-template {
  max-width: 1280px;
}
</style>
