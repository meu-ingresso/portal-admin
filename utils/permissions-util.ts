import { $axios } from '@/utils/nuxt-instance';

/**
 * Verifica um conjunto de permissões de uma vez só
 */
export async function checkUserPermissionsBatch(
  roleId: string,
  userId: string,
  eventId?: string
): Promise<Set<string>> {
  try {
    if (!roleId) {
      return new Set();
    }

    if (eventId) {
      // Verificar se o usuário é promotor do evento
      const eventResponse = await $axios.$get(`events?where[promoter_id][v]=${userId}&where[id][v]=${eventId}`);
      
      if (!eventResponse?.body?.result?.data?.promoter?.id) {
        // Buscar o usuário como colaborador do evento
        const collaboratorsResponse = await $axios.$get(
          `event-collaborators?preloads[]=user:people&preloads[]=role&preloads[]=event&whereHas[event][event_id][v]=${eventId}&where[user_id][v]=${userId}`
        );

        if (!collaboratorsResponse?.body?.result?.data) {
          return new Set();
        }

        const collaborator = collaboratorsResponse.body.result.data[0];

        if (collaborator?.role?.name === 'Promoter' || collaborator?.role?.name === 'Gerente' || collaborator?.role?.name === 'Admin') {
          // Retorna um Set com todas as permissões possíveis, já que esses roles têm acesso total
          return new Set(['*']);
        }

        // Buscar todas as permissões do role do colaborador de uma vez
        const rolePermissionsResponse = await $axios.$get(
          `role-permissions?where[role_id][v]=${collaborator.role_id}&limit=9999&preloads[]=permission`
        );

        if (!rolePermissionsResponse?.body?.result?.data) {
          return new Set();
        }

        const rolePermissions = rolePermissionsResponse.body.result.data;
        return new Set(rolePermissions.map(rp => rp.permission?.name).filter(Boolean));
      } else {
        // Promotor tem todas as permissões
        return new Set(['*']);
      }
    }

    // Para usuários normais, buscar todas as permissões do role de uma vez
    const rolePermissionsResponse = await $axios.$get(
      `role-permissions?where[role_id][v]=${roleId}&limit=9999&preloads[]=permission`
    );

    if (!rolePermissionsResponse?.body?.result?.data) {
      return new Set();
    }

    const rolePermissions = rolePermissionsResponse.body.result.data;
    return new Set(rolePermissions.map(rp => rp.permission?.name).filter(Boolean));
  } catch (error) {
    console.error('Erro ao verificar permissões do usuário:', error);
    return new Set();
  }
}

/**
 * Verifica se o usuário tem permissão para ver múltiplos itens do menu de uma vez
 */
export async function checkMenuItemsPermissions(
  userRole: any,
  userId: string,
  menuItems: Array<{ permissions?: string[] }>,
  eventId?: string
): Promise<boolean[]> {
  // Admin e Gerente têm acesso a tudo
  if (userRole?.name === 'Admin' || userRole?.name === 'Gerente') {
    return menuItems.map(() => true);
  }

  // Para outros usuários, buscar todas as permissões de uma vez
  const userPermissions = await checkUserPermissionsBatch(userRole.id, userId, eventId);
  
  // Se o usuário tem a permissão especial '*', permite tudo
  if (userPermissions.has('*')) {
    return menuItems.map(() => true);
  }

  // Verifica cada item do menu contra o conjunto de permissões do usuário
  return menuItems.map(item => {
    if (!item.permissions || item.permissions.length === 0) {
      return true;
    }
    return item.permissions.some(permission => userPermissions.has(permission));
  });
}

/**
 * Verifica se o usuário tem as permissões necessárias para uma determinada ação
 */
export async function checkUserPermissions(
  roleId: string, 
  requiredPermissionNames: string[], 
  userId: string, 
  eventId?: string
): Promise<boolean> {
  const userPermissions = await checkUserPermissionsBatch(roleId, userId, eventId);

  console.log('userPermissions', userPermissions);
  
  if (userPermissions.has('*')) {
    return true;
  }

  return requiredPermissionNames.some(name => userPermissions.has(name));
}

/**
 * Verifica se o usuário tem permissão para ver um item do menu
 */
export async function hasMenuItemPermission(
  userRole: any,
  userId: string,
  permissions: string[],
  eventId?: string
): Promise<boolean> {
  if (!permissions || permissions.length === 0) {
    return true;
  }

  if (userRole?.name === 'Admin' || userRole?.name === 'Gerente') {
    return true;
  }

  return await checkUserPermissions(userRole.id, permissions, userId, eventId);
} 