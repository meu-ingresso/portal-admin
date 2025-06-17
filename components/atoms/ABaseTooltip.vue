<template>
  <v-tooltip 
    :bottom="position === 'bottom'"
    :top="position === 'top'"
    :left="position === 'left'"
    :right="position === 'right'"
    :content-class="contentClass"
  >
    <template #activator="{ on, attrs }">
      <div v-bind="attrs" v-on="on">
        <slot />
      </div>
    </template>
    <span>{{ text }}</span>
  </v-tooltip>
</template>

<script>
export default {
  name: 'ABaseTooltip',
  
  props: {
    text: {
      type: String,
      required: true
    },
    position: {
      type: String,
      default: 'bottom',
      validator: (value) => ['top', 'bottom', 'left', 'right'].includes(value)
    },
    variant: {
      type: String,
      default: 'card',
      validator: (value) => ['card', 'default', 'left-aligned'].includes(value)
    }
  },
  
  computed: {
    contentClass() {
      return this.variant === 'card' ? 'base-tooltip-card' : '';
    }
  }
}
</script>

<style lang="scss">
.base-tooltip-card {
  background-color: white !important;
  border-radius: 8px !important;
  padding: 12px !important;
  max-width: 220px !important;
  box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.15) !important;
  color: rgba(76, 87, 108, 1) !important;
  font-size: 12px !important;
  line-height: 1.4 !important;
  text-align: center !important;
}
</style> 