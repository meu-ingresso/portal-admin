<template>
  <v-card class="ticket-form pa-4" outlined>
    <h4 class="ticket-form-title mb-4">{{ ticketName }} - Ingresso {{ instanceIndex + 1 }}</h4>
    
    <v-select
      v-model="personType"
      :items="personTypeOptions"
      label="Tipo de Pessoa"
      outlined
      dense
      class="mb-4"
      @change="updatePersonFields"
    ></v-select>
    
    <div v-if="isLoadingFields" class="text-center py-4">
      <v-progress-circular indeterminate color="primary" size="32"></v-progress-circular>
      <p class="mt-2">Carregando campos...</p>
    </div>
    
    <template v-else>
      <CheckoutFieldInput
        v-for="field in fields"
        :key="field.id"
        ref="fieldInputs"
        v-model="fieldValues[field.id]"
        :field="field"
      />
    </template>
  </v-card>
</template>

<script>
import { isMultiOptionField } from '~/utils/customFieldsHelpers';
export default {
  props: {
    ticketId: {
      type: String,
      required: true
    },
    ticketName: {
      type: String,
      required: true
    },
    instanceIndex: {
      type: Number,
      required: true
    },
    checkoutFields: {
      type: Array,
      required: true
    },
    checkoutFieldOptions: {
      type: Object,
      default: () => ({})
    },
    personTypeOptions: {
      type: Array,
      default: () => [
        { text: 'Pessoa Física', value: 'PF' },
        { text: 'Pessoa Jurídica', value: 'PJ' },
        { text: 'Estrangeiro', value: 'ESTRANGEIRO' }
      ]
    },
    value: {
      type: Object,
      default: () => ({
        personType: 'PF',
        fields: {}
      })
    }
  },
  data() {
    return {
      personType: this.value.personType || 'PF',
      fields: [],
      fieldValues: this.value.fields || {},
      isLoadingFields: false
    };
  },
  watch: {
    value: {
      handler(newVal) {
        if (newVal) {
          this.personType = newVal.personType || 'PF';
          this.fieldValues = newVal.fields || {};
        }
      },
      deep: true
    },
    fieldValues: {
      handler() {
        this.emitUpdate();
      },
      deep: true
    }
  },
  created() {
    this.loadFields();
  },
  methods: {
    loadFields() {
      this.isLoadingFields = true;
      this.fields = this.getFieldsForTicket(this.ticketId, this.personType);
      this.isLoadingFields = false;
    },
    getFieldsForTicket(ticketId, personType) {
      // Filtrar campos relevantes para este ingresso e tipo de pessoa
      const ticketFields = this.checkoutFields.filter(field => 
        field.ticket_id === ticketId && 
        field.eventCheckoutField.person_type === personType
      );
      
      // Mapear para formato adequado para o formulário
      return ticketFields.map(field => {
        const fieldType = field.eventCheckoutField.type;
        const result = {
          id: field.eventCheckoutField.id,
          name: field.eventCheckoutField.name,
          type: fieldType,
          required: field.eventCheckoutField.required,
          help_text: field.eventCheckoutField.help_text,
          visible_on_ticket: field.eventCheckoutField.visible_on_ticket,
          display_order: field.eventCheckoutField.display_order,
        };
        
        // Adicionar opções para campos especiais
        if (isMultiOptionField(fieldType)) {
          result.options = this.checkoutFieldOptions[field.eventCheckoutField.id] || [];
        }
        
        return result;
      }).sort((a, b) => a.display_order - b.display_order);
    },
    updatePersonFields() {
      this.loadFields();
      this.fieldValues = {}; // Limpar os valores quando muda o tipo de pessoa
      this.emitUpdate();
    },
    emitUpdate() {
      this.$emit('input', {
        personType: this.personType,
        fields: this.fieldValues
      });
    },
    validate() {
      if (!this.$refs.fieldInputs) return false;
      
      return this.$refs.fieldInputs.every(input => input.validate());
    }
  }
};
</script>

<style scoped>
.ticket-form {
  margin-bottom: 24px;
  border-radius: 8px !important;
}
.ticket-form-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--primary);
}
</style> 