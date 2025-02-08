import { CustomField, CustomFieldApiResponse, FieldSelectedOption, FieldTicketRelation, CustomFieldTicket } from '~/models/event';

export const defaultFields = ['Nome Completo', 'Email'];

interface TicketRelationChanges {
  toCreate: CustomFieldTicket[];
  toDelete: string[];
}

interface FieldOptionChanges {
  toCreate: string[];
  toUpdate: FieldSelectedOption[];
  toDelete: string[];
}

export const getTicketRelationChanges = (
  existingRelations: FieldTicketRelation[],
  newTickets: CustomFieldTicket[]
): TicketRelationChanges => {
  // Separa tickets deletados e ativos
  const deletedTicketIds = newTickets
    .filter(ticket => ticket._deleted)
    .map(ticket => ticket.id);
  
  const activeTickets = newTickets.filter(ticket => !ticket._deleted);

  return {
    // Criar apenas para tickets ativos que não existem
    toCreate: activeTickets
      .filter(ticket => !existingRelations.some(rel => rel.ticket_id === ticket.id)),
    
    // Deletar relações se:
    // 1. O ticket foi marcado como deletado OU
    // 2. A relação não existe mais nos tickets ativos
    toDelete: existingRelations
      .filter(rel => 
        deletedTicketIds.includes(rel.ticket_id) || 
        !activeTickets.some(ticket => ticket.id === rel.ticket_id)
      )
      .map(rel => rel.id)
  };
};

export const getFieldOptionChanges = (
  existingOptions: FieldSelectedOption[],
  newOptions: FieldSelectedOption[]
): FieldOptionChanges => {
  const existingOptionsMap = new Map(existingOptions.map(opt => [opt.name, opt]));
  const newOptionsMap = new Map(newOptions.map(opt => [opt.name, opt]));

  const toCreate: string[] = [];
  const toUpdate: FieldSelectedOption[] = [];
  const toDelete: string[] = [];

  // Encontrar opções para criar ou atualizar
  newOptions.forEach(newOpt => {
    const existingOpt = existingOptionsMap.get(newOpt.name);
    if (!existingOpt) {
      toCreate.push(newOpt.name);
    } else if (existingOpt.id && newOpt.name !== existingOpt.name) {
      toUpdate.push({ id: existingOpt.id, name: newOpt.name });
    }
  });

  // Encontrar opções para deletar
  existingOptions.forEach(existingOpt => {
    if (!newOptionsMap.has(existingOpt.name) && existingOpt.id) {
      toDelete.push(existingOpt.id);
    }
  });

  return { toCreate, toUpdate, toDelete };
};

export const shouldUpdateField = (
  existingField: CustomFieldApiResponse,
  newField: CustomField
): boolean => {
  return (
    existingField.type !== newField.type ||
    existingField.required !== newField.options.includes('required') ||
    existingField.visible_on_ticket !== newField.options.includes('visible_on_ticket') ||
    existingField.is_unique !== newField.options.includes('is_unique') ||
    existingField.help_text !== newField.help_text ||
    existingField.display_order !== newField.display_order ||
    existingField.name !== newField.name
  );
};

export const isMultiOptionField = (type: string): boolean => {
  return type === 'MULTI_CHECKBOX' || type === 'MENU_DROPDOWN';
};