<template>
  <v-tooltip bottom>
    <template #activator="{ on, attrs }">
      <v-chip
        outlined
        class="fee-badge ml-4 cursor-pointer"
        v-bind="attrs"
        v-on="on"
        @click="$emit('click')">
        <v-icon small color="grey darken-2"> mdi-percent-outline </v-icon>
      </v-chip>
    </template>
    <span> Taxa negociada: {{ fee }}% </span>
  </v-tooltip>
</template>

<script>
export default {
  props: {
    fee: {
      type: String,
      required: true,
    },
  },
};
</script>

<style scoped>
.fee-badge {
  border: 1px solid var(--black-text);
  padding: 8px 16px 8px 16px;
  gap: 10px;
  border-radius: 48px;
  width: 50px;
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
