/**
 * Verifica um conjunto de permissões de uma vez só
 * Agora utiliza a store de permissões como cache
 */
export async function checkUserPermissionsBatch(
  store: any,
  roleId: string,
  userId: string,
  eventId?: string
): Promise<Set<string>> {
  try {
    // Se estamos verificando permissões para um evento específico
    if (eventId) {
      // Verificar se já temos as permissões deste evento em cache
      const eventPermissions = store.getters['permissions/$eventPermissions'];
      const isCacheValid = store.getters['permissions/$isCacheValid'];
      
      if (isCacheValid && eventPermissions[eventId]) {
        // Converter o array de permissões para um Set para manter compatibilidade
        return new Set(eventPermissions[eventId]);
      }

      // Se não temos em cache, carregar as permissões do evento
      await store.dispatch('permissions/loadEventPermissions', {
        userId,
        eventId,
        roleId
      });

      // Retornar as permissões carregadas
      const updatedEventPermissions = store.getters['permissions/$eventPermissions'];
      return new Set(updatedEventPermissions[eventId] || []);
    } else {
      // Verificar se já temos as permissões gerais do usuário em cache
      const permissions = store.getters['permissions/$permissions'];
      const isCacheValid = store.getters['permissions/$isCacheValid'];
      
      if (isCacheValid && permissions.length > 0) {
        // Converter o array de permissões para um Set para manter compatibilidade
        return new Set(permissions);
      }

      // Se não temos em cache, carregar as permissões gerais
      await store.dispatch('permissions/loadUserPermissions', {
        userId,
        roleId
      });

      // Retornar as permissões carregadas
      const updatedPermissions = store.getters['permissions/$permissions'];
      return new Set(updatedPermissions);
    }
  } catch (error) {
    console.error('Erro ao verificar permissões do usuário:', error);
    return new Set();
  }
}

/**
 * Verifica se o usuário tem permissão para ver múltiplos itens do menu de uma vez
 */
export async function checkMenuItemsPermissions(
  store: any,
  userRole: any,
  userId: string,
  menuItems: Array<{ permissions?: string[] }>,
  eventId?: string
): Promise<boolean[]> {
  
  // Admin e Gerente têm acesso a tudo
  if (userRole?.name === 'Admin' || userRole?.name === 'Gerente') {
    return menuItems.map(() => true);
  }

  // Para outros usuários, verificar permissões
  try {
    if (eventId) {
      // Verificar se já temos as permissões do evento em cache
      const eventPermissions = store.getters['permissions/$eventPermissions'];
      const isCacheValid = store.getters['permissions/$isCacheValid'];
      
      if (!eventPermissions[eventId] || !isCacheValid) {
        // Carregar as permissões do evento
        await store.dispatch('permissions/loadEventPermissions', {
          userId,
          eventId,
          roleId: userRole.id
        });
      }

      // Obter as permissões atualizadas
      const updatedEventPermissions = store.getters['permissions/$eventPermissions'];

      // Verificar cada item do menu contra as permissões do evento
      return menuItems.map(item => {
        if (!item.permissions || item.permissions.length === 0) {
          return true;
        }
        
        // Verificar permissões do evento
        if (updatedEventPermissions[eventId]?.includes('*')) {
          return true;
        }
        
        return item.permissions.some(permission => 
          updatedEventPermissions[eventId]?.includes(permission)
        );
      });
    } else {
      // Verificar se já temos as permissões gerais em cache
      const permissions = store.getters['permissions/$permissions'];
      const isCacheValid = store.getters['permissions/$isCacheValid'];
      
      if (permissions.length === 0 || !isCacheValid) {
        // Carregar as permissões gerais
        await store.dispatch('permissions/loadUserPermissions', {
          userId,
          roleId: userRole.id
        });
      }

      // Obter as permissões atualizadas
      const updatedPermissions = store.getters['permissions/$permissions'];

      // Verificar cada item do menu contra as permissões gerais
      return menuItems.map(item => {
        if (!item.permissions || item.permissions.length === 0) {
          return true;
        }
        
        // Verificar permissões gerais
        if (updatedPermissions.includes('*')) {
          return true;
        }
        
        return item.permissions.some(permission => 
          updatedPermissions.includes(permission)
        );
      });
    }
  } catch (error) {
    console.error('Erro ao verificar permissões de menu:', error);
    // Em caso de erro, não permitir acesso
    return menuItems.map(() => false);
  }
}

/**
 * Verifica se o usuário tem as permissões necessárias para uma determinada ação
 */
export async function checkUserPermissions(
  store: any,
  roleId: string, 
  requiredPermissionNames: string[], 
  userId: string, 
  eventId?: string
): Promise<boolean> {
  try {
    if (eventId) {
      // Verificar permissões específicas do evento
      const eventPermissions = store.getters['permissions/$eventPermissions'];
      const isCacheValid = store.getters['permissions/$isCacheValid'];
      
      if (!eventPermissions[eventId] || !isCacheValid) {
        await store.dispatch('permissions/loadEventPermissions', {
          userId,
          eventId,
          roleId
        });
      }
      
      return await store.dispatch('permissions/checkEventPermissions', {
        eventId,
        permissions: requiredPermissionNames
      });
    } else {
      // Verificar permissões gerais
      const permissions = store.getters['permissions/$permissions'];
      const isCacheValid = store.getters['permissions/$isCacheValid'];
      
      if (permissions.length === 0 || !isCacheValid) {
        await store.dispatch('permissions/loadUserPermissions', {
          userId,
          roleId
        });
      }
      
      return await store.dispatch('permissions/checkPermissions', requiredPermissionNames);
    }
  } catch (error) {
    console.error('Erro ao verificar permissões:', error);
    return false;
  }
}