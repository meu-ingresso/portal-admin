<template>
  <v-chip outlined class="promoters-badge ml-4">
    <v-icon left small color="grey darken-2">mdi-account-group</v-icon>
    <span>{{ count }} Promoters</span>
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
};
</script>

<style scoped>
.promoters-badge {
  border: 1px solid;
  display: flex;
  align-items: center;
  padding: 8px 16px 8px 16px;
  gap: 12px;
  border-radius: 36px;
  width: 150px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--black-text);
  font-size: 16px;
  font-family: var(--font-family);
}
</style>
