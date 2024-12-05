import { Module, VuexModule, Mutation, Action } from 'vuex-module-decorators';

interface UpdatePayload {
  text: string;
  text2?: string;
  type: string;
  time: number;
}

@Module({
  name: 'toast',
  stateFactory: true,
  namespaced: true,
})
export default class Toast extends VuexModule {
  private toast = {
    toastText: '',
    toastText2: '',
    toastType: '',
    toastTime: 3000,
    show: false,
  };

  public get $single() {
    return this.toast;
  }

  @Mutation
  private SET_TOAST(data: UpdatePayload) {
    this.toast.toastText = data.text;
    this.toast.toastText2 = '';
    if (data.text2) this.toast.toastText2 = data.text2;
    this.toast.toastType = data.type;
    this.toast.show = true;
    this.toast.toastTime = data.time;
    setTimeout(() => {
      this.toast.show = false;
    }, this.toast.toastTime);
  }

  @Mutation
  private CLOSE_TOAST() {
    this.toast.toastText = '';
    this.toast.toastText2 = '';
    this.toast.toastType = '';
    this.toast.show = false;
  }

  @Action
  public setToast({ text, text2, type, time }: UpdatePayload) {
    this.context.commit('SET_TOAST', { text, text2, type, time });
  }

  @Action
  public closeToast() {
    this.context.commit('CLOSE_TOAST');
  }
}
