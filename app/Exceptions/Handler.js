'use strict'
const BaseExceptionHandler = use('BaseExceptionHandler')
const woodlotCustomLogger = require('woodlot').customLogger;
const moment = require('moment');
const woodlot = new woodlotCustomLogger({
    streams: ['./logs/'+moment().format('YYYY')+'/'+moment().format('YYYY-MM')+'/report-daily-'+moment().format('YYYY-MM-DD')+'.log'],
    stdout: false,
    userAnalytics: {
        platform: true,
        country: true
    },
    format: {
        type: 'json',
        options: {
          cookies: true,
          headers: true,
            spacing: 4,
            separator: '\n'
        }
    }
});


/**
 * This class handles all exceptions thrown during
 * the HTTP request lifecycle.
 *
 * @class ExceptionHandler
 */
class ExceptionHandler extends BaseExceptionHandler {
  /**
   * Handle exception thrown during the HTTP lifecycle
   *
   * @method handle
   *
   * @param  {Object} error
   * @param  {Object} options.request
   * @param  {Object} options.response
   *
   * @return {void}
   */
  async handle (error, { request, response }) {
    if (error.status == 404 || error.status == 500){
      woodlot.err(error.message +' on url '+ request.headers().host + request.url());
    }
    return response.status(error.status).json({
      status: error.status,
      message: error.message
    })
  }

  /**
   * Report exception for logging or debugging.
   *
   * @method report
   *
   * @param  {Object} error
   * @param  {Object} options.request
   *
   * @return {void}
   */
  async report (error, { request }) {
  }
}

module.exports = ExceptionHandler
