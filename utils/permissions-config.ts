/**
 * Configuração centralizada de permissões do sistema
 * Este arquivo define todas as permissões disponíveis no sistema
 * e serve como referência para configuração de rotas e verificações de acesso
 */

export interface Permission {
  name: string;
  description: string;
}

/**
 * Permissões relacionadas a eventos
 */
export const EVENT_PERMISSIONS = {
  VIEW: 'view_event',
  CREATE: 'create_event',
  EDIT: 'edit_event',
  DELETE: 'delete_event',
  MANAGE_TICKETS: 'manage_event_tickets',
  MANAGE_COUPONS: 'manage_event_coupons',
  MANAGE_COLLABORATORS: 'manage_event_collaborators',
  MANAGE_GUESTLIST: 'manage_event_guestlist',
  VIEW_ORDERS: 'view_event_orders',
  MANAGE_ORDERS: 'manage_event_orders',
  MANAGE_CHECKIN: 'manage_event_checkin',
  MANAGE_PDV: 'manage_event_pdv',
};

/**
 * Permissões relacionadas a usuários
 */
export const USER_PERMISSIONS = {
  VIEW: 'view_user',
  CREATE: 'create_user',
  EDIT: 'edit_user',
  DELETE: 'delete_user',
  MANAGE_ROLES: 'manage_user_roles',
};

/**
 * Permissões relacionadas a relatórios
 */
export const REPORT_PERMISSIONS = {
  VIEW_SALES: 'view_sales_reports',
  VIEW_CHECKIN: 'view_checkin_reports',
  VIEW_FINANCIAL: 'view_financial_reports',
  EXPORT: 'export_reports',
};

/**
 * Permissões relacionadas a configurações do sistema
 */
export const SYSTEM_PERMISSIONS = {
  MANAGE_SETTINGS: 'manage_system_settings',
  MANAGE_PERMISSIONS: 'manage_permissions',
};

/**
 * Lista de todas as permissões do sistema
 * Utilizada para cadastrar permissões na API
 */
export const ALL_PERMISSIONS: Permission[] = [
  // Permissões de eventos
  { name: EVENT_PERMISSIONS.VIEW, description: 'Visualizar eventos' },
  { name: EVENT_PERMISSIONS.CREATE, description: 'Criar eventos' },
  { name: EVENT_PERMISSIONS.EDIT, description: 'Editar eventos' },
  { name: EVENT_PERMISSIONS.DELETE, description: 'Excluir eventos' },
  { name: EVENT_PERMISSIONS.MANAGE_TICKETS, description: 'Gerenciar ingressos de eventos' },
  { name: EVENT_PERMISSIONS.MANAGE_COUPONS, description: 'Gerenciar cupons de eventos' },
  { name: EVENT_PERMISSIONS.MANAGE_COLLABORATORS, description: 'Gerenciar colaboradores de eventos' },
  { name: EVENT_PERMISSIONS.MANAGE_GUESTLIST, description: 'Gerenciar listas de convidados de eventos' },
  { name: EVENT_PERMISSIONS.VIEW_ORDERS, description: 'Visualizar pedidos de eventos' },
  { name: EVENT_PERMISSIONS.MANAGE_ORDERS, description: 'Gerenciar pedidos de eventos' },
  { name: EVENT_PERMISSIONS.MANAGE_CHECKIN, description: 'Gerenciar check-in de eventos' },
  { name: EVENT_PERMISSIONS.MANAGE_PDV, description: 'Gerenciar PDV de eventos' },
  
  // Permissões de usuários
  { name: USER_PERMISSIONS.VIEW, description: 'Visualizar usuários' },
  { name: USER_PERMISSIONS.CREATE, description: 'Criar usuários' },
  { name: USER_PERMISSIONS.EDIT, description: 'Editar usuários' },
  { name: USER_PERMISSIONS.DELETE, description: 'Excluir usuários' },
  { name: USER_PERMISSIONS.MANAGE_ROLES, description: 'Gerenciar papéis de usuários' },
  
  // Permissões de relatórios
  { name: REPORT_PERMISSIONS.VIEW_SALES, description: 'Visualizar relatórios de vendas' },
  { name: REPORT_PERMISSIONS.VIEW_CHECKIN, description: 'Visualizar relatórios de check-in' },
  { name: REPORT_PERMISSIONS.VIEW_FINANCIAL, description: 'Visualizar relatórios financeiros' },
  { name: REPORT_PERMISSIONS.EXPORT, description: 'Exportar relatórios' },
  
  // Permissões de sistema
  { name: SYSTEM_PERMISSIONS.MANAGE_SETTINGS, description: 'Gerenciar configurações do sistema' },
  { name: SYSTEM_PERMISSIONS.MANAGE_PERMISSIONS, description: 'Gerenciar permissões' },
];

/**
 * Função utilitária para mapear permissões necessárias para uma rota
 * @param permissions Array de nomes de permissões necessárias
 * @returns Array formatado para configuração de rota
 */
export function requirePermissions(...permissions: string[]): string[] {
  return permissions;
}

/**
 * Configurações de permissões para cada papel (role) no sistema
 * Define quais permissões cada papel possui por padrão
 */
export const ROLE_DEFAULT_PERMISSIONS = {
  'Admin': ALL_PERMISSIONS.map(p => p.name),
  'Gerente': [
    EVENT_PERMISSIONS.VIEW,
    EVENT_PERMISSIONS.CREATE,
    EVENT_PERMISSIONS.EDIT,
    EVENT_PERMISSIONS.MANAGE_TICKETS,
    EVENT_PERMISSIONS.MANAGE_COUPONS,
    EVENT_PERMISSIONS.MANAGE_COLLABORATORS,
    EVENT_PERMISSIONS.MANAGE_GUESTLIST,
    EVENT_PERMISSIONS.VIEW_ORDERS,
    EVENT_PERMISSIONS.MANAGE_CHECKIN,
    EVENT_PERMISSIONS.MANAGE_PDV,
    USER_PERMISSIONS.VIEW,
    REPORT_PERMISSIONS.VIEW_SALES,
    REPORT_PERMISSIONS.VIEW_CHECKIN,
    REPORT_PERMISSIONS.VIEW_FINANCIAL,
    REPORT_PERMISSIONS.EXPORT,
  ],
  'Promotor': [
    EVENT_PERMISSIONS.VIEW,
    EVENT_PERMISSIONS.CREATE,
    EVENT_PERMISSIONS.EDIT,
    EVENT_PERMISSIONS.MANAGE_TICKETS,
    EVENT_PERMISSIONS.MANAGE_COUPONS,
    EVENT_PERMISSIONS.MANAGE_COLLABORATORS,
    EVENT_PERMISSIONS.MANAGE_GUESTLIST,
    EVENT_PERMISSIONS.VIEW_ORDERS,
    EVENT_PERMISSIONS.MANAGE_CHECKIN,
    EVENT_PERMISSIONS.MANAGE_PDV,
    REPORT_PERMISSIONS.VIEW_SALES,
    REPORT_PERMISSIONS.VIEW_CHECKIN,
    REPORT_PERMISSIONS.VIEW_FINANCIAL,
  ],
  'Operador de Check-in': [
    EVENT_PERMISSIONS.VIEW,
    EVENT_PERMISSIONS.MANAGE_CHECKIN,
  ],
  'PDV (Ponto de venda)': [
    EVENT_PERMISSIONS.VIEW,
    EVENT_PERMISSIONS.MANAGE_PDV,
  ],
  'Colaborador': [
    EVENT_PERMISSIONS.VIEW,
  ],
}; 