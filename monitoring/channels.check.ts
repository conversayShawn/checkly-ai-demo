import {
  EmailAlertChannel,
  SlackAlertChannel,
  SmsAlertChannel,
  WebhookAlertChannel,
} from 'checkly/constructs'

// All channels are MOCKED for demo purposes — sendFailure/sendRecovery are off so nothing
// actually leaves the building. The wiring exists so the Checkly UI shows the relationship
// graph (check → group → channel) during the demo.
const mocked = {
  sendFailure: false,
  sendRecovery: false,
  sendDegraded: false,
  sslExpiry: false,
}

export const emailChannel = new EmailAlertChannel('demo-email', {
  address: 'alerts@example.invalid',
  ...mocked,
})

export const slackChannel = new SlackAlertChannel('demo-slack', {
  url: new URL('https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXXXXXX'),
  channel: '#demo-alerts',
  ...mocked,
})

export const smsChannel = new SmsAlertChannel('demo-sms', {
  phoneNumber: '+10000000000',
  ...mocked,
})

export const webhookChannel = new WebhookAlertChannel('demo-webhook', {
  name: 'Demo outbound webhook',
  method: 'POST',
  url: new URL('https://webhook.site/demo-placeholder'),
  template: '{"title":"{{ALERT_TITLE}}","type":"{{ALERT_TYPE}}"}',
  ...mocked,
})

export const allChannels = [emailChannel, slackChannel, smsChannel, webhookChannel]
