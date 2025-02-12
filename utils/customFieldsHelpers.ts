import { CustomField, CustomFieldApiResponse, FieldSelectedOption, FieldTicketRelation, CustomFieldTicket, PersonType } from '~/models/event';

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

interface PersonTypeChanges {
  toDelete: string[]; // IDs dos campos a serem deletados
  toCreate: PersonType[];
}

export const getTicketRelationChanges = (
  existingRelations: FieldTicketRelation[],
  ticketsFromEvent: CustomFieldTicket[],
  ticketsFromField: CustomFieldTicket[]
): TicketRelationChanges => {
  // Filtra apenas os tickets que pertencem ao campo
  const relevantTickets = ticketsFromEvent.filter(eventTicket =>
    ticketsFromField.some(fieldTicket => fieldTicket.id === eventTicket.id || fieldTicket.name === eventTicket.name)
  );
  
  // Separa tickets deletados e ativos
  const deletedTicketIds = relevantTickets
    .filter(ticket => ticket._deleted)
    .map(ticket => ticket.id);
  
  const activeTickets = relevantTickets.filter(ticket => !ticket._deleted);

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

  // Se o campo foi deletado, não atualiza
  if (newField._deleted) {
    return false;
  }

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

export const getPersonTypeChanges = (
  field: CustomField
): PersonTypeChanges => {
  const { field_ids: fieldIds, person_types: personTypes } = field;
  
  // Se não tem field_ids, é um campo novo
  if (!fieldIds) {
    return { toDelete: [], toCreate: personTypes };
  }

  // Encontra tipos de pessoa que têm ID mas não estão mais na lista
  const toDelete = Object.entries(fieldIds)
    .filter(([personType, id]) => 
      id && // tem ID
      !personTypes.includes(personType as PersonType) // não está mais na lista
    )
    .map(([_, id]) => id);
  
    // Encontra tipos de pessoa que estão na lista mas não têm ID
  const toCreate = personTypes.filter(personType => 
    !fieldIds[personType] || fieldIds[personType] === ''
  );

  return { toDelete, toCreate };
};

export const getNextDisplayOrder = (fields: CustomField[]): number[] => {
  // Ordena todos os fields (incluindo deletados) por display_order
  const sortedFields = [...fields].sort((a, b) =>
    (a.display_order || 0) - (b.display_order || 0)
  );

  // Cria um Set com todas as ordens em uso (incluindo de fields deletados)
  const usedOrders = new Set(
    sortedFields
      .filter(field => field.display_order && !field._deleted)
      .map(field => field.display_order)
  );

  // Gera array de display_orders válidos
  const displayOrders = fields.map((field) => {

    // Se o field já tem uma ordem válida e não conflitante, mantém
    if (field.display_order &&
        !usedOrders.has(field.display_order) &&
        field.display_order > 0) {
      usedOrders.add(field.display_order);
      return field.display_order;
    }

    // Encontra próxima ordem disponível
    let order = 1;
    while (usedOrders.has(order)) {
      order++;
    }
    usedOrders.add(order);
    return order;
  });

  return displayOrders;
};