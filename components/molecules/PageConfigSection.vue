<template>
  <v-card tile flat class="page-config-section mb-4">
    <!-- Header -->
    <v-card-text class="section-header pa-4">
      <v-row no-gutters align="center">
        <v-col cols="auto" class="d-flex align-center">
          <v-icon v-if="icon" class="mr-2" color="grey darken-1">{{ icon }}</v-icon>
          <div class="d-flex flex-column">
            <div class="text-subtitle-1 font-weight-medium">{{ title }}</div>
            <div v-if="subtitle" class="text-caption grey--text">{{ subtitle }}</div>
          </div>
        </v-col>
        <v-spacer></v-spacer>
        <v-col v-if="!isExpanded" cols="auto">
          <v-btn
            text
            color="primary"
            class="text-none font-weight-medium"
            @click="toggleExpand"
          >
            Editar
          </v-btn>
        </v-col>
      </v-row>
    </v-card-text>

    <!-- Expandable Content -->
    <v-expand-transition>
      <div v-show="isExpanded">
        <v-divider></v-divider>
        
        <v-card-text class="pa-4">
          <!-- Content Slot -->
          <slot></slot>
        </v-card-text>

        <!-- Actions -->
        <v-card-actions class="pa-4">
          <DefaultButton
            text="Cancelar"
            outlined
            is-text
            @click="handleCancel"
          />
          <v-spacer></v-spacer>
          <DefaultButton
            text="Salvar"
            :is-loading="loading"
            :disabled="disabled"
            @click="handleSave"
          />
        </v-card-actions>
      </div>
    </v-expand-transition>
  </v-card>
</template>

<script>
export default {
  props: {
    icon: {
      type: String,
      required: false,
      default: ''
    },
    title: {
      type: String,
      required: true
    },
    subtitle: {
      type: String,
      default: ''
    },
    loading: {
      type: Boolean,
      default: false
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },

  data() {
    return {
      isExpanded: false
    }
  },

  methods: {
    toggleExpand() {
      this.isExpanded = !this.isExpanded
    },

    handleSave() {
      this.$emit('save')
    },

    handleCancel() {
      this.isExpanded = false
      this.$emit('cancel')
    }
  }
}
</script>

<style scoped>
.page-config-section {
  border: 1px solid #e0e0e0 !important;
  border-radius: 8px !important;
}

.section-header {
  background-color: #fafafa;
}

@media (max-width: 600px) {
  .section-header {
    padding: 12px !important;
  }
}
</style> 