export default {
  env: {
    API_HOST: process.env.API_HOST,
    NODE_ENV: process.env.NODE_ENV,
    USE_MOCK_DATA: process.env.USE_MOCK_DATA || 'false',
  },

  server: {
    port: 9090,
  },

  head: {
    title: 'Meu Ingresso - ADMIN',
    htmlAttrs: {
      lang: 'en',
    },
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: '' },
      { name: 'format-detection', content: 'telephone=no' },
    ],
    link: [{ rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }],
  },

  css: ['~/assets/css/vuetify.css', '~/assets/css/main.css', '~/assets/scss/components/data-table.scss'],

  plugins: ['~/plugins/accessor', '~/plugins/axios', '~/plugins/auth'],

  components: [
    {
      path: '~/components/',
      pathPrefix: false,
    },
  ],

  buildModules: [
    '@nuxt/typescript-build',
    '@nuxtjs/vuetify',

    [
      '@nuxtjs/router',
      {
        fileName: 'nuxt.router.js',
      },
    ],
  ],

  device: {
    refreshOnResize: true,
  },

  vuetify: {
    theme: {
      dark: false,
      themes: {
        light: {
          primary: '#521F8E',
          secondary: '#612A92',
          success: '#2651f2',
          black: '#1B1B1B',
        },
      },
    },
  },
  modules: ['@nuxtjs/axios', 'cookie-universal-nuxt', '@nuxtjs/toast', '@nuxtjs/auth-next'],

  toast: {
    position: 'top-right',
    keepOnHover: true,
    duration: 3000,
    theme: 'bubble',
    singleton: true,
  },

  axios: {
    baseUrl: `${process.env.API_HOST}/v1`,
    withCredentials: true,
  },

  auth: {
    strategies: {
      local: {
        token: {
          property: 'body.result.token.token',
          global: true,
          type: 'Bearer'
        },
        user: {
          property: 'body.result.auth',
          autoFetch: true
        },
        endpoints: {
          login: { url: '/login', method: 'post' },
          logout: { url: '/logout', method: 'get' },
          user: { url: '/auth/me', method: 'get' }
        }
      }
    },
    redirect: {
      login: '/login',
      logout: '/',
      callback: '/login',
      home: '/'
    },

    cookie: {
      prefix: 'auth.',
      options: {
        domain: '.meuingresso.com.br',
        secure: true,
        sameSite: 'lax',
        path: '/',
      }
    },
  },



  router: {
    base: process.env.ROUTE || '/',
    middleware: ['event', 'permissions'],
  },

  build: {
    transpile: ['chart.js'],
    extractCSS: true,
    loaders: {
      vue: {
        prettify: false,
      },
    },
  },

  ssr: false,
};
