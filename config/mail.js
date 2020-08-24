'use strict'

const Env = use('Env')

module.exports = {
  /*
  |--------------------------------------------------------------------------
  | Connection
  |--------------------------------------------------------------------------
  |
  | Connection to be used for sending emails. Each connection needs to
  | define a driver too.
  |
  */
  connection: Env.get('MAIL_CONNECTION', 'smtp'),

  /*
  |--------------------------------------------------------------------------
  | SMTP
  |--------------------------------------------------------------------------
  |
  | Here we define configuration for sending emails via SMTP.
  |
  */
  smtp: {
    driver: 'smtp',
    pool: true,
    port: 587,
    host: 'smtp-relay.sendinblue.com',
    secure: false,
    auth: {
      user: 'noreply.permata@gmail.com',
      pass: 'LVtWD61Jf9jxXgCP'
    },
    tls: {
      rejectUnauthorized: false
    },
    maxConnections: 5,
    maxMessages: 100,
    rateLimit: 10
  },

  // smtp: {
  //   driver: 'smtp',
  //   pool: true,
  //   port: 465,
  //   host: 'smtp.sendgrid.net',
  //   secure: true,
  //   auth: {
  //     user: 'apikey',
  //     pass: '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'
  //   },
  //   tls: {
  //     rejectUnauthorized: false
  //   },
  //   maxConnections: 5,
  //   maxMessages: 100,
  //   rateLimit: 10
  // },

  /*
  |--------------------------------------------------------------------------
  | SparkPost
  |--------------------------------------------------------------------------
  |
  | Here we define configuration for spark post. Extra options can be defined
  | inside the `extra` object.
  |
  | https://developer.sparkpost.com/api/transmissions.html#header-options-attributes
  |
  | extras: {
  |   campaign_id: 'sparkpost campaign id',
  |   options: { // sparkpost options }
  | }
  |
  */
  sparkpost: {
    driver: 'sparkpost',
    apiKey: Env.get('SPARKPOST_API_KEY'),
    extras: {}
  },

  /*
  |--------------------------------------------------------------------------
  | Mailgun
  |--------------------------------------------------------------------------
  |
  | Here we define configuration for mailgun. Extra options can be defined
  | inside the `extra` object.
  |
  | https://mailgun-documentation.readthedocs.io/en/latest/api-sending.html#sending
  |
  | extras: {
  |   'o:tag': '',
  |   'o:campaign': '',,
  |   . . .
  | }
  |
  */
  mailgun: {
    driver: 'mailgun',
    domain: Env.get('MAILGUN_DOMAIN'),
    apiKey: Env.get('MAILGUN_API_KEY'),
    extras: {}
  },

  /*
  |--------------------------------------------------------------------------
  | Ethereal
  |--------------------------------------------------------------------------
  |
  | Ethereal driver to quickly test emails in your browser. A disposable
  | account is created automatically for you.
  |
  | https://ethereal.email
  |
  */
  ethereal: {
    driver: 'ethereal'
  }
}
