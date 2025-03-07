<template>
  <div class="advanced-autocomplete">
    <v-autocomplete
      v-model="selectedItems"
      :items="items"
      :label="label"
      multiple
      chips
      outlined
      dense
      :item-text="itemText"
      :item-value="itemValue"
      return-object
      :loading="loading"
      :search-input.sync="search"
      clearable
      menu-props="auto"
      :filter="customFilter"
    >
      <template #prepend-item>
        <v-list-item ripple @click="toggleSelectAll">
          <v-list-item-action class="mr-2">
            <v-icon color="primary">
              {{ icon }}
            </v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title> Todos </v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-divider></v-divider>
      </template>
      
      <template #selection="{ item, index }">
        <v-chip
          v-if="index < 3"
          small
          close
          @click:close="removeItem(item)"
        >
          <span>{{ getItemText(item) }}</span>
        </v-chip>
        <span
          v-if="index === 3"
          class="grey--text text-caption pl-2"
        >
          (+{{ selectedItems.length - 3 }} {{ moreLabel }})
        </span>
      </template>

      <template #item="{ item }">
        <v-list-item
          
          :class="{'selected-item': isSelected(item)}"
          @click.stop="toggleItem(item)"
        >
          <v-list-item-action class="mr-2">
            <v-checkbox
              :input-value="isSelected(item)"
              color="primary"
              @click.stop="onCheckboxClick($event, item)"
            ></v-checkbox>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title :class="{'font-weight-medium': isSelected(item)}">
              {{ getItemText(item) }}
            </v-list-item-title>
            <v-list-item-subtitle v-if="getItemSubtitle(item)">
              {{ getItemSubtitle(item) }}
            </v-list-item-subtitle>
          </v-list-item-content>
        </v-list-item>
      </template>
    </v-autocomplete>
  </div>
</template>

<script>
export default {
  props: {
    value: {
      type: Array,
      default: () => []
    },
    items: {
      type: Array,
      default: () => []
    },
    label: {
      type: String,
      default: 'Selecione'
    },
    itemText: {
      type: String,
      default: 'name'
    },
    itemValue: {
      type: String,
      default: 'id'
    },
    itemSubtitle: {
      type: String,
      default: ''
    },
    loading: {
      type: Boolean,
      default: false
    },
    moreLabel: {
      type: String,
      default: 'itens'
    }
  },
  
  data() {
    return {
      selectedItems: [],
      search: null,
    };
  },
  
  computed: {
    areAllSelected() {
      return this.items.length > 0 && 
        this.selectedItems.length === this.items.length;
    },
    
    isIndeterminate() {
      return this.selectedItems.length > 0 && 
        !this.areAllSelected;
    },

    icon() {
      if (this.areAllSelected) return 'mdi-checkbox-marked';
      if (this.isIndeterminate) return 'mdi-minus-box';
      return 'mdi-checkbox-blank-outline';
    },
  },
  
  watch: {
    value: {
      handler(newVal) {
        if (JSON.stringify(this.selectedItems) !== JSON.stringify(newVal)) {
          this.selectedItems = Array.isArray(newVal) ? [...newVal] : [];
        }
      },
      immediate: true
    },
    
    selectedItems: {
      handler(newVal) {
        if (JSON.stringify(this.value) !== JSON.stringify(newVal)) {
          this.$emit('input', newVal);
        }
      }
    }
  },
  
  methods: {
    toggleSelectAll() {
      if (this.areAllSelected) {
        this.selectedItems = [];
      } else {
        this.selectedItems = JSON.parse(JSON.stringify(this.items));
      }
    },
    
    removeItem(item) {
      const index = this.selectedItems.findIndex(
        selected => selected[this.itemValue] === item[this.itemValue]
      );
      if (index >= 0) {
        this.selectedItems.splice(index, 1);
      }
    },
    
    toggleItem(item) {
      const index = this.selectedItems.findIndex(
        selected => selected[this.itemValue] === item[this.itemValue]
      );
      
      if (index >= 0) {
        // Item já está selecionado, vamos remover
        this.selectedItems.splice(index, 1);
      } else {
        // Item não está selecionado, vamos adicionar
        this.selectedItems.push({...item});
      }
    },
    
    isSelected(item) {
      return this.selectedItems.some(
        selected => selected[this.itemValue] === item[this.itemValue]
      );
    },
    
    getItemText(item) {
      return this.itemText.includes('.')
        ? this.itemText.split('.').reduce((o, i) => o ? o[i] : null, item)
        : item[this.itemText];
    },
    
    getItemSubtitle(item) {
      if (!this.itemSubtitle) return '';
      
      return this.itemSubtitle.includes('.')
        ? this.itemSubtitle.split('.').reduce((o, i) => o ? o[i] : null, item)
        : item[this.itemSubtitle];
    },
    
    customFilter(item, queryText) {
      if (!queryText) return true;
      
      const text = this.getItemText(item) || '';
      const subtitle = this.getItemSubtitle(item) || '';
      
      const searchText = queryText.toLowerCase().trim();
      if (!searchText) return true;
      
      return text.toLowerCase().includes(searchText) || 
             subtitle.toLowerCase().includes(searchText);
    },

    // Garantir que os cliques no checkbox funcionem corretamente
    onCheckboxClick(event, item) {
      event.stopPropagation();
      this.toggleItem(item);
    }
  }
};
</script>

<style scoped>
.advanced-autocomplete {
  width: 100%;
}

:deep(.selected-item) {
  background-color: var(--tertiary);
}

/* Corrigir o alinhamento do checkbox com o texto */
:deep(.v-list-item__action) {
  margin-top: 0;
  margin-bottom: 0;
}

:deep(.v-list-item) {
  min-height: 40px;
}

:deep(.v-input__slot) {
  cursor: text;
}
</style> 