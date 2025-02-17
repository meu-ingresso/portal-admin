import { Module, VuexModule, Mutation, Action } from 'vuex-module-decorators';
import { EventGuest, ResultMeta } from '~/models/event';
import { $axios } from '@/utils/nuxt-instance';
import { handleGetResponse } from '~/utils/responseHelpers';
@Module({
  name: 'eventGuests',
  stateFactory: true,
  namespaced: true,
})
export default class EventGuests extends VuexModule {

  private isLoading: boolean = false;

  private isDeleting: boolean = false;

  private guestList: EventGuest[] = [];

  private meta: ResultMeta = {
    total: 0,
    perPage: 50,
    currentPage: 1,
    lastPage: 1,
    firstPage: 1
  };

  private mockGuestList: EventGuest[] = [
    {
      id: '123456',
      event_id: '123456',
      first_name: 'John',
      last_name: 'Doe',
      quantity: 1,
      guest_by: '123456',
      validated: false,
      validated_by: '123456',
      validated_at: '2025-02-01',
      created_at: '2025-02-01',
      updated_at: '2025-02-01',
      deleted_at: '2025-02-01',
    },
  ];

  constructor(module: VuexModule<ThisType<EventGuests>, EventGuests>) {
    super(module);
    this.guestList = process.env.USE_MOCK_DATA === 'true' ? this.mockGuestList : this.guestList;
  }

  public get $guests() {
    return this.guestList;
  }

  public get $meta() {
    return this.meta;
  }

  public get $isLoading() {
    return this.isLoading;
  }

  public get $isDeleting() {
    return this.isDeleting;
  }

  @Mutation
  private SET_LOADING(loading: boolean) {
    this.isLoading = loading;
  }

  @Mutation
  private SET_META(meta: ResultMeta) {
    this.meta = meta;
  }

  @Mutation
  private SET_DELETING(deleting: boolean) {
    this.isDeleting = deleting;
  }

  @Mutation
  private SET_GUESTS(guests: EventGuest[]) {
    this.guestList = guests;
  }

  @Mutation
  private ADD_GUEST(guest: EventGuest) {
    this.guestList = [...this.guestList, guest];
  }

  @Mutation
  private UPDATE_GUEST({ index, guest }: { index: number; guest: EventGuest }) {
    const updatedList = [...this.guestList];
    updatedList[index] = { ...guest };
    this.guestList = updatedList;
  }

  @Mutation
  private REMOVE_GUEST(index: number) {
    const updatedList = [...this.guestList];
    updatedList[index].deleted_at = new Date().toISOString();
    this.guestList = updatedList;
  }

  @Action
  public setGuests(guests: EventGuest[]) {
    this.context.commit('SET_GUESTS', guests);
  }

  @Action
  public addGuest(guest: EventGuest) {
    this.context.commit('ADD_GUEST', guest);
  }

  @Action
  public updateGuest(payload: { index: number; guest: EventGuest }) {
    this.context.commit('UPDATE_GUEST', payload);
  }

  @Action
  public removeGuest(index: number) {
    this.context.commit('REMOVE_GUEST', index);
  }

  @Action
  public async fetchAndPopulateByQuery(query: string): Promise<void> {
    try {
      this.context.commit('SET_LOADING', true);
      
      const response = await $axios.$get(`event-guests?${query}`);
      const result = handleGetResponse(response, 'Convidados não encontrados', null, true);

      if (result.meta) {
        this.context.commit('SET_META', result.meta);
      }
      
      this.context.commit('SET_GUESTS', result.data || []);
    } catch (error) {
      console.error('Erro ao buscar convidados:', error);
      throw error;
    } finally {
      this.context.commit('SET_LOADING', false);
    }
  }

  @Action
  public async createGuest(payload: {
    event_id: string;
    first_name: string;
    last_name: string;
    quantity: number;
    guest_by: string;
  }): Promise<string> {
    try {
      this.context.commit('SET_LOADING', true);

      const response = await $axios.$post('event-guest', payload);
      
      if (!response.body || response.body.code !== 'CREATE_SUCCESS') {
        throw new Error('Falha ao criar convidado');
      }

      return response.body.result.id;
    } catch (error) {
      console.error('Erro ao criar convidado:', error);
      throw error;
    } finally {
      this.context.commit('SET_LOADING', false);
    }
  }

  @Action
  public async fetchDeleteGuest(guestId: string): Promise<void> {
    try {
      this.context.commit('SET_DELETING', true);

      const response = await $axios.$delete(`event-guest/${guestId}`);
      
      if (!response.body || response.body.code !== 'DELETE_SUCCESS') {
        throw new Error('Falha ao remover convidado');
      }

      const guestIndex = this.guestList.findIndex(g => g.id === guestId);
      if (guestIndex !== -1) {
        this.context.commit('REMOVE_GUEST', guestIndex);
      }
    } catch (error) {
      console.error('Erro ao remover convidado:', error);
      throw error;
    } finally {
      this.context.commit('SET_DELETING', false);
    }
  }

} 