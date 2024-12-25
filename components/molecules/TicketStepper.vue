<template>
  <v-stepper v-model="currentStep" flat tile>
    <!-- Cabeçalho do Stepper -->
    <v-stepper-header class="box-shadow-none">
      <v-stepper-step :complete="currentStep > 1" step="1"
        >Informações do Ingresso</v-stepper-step
      >
      <v-divider></v-divider>
      <v-stepper-step :complete="currentStep > 2" step="2"
        >Formulário de Inscrição</v-stepper-step
      >
    </v-stepper-header>

    <!-- Corpo do Stepper -->
    <v-stepper-items>
      <!-- Etapa 1: Informações do Ingresso -->
      <v-stepper-content step="1" class="px-0 py-0">
        <TicketForm :ticket="localTicket" @update:ticket="updateTicket" />
        <div class="d-flex justify-end">
          <v-btn text color="primary" @click="nextStep">Próximo</v-btn>
        </div>
      </v-stepper-content>

      <!-- Etapa 2: Campos Customizados -->
      <v-stepper-content step="2" class="px-0 py-0">
        <CustomFieldForm
          :custom-fields="localTicket.customFields"
          :existing-fields="existingFields"
          @save="saveCustomFields" />
        <div class="d-flex justify-space-between align-center">
          <v-btn text color="grey" @click="previousStep">Voltar</v-btn>
          <v-btn text color="primary" @click="save">Salvar</v-btn>
        </div>
      </v-stepper-content>
    </v-stepper-items>
  </v-stepper>
</template>

<script>
export default {
  props: {
    ticket: {
      type: Object,
      required: true,
    },
    existingFields: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      localTicket: { ...this.ticket },
      currentStep: 1,
    };
  },
  methods: {
    nextStep() {
      if (this.currentStep < 2) this.currentStep++;
    },
    previousStep() {
      if (this.currentStep > 1) this.currentStep--;
    },
    updateTicket(updatedTicket) {
      this.localTicket = { ...updatedTicket }; // Atualiza o modelo local
    },
    saveCustomFields(fields) {
      this.localTicket.customFields = fields; // Atualiza os campos customizados
    },
    save() {
      this.$emit('save', this.localTicket); // Emite o ticket atualizado para o pai
    },
  },
};
</script>
<style scoped>
.box-shadow-none {
  box-shadow: none;
}
</style>
