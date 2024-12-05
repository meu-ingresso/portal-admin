export default {
  env: {
    api_host: process.env.API_HOST,
  },

  server: {
    port: 8080,
  },

  head: {
    title: 'Access Global',
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
          primary: '#023f88',
          secondary: '#ed1b34',
          success: '#2651f2',
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
