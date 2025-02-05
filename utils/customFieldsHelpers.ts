import { areArraysEqual } from './utils';
import { CustomField, CustomFieldApiResponse, FieldSelectedOption, FieldTicketRelation } from '~/models/event';

export const defaultFields = ['Nome Completo', 'Email'];

export const hasCustomFieldsChanged = (
    existingFields: CustomFieldApiResponse[],
    newFields: CustomField[]): boolean => {
  // Mapear campos existentes para formato comparável
  const existingFieldsMap = new Map<string, {
    type: string;
    person_types: string[];
    required: boolean;
    visible_on_ticket: boolean;
    is_unique: boolean;
  }>();

  existingFields.forEach(field => {
    const key = field.name;
    const existing = existingFieldsMap.get(key);
    
    if (existing) {
      existing.person_types.push(field.person_type);
    } else {
      existingFieldsMap.set(key, {
        type: field.type,
        person_types: [field.person_type],
        required: field.required,
        visible_on_ticket: field.visible_on_ticket,
        is_unique: field.is_unique,
      });
    }
  });

  // Comparar com novos campos
  for (const newField of newFields) {
    // Pular campos padrão
    if (newField.is_default) continue;
    
    const existingField = existingFieldsMap.get(newField.name);
    
    if (!existingField) return true;

    if (
      existingField.type !== newField.type ||
      !areArraysEqual(existingField.person_types.sort(), newField.person_types.sort()) ||
      existingField.required !== newField.options.includes('required') ||
      existingField.visible_on_ticket !== newField.options.includes('visible_on_ticket') ||
      existingField.is_unique !== newField.options.includes('is_unique')
    ) {
      return true;
    }
  }

  // Verificar se algum campo foi removido
  return newFields.length !== existingFieldsMap.size;
}

export const hasFieldOptionsChanged = (existingOptions: FieldSelectedOption[], newOptions: string[]): boolean => {
  if (existingOptions.length !== newOptions.length) return true;
  
  const existingNames = existingOptions.map(opt => opt.name).sort();
  const newNames = [...newOptions].sort();
  
  return !areArraysEqual(existingNames, newNames);
}

export const hasTicketRelationsChanged = (existingRelations: FieldTicketRelation[], newTickets: string[]): boolean => {
  if (existingRelations.length !== newTickets.length) return true;

  const existingTicketIds = existingRelations.map(rel => rel.ticket_id).sort();
  const newTicketIds = [...newTickets].sort();

  return !areArraysEqual(existingTicketIds, newTicketIds);
}