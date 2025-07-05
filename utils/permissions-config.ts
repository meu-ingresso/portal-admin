/**
 * Configuração centralizada de permissões do sistema
 * Este arquivo define todas as permissões disponíveis no sistema
 * e serve como referência para configuração de rotas e verificações de acesso
 */


/**
 * Permissões relacionadas a eventos e suas funcionalidades/templates
 */
export const EVENT_PERMISSIONS = {
  VIEW: 'view-events',
  CREATE: 'create-events',
  EDIT: 'edit-events',
  DELETE: 'delete-events',
  EXPORT: 'export-events-data',
  ADD_TICKETS: 'add-events-tickets',
  ADD_COUPONS: 'add-events-coupons',
  ADD_COLLABORATORS: 'add-events-collaborators',
  ADD_GUESTLIST: 'add-events-guestlist',
  ADD_ORDERS: 'add-events-orders',
  DO_CHECKIN: 'do-events-checkin',
  UNDO_CHECKIN: 'undo-events-checkin',
  ADD_PDV: 'add-events-pdv',
  ADD_ORDERS_PDV: 'add-events-orders-pdv',
  EDIT_TICKETS: 'edit-events-tickets',
  EDIT_COUPONS: 'edit-events-coupons',
  EDIT_COLLABORATORS: 'edit-events-collaborators',
  EDIT_GUESTLIST: 'edit-events-guestlist',
  EDIT_ORDERS: 'edit-events-orders',
  EDIT_PDV: 'edit-events-pdv',
  EDIT_ORDERS_PDV: 'edit-events-orders-pdv',
  DELETE_TICKETS: 'delete-events-tickets',
  DELETE_COUPONS: 'delete-events-coupons',
  DELETE_COLLABORATORS: 'delete-events-collaborators',
  DELETE_GUESTLIST: 'delete-events-guestlist',
  DELETE_ORDERS: 'delete-events-orders',
  DELETE_PDV: 'delete-events-pdv',
  DELETE_ORDERS_PDV: 'delete-events-orders-pdv',
  VIEW_TICKETS: 'view-events-tickets',
  VIEW_COUPONS: 'view-events-coupons',
  VIEW_COLLABORATORS: 'view-events-collaborators',
  VIEW_GUESTLIST: 'view-events-guestlist',
  VIEW_ORDERS: 'view-events-orders',
  VIEW_CHECKIN: 'view-events-checkin',
  VIEW_PDV: 'view-events-pdv',
  VIEW_ORDERS_PDV: 'view-events-orders-pdv',
  VIEW_INTEGRATIONS: 'view-events-integrations',
  EDIT_INTEGRATIONS: 'edit-events-integrations',
  RESEND_TICKETS_FROM_ORDERS: 'resend-events-tickets-from-orders',
  PRINT_TICKETS_FROM_ORDERS: 'print-events-tickets-from-orders',
  CANCEL_ORDERS: 'cancel-events-orders',
};

/**
 * Permissões relacionadas a usuários
 */
export const USER_PERMISSIONS = {
  VIEW: 'view-users',
  CREATE: 'create-users',
  EDIT: 'edit-users',
  DELETE: 'delete-users',
  MANAGE_ROLES: 'manage-users-roles',
};

/**
 * Permissões relacionadas a relatórios
 */
export const REPORT_PERMISSIONS = {
  VIEW_EVENT_GENERAL: 'view-events-general-reports',
  VIEW_SALES: 'view-sales-reports',
  VIEW_CHECKIN: 'view-checkin-reports',
  VIEW_TICKETS: 'view-tickets-reports',
  VIEW_USERS: 'view-users-reports',
};

/**
 * Permissões relacionadas a configurações do sistema
 */
export const SYSTEM_PERMISSIONS = {
  MANAGE_SETTINGS: 'manage-settings',
  MANAGE_PERMISSIONS: 'manage-permissions',
};

/**
 * Permissões relacionadas a produtores de eventos
 */
export const PRODUCER_PERMISSIONS = {
  VIEW: 'view-producer-page',
  EDIT: 'edit-producer-page',
};

/**
 * Nomes dos papéis
 */
export const ADMIN_ROLE = 'Admin';
export const FINANCIAL_ROLE = 'Financeiro';
export const ANALYST_ROLE = 'Analista';
export const OPERATOR_ROLE = 'Operador';
export const CLIENT_ROLE = 'Cliente';
export const PRODUCER_ROLE = 'Produtor';
export const MANAGER_ROLE = 'Gerente';
export const CHECKIN_COORDINATOR_ROLE = 'Coordenador de Check-in';
export const CHECKIN_ROLE = 'Check-in';
export const PDV_ROLE = 'PDV (Ponto de venda)';
export const VISUALIZATION_ROLE = 'Visualização';



/**
 * Papéis relacionados a colaboradores de eventos
 */
export const EVENT_COLLABORATOR_ROLES = [
  {
    name: MANAGER_ROLE,
    permissions: [
      EVENT_PERMISSIONS.VIEW,
      EVENT_PERMISSIONS.CREATE,
      EVENT_PERMISSIONS.EDIT,
      EVENT_PERMISSIONS.EXPORT,
      EVENT_PERMISSIONS.VIEW_TICKETS,
      EVENT_PERMISSIONS.VIEW_COUPONS,
      EVENT_PERMISSIONS.VIEW_COLLABORATORS,
      EVENT_PERMISSIONS.VIEW_GUESTLIST,
      EVENT_PERMISSIONS.VIEW_ORDERS,
      EVENT_PERMISSIONS.VIEW_CHECKIN,
      EVENT_PERMISSIONS.VIEW_PDV,
      EVENT_PERMISSIONS.VIEW_ORDERS_PDV,
      EVENT_PERMISSIONS.VIEW_INTEGRATIONS,
      EVENT_PERMISSIONS.ADD_TICKETS,
      EVENT_PERMISSIONS.ADD_COUPONS,
      EVENT_PERMISSIONS.ADD_COLLABORATORS,
      EVENT_PERMISSIONS.ADD_GUESTLIST,
      EVENT_PERMISSIONS.ADD_ORDERS,
      EVENT_PERMISSIONS.DO_CHECKIN,
      EVENT_PERMISSIONS.UNDO_CHECKIN,
      EVENT_PERMISSIONS.ADD_PDV,
      EVENT_PERMISSIONS.ADD_ORDERS_PDV,
      EVENT_PERMISSIONS.EDIT_TICKETS,
      EVENT_PERMISSIONS.EDIT_COUPONS,
      EVENT_PERMISSIONS.EDIT_COLLABORATORS,
      EVENT_PERMISSIONS.EDIT_GUESTLIST,
      EVENT_PERMISSIONS.EDIT_ORDERS,
      EVENT_PERMISSIONS.EDIT_PDV,
      EVENT_PERMISSIONS.EDIT_ORDERS_PDV,
      EVENT_PERMISSIONS.EDIT_INTEGRATIONS,
      EVENT_PERMISSIONS.RESEND_TICKETS_FROM_ORDERS,
      EVENT_PERMISSIONS.PRINT_TICKETS_FROM_ORDERS,
      EVENT_PERMISSIONS.CANCEL_ORDERS,
    ],
  },
  {
    name: CHECKIN_COORDINATOR_ROLE,
    permissions: [
      EVENT_PERMISSIONS.VIEW,
      EVENT_PERMISSIONS.VIEW_CHECKIN,
      EVENT_PERMISSIONS.DO_CHECKIN,
      EVENT_PERMISSIONS.UNDO_CHECKIN,
    ]
  },
  {
    name: CHECKIN_ROLE,
    permissions: [
      EVENT_PERMISSIONS.VIEW,
      EVENT_PERMISSIONS.VIEW_CHECKIN,
      EVENT_PERMISSIONS.DO_CHECKIN,
    ]
  },
  {
    name: PDV_ROLE,
    permissions: [
      EVENT_PERMISSIONS.VIEW,
      EVENT_PERMISSIONS.VIEW_ORDERS,
      EVENT_PERMISSIONS.VIEW_ORDERS_PDV,
      EVENT_PERMISSIONS.ADD_ORDERS_PDV,
      EVENT_PERMISSIONS.EDIT_ORDERS_PDV,
      EVENT_PERMISSIONS.RESEND_TICKETS_FROM_ORDERS,
    ]
  },
  {
    name: VISUALIZATION_ROLE,
    permissions: [
      EVENT_PERMISSIONS.VIEW,
      EVENT_PERMISSIONS.VIEW_TICKETS,
      EVENT_PERMISSIONS.VIEW_COUPONS,
      EVENT_PERMISSIONS.VIEW_COLLABORATORS,
      EVENT_PERMISSIONS.VIEW_GUESTLIST,
      EVENT_PERMISSIONS.VIEW_ORDERS,
      EVENT_PERMISSIONS.VIEW_CHECKIN,
      EVENT_PERMISSIONS.VIEW_PDV,
    ]
  },
];

/**
 * Papéis relacionados a administradores para gestão da empresa
 */
export const ADMIN_ROLES = [
  {
    name: ADMIN_ROLE,
    permissions: [
      ...Object.values(SYSTEM_PERMISSIONS),
      ...Object.values(REPORT_PERMISSIONS),
      ...Object.values(USER_PERMISSIONS),
      ...Object.values(EVENT_PERMISSIONS),
    ],
  },
  {
    name: FINANCIAL_ROLE,
    permissions: [
      EVENT_PERMISSIONS.VIEW,
      REPORT_PERMISSIONS.VIEW_SALES,
      REPORT_PERMISSIONS.VIEW_CHECKIN,
      REPORT_PERMISSIONS.VIEW_TICKETS,
      REPORT_PERMISSIONS.VIEW_EVENT_GENERAL,
    ]
  },
  {
    name: ANALYST_ROLE,
    permissions: [
      EVENT_PERMISSIONS.VIEW,
      EVENT_PERMISSIONS.EDIT,
      EVENT_PERMISSIONS.DELETE,
      EVENT_PERMISSIONS.EXPORT,
      EVENT_PERMISSIONS.VIEW_TICKETS,
      EVENT_PERMISSIONS.VIEW_COUPONS,
      EVENT_PERMISSIONS.VIEW_COLLABORATORS,
      EVENT_PERMISSIONS.VIEW_GUESTLIST,
      EVENT_PERMISSIONS.VIEW_ORDERS,
      EVENT_PERMISSIONS.VIEW_CHECKIN,
      EVENT_PERMISSIONS.VIEW_PDV,
      EVENT_PERMISSIONS.VIEW_ORDERS_PDV,
      EVENT_PERMISSIONS.ADD_TICKETS,
      EVENT_PERMISSIONS.ADD_COUPONS,
      EVENT_PERMISSIONS.ADD_COLLABORATORS,
      EVENT_PERMISSIONS.ADD_GUESTLIST,
      EVENT_PERMISSIONS.ADD_ORDERS,
      EVENT_PERMISSIONS.DO_CHECKIN,
      EVENT_PERMISSIONS.UNDO_CHECKIN,
      EVENT_PERMISSIONS.ADD_PDV,
      EVENT_PERMISSIONS.ADD_ORDERS_PDV,
      EVENT_PERMISSIONS.EDIT_ORDERS_PDV,
      EVENT_PERMISSIONS.EDIT_TICKETS,
      EVENT_PERMISSIONS.EDIT_COUPONS,
      EVENT_PERMISSIONS.EDIT_COLLABORATORS,
      EVENT_PERMISSIONS.EDIT_GUESTLIST,
      EVENT_PERMISSIONS.EDIT_ORDERS,
      EVENT_PERMISSIONS.EDIT_PDV,
      EVENT_PERMISSIONS.DELETE_TICKETS,
      EVENT_PERMISSIONS.DELETE_COUPONS,
      EVENT_PERMISSIONS.DELETE_COLLABORATORS,
      EVENT_PERMISSIONS.DELETE_GUESTLIST,
      EVENT_PERMISSIONS.DELETE_ORDERS,
      EVENT_PERMISSIONS.DELETE_PDV,
      EVENT_PERMISSIONS.DELETE_ORDERS_PDV,
      EVENT_PERMISSIONS.RESEND_TICKETS_FROM_ORDERS,
      EVENT_PERMISSIONS.PRINT_TICKETS_FROM_ORDERS,
      EVENT_PERMISSIONS.CANCEL_ORDERS,
    ]
  },
  {
    name: OPERATOR_ROLE,
    permissions: [
      EVENT_PERMISSIONS.VIEW,
      EVENT_PERMISSIONS.VIEW_ORDERS,
      EVENT_PERMISSIONS.EDIT_ORDERS,
    ]
  }
];


/**
 * Papéis relacionados a produtores de eventos
 */
export const PRODUCER_ROLES = [
  {
    name: PRODUCER_ROLE,
    permissions: [
      ...Object.values(PRODUCER_PERMISSIONS),
      ...Object.values(EVENT_PERMISSIONS),
    ]
  }
];

/**
 * Papéis relacionados a clientes
 */
export const CLIENT_ROLES = [
  {
    name: CLIENT_ROLE,
    permissions: Object.values(EVENT_PERMISSIONS),
  }
];

export interface Permission {
  name: string;
  description: string;
}


/**
 * Função utilitária para mapear permissões necessárias para uma rota
 * @param permissions Array de nomes de permissões necessárias
 * @returns Array formatado para configuração de rota
 */
export function requirePermissions(...permissions: string[]): string[] {
  return permissions;
}
