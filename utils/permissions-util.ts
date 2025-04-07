import { permissions } from '@/utils/store-util';

/**
 * Verifica um conjunto de permissões de uma vez só
 * Agora utiliza a store de permissões como cache
 */
export async function checkUserPermissionsBatch(
  roleId: string,
  userId: string,
  eventId?: string
): Promise<Set<string>> {
  try {
    // Se estamos verificando permissões para um evento específico
    if (eventId) {
      // Verificar se já temos as permissões deste evento em cache
      if (permissions.$isCacheValid && permissions.$eventPermissions[eventId]) {
        // Converter o array de permissões para um Set para manter compatibilidade
        return new Set(permissions.$eventPermissions[eventId]);
      }

      // Se não temos em cache, carregar as permissões do evento
      await permissions.loadEventPermissions({
        userId,
        eventId,
        roleId
      });

      // Retornar as permissões carregadas
      return new Set(permissions.$eventPermissions[eventId] || []);
    } else {
      // Verificar se já temos as permissões gerais do usuário em cache
      if (permissions.$isCacheValid && permissions.$permissions.length > 0) {
        // Converter o array de permissões para um Set para manter compatibilidade
        return new Set(permissions.$permissions);
      }

      // Se não temos em cache, carregar as permissões gerais
      await permissions.loadUserPermissions({
        userId,
        roleId
      });

      // Retornar as permissões carregadas
      return new Set(permissions.$permissions);
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
      if (!permissions.$eventPermissions[eventId] || !permissions.$isCacheValid) {
        // Carregar as permissões do evento
        await permissions.loadEventPermissions({
          userId,
          eventId,
          roleId: userRole.id
        });
      }

      // Verificar cada item do menu contra as permissões do evento
      return menuItems.map(item => {
        if (!item.permissions || item.permissions.length === 0) {
          return true;
        }
        
        // Verificar permissões do evento
        if (permissions.$eventPermissions[eventId]?.includes('*')) {
          return true;
        }
        
        return item.permissions.some(permission => 
          permissions.$eventPermissions[eventId]?.includes(permission)
        );
      });
    } else {
      // Verificar se já temos as permissões gerais em cache
      if (permissions.$permissions.length === 0 || !permissions.$isCacheValid) {
        // Carregar as permissões gerais
        await permissions.loadUserPermissions({
          userId,
          roleId: userRole.id
        });
      }

      // Verificar cada item do menu contra as permissões gerais
      return menuItems.map(item => {
        if (!item.permissions || item.permissions.length === 0) {
          return true;
        }
        
        // Verificar permissões gerais
        if (permissions.$permissions.includes('*')) {
          return true;
        }
        
        return item.permissions.some(permission => 
          permissions.$permissions.includes(permission)
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
  roleId: string, 
  requiredPermissionNames: string[], 
  userId: string, 
  eventId?: string
): Promise<boolean> {
  try {
    if (eventId) {
      // Verificar permissões específicas do evento
      if (!permissions.$eventPermissions[eventId] || !permissions.$isCacheValid) {
        await permissions.loadEventPermissions({
          userId,
          eventId,
          roleId
        });
      }
      
      return await permissions.checkEventPermissions({
        eventId,
        permissions: requiredPermissionNames
      });
    } else {
      // Verificar permissões gerais
      if (permissions.$permissions.length === 0 || !permissions.$isCacheValid) {
        await permissions.loadUserPermissions({
          userId,
          roleId
        });
      }
      
      return await permissions.checkPermissions(requiredPermissionNames);
    }
  } catch (error) {
    console.error('Erro ao verificar permissões:', error);
    return false;
  }
}