<template>
  <v-row>
    <v-col v-for="stat in statistics" :key="stat.title" cols="3">
      <StatisticCard :title="stat.title" :value="stat.value" />
    </v-col>
  </v-row>
</template>

<script>
export default {
  props: {
    statistics: { type: Array, required: true },
  },
};
</script>
