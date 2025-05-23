import { Middleware } from '@nuxt/types';
import { permissions, user } from '@/utils/store-util';

/**
 * Middleware para verificar permissões de acesso a rotas
 * Verifica se o usuário tem as permissões necessárias para acessar a rota
 * com base em meta.permissions e verificações específicas para promotores e colaboradores
 */
const permissionsMiddleware: Middleware = async ({ route, redirect, app, store }) => {


  // Se a rota é a de login, não é necessário verificar permissões
  if (route.path === '/login') {
    return;
  }

  // Verifica se temos os dados do usuário logado na store de user
  if (!store.state.user.user || store.state.user.user.id === '') {
    console.log("Buscando dados do usuário no banco de dados...")
    const responseUser = await user.getById({
      user_id: app.$cookies.get('user_id'),
      commit: true
    });

    if (!responseUser) {
      console.log("Usuário não encontrado, redirecionando para login...")
      return redirect('/login');
    }
  }

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
  
  try {
    // Verificar se a rota é uma rota filha de /events/:id
    const eventIdMatch = route.path.match(/^\/events\/([^/]+)\/([^/]+)/);
    let eventId = null;

    if (eventIdMatch) {
      eventId = eventIdMatch[1]; // ID do evento
      
      // Carregar permissões do evento se ainda não foram carregadas ou cache expirou
      if (!permissions.$eventPermissions[eventId] || !permissions.$isCacheValid) {
        await permissions.loadEventPermissions({
          userId,
          eventId,
          roleId: userRole.id
        });
      }

      // Verificar permissões para o evento
      const hasPermission = requiredPermissions.length === 0 || 
        await permissions.checkEventPermissions({
          eventId,
          permissions: requiredPermissions
        });

      if (!hasPermission) {
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
    } else {
      // Carregar permissões gerais do usuário se ainda não foram carregadas ou cache expirou
      if (permissions.$permissions.length === 0 || !permissions.$isCacheValid) {
        await permissions.loadUserPermissions({
          userId,
          roleId: userRole.id
        });
      }

      // Verificar permissões gerais
      const hasPermission = requiredPermissions.length === 0 || 
        await permissions.checkPermissions(requiredPermissions);

      if (!hasPermission) {
        // Redirecionar para a página inicial se não tem permissão
        return redirect('/');
      }
    }
  } catch (error) {
    console.error('Erro ao verificar permissões:', error);
    return redirect('/');
  }
};

export default permissionsMiddleware; 