<template>
  <div class="ticket-sidebar-wrapper">

    <div v-if="show" class="sidebar-overlay"></div>

    <v-navigation-drawer :value="show" fixed right width="500" class="ticket-fields-sidebar"
      :class="{ 'mobile-sidebar': isMobile }" @input="$emit('update:show', $event)">

      <v-card flat class="full-height" :tile="isMobile">
        <v-card-title class="d-flex justify-space-between align-center mb-2">
          <h3 class="modalTitle">Editar Dados do Ingresso</h3>
          <v-btn icon @click="close">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>

        <v-card-text class="pt-4 sidebar-content">
          <Lottie v-if="isLoading" path="./animations/loading_default.json" height="300" width="300" />

          <template v-else>
            <v-form ref="ticketFieldsForm" v-model="valid">
              <v-row>
                <v-col v-for="field in processedTicketFields" :key="field.id" cols="12" class="py-0">
                  <CheckoutFieldInput ref="fieldInputs" v-model="formData[field.id]" :field="field" />
                </v-col>
              </v-row>
            </v-form>
          </template>
        </v-card-text>
        <v-card-actions v-if="!isLoading" class="py-4 px-4 sidebar-actions" :class="{
          'd-flex align-center justify-space-between': $vuetify.breakpoint.mdAndUp,
          'mobile-actions': $vuetify.breakpoint.smAndDown
        }">
          <DefaultButton text="Cancelar" outlined :class="{
            'mr-2': $vuetify.breakpoint.mdAndUp,
            'mb-3': $vuetify.breakpoint.smAndDown,
            'full-width-mobile': $vuetify.breakpoint.smAndDown
          }" @click="close" />

          <DefaultButton text="Salvar" color="primary" :loading="isSaving" :disabled="!valid" :class="{
            'mb-3': $vuetify.breakpoint.smAndDown,
            'full-width-mobile': $vuetify.breakpoint.smAndDown
          }" @click="saveChanges" />
        </v-card-actions>
      </v-card>
    </v-navigation-drawer>

  </div>
</template>

<script>
import { isMobileDevice } from '@/utils/utils';
import { isMultiOptionField } from '@/utils/customFieldsHelpers';

export default {

  props: {
    show: {
      type: Boolean,
      default: false,
    },
    customerTicketId: {
      type: String,
      default: null,
    },
  },

  data() {
    return {
      isLoading: false,
      isSaving: false,
      valid: true,
      ticketFields: [],
      formData: {},
      fieldOptions: {},
    };
  },

  computed: {
    isMobile() {
      return isMobileDevice(this.$vuetify);
    },

    processedTicketFields() {

      if (!this.ticketFields || this.ticketFields.length === 0) return [];

      return this.ticketFields.map(field => {
        if (!field.checkoutField) return null;

        const processedField = {
          id: field.id,
          name: field.checkoutField.name,
          type: field.checkoutField.type,
          required: field.checkoutField.required,
          help_text: field.checkoutField.help_text,
          visible_on_ticket: field.checkoutField.visible_on_ticket,
          display_order: field.checkoutField.display_order,
        };

        // Adicionar opções para campos especiais
        if (isMultiOptionField(field.checkoutField.type)) {
          processedField.options = this.fieldOptions[field.checkoutField.id] || [];
        }

        return processedField;
      }).filter(field => field !== null);
    }
  },

  watch: {
    show(newValue) {
      if (newValue && this.customerTicketId) {
        this.loadTicketFields();
      }
    }
  },

  methods: {
    close() {
      this.$emit('update:show', false);
      this.resetForm();
    },

    resetForm() {
      this.ticketFields = [];
      this.formData = {};
      this.fieldOptions = {};
      this.valid = true;
    },

    async loadTicketFields() {
      if (!this.customerTicketId) return;

      try {
        this.isLoading = true;
        const response = await this.$store.dispatch('eventCheckout/getTicketFields', this.customerTicketId);

        if (!response || response.length === 0) return;

        // Ordenar os campos de acordo com a ordem de exibição
        this.ticketFields = response.sort((a, b) => a?.checkoutField?.display_order - b?.checkoutField?.display_order);

        // Inicializar formData com os valores atuais
        this.formData = {};

        this.ticketFields.forEach(field => {
          if (field.checkoutField) {
            if (field.checkoutField.type === 'TERMO') {
              // Para campos tipo termo, converter para booleano
              this.$set(this.formData, field.id, field.value === 'true');
            } else if (field.checkoutField.type === 'MULTI_CHECKBOX') {
              // Para campos multi-checkbox, inicializar como array
              this.$set(this.formData, field.id, field.value ? field.value.split(',') : []);
            } else {
              // Para outros campos, usar o valor direto
              this.$set(this.formData, field.id, field.value);
            }
          }
        });

        // Carregar opções para campos do tipo dropdown e multi-checkbox
        await this.loadFieldOptions();
      } catch (error) {
        console.error('Erro ao carregar campos do ingresso:', error);
        this.$store.dispatch('toast/setToast', {
          text: 'Erro ao carregar dados do ingresso',
          type: 'error',
          time: 5000,
        });
      } finally {
        this.isLoading = false;
      }
    },

    async loadFieldOptions() {
      const specialFields = this.ticketFields.filter(
        field =>
          field.checkoutField &&
          isMultiOptionField(field.checkoutField.type)
      );

      if (specialFields.length === 0) return;

      try {
        for (const field of specialFields) {
          const fieldId = field.checkoutField.id;
          if (!this.fieldOptions[fieldId]) {
            const options = await this.$store.dispatch('eventCheckout/fetchCheckoutFieldOptions', fieldId);
            this.$set(this.fieldOptions, fieldId, options);
          }
        }
      } catch (error) {
        console.error('Erro ao carregar opções de campos:', error);
        this.$store.dispatch('toast/setToast', {
          text: 'Erro ao carregar opções dos campos',
          type: 'error',
          time: 5000,
        });
      }
    },

    validateForm() {
      if (!this.$refs.fieldInputs) return true;
      return this.$refs.fieldInputs.every(input => input.validate());
    },

    async saveChanges() {
      if (!this.validateForm()) {
        this.$store.dispatch('toast/setToast', {
          text: 'Por favor, corrija os erros no formulário antes de salvar',
          type: 'error',
          time: 5000,
        });
        return;
      }

      try {
        this.isSaving = true;

        // Preparar dados para envio
        const updateData = Object.keys(this.formData).map(fieldId => {
          let value = this.formData[fieldId];

          // Converter arrays para string separada por vírgulas (para campos multi-checkbox)
          if (Array.isArray(value)) {
            value = value.join(',');
          }

          // Converter booleanos para string (para campos termo)
          if (typeof value === 'boolean') {
            value = value.toString();
          }

          return {
            id: fieldId,
            value: String(value)
          };
        });

        // Enviar atualização
        await this.$store.dispatch('eventCheckout/updateTicketFields', { data: updateData });

        // Emitir evento de sucesso
        this.$emit('fields-updated');
        this.close();
      } catch (error) {
        console.error('Erro ao salvar alterações:', error);
        this.$store.dispatch('toast/setToast', {
          text: 'Erro ao salvar alterações nos dados do ingresso',
          type: 'error',
          time: 5000,
        });
      } finally {
        this.isSaving = false;
      }
    },
  },
};
</script>

<style scoped>
.ticket-sidebar-wrapper {
  position: relative;
}

.ticket-sidebar-wrapper .v-card {
  background-color: #fff !important;
}

.ticket-fields-sidebar {
  z-index: 1001;
  box-shadow: -2px 0 10px rgba(0, 0, 0, 0.1);
}

.full-height {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.sidebar-content {
  flex-grow: 1;
  overflow-y: auto;
}

.sidebar-actions {
  border-top: 1px solid rgba(0, 0, 0, 0.12);
}

.full-width-mobile {
  width: 100%;
}

.mobile-sidebar {
  width: 100% !important;
}

.mobile-actions {
  display: flex;
  flex-direction: column;
}

.sidebar-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  pointer-events: auto;
}
</style>