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
      item-text="text"
      item-value="value"
      return-object
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
          {{ tooltipText }}
        </v-tooltip>
      </template>

      <!-- Template para exibir cada item com ações -->
      <template #item="{ item }">
        <div class="d-flex align-center justify-space-between w-full">
          <span>{{ item.text }}</span>
          <div v-if="allowEdit || allowRemove" class="ml-2">
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
          Tem certeza de que deseja excluir "{{ itemToRemove?.text }}"?
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
      type: Object,
      default: null,
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
    tooltipText: {
      type: String,
      default:
        'Este campo pode ser utilizado quando o evento possui vários setores, ex.: VIP, Mezanino, Plateia Frontal, etc',
    },
    persistentHint: {
      type: Boolean,
      default: false,
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
  },
  created() {
    this.debouncer = new Debounce(this.suggestCreateItem, 500);
  },
  methods: {
    onSearchInput(query) {
      if (query === null) return;
      this.searchQuery = query.length ? query.trim() : '';
      this.debouncer.execute(query);
    },

    suggestCreateItem(query) {
      if (
        query &&
        !this.internalItems.some(
          (item) => item.text.toLowerCase() === query.toLowerCase()
        )
      ) {
        this.internalItems.push(this.createNewItemObject(query));
      } else {
        this.clearPlaceholders();
      }
    },

    createNewItemObject(name) {
      return {
        id: '-1', // Indica que é um novo item
        text: `Criar e atribuir ${name}`,
        value: name,
        _isNew: true, // Flag para identificar itens novos
      };
    },

    onItemChange(item) {
      if (item && item._isNew) {
        item.text = item.text.replace('Criar e atribuir ', '');
        this.selectedItem = item;
        this.clearPlaceholders();
        this.$emit('input', this.selectedItem);
      } else {
        this.selectedItem = item;
        this.$emit('input', this.selectedItem);
      }
    },

    clearPlaceholders() {
      this.internalItems = this.internalItems.filter(
        (item) => !item.text.startsWith('Criar e atribuir ')
      );
    },

    confirmRemoveItem(item) {
      this.itemToRemove = item;
      this.confirmDialog = true;
    },
    removeItem() {
      this.internalItems = this.internalItems.filter(
        (item) =>
          item.value !== this.itemToRemove.value && item.text !== this.itemToRemove.text
      );

      if (this.selectedItem && this.selectedItem.value === this.itemToRemove.value) {
        this.selectedItem = null;
      }

      this.$emit('remove', this.itemToRemove);
      this.confirmDialog = false;
    },

    openEditModal(item) {
      this.itemToEdit = item;
      this.editedItemValue = item.text;
      this.editDialog = true;
    },

    saveEditedItem() {
      if (this.editedItemValue.trim().length > 0) {
        const editedItem = {
          ...this.itemToEdit,
          text: this.editedItemValue.trim(),
          value: this.editedItemValue.trim(),
        };

        this.$set(this.selectedItem, 'text', editedItem.text);
        this.$set(this.selectedItem, 'value', editedItem.value);

        this.$emit('edit', editedItem);
        this.editDialog = false;
      }
    },
  },
};
</script>

<style scoped></style>
