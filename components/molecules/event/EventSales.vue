<template>
  <v-row class="mb-4">
    <v-col cols="12">
      <div class="event-sales-title">Suas Vendas</div>
    </v-col>

    <v-col v-for="sale in sales" :key="sale.title" cols="12" xl="4" lg="4" md="6" sm="12">
      <SalesCard :title="sale.title" :value="sale.value" />
    </v-col>
  </v-row>
</template>

<script>
export default {
  props: {
    sales: { type: Array, required: true },
  },
};
</script>
<style scoped>
.event-sales-title {
  font-size: 40px;
  font-weight: 700;
  color: var(--black-text);
  font-family: var(--font-family-poppins-bold);
}

@media (max-width: 360px) {
  .event-sales-title {
    font-size: 16px;
  }
}

@media (min-width: 361px) and (max-width: 480px) {
  .event-sales-title {
    font-size: 18px;
  }
}
</style>
