<template>
  <v-chip outlined class="promoters-badge" color="grey lighten-4">
    <v-icon left small color="grey darken-2">mdi-account-group</v-icon>
    <span>{{ formattedCount }} Promoters</span>
  </v-chip>
</template>

<script>
export default {
  props: {
    count: {
      type: Number,
      required: true,
    },
  },
  computed: {
    formattedCount() {
      return this.count.toString().padStart(2, '0');
    },
  },
};
</script>

<style scoped>
.promoters-badge {
  display: flex;
  align-items: center;
  padding: 8px 16px 8px 16px;
  gap: 12px;
  border-radius: 38px 0px 0px 0px;
}
</style>
