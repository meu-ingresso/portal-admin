<template>
  <v-container class="home-template">
    <div class="home-template-title">{{ getTitle }}</div>
    <EventCardList :events="events" />

    <v-row>
      <v-col cols="12" class="d-flex justify-center">
        <SeeMoreButton text="Ver mais eventos" :to="'/events'" />
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  props: {
    events: { type: Array, required: true },
  },
  computed: {
    getTitle() {
      return 'Bem-vindo, ' + this.$cookies.get('username');
    },
  },
};
</script>
<style scoped>
.home-template-title {
  font-size: 40px;
  font-weight: 700;
  margin-bottom: 20px;
  color: var(--black-text);
  font-family: var(--font-family-poppins-bold);}
.home-template {
  max-width: 1280px;
}
</style>