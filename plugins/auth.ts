export default function ({ $auth, store }: any) {
  // Verificar se o $auth está disponível
  if (!$auth) {
    return;
  }

  // Interceptar mudanças no estado de autenticação
  $auth.onRedirect((to: string, from: string) => {
    console.log('Auth redirect:', from, 'to', to);
  });

  // Carregar permissões quando o usuário fizer login
  $auth.onLoggedIn(async () => {
    try {
      const user = $auth.user;
      if (user?.auth?.id && user?.auth?.role?.id) {
        await store.dispatch('permissions/loadUserPermissions', {
          userId: user.auth.id,
          roleId: user.auth.role.id
        });
      }
    } catch (error) {
      console.error('Erro ao carregar permissões após login:', error);
    }
  });

  // Limpar permissões quando o usuário fizer logout
  $auth.onLoggedOut(async () => {
    try {
      await store.dispatch('permissions/clearPermissions');
    } catch (error) {
      console.error('Erro ao limpar permissões após logout:', error);
    }
  });
} 