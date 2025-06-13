// eslint-disable-next-line import/named
import { NuxtAxiosInstance } from '@nuxtjs/axios'
import { NuxtCookies } from 'cookie-universal-nuxt'

/* eslint-disable import/no-mutable-exports */
let $axios: NuxtAxiosInstance
let $cookies: NuxtCookies
let $auth: any

export const initializeAxios = (axiosInstance: NuxtAxiosInstance) => {
  $axios = axiosInstance
}

export const initializeCookies = (cookieInstance: NuxtCookies) => {
  $cookies = cookieInstance
}

export const initializeAuth = (authInstance: any) => {
  $auth = authInstance
}

export { $axios, $cookies, $auth }