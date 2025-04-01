<template>
  <v-dialog
    v-model="dialog"
    max-width="500px"
    persistent
  >
    <v-card>
      <v-card-title class="d-flex justify-space-between align-center">
        <span class="modalTitle">Limpar Check-ins</span>
        <v-btn icon @click="close">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <v-card-text>
        <p class="mb-4">Utilize este recurso para desfazer em massa os check-ins realizados no evento.</p>

        <v-radio-group v-model="clearMode" class="mt-0">
          <v-radio
            label="Limpar todos"
            value="all"
          >
            <template #label>
              <div>
                <div>Limpar todos</div>
                <div class="text-caption grey--text">
                  {{ allDescription }}
                </div>
              </div>
            </template>
          </v-radio>

          <v-radio
            :label="selectedLabel"
            value="selected"
          >
            <template #label>
              <div>
                <div>{{ selectedLabel }}</div>
                <div class="text-caption grey--text">
                  {{ selectedDescription }}
                </div>
              </div>
            </template>
          </v-radio>
        </v-radio-group>

        <div v-if="clearMode === 'selected'" class="mt-4">
          <AdvancedAutocomplete
            v-model="selectedItems"
            :items="items"
            :label="selectionPlaceholder"
            :item-text="itemText"
            :item-value="itemValue"
            :loading="loading"
          />
        </div>
      </v-card-text>

      <v-card-actions class="d-flex justify-space-between align-center py-3 px-6">
        <DefaultButton
          outlined
          :loading="processing"
          :disabled="!isValid"
          text="Cancelar"
          @click="close"
        />
        <DefaultButton
          :loading="processing"
          :disabled="!isValid"
          text="Continuar"
          @click="clearCheckins"
        />
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  props: {
    show: {
      type: Boolean,
      default: false
    },
    items: {
      type: Array,
      default: () => []
    },
    loading: {
      type: Boolean,
      default: false
    },
    mode: {
      type: String,
      default: 'tickets',
      validator: value => ['tickets', 'guests'].includes(value)
    },
    itemText: {
      type: String,
      default: 'name'
    },
    itemValue: {
      type: String,
      default: 'id'
    }
  },

  data() {
    return {
      dialog: false,
      clearMode: 'all',
      selectedItems: [],
      processing: false
    };
  },

  computed: {
    isValid() {
      if (this.clearMode === 'all') return true;
      return this.selectedItems.length > 0;
    },

    // Textos dinâmicos baseados no modo (ingressos ou convidados)
    allDescription() {
      return this.mode === 'tickets'
        ? 'Todos os check-ins de ingressos realizados até o momento serão perdidos'
        : 'Todos os check-ins de convidados realizados até o momento serão perdidos';
    },

    selectedLabel() {
      return this.mode === 'tickets'
        ? 'Limpar apenas alguns tipos de ingressos'
        : 'Limpar apenas algumas listas de convidados';
    },

    selectedDescription() {
      return this.mode === 'tickets'
        ? 'Os check-ins realizados nos tipos de ingressos selecionados serão perdidos'
        : 'Os check-ins realizados nas listas de convidados selecionadas serão perdidos';
    },

    selectionLabel() {
      return this.mode === 'tickets' ? 'Tipos de ingressos' : 'Listas de convidados';
    },

    selectionPlaceholder() {
      return this.mode === 'tickets'
        ? 'Selecione os tipos de ingressos'
        : 'Selecione as listas de convidados';
    }
  },

  watch: {
    show: {
      handler(val) {
        this.dialog = val;
      },
      immediate: true
    },
    
    dialog(val) {
      if (!val) {
        this.$emit('update:show', false);
        this.resetForm();
      }
    }
  },

  methods: {
    close() {
      this.dialog = false;
    },

    resetForm() {
      this.clearMode = 'all';
      this.selectedItems = [];
      this.processing = false;
    },

    clearCheckins() {
      try {
        this.processing = true;
        
        const payload = {
          mode: this.clearMode,
          type: this.mode,
          items: this.clearMode === 'selected' ? this.selectedItems : []
        };

        this.$emit('clear', payload);
        this.close();
      } catch (error) {
        console.error('Erro ao limpar check-ins:', error);
      } finally {
        this.processing = false;
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.v-radio {
  margin-top: 8px;
}
</style> 