  import { CustomerTicketApiResponse } from "~/models/event";

  
  /**
 * Cria o payload para salvar os tickets customizados
 * @param {Array} ticketFormGroups - Grupos de formulários de tickets
 * @param {string} paymentId - ID do pagamento
 * @param {string} ownerId - ID do proprietário
 * @param {string} statusId - ID do status
 * @returns {Object} - Payload para criar os tickets customizados
   */
  export const prepareCustomTicketsPayload = (payload: {
    ticketFormGroups: any[],
    paymentId: string,
    ownerId: string,
    statusId: string
  }): any => {

    console.log(payload);

    try {
      const customerTickets = [];
    
      for (const group of payload.ticketFormGroups) {
        const ticketId = group.ticketId;
        
        for (const instance of group.instances) {
          customerTickets.push({
            ticket_id: ticketId,
            current_owner_id: payload.ownerId,
            payment_id: payload.paymentId,
            status_id: payload.statusId,
            // custom_fields: instance.fields
          });
        }
      }
    
      return { data: customerTickets };
    } catch (error) {
      console.error('Erro ao preparar payload de tickets customizados:', error);
      throw error;
    }
  }

  /**
   * Prepara o payload para criação dos registros na tabela ticket-field
   * @param {Array} customerTicketsResponse - Resposta da API com os customer tickets criados
   * @param {Array} ticketFormGroups - Grupos de formulários com os dados preenchidos
   * @returns {Object} Payload para criar os registros de ticket-field
   */
  export const prepareTicketFieldsPayload = (customerTicketsResponse: CustomerTicketApiResponse[], ticketFormGroups: any) => {
    const ticketFields = [];

    try {
      // Para cada ticket criado
      customerTicketsResponse.forEach((customerTicket, index) => {
        const customerTicketId = customerTicket.id;
        
        // Identificar o grupo e a instância correspondente
        // Precisamos fazer um mapeamento entre o índice do customerTicket e o grupo/instância correspondente
        let currentIndex = 0;
        let targetGroup = null;
        let targetInstance = null;
        
        // Encontrar o grupo e instância correspondentes ao customerTicket atual
        for (const group of ticketFormGroups) {
          for (const instance of group.instances) {
            if (currentIndex === index) {
              targetGroup = group;
              targetInstance = instance;
              break;
            }
            currentIndex++;
          }
          if (targetGroup) break;
        }
        
        if (targetInstance) {
          // Para cada campo preenchido no formulário
          Object.keys(targetInstance.fields).forEach(fieldId => {
            const fieldValue = targetInstance.fields[fieldId];
            
            // Verificar se o valor existe e não está vazio
            if (fieldValue !== undefined && fieldValue !== null && fieldValue !== '') {
              let value = '';
              
              // Para campos do tipo checkbox (array), convertemos para string
              if (Array.isArray(fieldValue)) {
                value = fieldValue.join(',');
              } else {
                // Para campos normais, usamos o valor diretamente
                value = fieldValue.toString();
              }
              
              ticketFields.push({
                customer_ticket_id: customerTicketId,
                field_id: fieldId,
                value
              });
            }
          });
        }
      });
    
      return { data: ticketFields };
    } catch (error) {
      console.error('Erro ao preparar payload de tickets customizados:', error);
      throw error;
    }
  }


/**
 * Prepara o payload para a API ticket-field mapeando os valores corretamente
 * @param {Array} customerTicketsResponse - Resposta da API com os tickets criados
 * @param {Array} ticketFormGroups - Grupos de formulário com dados preenchidos
 * @param {Array} checkoutFields - Campos de checkout disponíveis
 * @param {Array} checkoutFieldOptions - Opções de campos de checkout disponíveis
 * @returns {Object} Payload para a API ticket-field
 */
export const prepareTicketFieldsPayloadWithMappedValues = (
  customerTicketsResponse: CustomerTicketApiResponse[], 
  ticketFormGroups: any, 
  checkoutFields: any,
  checkoutFieldOptions: any
) => {
  
  const ticketFields = [];
    
    try {
      // Para cada ticket criado
      customerTicketsResponse.forEach((customerTicket, index) => {
        const customerTicketId = customerTicket.id;
        
        // Identificar a instância correspondente
        let currentIndex = 0;
        let targetInstance = null;
        
        // Encontrar a instância correspondente ao customerTicket atual
        for (const group of ticketFormGroups) {
          for (const instance of group.instances) {
            if (currentIndex === index) {
              targetInstance = instance;
              break;
            }
            currentIndex++;
          }
          if (targetInstance) break;
        }
        
        if (targetInstance) {
          // Para cada campo preenchido no formulário
          Object.keys(targetInstance.fields).forEach(fieldId => {
            const fieldValue = targetInstance.fields[fieldId];
            
            if (fieldValue !== undefined && fieldValue !== null && fieldValue !== '') {
              // Encontrar informações do campo para saber seu tipo
              const fieldInfo = checkoutFields.find(field => 
                field.eventCheckoutField.id === fieldId
              )?.eventCheckoutField;
              
              let value;
              
              // Tratar valores de acordo com o tipo de campo
              if (fieldInfo && ['MENU_DROPDOWN', 'MULTI_CHECKBOX'].includes(fieldInfo.type)) {
                

                if (Array.isArray(fieldValue)) {
                  // Para múltiplas seleções, concatenar os valores
                  value = fieldValue.join(',');
                } else {
                  // Para seleção única, usar o valor como está e buscar o nome da opção
                  // const option = checkoutFieldOptions[fieldId].find(option => option.id === fieldValue);
                  value = fieldValue
                }
              } else {
                // Para campos de texto, usar o valor como está
                value = fieldValue.toString();
              }
              
              ticketFields.push({
                customer_ticket_id: customerTicketId,
                field_id: fieldId,
                value
              });
            }
          });
        }
      });
      
      return { data: ticketFields };
    } catch (error) {
      console.error('Erro ao preparar payload de ticket fields:', error);
      return { data: [] };
    }
  }
