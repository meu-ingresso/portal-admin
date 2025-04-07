/**
 * Script para setup inicial de permissões no sistema
 * Este script cria as permissões no sistema e associa às roles
 * Atualizado para usar a mesma estrutura de permissões definida em utils/permissions-config.ts
 */

// Importar axios para realizar as chamadas à API
const axios = require('axios');

// ===== Definir as constantes de permissões (igual ao permissions-config.ts) =====
/**
 * Permissões relacionadas a eventos e suas funcionalidades/templates
 */
const EVENT_PERMISSIONS = {
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
const USER_PERMISSIONS = {
  VIEW: 'view_user',
  CREATE: 'create_user',
  EDIT: 'edit_user',
  DELETE: 'delete_user',
  MANAGE_ROLES: 'manage_user_roles',
};

/**
 * Permissões relacionadas a relatórios
 */
const REPORT_PERMISSIONS = {
  VIEW_EVENT_GENERAL: 'view_event_general_reports',
  VIEW_SALES: 'view_sales_reports',
  VIEW_CHECKIN: 'view_checkin_reports',
  VIEW_TICKETS: 'view_tickets_reports',
  VIEW_USERS: 'view_users_reports',
};

/**
 * Permissões relacionadas a configurações do sistema
 */
const SYSTEM_PERMISSIONS = {
  MANAGE_SETTINGS: 'manage_system_settings',
  MANAGE_PERMISSIONS: 'manage_permissions',
};

/**
 * Permissões relacionadas a produtores de eventos
 */
const PRODUCER_PERMISSIONS = {
  VIEW: 'view_producer_page',
  EDIT: 'edit_producer_page',
};

/**
 * Nomes dos papéis
 */
const ADMIN_ROLE = 'Admin';
const FINANCIAL_ROLE = 'Financeiro';
const ANALYST_ROLE = 'Analista';
const OPERATOR_ROLE = 'Operador';
const CLIENT_ROLE = 'Cliente';
const PRODUCER_ROLE = 'Produtor';
const MANAGER_ROLE = 'Gerente';
const CHECKIN_COORDINATOR_ROLE = 'Coordenador de check-in';
const CHECKIN_ROLE = 'Check-in';
const PDV_ROLE = 'PDV';
const VISUALIZATION_ROLE = 'Visualização';

// ===== Definir as roles e suas permissões (igual ao permissions-config.ts) =====
/**
 * Papéis relacionados a colaboradores de eventos
 */
const EVENT_COLLABORATOR_ROLES = [
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
const ADMIN_ROLES = [
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
const PRODUCER_ROLES = [
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
const CLIENT_ROLES = [
  {
    name: CLIENT_ROLE,
    permissions: Object.values(EVENT_PERMISSIONS),
  }
];


// Combinar ambos os arrays de roles para criar uma estrutura unificada para o script
const ALL_ROLE_DEFINITIONS = [...EVENT_COLLABORATOR_ROLES, ...ADMIN_ROLES, ...PRODUCER_ROLES, ...CLIENT_ROLES];

// Lista de todas as permissões (mapeadas a partir das constantes)
const ALL_PERMISSIONS = [
  // Permissões de eventos
  { name: EVENT_PERMISSIONS.VIEW, description: 'Visualizar eventos' },
  { name: EVENT_PERMISSIONS.CREATE, description: 'Criar eventos' },
  { name: EVENT_PERMISSIONS.EDIT, description: 'Editar eventos' },
  { name: EVENT_PERMISSIONS.DELETE, description: 'Excluir eventos' },
  { name: EVENT_PERMISSIONS.EXPORT, description: 'Exportar dados de eventos' },
  { name: EVENT_PERMISSIONS.ADD_TICKETS, description: 'Adicionar ingressos de eventos' },
  { name: EVENT_PERMISSIONS.ADD_COUPONS, description: 'Adicionar cupons de eventos' },
  { name: EVENT_PERMISSIONS.ADD_COLLABORATORS, description: 'Adicionar colaboradores de eventos' },
  { name: EVENT_PERMISSIONS.ADD_GUESTLIST, description: 'Adicionar lista de convidados de eventos' },
  { name: EVENT_PERMISSIONS.ADD_ORDERS, description: 'Adicionar pedidos de eventos' },
  { name: EVENT_PERMISSIONS.DO_CHECKIN, description: 'Realizar check-in de eventos' },
  { name: EVENT_PERMISSIONS.UNDO_CHECKIN, description: 'Cancelar check-in de eventos' },
  { name: EVENT_PERMISSIONS.ADD_PDV, description: 'Adicionar PDV de eventos' },
  { name: EVENT_PERMISSIONS.ADD_ORDERS_PDV, description: 'Adicionar pedidos PDV de eventos' },
  { name: EVENT_PERMISSIONS.EDIT_TICKETS, description: 'Editar ingressos de eventos' },
  { name: EVENT_PERMISSIONS.EDIT_COUPONS, description: 'Editar cupons de eventos' },
  { name: EVENT_PERMISSIONS.EDIT_COLLABORATORS, description: 'Editar colaboradores de eventos' },
  { name: EVENT_PERMISSIONS.EDIT_GUESTLIST, description: 'Editar lista de convidados de eventos' },
  { name: EVENT_PERMISSIONS.EDIT_ORDERS, description: 'Editar pedidos de eventos' },
  { name: EVENT_PERMISSIONS.EDIT_PDV, description: 'Editar PDV de eventos' },
  { name: EVENT_PERMISSIONS.EDIT_ORDERS_PDV, description: 'Editar pedidos PDV de eventos' },
  { name: EVENT_PERMISSIONS.DELETE_TICKETS, description: 'Excluir ingressos de eventos' },
  { name: EVENT_PERMISSIONS.DELETE_COUPONS, description: 'Excluir cupons de eventos' },
  { name: EVENT_PERMISSIONS.DELETE_COLLABORATORS, description: 'Excluir colaboradores de eventos' },
  { name: EVENT_PERMISSIONS.DELETE_GUESTLIST, description: 'Excluir lista de convidados de eventos' },
  { name: EVENT_PERMISSIONS.DELETE_ORDERS, description: 'Excluir pedidos de eventos' },
  { name: EVENT_PERMISSIONS.DELETE_PDV, description: 'Excluir PDV de eventos' },
  { name: EVENT_PERMISSIONS.DELETE_ORDERS_PDV, description: 'Excluir pedidos PDV de eventos' },
  { name: EVENT_PERMISSIONS.VIEW_TICKETS, description: 'Visualizar ingressos de eventos' },
  { name: EVENT_PERMISSIONS.VIEW_COUPONS, description: 'Visualizar cupons de eventos' },
  { name: EVENT_PERMISSIONS.VIEW_COLLABORATORS, description: 'Visualizar colaboradores de eventos' },
  { name: EVENT_PERMISSIONS.VIEW_GUESTLIST, description: 'Visualizar lista de convidados de eventos' },
  { name: EVENT_PERMISSIONS.VIEW_ORDERS, description: 'Visualizar pedidos de eventos' },
  { name: EVENT_PERMISSIONS.VIEW_CHECKIN, description: 'Visualizar check-in de eventos' },
  { name: EVENT_PERMISSIONS.VIEW_PDV, description: 'Visualizar PDV de eventos' },
  { name: EVENT_PERMISSIONS.VIEW_ORDERS_PDV, description: 'Visualizar pedidos PDV de eventos' },
  { name: EVENT_PERMISSIONS.RESEND_TICKETS_FROM_ORDERS, description: 'Reenviar ingressos de eventos' },
  { name: EVENT_PERMISSIONS.PRINT_TICKETS_FROM_ORDERS, description: 'Imprimir ingressos de eventos' },
  { name: EVENT_PERMISSIONS.CANCEL_ORDERS, description: 'Cancelar pedidos de eventos' },
  
  // Permissões de usuários
  { name: USER_PERMISSIONS.VIEW, description: 'Visualizar usuários' },
  { name: USER_PERMISSIONS.CREATE, description: 'Criar usuários' },
  { name: USER_PERMISSIONS.EDIT, description: 'Editar usuários' },
  { name: USER_PERMISSIONS.DELETE, description: 'Excluir usuários' },
  { name: USER_PERMISSIONS.MANAGE_ROLES, description: 'Gerenciar papéis de usuários' },
  
  // Permissões de relatórios
  { name: REPORT_PERMISSIONS.VIEW_EVENT_GENERAL, description: 'Visualizar relatórios gerais de eventos' },
  { name: REPORT_PERMISSIONS.VIEW_SALES, description: 'Visualizar relatórios de vendas' },
  { name: REPORT_PERMISSIONS.VIEW_CHECKIN, description: 'Visualizar relatórios de check-in' },
  { name: REPORT_PERMISSIONS.VIEW_TICKETS, description: 'Visualizar relatórios de ingressos' },
  { name: REPORT_PERMISSIONS.VIEW_USERS, description: 'Visualizar relatórios de usuários' },
  
  // Permissões de sistema
  { name: SYSTEM_PERMISSIONS.MANAGE_SETTINGS, description: 'Gerenciar configurações do sistema' },
  { name: SYSTEM_PERMISSIONS.MANAGE_PERMISSIONS, description: 'Gerenciar permissões' },

  // Permissões de produtores
  { name: PRODUCER_PERMISSIONS.VIEW, description: 'Visualizar página do produtor' },
  { name: PRODUCER_PERMISSIONS.EDIT, description: 'Editar página do produtor' },
];

// Configure o axios para usar o endpoint correto
const API_HOST = process.env.API_HOST || 'https://staging-api.meuingresso.com.br';
let token = null;

/**
 * Cria uma permissão na API
 */
async function createPermission(permission) {
  try {
    console.log(`Criando permissão: ${permission.name}`);
    const response = await axios.post(`${API_HOST}/v1/permission`, {
      data: [permission]
    }, {
      headers: {
        'Authorization': `bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.data?.body?.code === 'CREATE_SUCCESS') {
      return response.data.body.result[0];
    }
    
    return null;
  } catch (error) {
    console.error(`Erro ao criar permissão ${permission.name}:`, error.message);
    return null;
  }
}

/**
 * Busca todas as permissões existentes no sistema
 */
async function fetchAllPermissions() {
  try {
    const response = await axios.get(`${API_HOST}/v1/permissions?limit=9999`, {
      headers: { 'Authorization': `bearer ${token}` }
    });
    
    if (response.data?.body?.result?.data) {
      return response.data.body.result.data;
    }
    
    return [];
  } catch (error) {
    console.error('Erro ao buscar permissões:', error.message);
    return [];
  }
}

/**
 * Busca todas as roles existentes no sistema
 */
async function fetchAllRoles() {
  try {
    const response = await axios.get(`${API_HOST}/v1/roles?limit=9999`, {
      headers: { 'Authorization': `bearer ${token}` }
    });
    
    if (response.data?.body?.result?.data) {
      return response.data.body.result.data;
    }
    
    return [];
  } catch (error) {
    console.error('Erro ao buscar roles:', error.message);
    return [];
  }
}

/**
 * Associa uma permissão a uma role
 */
async function assignPermissionToRole(roleId, permissionId) {
  try {
    // Verificar se já existe essa associação
    const checkResponse = await axios.get(
      `${API_HOST}/v1/role-permissions?where[role_id][v]=${roleId}&where[permission_id][v]=${permissionId}`,
      { headers: { 'Authorization': `bearer ${token}` } }
    );
    
    if (checkResponse.data?.body?.result?.data && checkResponse.data.body.result.data.length > 0) {
      console.log(`Permissão ${permissionId} já associada à role ${roleId}`);
      return true;
    }
    
    // Criar a associação
    const response = await axios.post(`${API_HOST}/v1/role-permission`, {
      data: [{
        role_id: roleId,
        permission_id: permissionId
      }]
    }, {
      headers: {
        'Authorization': `bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.data?.body?.code === 'CREATE_SUCCESS') {
      console.log(`Permissão ${permissionId} associada à role ${roleId}`);
      return true;
    }
    
    console.error(`Erro ao associar permissão ${permissionId} à role ${roleId}:`, response.data?.body);
    return false;
  } catch (error) {
    console.error(`Erro ao associar permissão ${permissionId} à role ${roleId}:`, error.message);
    return false;
  }
}

/**
 * Login na API para obter o token
 */
async function login(email, password) {
  try {
    console.log('Fazendo login na API...');
    const response = await axios.post(`${API_HOST}/v1/login`, { 
      email, 
      password 
    });
    
    if (response.data?.body?.code === 'LOGIN_SUCCESS') {
      token = response.data.body.result.token.token;
      console.log('Login realizado com sucesso!');
      return true;
    }
    
    console.error('Falha no login:', response.data?.body);
    return false;
  } catch (error) {
    console.error('Erro ao fazer login:', error.message);
    return false;
  }
}

/**
 * Cria uma nova role na API
 */
async function createRole(roleName, description) {
  try {
    console.log(`Criando role: ${roleName}`);
    const response = await axios.post(`${API_HOST}/v1/role`, {
      data: [{
        name: roleName,
        description: description || `Role de ${roleName}`
      }]
    }, {
      headers: {
        'Authorization': `bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.data?.body?.code === 'CREATE_SUCCESS') {
      console.log(`Role '${roleName}' criada com sucesso!`);
      return response.data.body.result[0];
    }
    
    console.error(`Erro ao criar role '${roleName}':`, response.data?.body);
    return null;
  } catch (error) {
    console.error(`Erro ao criar role ${roleName}:`, error.message);
    return null;
  }
}

/**
 * Configuração inicial de permissões
 */
async function setupPermissions() {
  console.log('Iniciando setup de permissões...');
  
  // Solicitar credenciais
  const email = process.env.ADMIN_EMAIL || 'admin@gmail.com';
  const password = process.env.ADMIN_PASSWORD || '123456';
  
  if (!email || !password) {
    console.error('Você precisa definir as variáveis de ambiente ADMIN_EMAIL e ADMIN_PASSWORD');
    console.error('Execute o script com: ADMIN_EMAIL=seu@email.com ADMIN_PASSWORD=suasenha node scripts/setup-permissions.js');
    process.exit(1);
  }
  
  // Fazer login
  const loginSuccess = await login(email, password);
  if (!loginSuccess) {
    console.error('Não foi possível fazer login. Verifique suas credenciais.');
    process.exit(1);
  }
  
  // 1. Buscar permissões existentes
  const existingPermissions = await fetchAllPermissions();
  console.log(`${existingPermissions.length} permissões encontradas no sistema`);
  
  // 2. Criar permissões faltantes
  const permissionsMap = {};
  
  for (const permission of ALL_PERMISSIONS) {
    const existingPermission = existingPermissions.find(p => p.name === permission.name);
    
    if (existingPermission) {
      console.log(`Permissão '${permission.name}' já existe, id: ${existingPermission.id}`);
      permissionsMap[permission.name] = existingPermission.id;
    } else {
      const newPermission = await createPermission(permission);
      
      if (newPermission) {
        console.log(`Permissão '${permission.name}' criada, id: ${newPermission.id}`);
        permissionsMap[permission.name] = newPermission.id;
      }
    }
  }
  
  // 3. Buscar todas as roles existentes
  const existingRoles = await fetchAllRoles();
  console.log(`${existingRoles.length} roles encontradas no sistema`);
  
  // 4. Verificar quais roles precisam ser criadas
  const rolesMap = {};
  existingRoles.forEach(role => {
    rolesMap[role.name] = role;
  });
  
  // 5. Criar as roles que não existem no sistema
  for (const roleDefinition of ALL_ROLE_DEFINITIONS) {
    const roleName = roleDefinition.name;
    
    if (!rolesMap[roleName]) {
      console.log(`Role '${roleName}' não encontrada no sistema. Criando...`);
      const description = `Role de ${roleName}`;
      const newRole = await createRole(roleName, description);
      
      if (newRole) {
        rolesMap[roleName] = newRole;
        console.log(`Role '${roleName}' criada com sucesso!`);
      } else {
        console.error(`Falha ao criar role '${roleName}'`);
      }
    } else {
      console.log(`Role '${roleName}' já existe no sistema.`);
    }
  }
  
  // 6. Associar permissões às roles (existentes e recém-criadas)
  console.log('Configurando permissões para todas as roles...');
  
  for (const roleDefinition of ALL_ROLE_DEFINITIONS) {
    const roleName = roleDefinition.name;
    const role = rolesMap[roleName];
    
    if (role) {
      const rolePermissions = roleDefinition.permissions;
      console.log(`Configurando ${rolePermissions.length} permissões para role '${roleName}'`);
      
      for (const permissionName of rolePermissions) {
        const permissionId = permissionsMap[permissionName];
        
        if (permissionId) {
          await assignPermissionToRole(role.id, permissionId);
        } else {
          console.warn(`Permissão '${permissionName}' não encontrada para associar à role '${roleName}'`);
        }
      }
    } else {
      console.warn(`Role '${roleName}' não foi encontrada para configurar permissões`);
    }
  }
  
  console.log('Setup de permissões concluído!');
}

// Executar o script se for chamado diretamente
if (require.main === module) {
  setupPermissions().catch(error => {
    console.error('Erro durante setup de permissões:', error);
    process.exit(1);
  });
}

module.exports = { setupPermissions }; 