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
      let peopleID = context.$store.state.auth.user?.auth?.people?.id;
      if (!peopleID) {
        const userId = context.$store.state.auth.user?.auth?.id;
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
      
      const userId = context.$store.state.auth.user?.auth?.id;
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