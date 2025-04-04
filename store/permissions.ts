import { Module, VuexModule, Action, Mutation } from 'vuex-module-decorators';
import { $axios } from '@/utils/nuxt-instance';

@Module({
  name: 'permissions',
  stateFactory: true,
  namespaced: true,
})
export default class PermissionsModule extends VuexModule {
  private userPermissions: string[] = [];
  private eventPermissionsMap: Record<string, string[]> = {};
  private lastUpdate: number = 0;
  private cacheExpirationTime: number = 5 * 60 * 1000; // 5 minutos

  get $permissions(): string[] {
    return this.userPermissions;
  }

  get $eventPermissions(): Record<string, string[]> {
    return this.eventPermissionsMap;
  }

  get $lastUpdate(): number {
    return this.lastUpdate;
  }

  get $isCacheValid(): boolean {
    return Date.now() - this.lastUpdate < this.cacheExpirationTime;
  }

  get $hasAllPermissions(): boolean {
    return this.userPermissions.includes('*');
  }

  @Mutation
  SET_USER_PERMISSIONS(permissions: string[]) {
    this.userPermissions = permissions;
    this.lastUpdate = Date.now();
  }

  @Mutation
  SET_EVENT_PERMISSIONS(payload: { eventId: string; permissions: string[] }) {
    this.eventPermissionsMap[payload.eventId] = payload.permissions;
    this.lastUpdate = Date.now();
  }

  @Mutation
  RESET_PERMISSIONS() {
    this.userPermissions = [];
    this.eventPermissionsMap = {};
    this.lastUpdate = 0;
  }

  @Action
  async loadUserPermissions(payload: { userId: string; roleId: string }) {
    try {
      if (this.$isCacheValid && this.userPermissions.length > 0) {
        return this.userPermissions;
      }

      // Admin e Gerente têm acesso a tudo
      if (payload.roleId && ['1', '2'].includes(payload.roleId.toString())) {
        const allPermissions = ['*'];
        this.context.commit('SET_USER_PERMISSIONS', allPermissions);
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
      
      this.context.commit('SET_USER_PERMISSIONS', permissionsList);
      return permissionsList;
    } catch (error) {
      console.error('Erro ao carregar permissões do usuário:', error);
      return [];
    }
  }

  @Action
  async loadEventPermissions(payload: { userId: string; eventId: string; roleId: string }) {
    try {
      // Verificar se já tem no cache
      if (this.$isCacheValid && this.eventPermissionsMap[payload.eventId]) {
        return this.eventPermissionsMap[payload.eventId];
      }

      // Admin e Gerente têm acesso a tudo
      if (payload.roleId && ['1', '2'].includes(payload.roleId.toString())) {
        const allPermissions = ['*'];
        this.context.commit('SET_EVENT_PERMISSIONS', { 
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
        this.context.commit('SET_EVENT_PERMISSIONS', { 
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
        this.context.commit('SET_EVENT_PERMISSIONS', { 
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
      
      this.context.commit('SET_EVENT_PERMISSIONS', { 
        eventId: payload.eventId, 
        permissions: permissionsList 
      });
      
      return permissionsList;
    } catch (error) {
      console.error('Erro ao carregar permissões do evento:', error);
      return [];
    }
  }

  @Action
  hasPermission(permission: string): boolean {
    return this.userPermissions.includes('*') || this.userPermissions.includes(permission);
  }

  @Action
  hasEventPermission(payload: { eventId: string; permission: string }): boolean {
    const eventPerms = this.eventPermissionsMap[payload.eventId];
    if (!eventPerms) return false;
    
    return eventPerms.includes('*') || eventPerms.includes(payload.permission);
  }

  @Action
  checkPermissions(permissions: string[]): boolean {
    if (this.userPermissions.includes('*')) return true;
    
    return permissions.some(permission => this.userPermissions.includes(permission));
  }

  @Action
  checkEventPermissions(payload: { eventId: string; permissions: string[] }): boolean {
    const eventPerms = this.eventPermissionsMap[payload.eventId];
    if (!eventPerms) return false;
    
    if (eventPerms.includes('*')) return true;
    
    return payload.permissions.some(permission => eventPerms.includes(permission));
  }

  @Action
  clearPermissions() {
    this.context.commit('RESET_PERMISSIONS');
  }
} 