import { $axios } from '@/utils/nuxt-instance';

interface PermissionsState {
  userPermissions: string[];
  eventPermissionsMap: Record<string, string[]>;
  lastUpdate: number;
  cacheExpirationTime: number;
  isLoadingEventPermissions: boolean;
}

export const state = (): PermissionsState => ({
  userPermissions: [],
  eventPermissionsMap: {},
  lastUpdate: 0,
  cacheExpirationTime: 5 * 60 * 1000, // 5 minutos
  isLoadingEventPermissions: false,
});

export const getters = {
  $permissions: (state: PermissionsState) => state.userPermissions,
  $eventPermissions: (state: PermissionsState) => state.eventPermissionsMap,
  $lastUpdate: (state: PermissionsState) => state.lastUpdate,
  $isCacheValid: (state: PermissionsState) => Date.now() - state.lastUpdate < state.cacheExpirationTime,
  $hasAllPermissions: (state: PermissionsState) => state.userPermissions.includes('*'),
  $isLoadingEventPermissions: (state: PermissionsState) => state.isLoadingEventPermissions,
};

export const mutations = {
  SET_LOADING_EVENT_PERMISSIONS(state: PermissionsState, loading: boolean) {
    state.isLoadingEventPermissions = loading;
  },

  SET_USER_PERMISSIONS(state: PermissionsState, permissions: string[]) {
    state.userPermissions = permissions;
    state.lastUpdate = Date.now();
  },

  SET_EVENT_PERMISSIONS(state: PermissionsState, payload: { eventId: string; permissions: string[] }) {
    state.eventPermissionsMap[payload.eventId] = payload.permissions;
    state.lastUpdate = Date.now();
  },

  RESET_PERMISSIONS(state: PermissionsState) {
    state.userPermissions = [];
    state.eventPermissionsMap = {};
    state.lastUpdate = 0;
  },
};

export const actions = {
  async loadUserPermissions({ commit, getters }: any, payload: { userId: string; roleId: string }) {
    try {
      if (getters.$isCacheValid && getters.$permissions.length > 0) {
        return getters.$permissions;
      }

      // Admin e Gerente têm acesso a tudo
      // TODO melhorar essa lógica pois está com o id hardcoded
      if (payload.roleId && ['21ef3067-9b36-4302-987f-e7c67f4c93d4', '24a68e45-bb44-4707-8de0-46e61db159a9'].includes(payload.roleId)) {
        const allPermissions = ['*'];
        commit('SET_USER_PERMISSIONS', allPermissions);
        return allPermissions;
      }

      // Para outros usuários, buscar todas as permissões de uma vez
      const rolePermissionsResponse = await $axios.$get(
        `role-permissions?where[role_id][v]=${payload.roleId}&limit=9999&preloads[]=permission`
      );

      if (!rolePermissionsResponse?.body?.result?.data) {
        return [];
      }

      const rolePermissions = rolePermissionsResponse.body.result.data;
      const permissionsList = rolePermissions
        .map((rp: any) => rp.permission?.name)
        .filter(Boolean);
      
      commit('SET_USER_PERMISSIONS', permissionsList);
      return permissionsList;
    } catch (error) {
      console.error('Erro ao carregar permissões do usuário:', error);
      return [];
    }
  },

  async loadEventPermissions({ commit, getters }: any, payload: { userId: string; eventId: string; roleId: string }) {
    try {
      commit('SET_LOADING_EVENT_PERMISSIONS', true);

      // Verificar se já tem no cache
      if (getters.$isCacheValid && getters.$eventPermissions[payload.eventId]) {
        return getters.$eventPermissions[payload.eventId];
      }

      // Admin e Gerente têm acesso a tudo
      // TODO melhorar essa lógica pois está com o id hardcoded
      if (payload.roleId && ['21ef3067-9b36-4302-987f-e7c67f4c93d4', '24a68e45-bb44-4707-8de0-46e61db159a9'].includes(payload.roleId)) {
        const allPermissions = ['*'];
        commit('SET_EVENT_PERMISSIONS', { 
          eventId: payload.eventId, 
          permissions: allPermissions 
        });
        return allPermissions;
      }

      // Verificar se o usuário é promotor do evento
      const eventResponse = await $axios.$get(
        `events?where[promoter_id][v]=${payload.userId}&where[id][v]=${payload.eventId}`
      );
      
      if (eventResponse?.body?.result?.data?.length > 0) {
        // Promotor tem todas as permissões
        const allPermissions = ['*'];
        commit('SET_EVENT_PERMISSIONS', { 
          eventId: payload.eventId, 
          permissions: allPermissions 
        });
        return allPermissions;
      }
      
      // Buscar o usuário como colaborador do evento
      const query = `event-collaborators?preloads[]=user:people&preloads[]=role&preloads[]=event&whereHas[event][event_id][v]=${payload.eventId}&where[user_id][v]=${payload.userId}`;
      const collaboratorsResponse = await $axios.$get(query);

      if (!collaboratorsResponse?.body || collaboratorsResponse.body.code !== 'SEARCH_SUCCESS') {
        return [];
      }

      const collaborator = collaboratorsResponse?.body?.result?.data[0];

      if (collaborator && ['Admin', 'Gerente'].includes(collaborator?.role?.name)) {
        // Retorna um array com todas as permissões possíveis
        const allPermissions = ['*'];
        commit('SET_EVENT_PERMISSIONS', { 
          eventId: payload.eventId, 
          permissions: allPermissions 
        });
        return allPermissions;
      }
      
      const targetRoleId = collaborator?.role_id || payload.roleId;

      // Buscar todas as permissões do role do colaborador de uma vez
      const rolePermissionsResponse = await $axios.$get(
        `role-permissions?where[role_id][v]=${targetRoleId}&limit=9999&preloads[]=permission`
      );

      if (!rolePermissionsResponse?.body?.result?.data) {
        return [];
      }

      const rolePermissions = rolePermissionsResponse.body.result.data;
      const permissionsList = rolePermissions
        .map((rp: any) => rp.permission?.name)
        .filter(Boolean);
      
      commit('SET_EVENT_PERMISSIONS', { 
        eventId: payload.eventId, 
        permissions: permissionsList 
      });
      
      return permissionsList;
    } catch (error) {
      console.error('Erro ao carregar permissões do evento:', error);
      return [];
    } finally {
      commit('SET_LOADING_EVENT_PERMISSIONS', false);
    }
  },

  hasPermission({ getters }: any, permission: string): boolean {
    return getters.$permissions.includes('*') || getters.$permissions.includes(permission);
  },

  hasEventPermission({ getters }: any, payload: { eventId: string; permission: string }): boolean {
    const eventPerms = getters.$eventPermissions[payload.eventId];
    if (!eventPerms) return false;
    
    return eventPerms.includes('*') || eventPerms.includes(payload.permission);
  },

  checkPermissions({ getters }: any, permissions: string[]): boolean {
    if (getters.$permissions.includes('*')) return true;
    
    return permissions.some(permission => getters.$permissions.includes(permission));
  },

  checkEventPermissions({ getters }: any, payload: { eventId: string; permissions: string[] }): boolean {
    const eventPerms = getters.$eventPermissions[payload.eventId];
    if (!eventPerms) return false;
    
    if (eventPerms.includes('*')) return true;
    
    return payload.permissions.some(permission => eventPerms.includes(permission));
  },

  clearPermissions({ commit }: any) {
    commit('RESET_PERMISSIONS');
  },
}; 