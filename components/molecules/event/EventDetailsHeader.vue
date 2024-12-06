<template>
  <div class="event-details-header">
    <div class="event-title-wrapper mb-2">
      <div class="event-title">{{ title }}</div>
      <v-icon>mdi-circle-small</v-icon>
      <StatusBadge :text="statusText" />
      <PromotersBadge :count="promoters"/>
    </div>

    <p>{{ location }}</p>
    <p>{{ formattedDate }}</p>
  </div>
</template>

<script>
import { formatDateTimeToBr } from '@/utils/formatters';
export default {
  props: {
    title: { type: String, required: true },
    statusText: { type: String, required: true },
    location: { type: String, required: true },
    date: { type: String, required: true },
    promoters: { type: Number, required: true },
  },
  computed: {
    formattedDate() {
      return formatDateTimeToBr(this.date);
    },
  },
};
</script>

<style scoped>
.event-details-header {
  margin-bottom: 24px;
}
.event-title-wrapper {
  display: flex;
  align-items: center;
}

.event-title {
  font-size: 40px;
  color: var(--black-text);
  font-family: var(--font-family-inter-bold);    
}
</style>
