
<template>
  <v-container class="step-tickets">
    <v-row>
      <v-col cols="12">
        <h3>Cadastro de Ingressos</h3>
        <p class="subtitle-1">Adicione ingresos para o evento.</p>
        <DefaultButton class="mt-2" text="Adicionar Ingresso" @click="addTicket" />
      </v-col>
    </v-row>

    <v-row
      v-for="(ticket, ticketIndex) in localForm.tickets"
      :key="ticketIndex"
      class="ticket-row"
      :class="{
        'bg-white': ticketIndex % 2 === 0,
        'bg-light-gray': ticketIndex % 2 !== 0,
      }">
      <v-col cols="12" sm="4">
        <v-text-field
          v-model="ticket.name"
          label="Nome do Ingresso"
          placeholder="Ex: Ingresso VIP"
          required />
      </v-col>
      <v-col cols="12" sm="2">
        <v-text-field
          v-model="ticket.price"
          label="Preço (R$)"
          type="number"
          min="0"
          required />
      </v-col>
      <v-col cols="12" sm="2">
        <v-text-field
          v-model="ticket.max_quantity"
          label="Quantidade Máxima"
          type="number"
          min="0"
          required />
      </v-col>
      <v-col cols="12" sm="2">
        <v-text-field
          v-model="ticket.min_purchase"
          label="Compra Mínima"
          type="number"
          min="0"
          required />
      </v-col>
      <v-col cols="12" sm="2">
        <v-text-field
          v-model="ticket.max_purchase"
          label="Compra Máxima"
          type="number"
          min="0"
          required />
      </v-col>
      <v-col cols="12" md="3" sm="12">
        <v-menu
          v-model="ticket.open_date_menu"
          :close-on-content-click="false"
          :nudge-right="40"
          transition="scale-transition"
          offset-y
          min-width="auto">
          <template #activator="{ on, attrs }">
            <v-text-field
              v-model="ticket.open_date"
              label="Data de Abertura"
              readonly
              v-bind="attrs"
              v-on="on" />
          </template>
          <v-date-picker
            v-model="ticket.open_date"
            @input="ticket.open_date_menu = false"></v-date-picker>
        </v-menu>
      </v-col>
      <v-col cols="12" md="3" sm="12">
        <v-menu
          v-model="ticket.close_date_menu"
          :close-on-content-click="false"
          :nudge-right="40"
          transition="scale-transition"
          offset-y
          min-width="auto">
          <template #activator="{ on, attrs }">
            <v-text-field
              v-model="ticket.close_date"
              label="Data de Fechamento"
              readonly
              v-bind="attrs"
              v-on="on" />
          </template>
          <v-date-picker
            v-model="ticket.close_date"
            @input="ticket.close_date_menu = false"></v-date-picker>
        </v-menu>
      </v-col>
      <v-col cols="12" md="2" sm="12">
        <v-select
          v-model="ticket.visibility"
          :items="['Público', 'Privado']"
          label="Visibilidade"
          required />
      </v-col>
      <v-col cols="12" md="2" sm="12">
        <v-autocomplete
          v-model="ticket.category"
          :items="categories"
          label="Categoria"
          :search-input.sync="ticket.categorySearch"
          no-data-text="Nenhuma categoria encontrada"
          required
          @update:search-input="onTriggerCategorySearch(ticketIndex)"
          @change="onCategoryChange(ticketIndex)" />
      </v-col>
      <v-col cols="12" md="2" sm="12" class="d-flex align-center">
        <v-btn color="red" text @click="removeTicket(ticketIndex)">
          Remover Ingresso
        </v-btn>
      </v-col>

      <!-- Tabela de Campos Customizados -->
      <v-col cols="12" class="mt-3">
        <div class="d-flex align-center">
          <h4 class="mr-2">Campos Customizados</h4>
          <DefaultButton is-text text="Adicionar Campo" @click="addCustomField(ticketIndex)" />
        </div>
        <v-simple-table>
          <thead>
            <tr>
              <th>Nome</th>
              <th>Tipo</th>
              <th>Obrigatório</th>
              <th>Único</th>
              <th>Visível</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(field, fieldIndex) in ticket.customFields" :key="fieldIndex">
              <td>{{ field.name }}</td>
              <td>{{ field.type }}</td>
              <td>{{ field.required ? 'Sim' : 'Não' }}</td>
              <td>{{ field.unique ? 'Sim' : 'Não' }}</td>
              <td>{{ field.visible ? 'Sim' : 'Não' }}</td>
              <td>
                <v-btn text icon @click="editCustomField(ticketIndex, fieldIndex)">
                  <v-icon>mdi-pencil</v-icon>
                </v-btn>
                <v-btn
                  text
                  icon
                  color="red"
                  @click="removeCustomField(ticketIndex, fieldIndex)">
                  <v-icon>mdi-delete</v-icon>
                </v-btn>
              </td>
            </tr>
            <tr v-if="!ticket.customFields.length">
              <td colspan="6" class="text-center">Nenhum campo adicionado</td>
            </tr>
          </tbody>
        </v-simple-table>
      </v-col>
    </v-row>

    <!-- Modal para Criar/Editar Campo -->
    <template v-if="currentTicket">
      <v-dialog v-model="showCustomFieldModal" persistent max-width="600px">
        <v-card>
          <v-card-title class="d-flex justify-space-between align-center">
            <span>
              {{ isEditing ? 'Editar Campo Customizado' : 'Adicionar Campo Customizado' }}
            </span>
            <v-btn icon @click="closeCustomFieldModal">
              <v-icon>mdi-close</v-icon>
            </v-btn>
          </v-card-title>
          <v-card-text>
            <CustomFieldForm
              :custom-field="customFieldBeingEdited"
              :existing-fields="existingFields"
              @save="saveCustomField" />
          </v-card-text>
        </v-card>
      </v-dialog>
    </template>

    <!-- Modal para alerta sobre remoção de campos customizados -->
    <template v-if="alertField">
      <CustomFieldAlertModal
        :visible.sync="showAlertModal"
        :field="alertField"
        :tickets-using-field="alertTickets" />
    </template>
  </v-container>
</template>

<script>
import Debounce from '@/utils/Debounce';
export default {
  props: {
    form: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      localForm: { ...this.form },
      showCustomFieldModal: false,
      categories: [], // Categorias disponíveis
      currentTicketIndex: 0, // Índice do ingresso atual
      existingFields: [], // Campos criados globalmente
      isEditing: false, // Flag para edição de campo
      customFieldBeingEdited: null, // Campo sendo editado
      showAlertModal: false, // Controla a visibilidade do modal
      alertField: null, // Armazena o campo a ser exibido no alerta
      alertTickets: [], // Armazena os ingressos que utilizam o campo
    };
  },

  computed: {
    currentTicket() {
      return this.localForm.tickets[this.currentTicketIndex];
    },
  },

  watch: {
    localForm: {
      handler() {
        this.emitChanges();
      },
      deep: true,
    },
  },

  created() {
    this.debouncer = new Debounce(this.onCategorySearch, 900);
  },

  mounted() {
    this.populateExistingFields();
  },

  methods: {
    canProceed(callback) {
      if (this.localForm.tickets.length === 0) {
        callback(null, false, 'Adicione pelo menos um ingresso');
        return;
      }

      const pendingIndex = this.localForm.tickets.findIndex(
        (ticket) => !ticket.customFields || ticket.customFields.length === 0
      );

      if (pendingIndex !== -1) {
        this.currentTicketIndex = pendingIndex;
        this.showCustomFieldModal = true;
        callback(null, false);
      } else {
        callback(null, true);
      }
    },
    populateExistingFields() {
      this.existingFields = [];

      this.localForm.tickets.forEach((ticket) => {
        ticket.customFields.forEach((field) => {
          if (!this.existingFields.some((existing) => existing.name === field.name)) {
            this.existingFields.push(field);
          }
        });
      });
    },
    emitChanges() {
      this.$emit('update:form', { ...this.localForm });
    },
    removeTicket(ticketIndex) {
      this.localForm.tickets.splice(ticketIndex, 1);
    },
    onTriggerCategorySearch(ticketIndex) {
      this.debouncer.execute(ticketIndex);
    },
    onCategorySearch(ticketIndex) {
      const search = this.localForm.tickets[ticketIndex].categorySearch;
      if (
        search &&
        !this.categories.includes(search) &&
        !this.categories.includes(`Criar categoria e atribuir "${search}"`)
      ) {
        this.categories.push(`Criar categoria e atribuir "${search}"`);
      } else {
        this.clearTempCategories();
      }
    },
    onCategoryChange(ticketIndex) {
      const category = this.localForm.tickets[ticketIndex].category;
      if (category && category.startsWith('Criar categoria e atribuir')) {
        const newCategory = category
          .replace('Criar categoria e atribuir "', '')
          .replace('"', '');
        this.categories.push(newCategory);
        this.localForm.tickets[ticketIndex].category = newCategory;
        this.clearTempCategories();
      }
    },
    clearTempCategories() {
      this.categories = this.categories.filter(
        (category) => !category.startsWith('Criar categoria e atribuir')
      );
    },
    addTicket() {
      this.localForm.tickets.push({
        name: '',
        price: 0,
        max_quantity: 0,
        min_purchase: 0,
        max_purchase: 0,
        open_date: '',
        close_date: '',
        visibility: 'Público',
        category: '',
        categorySearch: '',
        open_date_menu: false,
        close_date_menu: false,
        customFields: [],
      });
    },
    addCustomField(ticketIndex) {
      this.isEditing = false;
      this.resetCustomFieldBeignEdited();
      this.currentTicketIndex = ticketIndex;
      this.showCustomFieldModal = true;
    },
    editCustomField(ticketIndex, fieldIndex) {
      this.isEditing = true;
      this.currentTicketIndex = ticketIndex;
      this.editingFieldIndex = fieldIndex;
      this.customFieldBeingEdited = {
        ...this.localForm.tickets[ticketIndex].customFields[fieldIndex],
      };
      this.showCustomFieldModal = true;
    },
    saveCustomField(field) {
      if (this.isEditing) {
        this.localForm.tickets[this.currentTicketIndex].customFields[
          this.editingFieldIndex
        ] = { ...field };
      } else {
        this.localForm.tickets[this.currentTicketIndex].customFields.push(field);
      }

      // Atualiza existingFields
      this.updateExistingFields();

      this.closeCustomFieldModal();
    },
    closeCustomFieldModal() {
      this.showCustomFieldModal = false;
      this.resetCustomFieldBeignEdited();
      this.isEditing = false;
      this.editingFieldIndex = null;
    },
    resetCustomFieldBeignEdited() {
      this.customFieldBeingEdited = {
        name: '',
        type: '',
        required: false,
        unique: false,
        visible: true,
        description: '',
      };
    },
    removeCustomField(ticketIndex, fieldIndex) {
      const removedField = this.localForm.tickets[ticketIndex].customFields[fieldIndex];

      // Verifica se o campo está em uso por outros tickets
      const ticketsUsingField = this.localForm.tickets
        .filter(
          (ticket, index) =>
            index !== ticketIndex &&
            ticket.customFields.some((field) => field.name === removedField.name)
        )
        .map((ticket) => ticket.name || 'Ingresso Sem Nome');

      if (ticketsUsingField.length > 0) {
        // Exibe o modal com os detalhes do alerta
        this.alertField = removedField;
        this.alertTickets = ticketsUsingField;
        this.showAlertModal = true;
      } else {
        // Remove o campo do ticket atual
        this.localForm.tickets[ticketIndex].customFields.splice(fieldIndex, 1);

        // Atualiza existingFields
        this.updateExistingFields();
      }
    },
    updateExistingFields() {
      const allFields = [];
      this.localForm.tickets.forEach((ticket) => {
        ticket.customFields.forEach((field) => {
          if (!allFields.some((existing) => existing.name === field.name)) {
            allFields.push({ ...field });
          }
        });
      });
      this.existingFields = allFields;
    },
    showFieldInUseAlert(field) {
      const ticketsUsingField = this.localForm.tickets
        .filter((ticket) =>
          ticket.customFields.some((customField) => customField.name === field.name)
        )
        .map((ticket) => ticket.name || 'Ingresso Sem Nome');

      const alertMessage = `O campo "${
        field.name
      }" está em uso nos seguintes ingressos: ${ticketsUsingField.join(
        ', '
      )}. Remova-o de todos os ingressos antes de excluí-lo.`;

      // Exibir o alerta (exemplo usando toast ou snackbar)
      this.$toast.error(alertMessage);
    },
  },
};
</script>

<style scoped>
.step-tickets {
  margin: 0 auto;
}

.ticket-row {
  margin-bottom: 16px;
}

.category-row {
  margin-top: 16px;
  margin-bottom: 16px;
  align-items: center;
}

.bg-white {
  background-color: white;
}

.bg-light-gray {
  background-color: #f5f5f5;
}
</style>
