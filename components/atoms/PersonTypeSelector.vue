<template>
  <div class="mb-6">
    <v-btn-toggle
      v-model="localValue"
      mandatory
      class="person-type-toggle d-flex flex-column flex-sm-row"
      @change="updateValue"
    >
      <v-btn
        value="PF"
        small
        class="person-type-btn flex-grow-1 pa-2"
        :outlined="localValue !== 'PF'"
        :color="localValue === 'PF' ? 'primary' : ''"
      >
        <div class="d-flex flex-column align-center">
          <v-icon size="24" :color="localValue === 'PF' ? 'white' : 'primary'">mdi-account</v-icon>
          <span class="text-h6" :class="{'white--text': localValue === 'PF'}">Pessoa Física</span>
        </div>
      </v-btn>
      
      <v-btn
        value="PJ"
        small
        class="person-type-btn flex-grow-1 pa-2"
        :outlined="localValue !== 'PJ'"
        :color="localValue === 'PJ' ? 'primary' : ''"
      >
        <div class="d-flex flex-column align-center">
          <v-icon size="24" :color="localValue === 'PJ' ? 'white' : 'primary'">mdi-domain</v-icon>
          <span class="text-h6" :class="{'white--text': localValue === 'PJ'}">Pessoa Jurídica</span>
        </div>
      </v-btn>
    </v-btn-toggle>
  </div>
</template>

<script>
export default {
  props: {
    modelValue: {
      type: String,
      required: true
    }
  },
  emits: ['update:modelValue'],
  data() {
    return {
      localValue: this.modelValue
    };
  },
  watch: {
    modelValue(newValue) {
      this.localValue = newValue;
    }
  },
  methods: {
    updateValue(value) {
      this.$emit('update:modelValue', value);
    }
  }
}
</script>

<style scoped>
.person-type-toggle {
  border-radius: 8px;
  overflow: hidden;
  width: 100%;
}

.person-type-btn {
  border-radius: 0;
  height: auto !important;
  transition: all 0.3s ease;
}

@media (max-width: 599px) {
  .person-type-btn:first-child {
    border-bottom: 1px solid rgba(0, 0, 0, 0.12);
  }
}

@media (min-width: 600px) {
  .person-type-btn:first-child {
    border-right: 1px solid rgba(0, 0, 0, 0.12);
  }
}
</style> 