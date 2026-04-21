import { StatusPage } from 'checkly/constructs'
import { apiService, checkoutService, webService } from './services.check'

new StatusPage('public-status', {
  name: 'Astroshop — Service Status',
  url: 'astroshop',
  defaultTheme: 'DARK',
  cards: [
    {
      name: 'Customer-facing',
      services: [webService, checkoutService],
    },
    {
      name: 'Platform',
      services: [apiService],
    },
  ],
})
