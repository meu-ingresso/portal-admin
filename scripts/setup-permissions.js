/**
 * Script para setup inicial de permissões no sistema
 * Este script cria as permissões no sistema e associa às roles
 */

// Importar axios para realizar as chamadas à API
const axios = require('axios');

// Definir as constantes de permissões
const EVENT_PERMISSIONS = {
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
  MANAGE_ORDERS_PDV: 'manage_event_orders_pdv',
  MANAGE_CHECKIN: 'manage_event_checkin',
  MANAGE_PDV: 'manage_event_pdv',
};

const USER_PERMISSIONS = {
  VIEW: 'view_user',
  CREATE: 'create_user',
  EDIT: 'edit_user',
  DELETE: 'delete_user',
  MANAGE_ROLES: 'manage_user_roles',
};

const REPORT_PERMISSIONS = {
  VIEW_SALES: 'view_sales_reports',
  VIEW_CHECKIN: 'view_checkin_reports',
  VIEW_FINANCIAL: 'view_financial_reports',
  EXPORT: 'export_reports',
};

const SYSTEM_PERMISSIONS = {
  MANAGE_SETTINGS: 'manage_system_settings',
  MANAGE_PERMISSIONS: 'manage_permissions',
};

// Lista de todas as permissões
const ALL_PERMISSIONS = [
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
  { name: EVENT_PERMISSIONS.MANAGE_ORDERS_PDV, description: 'Gerenciar pedidos de eventos como PDV' },
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

// Configurações de permissões para cada papel (role)
const ROLE_DEFAULT_PERMISSIONS = {
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
    EVENT_PERMISSIONS.MANAGE_ORDERS_PDV,
    USER_PERMISSIONS.VIEW,
    REPORT_PERMISSIONS.VIEW_SALES,
    REPORT_PERMISSIONS.VIEW_CHECKIN,
    REPORT_PERMISSIONS.VIEW_FINANCIAL,
    REPORT_PERMISSIONS.EXPORT,
  ],
  'Coordenador de Check-in': [
    EVENT_PERMISSIONS.VIEW,
    EVENT_PERMISSIONS.MANAGE_CHECKIN,
    EVENT_PERMISSIONS.MANAGE_PDV,
  ],
  'Check-in': [
    EVENT_PERMISSIONS.MANAGE_CHECKIN,
  ],
  'PDV (Ponto de venda)': [
    EVENT_PERMISSIONS.VIEW,
    EVENT_PERMISSIONS.MANAGE_ORDERS_PDV,
  ],
  'Visualização': [
    EVENT_PERMISSIONS.VIEW,
  ],
  'Cliente Final': [
    EVENT_PERMISSIONS.VIEW,
  ],
};

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
 * Configuração inicial de permissões
 */
async function setupPermissions() {
  console.log('Iniciando setup de permissões...');
  
  // Solicitar credenciais
  const email = process.env.ADMIN_EMAIL || '';
  const password = process.env.ADMIN_PASSWORD || '';
  
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
  
  // 3. Buscar todas as roles
  const roles = await fetchAllRoles();
  console.log(`${roles.length} roles encontradas no sistema`);
  
  // 4. Associar permissões às roles
  for (const role of roles) {
    const roleName = role.name;
    const rolePermissions = ROLE_DEFAULT_PERMISSIONS[roleName] || [];
    
    console.log(`Configurando ${rolePermissions.length} permissões para role '${roleName}'`);
    
    for (const permissionName of rolePermissions) {
      const permissionId = permissionsMap[permissionName];
      
      if (permissionId) {
        await assignPermissionToRole(role.id, permissionId);
      } else {
        console.warn(`Permissão '${permissionName}' não encontrada para associar à role '${roleName}'`);
      }
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