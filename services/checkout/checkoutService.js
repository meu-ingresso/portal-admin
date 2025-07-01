import { prepareCustomTicketsPayload, prepareTicketFieldsPayloadWithMappedValues } from '@/utils/eventCheckoutHelpers';

// Serviço como um objeto literal JavaScript puro
export default {
  /**
   * Processa um pagamento PDV
   * @param {Object} context - Contexto do componente (this)
   * @param {Object} payload - Dados para processamento
   * @returns {Promise<boolean>}
   */
  async processPdvPayment(context, payload) {
    const { 
      tickets, 
      ticketFormGroups, 
      checkoutFields, 
      checkoutFieldOptions,
      totalAmount,
      netAmount,
      pdvId
    } = payload;
    
    try {
      // 1. Criar pagamento
      const paymentData = await this.createPayment(context, totalAmount, netAmount, pdvId);
      if (!paymentData || !paymentData[0] || !paymentData[0].id) {
        throw new Error('Falha ao criar registro de pagamento');
      }
      
      const paymentId = paymentData[0].id;
      
      // 2. Obter status necessários
      const ticketAvailableStatus = await context.$store.dispatch('status/fetchStatusByModuleAndName', { 
        module: 'customer_ticket', 
        name: 'Disponível' 
      });
      if (!ticketAvailableStatus) throw new Error('Status de ingresso disponível não encontrado');
      
      // 3. Obter profile_id do usuário
      let peopleID = context.$store.state.auth.user?.people?.id;
      if (!peopleID) {
        const userId = context.$store.state.auth.user?.id;
        if (!userId) throw new Error('ID do usuário não encontrado');

        const userResponse = await context.$store.dispatch('user/getById', { user_id: userId, commit: false });
        if (!userResponse || !userResponse?.people || !userResponse?.people?.id) {
          throw new Error('Dados do usuário não encontrados');
        }
        peopleID = userResponse.people.id;
      }

      if (!peopleID) throw new Error('ID do perfil não encontrado');
      
      // 4. Criar tickets customizados. Se pdvId for passado, o ownerId será null, pois o pagamento é feito por um PDV
      // TODO: Verificar se o ownerId é realmente necessário
      const customerTicketsPayload = prepareCustomTicketsPayload({
        ticketFormGroups,
        paymentId,
        ownerId: pdvId ? peopleID : peopleID,
        statusId: ticketAvailableStatus.id
      });
      
      // 5. Enviar para a API e obter resposta com IDs
      const customerTicketsResponse = await context.$store.dispatch('eventCheckout/createCustomerTicket', customerTicketsPayload);
      if (!customerTicketsResponse) throw new Error('Falha ao criar tickets');
      
      // 6. Criar campos de tickets (se existirem campos de checkout)
      if (checkoutFields && checkoutFields.length > 0) {
        const ticketFieldsPayload = prepareTicketFieldsPayloadWithMappedValues(
          customerTicketsResponse, 
          ticketFormGroups, 
          checkoutFields, 
          checkoutFieldOptions
        );
        
        if (ticketFieldsPayload.data.length > 0) {
          await context.$store.dispatch('eventCheckout/createTicketFields', ticketFieldsPayload);
        }
      }
      
      // 7. Atualizar contagem de ingressos vendidos
      const ticketsSoldPayload = tickets.map(ticket => ({
        ticketId: ticket.id,
        total_sold: ticket.quantity
      }));
      
      await context.$store.dispatch('eventCheckout/updateEventTicketsTotalSold', ticketsSoldPayload);
      
      return true;
    } catch (error) {
      console.error('Erro no processamento do PDV:', error);
      throw error;
    }
  },

  /**
   * Processa um pagamento PDV usando a nova estrutura e endpoint
   * @param {Object} context - Contexto do componente (this)
   * @param {Object} payload - Dados para processamento
   * @returns {Promise<boolean>}
   */
  async processPdvPaymentV2(context, payload) {
    const { 
      tickets, 
      ticketFormGroups, 
      checkoutFields, 
      totalAmount,
      netAmount,
      pdvId,
      eventId
    } = payload;
    
    try {
      // 1. Obter people_id do usuário
      let peopleId = context.$store.state.auth.user?.people?.id;
      if (!peopleId) {
        const userId = context.$store.state.auth.user?.id;
        if (!userId) throw new Error('ID do usuário não encontrado');

        const userResponse = await context.$store.dispatch('user/getById', { user_id: userId, commit: false });
        if (!userResponse || !userResponse?.people || !userResponse?.people?.id) {
          throw new Error('Dados do usuário não encontrados');
        }
        peopleId = userResponse.people.id;
      }

      if (!peopleId) throw new Error('ID do perfil não encontrado');
      
      // 2. Preparar tickets com campos
      const formattedTickets = this.prepareTicketsForPdvV2(tickets, ticketFormGroups, checkoutFields);
      
      // 3. Montar payload para a nova API
      const pdvPayload = {
        event_id: eventId,
        people_id: peopleId,
        pdv_id: pdvId,
        description: "Venda PDV",
        transaction_amount: totalAmount,
        gross_value: totalAmount,
        net_value: netAmount,
        tickets: formattedTickets
      };

      // 4. Chamar o novo endpoint
      const response = await this.callPdvPaymentApi(context, pdvPayload);
      
      if (!response || response.body.code !== 'PDV_PAYMENT_SUCCESS') {
        throw new Error('Falha no processamento do pagamento PDV');
      }
      
      return response;
    } catch (error) {
      console.error('Erro no processamento do PDV V2:', error);
      throw error;
    }
  },

  /**
   * Prepara os tickets no formato da nova API
   * @param {Array} tickets - Tickets selecionados
   * @param {Array} ticketFormGroups - Grupos de formulários de tickets
   * @param {Array} checkoutFields - Campos de checkout
   * @returns {Array} Tickets formatados
   */
  prepareTicketsForPdvV2(tickets, ticketFormGroups, checkoutFields) {
    const formattedTickets = [];
    
    try {
      for (const ticket of tickets) {
        // Encontrar o grupo de formulário correspondente
        const formGroup = ticketFormGroups.find(group => group.ticketId === ticket.id);
        
        if (!formGroup) {
          // Se não há formulário, criar ticket simples
          formattedTickets.push({
            ticket_id: ticket.id,
            quantity: ticket.quantity,
            ticket_fields: []
          });
          continue;
        }
        
        // Para cada instância no grupo, preparar os campos
        const allTicketFields = [];
        
        for (const instance of formGroup.instances) {
          const ticketFields = [];
          
          // Para cada campo preenchido na instância
          Object.keys(instance.fields).forEach(fieldId => {
            const fieldValue = instance.fields[fieldId];
            
            if (fieldValue !== undefined && fieldValue !== null && fieldValue !== '') {
              let value;
              
              // Encontrar informações do campo para saber seu tipo
              const fieldInfo = checkoutFields.find(field => 
                field.eventCheckoutField.id === fieldId
              )?.eventCheckoutField;
              
              if (fieldInfo && ['MENU_DROPDOWN', 'MULTI_CHECKBOX'].includes(fieldInfo.type)) {
                if (Array.isArray(fieldValue)) {
                  value = fieldValue.join(',');
                } else {
                  value = fieldValue.toString();
                }
              } else {
                value = fieldValue.toString();
              }
              
              ticketFields.push({
                field_id: fieldId,
                value
              });
            }
          });
          
          allTicketFields.push(...ticketFields);
        }
        
        formattedTickets.push({
          ticket_id: ticket.id,
          quantity: ticket.quantity,
          ticket_fields: allTicketFields
        });
      }
      
      return formattedTickets;
    } catch (error) {
      console.error('Erro ao preparar tickets para PDV V2:', error);
      throw error;
    }
  },

  /**
   * Chama a nova API de pagamento PDV
   * @param {Object} context - Contexto do componente
   * @param {Object} payload - Dados do pagamento
   * @returns {Promise<Object>}
   */
  async callPdvPaymentApi(context, payload) {
    try {
      const response = await context.$axios.post('/payment/pdv', payload);
      return response.data;
    } catch (error) {
      console.error('Erro na chamada da API PDV:', error);
      throw error;
    }
  },
  
  /**
   * Cria um registro de pagamento
   * @param {Object} context - Contexto do componente
   * @param {Number} totalAmount - Valor total
   * @param {Number} netAmount - Valor líquido
   * @returns {Promise<Object>}
   */
  async createPayment(context, totalAmount, netAmount, pdvId = null) {
    try {
      const paymentApprovedStatus = await context.$store.dispatch('status/fetchStatusByModuleAndName', { 
        module: 'payment', 
        name: 'Aprovado' 
      });
      if (!paymentApprovedStatus) throw new Error('Status de pagamento aprovado não encontrado');
      
      const userId = context.$store.state.auth.user?.id;
      if (!userId) throw new Error('ID do usuário não encontrado');

      const paymentPayload = {
        user_id: userId,
        status_id: paymentApprovedStatus.id,
        payment_method: 'PDV',
        gross_value: totalAmount,
        net_value: netAmount,
        paid_at: new Date().toISOString(),
      }

      if (pdvId) {
        paymentPayload.pdv_id = pdvId;
      } 

      return context.$store.dispatch('payment/createPayment', [paymentPayload]);
    } catch (error) {
      console.error('Erro ao criar pagamento:', error);
      throw error;
    }
  }
}; 