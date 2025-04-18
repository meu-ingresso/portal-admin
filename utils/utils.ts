import { CategoryOption, Ticket } from '~/models/event';

export const sleep = async (ms: number): Promise<void> => {
  return await new Promise((resolve) => setTimeout(resolve, ms));
};

export const isMobileDevice = (vuetify: any): boolean => {
  return vuetify.breakpoint.mobile;
};

export const getNow = (): Date => {
  return new Date();
};

export const getYearList = () => {
  const currentYear = getNow().getFullYear();

  const years = [];

  for (let i = 0; i < 5; i++) {
    const year = currentYear + i;
    years.push({ value: String(year), text: String(year) });
  }

  return years;
};

export const getCurrentYear = (): string => {
  return String(getNow().getFullYear());
};

export const getNextYearIfLastMonth = (): string => {
  const now = new Date();
  const currentMonthIndex = now.getMonth();

  if (currentMonthIndex === 11) {
    return String(now.getFullYear() + 1);
  }

  return String(now.getFullYear());
};

export const getInitialMonth = (): any => {
  const month = getNow().getMonth() + 1 > 11 ? 0 : getNow().getMonth() + 1;

  return getMonths()[month];
};

export const getMonths = (): any[] => {
  return [
    { value: '1', text: 'Janeiro' },
    { value: '2', text: 'Fevereiro' },
    { value: '3', text: 'Março' },
    { value: '4', text: 'Abril' },
    { value: '5', text: 'Maio' },
    { value: '6', text: 'Junho' },
    { value: '7', text: 'Julho' },
    { value: '8', text: 'Agosto' },
    { value: '9', text: 'Setembro' },
    { value: '10', text: 'Outubro' },
    { value: '11', text: 'Novembro' },
    { value: '12', text: 'Dezembro' },
  ];
};

export const getMonthList = (year: number): any[] => {
  const yearParam = Number(year);

  const now = getNow();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  const months = getMonths();

  const upcomingMonths = [];

  if (yearParam === currentYear) {
    const startMonth = currentMonth + 1;

    for (let i = startMonth; i < months.length; i++) {
      upcomingMonths.push(months[i]);
    }
  } else {
    return months;
  }

  return upcomingMonths;
};

export const userHasPermissions = (
  permissionList: any[],
  routePrefix: string
): boolean => {
  const allowedPrefixes = permissionList.map((permission) => permission.module_prefix);

  return allowedPrefixes.includes(routePrefix);
};

export const getArrayObjectText = (arrayValue: any[], key = 'text'): string => {
  if (!key) {
    return arrayValue.map((item) => item).join(', ');
  }
  return arrayValue.map((item) => item[key]).join(', ');
};

export const getUniqueCategories = (tickets: Ticket[]): CategoryOption[] => {
  const categoryMap = new Map<string, CategoryOption>();

  tickets.forEach((ticket) => {
    if (ticket.category) {
      categoryMap.set(ticket.category.value, ticket.category);
    }
  });

  return Array.from(categoryMap.values());
};

export const areArraysEqual = (arr1: string[], arr2: string[]): boolean => {
  if (arr1.length !== arr2.length) return false;
  return arr1.every((value, index) => value === arr2[index]);
};

export const isArrayEmpty = (array: any[]): boolean => {
  return array.length === 0;
};

export const getPaymentMethod = (payment: string): string => {
  switch (payment) {
    case 'pix':
      return 'Pix';
    case 'billet':
      return 'Boleto';
    case 'credit':
      return 'Cartão de Crédito';
    case 'debit':
      return 'Cartão de Débito';
    case 'PDV':
      return 'PDV (Ponto de Venda)';
    default:
      return payment;
  }
};

export const getUserRole = (cookies: any): any => {
  return cookies.get('user_role');
};

export const isUserAdmin = (cookies: any): boolean => {
  const role = getUserRole(cookies);

  return role && role.name === 'Admin';
};

export const isUserManager = (cookies: any): boolean => {
  const role = getUserRole(cookies);

  return role && role.name === 'Gerente';
};

/**
 * Verifica se o momento atual é pelo menos 24 horas antes da data fornecida,
 * considerando o fuso horário do Brasil.
 * 
 * @param date - Data a ser verificada (formato: '2025-03-31T22:00:00.000Z' ou similar)
 * @returns true se o momento atual é pelo menos 24 horas antes da data fornecida
 */
export const is24HoursOrMoreBeforeDate = (date: string | Date): boolean => {
  if (!date) return false;
  
  // Converte a data para um objeto Date (se ainda não for)
  const eventDate = date instanceof Date ? date : new Date(date);
  
  // Obtém a data atual considerando o fuso horário do Brasil (UTC-3)
  const now = new Date();
  
  // Verifica se a data já passou
  if (eventDate.getTime() <= now.getTime()) {
    return false; // Evento já aconteceu ou está acontecendo, não permite edição
  }
  
  // Calcula a diferença em milissegundos
  const oneDay = 24 * 60 * 60 * 1000; // 24 horas em milissegundos
  
  // Verifica se a diferença é maior ou igual a 24 horas
  return eventDate.getTime() - now.getTime() >= oneDay;
};

export const extractNameFromEmail = (email: string): { firstName: string, lastName: string } => {

  try {
    if (!email || !email.includes('@')) {
      return { firstName: '', lastName: '' };
    }
    
    const localPart = email.split('@')[0];
    
    const cleanedPart = localPart.replace(/[0-9!#$%^&*()+=[\]{};':"\\|,<>/?]/g, '');
    
    const parts = cleanedPart.split(/[._-]/);

    const formattedParts = parts
      .filter(part => part.trim().length > 0)
      .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase());
    
    if (formattedParts.length === 0) {
      return { firstName: '', lastName: '' };
    }
    
    if (formattedParts.length === 1) {
      return { firstName: formattedParts[0], lastName: '' };
    }
    
    const firstName = formattedParts[0];
    const lastName = formattedParts[formattedParts.length - 1];
    
    return { firstName, lastName };
  } catch (error) {
    console.error('Erro ao extrair nome do e-mail:', error);
    return { firstName: '', lastName: '' };
  }
};