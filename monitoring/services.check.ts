import { StatusPageService } from 'checkly/constructs'

export const webService = new StatusPageService('svc-web', {
  name: 'Web Storefront',
})

export const apiService = new StatusPageService('svc-api', {
  name: 'Public API',
})

export const checkoutService = new StatusPageService('svc-checkout', {
  name: 'Checkout',
})
