export default {
  env: {
    API_HOST: process.env.API_HOST,
    NODE_ENV: process.env.NODE_ENV,
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

  css: ['~/assets/css/vuetify.css', '~/assets/css/main.css'],

  plugins: ['~/plugins/accessor', '~/plugins/axios'],

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
          secondary: '#521f8e0d',
          success: '#2651f2',
          black: '#1B1B1B',
        },
      },
    },
  },
  modules: ['@nuxtjs/axios', 'cookie-universal-nuxt', '@nuxtjs/toast'],

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

  router: {
    base: process.env.ROUTE || '/',
  },

  build: {
    extractCSS: true,
    loaders: {
      vue: {
        prettify: false,
      },
    },
  },

  ssr: false,
};
