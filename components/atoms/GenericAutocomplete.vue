<template>
  <div>
    <v-autocomplete
      v-model="selectedItem"
      :items="internalItems"
      :label="label"
      :placeholder="placeholder"
      :search-input.sync="searchQuery"
      :hint="hint"
      :persistent-hint="persistentHint"
      outlined
      dense
      hide-details="auto"
      clearable
      :prepend-inner-icon="prependInnerIcon"
      :no-data-text="noDataText"
      @update:search-input="onSearchInput"
      @change="onItemChange">
      <template #prepend-inner>
        <v-tooltip bottom>
          <template #activator="{ on }">
            <v-icon v-on="on"> {{ prependInnerIcon }} </v-icon>
          </template>
          Este campo pode ser utilizado quando o evento possui vários setores, ex.: VIP,
          Mezanino, Plateia Frontal, etc
        </v-tooltip>
      </template>

      <!-- Template para exibir cada item com ações -->
      <template #item="{ item }">
        <div class="d-flex align-center justify-space-between w-full">
          <span>{{ formatItem(item) }}</span>
          <div v-if="(allowEdit || allowRemove) && !checkItemIsNew(item)" class="ml-2">
            <v-btn v-if="allowEdit" icon small @click="openEditModal(item)">
              <v-icon>mdi-pencil</v-icon>
            </v-btn>
            <v-btn v-if="allowRemove" icon small @click="confirmRemoveItem(item)">
              <v-icon color="red">mdi-delete</v-icon>
            </v-btn>
          </div>
        </div>
      </template>
    </v-autocomplete>

    <!-- Dialog de Confirmação -->
    <v-dialog v-model="confirmDialog" max-width="500">
      <v-card>
        <v-card-title class="d-flex justify-space-between align-center">
          <h3>Confirmar exclusão</h3>
          <v-btn icon @click="confirmDialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        <v-card-text>
          Tem certeza de que deseja excluir "{{ formatItem(itemToRemove) }}"?
        </v-card-text>
        <v-card-actions class="d-flex align-center py-5">
          <v-spacer />

          <DefaultButton outlined text="Cancelar" @click="confirmDialog = false" />
          <DefaultButton text="Excluir" @click="removeItem" />
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Dialog de Edição -->
    <v-dialog v-model="editDialog" max-width="500">
      <v-card>
        <v-card-title class="d-flex justify-space-between align-center">
          <h3>Editar Item</h3>
          <v-btn icon @click="editDialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        <v-card-text>
          <v-text-field
            v-model="editedItemValue"
            label="Novo valor"
            outlined
            dense
            hide-details="auto" />
        </v-card-text>
        <v-card-actions class="d-flex justify-space-between align-center">
          <DefaultButton outlined text="Cancelar" @click="editDialog = false" />
          <DefaultButton text="Salvar" @click="saveEditedItem" />
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import Debounce from '@/utils/Debounce';

export default {
  props: {
    items: {
      type: Array,
      default: () => [],
    },
    value: {
      type: [String, Object],
      default: '',
    },
    label: {
      type: String,
      default: 'Selecione ou crie um item',
    },
    placeholder: {
      type: String,
      default: 'Digite para criar ou selecionar',
    },
    hint: {
      type: String,
      default: '',
    },
    prependInnerIcon: {
      type: String,
      default: 'mdi-information-variant-circle',
    },
    persistentHint: {
      type: Boolean,
      default: false,
    },
    itemKey: {
      type: String,
      default: 'name',
    },
    allowEdit: {
      type: Boolean,
      default: true,
    },
    allowRemove: {
      type: Boolean,
      default: true,
    },
  },

  data() {
    return {
      internalItems: [...this.items],
      selectedItem: this.value,
      searchQuery: '',
      confirmDialog: false,
      itemToRemove: null,
      editDialog: false,
      itemToEdit: null,
      editedItemValue: '',
    };
  },

  computed: {
    noDataText() {
      return this.internalItems.length
        ? 'Selecione um item'
        : 'Comece a digitar para criar um item';
    },
  },
  watch: {
    items: {
      handler(newItems) {
        this.internalItems = [...newItems];
      },
      deep: true,
      immediate: true,
    },
    value: {
      handler(newValue) {
        this.selectedItem = newValue;
      },
      immediate: true,
    },
    selectedItem: {
      handler(newItem) {
        this.$emit('input', newItem);
      },
    },
  },
  created() {
    this.debouncer = new Debounce(this.suggestCreateItem, 500);
  },
  methods: {
    formatItem(item) {
      if (!item) return 'Item inválido';
      return typeof item === 'object' ? item[this.itemKey] || 'Item sem nome' : item;
    },
    onSearchInput(query) {
      if (query === null) return;
      this.searchQuery = query.length ? query.trim() : '';
      this.debouncer.execute(query);
    },
    suggestCreateItem(query) {
      if (
        query &&
        !this.internalItems.some(
          (item) => this.formatItem(item).toLowerCase() === query.toLowerCase()
        )
      ) {
        this.internalItems.push(this.createPlaceholder(query));
      } else {
        this.clearPlaceholders();
      }
    },
    onItemChange(item) {
      if (item && typeof item === 'string' && item.startsWith('Criar e atribuir ')) {
        const newItem = item.replace('Criar e atribuir ', '').trim();
        if (newItem) {
          const formattedItem = this.formatNewItem(newItem);
          this.internalItems.push(formattedItem);
          this.selectedItem = formattedItem;
        }
        this.clearPlaceholders();
        this.$emit('update:items', this.internalItems);
      }
    },
    checkItemIsNew(item) {
      return typeof item === 'string' && item.startsWith('Criar e atribuir ');
    },
    createPlaceholder(query) {
      return `Criar e atribuir ${query}`;
    },
    clearPlaceholders() {
      this.internalItems = this.internalItems.filter(
        (item) => typeof item !== 'string' || !item.startsWith('Criar e atribuir ')
      );
    },
    confirmRemoveItem(item) {
      this.itemToRemove = item;
      this.confirmDialog = true;
    },
    removeItem() {
      this.internalItems = this.internalItems.filter(
        (item) => item !== this.itemToRemove
      );
      if (this.selectedItem === this.itemToRemove) {
        this.selectedItem = null;
      }
      this.confirmDialog = false;
      this.$emit('update:items', this.internalItems);
    },
    openEditModal(item) {
      this.itemToEdit = item;
      this.editedItemValue = this.formatItem(item);
      this.editDialog = true;
    },
    saveEditedItem() {
      if (this.editedItemValue.trim().length > 0) {
        const formattedItem = this.formatNewItem(this.editedItemValue.trim());
        const index = this.internalItems.indexOf(this.itemToEdit);
        this.internalItems.splice(index, 1, formattedItem);
        if (this.selectedItem === this.itemToEdit) {
          this.selectedItem = formattedItem;
        }
        this.editDialog = false;
        this.$emit('update:items', this.internalItems);
      }
    },
    formatNewItem(name) {
      return typeof this.items[0] === 'object' ? { [this.itemKey]: name } : name;
    },
  },
};
</script>

<style scoped></style>
