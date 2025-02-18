<template>
  <div class="empty-state">
    <div class="empty-state-content">
      <v-icon size="64" color="grey lighten-1">{{ icon }}</v-icon>
      <h3 class="empty-state-title">{{ title }}</h3>
      <p class="empty-state-subtitle">{{ subtitle }}</p>
      <slot name="action"></slot>
    </div>
  </div>
</template>

<script>
export default {
  name: 'EmptyState',
  props: {
    title: {
      type: String,
      required: true,
    },
    subtitle: {
      type: String,
      required: true,
    },
    icon: {
      type: String,
      default: 'mdi-alert-circle-outline',
    },
  },
};
</script>

<style scoped>
.empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 48px 24px;
  border-radius: 8px;
  min-height: 300px;
}

.empty-state-content {
  text-align: center;
  max-width: 400px;
}

.empty-state-title {
  margin-top: 24px;
  margin-bottom: 8px;
  color: var(--black-text);
  font-size: 20px;
  font-weight: 600;
  font-family: var(--font-family);
}

.empty-state-subtitle {
  color: var(--grey-dark);
  font-size: 16px;
  line-height: 1.5;
  font-family: var(--font-family);
}
</style> 