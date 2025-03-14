<template>
  <v-dialog :value="show" fullscreen persistent @input="$emit('update:show', $event)">
    <v-card tile>
      <v-card-title class="d-flex justify-space-between align-center">
        <h3 class="modalTitle">PDV - Ponto de Venda</h3>
        <v-btn icon @click="close">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <v-stepper v-model="currentStep" class="pdv-stepper">
        <v-stepper-header>
          <v-stepper-step :complete="currentStep > 1" step="1">Seleção de Ingressos</v-stepper-step>
          <v-divider></v-divider>
          <v-stepper-step :complete="currentStep > 2" step="2">Informações do Comprador</v-stepper-step>
          <v-divider></v-divider>
          <v-stepper-step step="3">Pagamento</v-stepper-step>
        </v-stepper-header>

        <v-stepper-items>
          <!-- Etapa 1: Seleção de Ingressos -->
          <v-stepper-content step="1">
            <v-card-text class="pt-4">
              <v-row>
                <v-col cols="12" md="8">
                  <v-card outlined class="pa-4 mb-4">
                    <div v-if="isLoading" class="text-center py-4">
                      <v-progress-circular indeterminate color="primary"></v-progress-circular>
                      <p class="mt-2">Carregando ingressos...</p>
                    </div>
                    
                    <div v-else-if="Object.keys(groupedTickets).length === 0" class="text-center py-4">
                      <p class="empty-tickets-message">Não há ingressos disponíveis para venda.</p>
                    </div>
                    
                    <div v-else>
                      <v-expansion-panels
                        v-model="expandedPanels"
                        multiple
                        class="ticket-category-panels"
                      >
                        <v-expansion-panel
                          v-for="(category, categoryId) in groupedTickets"
                          :key="categoryId"
                          class="ticket-category-panel"
                        >
                          <v-expansion-panel-header class="group-header">
                            <div class="d-flex align-center justify-space-between w-100">
                              <span class="ticket-category-name">{{ category.name }}</span>
                              <span class="ticket-category-count grey--text">{{ category.tickets.length }} {{ category.tickets.length === 1 ? 'ingresso' : 'ingressos' }}</span>
                            </div>
                          </v-expansion-panel-header>

                          <v-expansion-panel-content>
                            <CheckoutTicketRow
                              v-for="ticket in category.tickets"
                              :key="ticket.id"
                              :ticket="ticket"
                              :selected-quantity="getTicketQuantity(ticket.id)"
                              @increment="incrementTicket(ticket.id)"
                              @decrement="decrementTicket(ticket.id)"
                            />
                          </v-expansion-panel-content>
                        </v-expansion-panel>
                      </v-expansion-panels>
                    </div>
                  </v-card>
                </v-col>

                <v-col cols="12" md="4">
                  <v-card outlined class="pa-4">
                    <h3 class="ticket-section-title mb-4">Resumo do Pedido</h3>
                    
                    <div v-if="selectedTickets.length === 0" class="text-center py-4">
                      <p class="empty-cart-message">Seu carrinho está vazio</p>
                      <p class="empty-cart-description">Selecione pelo menos um ingresso para continuar</p>
                    </div>
                    
                    <template v-else>
                      <div class="selected-tickets-list mb-4">
                        <div v-for="(item, index) in selectedTickets" :key="index" class="selected-ticket-item mb-2">
                          <div class="d-flex justify-space-between">
                            <div>
                              <div class="ticket-name">{{ item.name }}</div>
                              <div class="ticket-quantity">{{ item.quantity }}x {{ formatRealValue(item.price) }}</div>
                            </div>
                            <div class="ticket-total">{{ formatRealValue(item.total) }}</div>
                          </div>
                        </div>
                      </div>
                      
                      <v-divider class="mb-4"></v-divider>
                      
                      <div class="d-flex justify-space-between mb-2">
                        <span>Subtotal</span>
                        <span class="font-weight-bold">{{ formatRealValue(totalAmount) }}</span>
                      </div>
                      
                      <div class="d-flex justify-space-between mb-2">
                        <span>Taxa plataforma ({{ eventFeePercentage }}%)</span>
                        <span>{{ formatRealValue(calculateFee) }}</span>
                      </div>
                      
                      <div class="d-flex justify-space-between mb-4">
                        <span class="font-weight-bold">Total</span>
                        <span class="total-value">{{ formatRealValue(netAmount) }}</span>
                      </div>

                      <DefaultButton
                        :disabled="selectedTickets.length === 0"
                        text="Próximo"
                        block
                        @click="nextStep"
                      />
                    </template>
                  </v-card>
                </v-col>
              </v-row>
            </v-card-text>
          </v-stepper-content>

          <!-- Etapa 2: Informações do Comprador -->
          <v-stepper-content step="2">
            <v-card-text class="pt-4">
              <v-row>
                <v-col cols="12" md="8">
                  <v-card outlined class="pa-4 mb-4">
                    <h3 class="ticket-section-title mb-4">Informações do Comprador</h3>
                    
                    <div v-if="isLoadingFields" class="text-center py-4">
                      <v-progress-circular indeterminate color="primary"></v-progress-circular>
                      <p class="mt-2">Carregando campos customizados...</p>
                    </div>
                    
                    <template v-else>
                      <v-expansion-panels
                        v-model="expandedFormPanels"
                        multiple
                        class="ticket-forms-panels"
                      >
                        <v-expansion-panel
                          v-for="(ticketGroup, index) in ticketFormGroups"
                          :key="index"
                          class="ticket-form-panel"
                        >
                          <v-expansion-panel-header class="group-header">
                            <div class="d-flex align-center justify-space-between w-100">
                              <span class="ticket-name">{{ ticketGroup.ticketName }}</span>
                              <span class="ticket-quantity grey--text">{{ ticketGroup.quantity }} {{ ticketGroup.quantity === 1 ? 'ingresso' : 'ingressos' }}</span>
                            </div>
                          </v-expansion-panel-header>

                          <v-expansion-panel-content>
                            <CheckoutTicketForm
                              v-for="(instance, instanceIndex) in ticketGroup.instances"
                              :key="instanceIndex"
                              ref="ticketForms"
                              v-model="ticketGroup.instances[instanceIndex]"
                              :ticket-id="ticketGroup.ticketId"
                              :ticket-name="ticketGroup.ticketName"
                              :instance-index="instanceIndex"
                              :checkout-fields="checkoutFields"
                              :checkout-field-options="checkoutFieldOptions"
                              :person-type-options="personTypeOptions"
                            ></CheckoutTicketForm>
                          </v-expansion-panel-content>
                        </v-expansion-panel>
                      </v-expansion-panels>
                    </template>
                  </v-card>
                </v-col>
                
                <v-col cols="12" md="4">
                  <v-card outlined class="pa-4">
                    <h3 class="ticket-section-title mb-4">Resumo do Pedido</h3>
                    
                    <div class="selected-tickets-list mb-4">
                      <div v-for="(item, index) in selectedTickets" :key="index" class="selected-ticket-item mb-2">
                        <div class="d-flex justify-space-between">
                          <div>
                            <div class="ticket-name">{{ item.name }}</div>
                            <div class="ticket-quantity">{{ item.quantity }}x {{ formatRealValue(item.price) }}</div>
                          </div>
                          <div class="ticket-total">{{ formatRealValue(item.total) }}</div>
                        </div>
                      </div>
                    </div>
                    
                    <v-divider class="mb-4"></v-divider>
                    
                    <div class="d-flex justify-space-between mb-2">
                      <span>Subtotal</span>
                      <span class="font-weight-bold">{{ formatRealValue(totalAmount) }}</span>
                    </div>
                    
                    <div class="d-flex justify-space-between mb-2">
                      <span>Taxa plataforma ({{ eventFeePercentage }}%)</span>
                      <span>{{ formatRealValue(calculateFee) }}</span>
                    </div>
                    
                    <div class="d-flex justify-space-between mb-4">
                      <span class="font-weight-bold">Total</span>
                      <span class="total-value">{{ formatRealValue(netAmount) }}</span>
                    </div>
                    
                    <div class="d-flex">
                      <DefaultButton
                        text="Voltar"
                        outlined
                        class="mr-2"
                        @click="previousStep"
                      />
                      <DefaultButton
                        :disabled="!validateCheckoutFields()"
                        text="Próximo"
                        @click="nextStep"
                      />
                    </div>
                  </v-card>
                </v-col>
              </v-row>
            </v-card-text>
          </v-stepper-content>

          <!-- Etapa 3: Pagamento -->
          <v-stepper-content step="3">
            <v-card-text class="pt-4">
              <v-row>
                <v-col cols="12" md="8">
                  <v-card outlined class="pa-4 mb-4">
                    <h3 class="ticket-section-title mb-4">Método de Pagamento</h3>
                    <v-radio-group v-model="paymentMethod" class="mt-0">
                      <v-radio value="PDV" label="Ponto de Venda (PDV)"></v-radio>
                    </v-radio-group>
                  </v-card>
                </v-col>
                
                <v-col cols="12" md="4">
                  <CheckoutSummary
                    :selected-tickets="selectedTickets"
                    :total-amount="totalAmount"
                    :calculate-fee="calculateFee"
                    :net-amount="netAmount"
                    :is-processing="isProcessing"
                    :event-fee-percentage="eventFeePercentage"
                    @process-payment="processPdvPayment"
                  >
                    <template #actions>
                      <v-btn 
                        outlined
                        class="mr-2"
                        @click="previousStep"
                      >
                        Voltar
                      </v-btn>
                      <v-btn 
                        color="primary" 
                        class="flex-grow-1"
                        :loading="isProcessing"
                        :disabled="isProcessing"
                        @click="processPdvPayment"
                      >
                        Concluir Pedido
                      </v-btn>
                    </template>
                  </CheckoutSummary>
                </v-col>
              </v-row>
            </v-card-text>
          </v-stepper-content>
        </v-stepper-items>
      </v-stepper>
    </v-card>
  </v-dialog>
</template>

<script>
import { mask } from 'vue-the-mask';
import { eventTickets, eventGeneralInfo, status, toast, payment, user, eventCheckout } from '@/store';
import { formatRealValue } from '@/utils/formatters';
import { prepareCustomTicketsPayload, prepareTicketFieldsPayloadWithMappedValues } from '@/utils/eventCheckoutHelpers';
import { isMultiOptionField } from '@/utils/customFieldsHelpers';
export default {
  directives: {
    mask
  },

  props: {
    show: {
      type: Boolean,
      required: true
    },
    eventId: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      selectedQuantities: {},
      isLoading: false,
      isLoadingFields: false,
      isProcessing: false,
      expandedPanels: [],
      expandedFormPanels: [],
      currentStep: 1,
      checkoutFields: [],
      checkoutFieldOptions: {},
      ticketFormGroups: [],
      paymentMethod: 'PDV',
      personTypeOptions: [
        { text: 'Pessoa Física', value: 'PF' },
        { text: 'Pessoa Jurídica', value: 'PJ' },
        { text: 'Estrangeiro', value: 'ESTRANGEIRO' }
      ]
    };
  },
  computed: {
    tickets() {
      return eventTickets.$tickets.filter(ticket => 
        !ticket._deleted && 
        ticket.status?.name !== 'Indisponível' &&
        (ticket.total_quantity - ticket.total_sold) > 0
      );
    },
    groupedTickets() {
      return this.tickets.reduce((acc, ticket) => {
        const categoryId = ticket.category?.id || 'uncategorized';
        const categoryName = ticket.category?.text || 'Sem Categoria';
        if (!acc[categoryId]) {
          acc[categoryId] = { name: categoryName, tickets: [] };
        }
        acc[categoryId].tickets.push(ticket);
        return acc;
      }, {});
    },
    currentEvent() {
      return eventGeneralInfo.$info;
    },
    eventFeePercentage() {
      return parseFloat(this.currentEvent?.fees?.platform_fee) || 0;
    },
    selectedTickets() {
      return Object.keys(this.selectedQuantities)
        .filter(id => this.selectedQuantities[id] > 0)
        .map(id => {
          const ticket = this.tickets.find(t => t.id === id);
          return {
            id,
            name: ticket.name,
            price: parseFloat(ticket.price),
            quantity: this.selectedQuantities[id],
            total: parseFloat(ticket.price) * this.selectedQuantities[id]
          };
        });
    },
    totalAmount() {
      return this.selectedTickets.reduce((sum, item) => sum + item.total, 0);
    },
    calculateFee() {
      return 0;
    },
    netAmount() {
      return this.totalAmount - this.calculateFee;
    }
  },
  watch: {
    show(newVal) {
      if (newVal) {
        this.loadData();
      } else {
        this.resetData();
      }
    },
    selectedTickets: {
      handler(newVal) {
        if (newVal.length > 0 && this.currentStep === 2) {
          this.generateTicketForms();
        }
      },
      deep: true
    }
  },
  methods: {
    formatRealValue,
    async loadData() {
      try {
        this.isLoading = true;
        await eventTickets.fetchAndPopulateByEventId(this.eventId);
        const categoryCount = Object.keys(this.groupedTickets).length;
        if (categoryCount > 0) {
          this.expandedPanels = [...Array(categoryCount).keys()];
        }
        this.isLoading = false;
      } catch (error) {
        console.error('Erro ao carregar ingressos:', error);
        toast.setToast({ text: 'Erro ao carregar ingressos.', type: 'error', time: 3000 });
        this.isLoading = false;
      }
    },
    resetData() {
      this.selectedQuantities = {};
      this.expandedPanels = [];
      this.expandedFormPanels = [];
      this.currentStep = 1;
      this.checkoutFields = [];
      this.checkoutFieldOptions = {};
      this.ticketFormGroups = [];
    },
    close() {
      this.resetData();
      this.$emit('update:show', false);
    },
    getTicketQuantity(ticketId) {
      return this.selectedQuantities[ticketId] || 0;
    },
    incrementTicket(ticketId) {
      const currentQty = this.selectedQuantities[ticketId] || 0;
      const ticket = this.tickets.find(t => t.id === ticketId);
      const available = ticket.total_quantity - ticket.total_sold;
      if (currentQty < available) {
        this.$set(this.selectedQuantities, ticketId, currentQty + 1);
      }
    },
    decrementTicket(ticketId) {
      if (this.selectedQuantities[ticketId] > 0) {
        this.$set(this.selectedQuantities, ticketId, this.selectedQuantities[ticketId] - 1);
      }
    },
    nextStep() {
      if (this.currentStep === 1) {
        this.fetchCheckoutFields();
      }
      if (this.currentStep < 3) {
        this.currentStep++;
      }
    },
    previousStep() {
      if (this.currentStep > 1) {
        this.currentStep--;
      }
    },
    async fetchCheckoutFields() {
      try {
        this.isLoadingFields = true;
        this.checkoutFields = await eventCheckout.fetchCheckoutFields(this.eventId);
        await this.fetchFieldOptions();
        this.generateTicketForms();
        this.isLoadingFields = false;
      } catch (error) {
        console.error('Erro ao carregar campos de checkout:', error);
        toast.setToast({ text: 'Erro ao carregar campos de checkout.', type: 'error', time: 3000 });
        this.isLoadingFields = false;
      }
    },
    async fetchFieldOptions() {
      // Encontrar campos do tipo MENU_DROPDOWN ou MULTI_CHECKBOX
      const specialFields = this.checkoutFields.filter(field =>  isMultiOptionField(field.eventCheckoutField.type));
      
      // Buscar opções para cada campo especial
      for (const field of specialFields) {
        try {
          const fieldId = field.eventCheckoutField.id;
          if (!this.checkoutFieldOptions[fieldId]) {
            this.checkoutFieldOptions[fieldId] = await eventCheckout.fetchCheckoutFieldOptions(fieldId);
          }
        } catch (error) {
          console.error('Erro ao carregar opções de campo:', error);
        }
      }
    },
    generateTicketForms() {
      this.ticketFormGroups = [];
      this.expandedFormPanels = [];
      
      let panelIndex = 0;
      
      // Para cada tipo de ingresso selecionado
      this.selectedTickets.forEach(selectedTicket => {
        const ticket = this.tickets.find(t => t.id === selectedTicket.id);
        if (!ticket) return;
        
        const instances = [];
        // Para cada unidade desse ingresso
        for (let i = 0; i < selectedTicket.quantity; i++) {
          instances.push({
            personType: 'PF',
            fields: {}
          });
        }
        
        this.ticketFormGroups.push({
          ticketId: ticket.id,
          ticketName: ticket.name,
          quantity: selectedTicket.quantity,
          instances
        });
        
        // Expandir o primeiro painel por padrão
        this.expandedFormPanels.push(panelIndex);
        panelIndex++;
      });
    },
    validateCheckoutFields() {
      if (!this.$refs.ticketForms) return false;
      
      return this.$refs.ticketForms.every(form => form.validate());
    },
    async processPdvPayment() {
      if (this.selectedTickets.length === 0) {
        toast.setToast({ text: 'Selecione pelo menos um ingresso para continuar.', type: 'error', time: 3000 });
        return;
      }
      
      // Validar campos antes de processar
      if (!this.validateCheckoutFields()) {
        toast.setToast({ text: 'Por favor, preencha todos os campos obrigatórios.', type: 'error', time: 3000 });
        return;
      }
      
      try {
        this.isProcessing = true;
        const paymentApprovedStatus = await status.fetchStatusByModuleAndName({ module: 'payment', name: 'Aprovado' });
        if (!paymentApprovedStatus) throw new Error('Status de pagamento aprovado não encontrado');
        
        const paymentPayload = {
          data: [{
            user_id: this.$cookies.get('user_id'),
            status_id: paymentApprovedStatus.id,
            payment_method: 'PDV',
            gross_value: this.totalAmount,
            net_value: this.netAmount,
            paid_at: new Date().toISOString()
          }]
        };
        const paymentResponse = await payment.createPayment(paymentPayload);
        const paymentId = paymentResponse[0].id;

        const ticketAvailableStatus = await status.fetchStatusByModuleAndName({ module: 'customer-ticket', name: 'Disponível' });
        if (!ticketAvailableStatus) throw new Error('Status de ingresso disponível não encontrado');

        const userResponse = await user.get(this.$cookies.get('user_id'));
        
        // Preparar e enviar os tickets com campos customizados usando o serviço
        const customerTicketsPayload = prepareCustomTicketsPayload({
          ticketFormGroups: this.ticketFormGroups,
          paymentId,
          ownerId: userResponse.people.id,
          statusId: ticketAvailableStatus.id
        });

        console.log(customerTicketsPayload);
        
        // Criar os customer tickets e obter o retorno com os IDs
        const customerTicketsResponse = await eventCheckout.createCustomerTicket(customerTicketsPayload);
        
        // Preparar os dados para a tabela ticket-field com valores mapeados
        const ticketFieldsPayload = prepareTicketFieldsPayloadWithMappedValues(
          customerTicketsResponse, 
          this.ticketFormGroups, 
          this.checkoutFields,
          this.checkoutFieldOptions
        );
        
        // Enviar os dados para a API ticket-field
        if (ticketFieldsPayload.data.length > 0) {
            console.log('Payload de campos de ticket:', ticketFieldsPayload);
            await eventCheckout.createTicketFields(ticketFieldsPayload);
        }

        // Atualizar a quantidade de ingressos vendidos
        const ticketsSoldPayload = this.selectedTickets.map(ticket => ({
          ticketId: ticket.id,
          total_sold: ticket.quantity
        }));
        
        await eventCheckout.updateEventTicketsTotalSold(ticketsSoldPayload);

        toast.setToast({ text: 'Pedido PDV realizado com sucesso!', type: 'success', time: 3000 });
        this.close();
        this.$emit('order-created');
      } catch (error) {
        console.error('Erro ao processar PDV:', error);
        toast.setToast({ text: 'Erro ao processar pedido PDV: ' + (error.message || 'Erro desconhecido'), type: 'error', time: 3000 });
      } finally {
        this.isProcessing = false;
      }
    },
    
  }
};
</script>

<style scoped>
.ticket-section-title { font-size: 18px; font-weight: 700; color: var(--black-text); font-family: var(--font-family-inter-bold); }
.ticket-category-panels { border-radius: 0;}
.ticket-category-panel { margin-bottom: 8px; border: none !important; border-radius: 8px !important; overflow: hidden;background-color: #f5f5f5 !important; }
::v-deep .v-expansion-panel-content__wrap { padding: 18px 14px; }
::v-deep .v-expansion-panel::before { box-shadow: none; }
.ticket-category-name { font-size: 16px; font-weight: 700; color: var(--primary); font-family: var(--font-family-inter-bold); }
.ticket-category-count { font-size: 14px; }
.empty-tickets-message { color: var(--black-text); font-size: 14px; text-align: center; padding: 20px 0; }
.empty-cart-message { font-size: 16px; font-weight: 700; color: var(--black-text); margin-bottom: 8px; }
.empty-cart-description { font-size: 14px; color: var(--grey-text); }
.ticket-name { font-weight: 500; }
.ticket-quantity { font-size: 13px; color: var(--grey-text); }
.total-value { font-weight: 700; color: var(--primary); font-size: 18px; }
.pdv-stepper { box-shadow: none; }
.ticket-instance-title { font-size: 16px; font-weight: 500; color: var(--black-text); }
.ticket-forms-panels { border-radius: 0;}
.ticket-form-panel { margin-bottom: 8px; border: none !important; border-radius: 8px !important; overflow: hidden;background-color: #f5f5f5 !important; }
.field-label { font-size: 14px; }
.required { color: red; }
</style>