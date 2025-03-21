import { Middleware } from '@nuxt/types';
import { $axios } from '@/utils/nuxt-instance';

/**
 * Middleware para verificar permissões de acesso a rotas
 * Verifica se o usuário tem as permissões necessárias para acessar a rota
 * com base em meta.permissions e verificações específicas para promotores e colaboradores
 */
const permissions: Middleware = async ({ route, redirect, app }) => {
  // Se a rota não tem configuração de permissões, permite o acesso
  if (!route.meta || (!route.meta[0]?.permissions && !route.meta[0]?.requiresAuth)) {
    return;
  }

  // Obter as informações do usuário dos cookies
  const userId = app.$cookies.get('user_id');
  const userRole = app.$cookies.get('user_role');

  // Se não houver usuário ou role, redirecionar para login
  if (!userId || !userRole) {
    return redirect('/login');
  }

  // Se a rota só requer autenticação (sem permissões específicas), permite o acesso
  if (route.meta[0]?.requiresAuth && !route.meta[0]?.permissions) {
    return;
  }

  // Verificar permissões específicas da rota - sempre priorizar a permissão da rota mais específica
  let requiredPermissions = [];
  
  // Verificar se existe uma rota correspondente no estado matched do Vue Router
  if (route.matched && route.matched.length > 0) {
    // Percorrer as rotas do mais específico (último) para o menos específico (primeiro)
    for (let i = route.matched.length - 1; i >= 0; i--) {
      const matchedRoute = route.matched[i];

      if (matchedRoute.meta && matchedRoute.meta?.permissions) {
        requiredPermissions = matchedRoute.meta?.permissions;
        break;
      }
    }
  } else {
    // Fallback para o comportamento antigo
    requiredPermissions = route.meta?.permissions || [];
  }


  // Para outras rotas que exigem permissões específicas, verificar se o usuário tem as permissões
  // Usuários Admin e Gerente têm acesso a tudo
  if (userRole?.name === 'Admin' || userRole?.name === 'Gerente') {
    return;
  }
  
  // Verificar permissões específicas do usuário através do sistema de role_permissions
  try {

    // Verificar se a rota é uma rota filha de /events/:id
    const eventIdMatch = route.path.match(/^\/events\/([^/]+)\/([^/]+)/);
    let eventId = null;

    if (eventIdMatch) {
      eventId = eventIdMatch[1]; // ID do evento
    }


    const hasPermission = requiredPermissions.length === 0 || 
                          await checkUserPermissions(userRole.id, requiredPermissions, userId, eventId);
    
    if (!hasPermission) {

      if (eventId) {
        const subRoute = eventIdMatch[2]; // Sub-rota (template) que tentou acessar
        
        // Verificar se a rota pai do evento existe no array matched
        const eventParentRoute = route.matched.find(r => 
          r.path === '/events/:id' || 
          r.path.startsWith('/events/:id')
        );
        
        if (eventParentRoute) {
          // Redirecionar para a página de detalhes do evento com parâmetro de alerta
          return redirect(`/events/${eventId}?noPermission=true&template=${subRoute}`);
        }
      }
      
      // Se não for rota de evento ou não encontrou a rota pai, redirecionar para a página inicial
      return redirect('/');
    }
  } catch (error) {
    console.error('Erro ao verificar permissões:', error);
    return redirect('/');
  }
};

/**
 * Verifica se o role do usuário tem as permissões específicas necessárias
 * usando o sistema de role_permissions da API
 */
async function checkUserPermissions(roleId: string, requiredPermissionNames: string[], userId: string, eventId?: string): Promise<boolean> {
  try {
    if (!roleId || !requiredPermissionNames.length) {
      return false;
    }

    if (eventId) {
      
      // Verificar se o usuário é promotor do evento
      const eventResponse = await $axios.$get(`events?where[promoter_id][v]=${userId}&where[id][v]=${eventId}`);
      
      // Se o evento não for encontrado ou o promotor não for o usuário, verificar os colaboradores do evento
      if (!eventResponse?.body?.result?.data?.promoter?.id) {
        

        // Buscar o usuário como colaborador do evento
        const collaboratorsResponse = await $axios.$get(`event-collaborators?preloads[]=user:people&preloads[]=role&preloads[]=event&whereHas[event][event_id][v]=${eventId}&where[user_id][v]=${userId}`);

        if (!collaboratorsResponse?.body?.result?.data) {
          return false;
        }

        // Verificar se o usuário é promotor, gerente ou admin do evento
        const collaborator = collaboratorsResponse.body.result.data[0];

        if (collaborator?.role?.name === 'Promoter' || collaborator?.role?.name === 'Gerente' || collaborator?.role?.name === 'Admin') {
          console.log('Usuário é colaborador do evento e tem permissão para acessar a rota (Promoter, Gerente ou Admin)');
          return true;
        }

        // Buscar as permissões associadas ao role do usuário
        const rolePermissionsResponse = await $axios.$get(`role-permissions?where[role_id][v]=${collaborator.role_id}&limit=9999`);

        if (!rolePermissionsResponse?.body?.result?.data) {
          return false;
        }

        const rolePermissions = rolePermissionsResponse.body.result.data;

        // Criar um mapa de nome para id para facilitar a busca
        const permissionMap = rolePermissions.reduce((map, permission) => {
          map[permission.name] = permission.id;
          return map;
        }, {});

        // Verificar se todas as permissões necessárias estão presentes
        return requiredPermissionNames.every(name => permissionMap[name]);

      } else {
        return true;
      }

    }

    // 1. Buscar todas as permissões para mapear nome -> id
    const permissionsResponse = await $axios.$get(
      requiredPermissionNames.length === 1 ?
        `permissions?where[name][o]=_LIKE_&where[name][v]=${requiredPermissionNames[0]}` : 'permissions?limit=9999');
    
    if (!permissionsResponse?.body?.result?.data) {
      return false;
    }
    
    const permissions = permissionsResponse.body.result.data;
    
    // Criar um mapa de nome para id para facilitar a busca
    const permissionMap = permissions.reduce((map, permission) => {
      map[permission.name] = permission.id;
      return map;
    }, {});


    if (!Object.keys(permissionMap).length) {
      return false;
    }
    
    // 3. Buscar as permissões associadas ao role do usuário
    const rolePermissionsResponse = await $axios.$get(`role-permissions?where[role_id][v]=${roleId}&limit=9999`);
    
    if (!rolePermissionsResponse?.body?.result?.data) {
      return false;
    }
    
    const rolePermissions = rolePermissionsResponse.body.result.data;
    
    // 4. Extrair os IDs de permissão do role
    const userPermissionIds = rolePermissions.map(rp => rp.permission_id);
    
    // 5. Verificar se todas as permissões necessárias estão presentes
    return requiredPermissionNames.every(name => userPermissionIds.includes(permissionMap[name]));
  } catch (error) {
    console.error('Erro ao verificar permissões do usuário:', error);
    return false;
  }
}

export default permissions; 