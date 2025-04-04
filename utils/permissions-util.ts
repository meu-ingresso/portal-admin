import { $axios } from '@/utils/nuxt-instance';

/**
 * Busca um colaborador de um evento
 */
async function getEventCollaborator(eventId?: string, userId?: string) {

  try {
    
    let query = 'event-collaborators?preloads[]=user:people&preloads[]=role&preloads[]=event';

    if (eventId) {
      query += `&whereHas[event][event_id][v]=${eventId}`;
    }

    if (userId) {
      query += `&where[user_id][v]=${userId}`;
    }

    const collaboratorsResponse = await $axios.$get(query);

    if (!collaboratorsResponse?.body || collaboratorsResponse.body.code !== 'SEARCH_SUCCESS') {
      return null;
    }

    return collaboratorsResponse?.body?.result?.data;
  } catch (error) {
    console.error('Erro ao buscar colaborador do evento:', error);
    return null;
  }

}

/**
 * Verifica um conjunto de permissões de uma vez só
 */
export async function checkUserPermissionsBatch(
  roleId: string,
  userId: string,
  eventId?: string
): Promise<Set<string>> {
  try {

    console.log('<<< checkUserPermissionsBatch >>>');
    console.log('roleId', roleId);
    console.log('userId', userId);
    console.log('eventId', eventId);
    console.log('--------------------------------');

    if (!roleId) {
      return new Set();
    }

    if (eventId) {
      // Verificar se o usuário é promotor do evento
      const eventResponse = await $axios.$get(`events?where[promoter_id][v]=${userId}&where[id][v]=${eventId}`);
      
      if (!eventResponse?.body?.result?.data?.promoter?.id) {
        
        // Buscar o usuário como colaborador do evento
        const collaboratorsResponse = await getEventCollaborator(eventId, userId);

        if (!collaboratorsResponse) {
          return new Set();
        }

        const collaborator = collaboratorsResponse[0];

         if (collaborator && (collaborator?.role?.name === 'Gerente' || collaborator?.role?.name === 'Admin')) {
          // Retorna um Set com todas as permissões possíveis, já que esses roles têm acesso total
          return new Set(['*']);
         }
        
        const targetRoleId = collaborator?.role_id || roleId;

        // Buscar todas as permissões do role do colaborador de uma vez
        const rolePermissionsResponse = await $axios.$get(
          `role-permissions?where[role_id][v]=${targetRoleId}&limit=9999&preloads[]=permission`
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

    // Buscar o usuário como colaborador do evento
    const collaboratorsResponse = await getEventCollaborator(null, userId);

    if (!collaboratorsResponse) {
      // Para usuários normais, buscar todas as permissões do role de uma vez
      const rolePermissionsResponse = await $axios.$get(
        `role-permissions?where[role_id][v]=${roleId}&limit=9999&preloads[]=permission`
      );

      if (!rolePermissionsResponse?.body?.result?.data) {
        return new Set();
      }

      const rolePermissions = rolePermissionsResponse.body.result.data;
      return new Set(rolePermissions.map(rp => rp.permission?.name).filter(Boolean));
    }


    const rolePermissions = [];
    const processedRoles = [];
    const promisesCollaborators = collaboratorsResponse.map(async (collaborator) => {

      // Se já tem permissão de acesso total, não processa
      if (rolePermissions.includes('*')) {
        return;
      }

      // Se já processou este role, não processa
      if (processedRoles.includes(collaborator?.role_id)) {
        return;
      }

      // Se o colaborador é promotor, adiciona permissão de acesso total
      if (collaborator && (collaborator?.role?.name === 'Gerente' || collaborator?.role?.name === 'Admin')) {
         rolePermissions.push(new Set(['*']));
      }

      const rolePermissionsResponse = await $axios.$get(
        `role-permissions?where[role_id][v]=${collaborator?.role_id}&limit=9999&preloads[]=permission`
      );

      if (!rolePermissionsResponse?.body || rolePermissionsResponse.body.code !== 'SEARCH_SUCCESS') {
        throw new Error('Erro ao buscar permissões do role do colaborador');
      }

      // Adiciona as permissões do role do colaborador
      rolePermissionsResponse.body.result.data.forEach(rp => {
        rolePermissions.push(rp.permission?.name);
      });

      processedRoles.push(collaborator?.role_id);
    });

    await Promise.all(promisesCollaborators);

    return new Set(rolePermissions.map(rp => rp).filter(Boolean));
    
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