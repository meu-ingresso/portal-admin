<template>
  <v-chip outlined class="collaborators-badge ml-4">
    <v-icon left small color="grey darken-2">mdi-account-group</v-icon>

    <span>{{ count }} Colaboradores</span>
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
.collaborators-badge {
  border: 1px solid var(--black-text);
  padding: 8px 16px 8px 16px;
  gap: 10px;
  border-radius: 48px;
  width: 150px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--black-text);
  font-weight: 400;
  font-size: 16px;
  font-family: var(--font-family);
}
</style>
