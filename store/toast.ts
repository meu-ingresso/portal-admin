interface UpdatePayload {
  text: string;
  text2?: string;
  type: string;
  time: number;
}

interface ToastState {
  toast: {
    toastText: string;
    toastText2: string;
    toastType: string;
    toastTime: number;
    show: boolean;
  };
}

export const state = (): ToastState => ({
  toast: {
    toastText: '',
    toastText2: '',
    toastType: '',
    toastTime: 3000,
    show: false,
  },
});

export const getters = {
  $single: (state: ToastState) => state.toast,
};

export const mutations = {
  SET_TOAST(state: ToastState, data: UpdatePayload) {
    state.toast.toastText = data.text;
    state.toast.toastText2 = '';
    if (data.text2) state.toast.toastText2 = data.text2;
    state.toast.toastType = data.type;
    state.toast.show = true;
    state.toast.toastTime = data.time;
    setTimeout(() => {
      state.toast.show = false;
    }, state.toast.toastTime);
  },

  CLOSE_TOAST(state: ToastState) {
    state.toast.toastText = '';
    state.toast.toastText2 = '';
    state.toast.toastType = '';
    state.toast.show = false;
  },
};

export const actions = {
  setToast({ commit }: any, { text, text2, type, time }: UpdatePayload) {
    commit('SET_TOAST', { text, text2, type, time });
  },

  closeToast({ commit }: any) {
    commit('CLOSE_TOAST');
  },
};
