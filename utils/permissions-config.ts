/**
 * Configuração centralizada de permissões do sistema
 * Este arquivo define todas as permissões disponíveis no sistema
 * e serve como referência para configuração de rotas e verificações de acesso
 */


/**
 * Permissões relacionadas a eventos e suas funcionalidades/templates
 */
export const EVENT_PERMISSIONS = {
  VIEW: 'view_event',
  CREATE: 'create_event',
  EDIT: 'edit_event',
  DELETE: 'delete_event',
  EXPORT: 'export_event_data',
  ADD_TICKETS: 'add_event_tickets',
  ADD_COUPONS: 'add_event_coupons',
  ADD_COLLABORATORS: 'add_event_collaborators',
  ADD_GUESTLIST: 'add_event_guestlist',
  ADD_ORDERS: 'add_event_orders',
  DO_CHECKIN: 'do_event_checkin',
  UNDO_CHECKIN: 'undo_event_checkin',
  ADD_PDV: 'add_event_pdv',
  ADD_ORDERS_PDV: 'add_event_orders_pdv',
  EDIT_TICKETS: 'edit_event_tickets',
  EDIT_COUPONS: 'edit_event_coupons',
  EDIT_COLLABORATORS: 'edit_event_collaborators',
  EDIT_GUESTLIST: 'edit_event_guestlist',
  EDIT_ORDERS: 'edit_event_orders',
  EDIT_PDV: 'edit_event_pdv',
  EDIT_ORDERS_PDV: 'edit_event_orders_pdv',
  DELETE_TICKETS: 'delete_event_tickets',
  DELETE_COUPONS: 'delete_event_coupons',
  DELETE_COLLABORATORS: 'delete_event_collaborators',
  DELETE_GUESTLIST: 'delete_event_guestlist',
  DELETE_ORDERS: 'delete_event_orders',
  DELETE_PDV: 'delete_event_pdv',
  DELETE_ORDERS_PDV: 'delete_event_orders_pdv',
  VIEW_TICKETS: 'view_event_tickets',
  VIEW_COUPONS: 'view_event_coupons',
  VIEW_COLLABORATORS: 'view_event_collaborators',
  VIEW_GUESTLIST: 'view_event_guestlist',
  VIEW_ORDERS: 'view_event_orders',
  VIEW_CHECKIN: 'view_event_checkin',
  VIEW_PDV: 'view_event_pdv',
  VIEW_ORDERS_PDV: 'view_event_orders_pdv',
  RESEND_TICKETS_FROM_ORDERS: 'resend_event_tickets_from_orders',
  PRINT_TICKETS_FROM_ORDERS: 'print_event_tickets_from_orders',
  CANCEL_ORDERS: 'cancel_event_orders',
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
  VIEW_EVENT_GENERAL: 'view_event_general_reports',
  VIEW_SALES: 'view_sales_reports',
  VIEW_CHECKIN: 'view_checkin_reports',
  VIEW_TICKETS: 'view_tickets_reports',
  VIEW_USERS: 'view_users_reports',
};

/**
 * Permissões relacionadas a configurações do sistema
 */
export const SYSTEM_PERMISSIONS = {
  MANAGE_SETTINGS: 'manage_system_settings',
  MANAGE_PERMISSIONS: 'manage_permissions',
};

/**
 * Permissões relacionadas a produtores de eventos
 */
export const PRODUCER_PERMISSIONS = {
  VIEW: 'view_producer_page',
  EDIT: 'edit_producer_page',
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
export const CHECKIN_COORDINATOR_ROLE = 'Coordenador de check-in';
export const CHECKIN_ROLE = 'Check-in';
export const PDV_ROLE = 'PDV';
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
