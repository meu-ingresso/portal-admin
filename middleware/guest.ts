import { Middleware } from '@nuxt/types'

const guest: Middleware = ({ store, redirect}) => {
  // Se o usuário já está logado, redirecionar para a página inicial
  if (store.state.auth.loggedIn) {
    return redirect('/');
  }
}

export default guest;