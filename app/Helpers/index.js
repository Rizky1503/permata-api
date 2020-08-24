'use strict'

const Drive = use('Drive')
const moment = use('moment')
const crypto = use('crypto')
const Database = use('Database')
const Helpers = use('Helpers')
var admin = require("firebase-admin");
// var serviceAccount = require("path/to/serviceAccountKey.json");
var serviceAccount = require(Helpers.publicPath('permatabimbel-33f11-firebase-adminsdk-9wnxy-7883d04e45.json'));
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://permatabimbel-33f11.firebaseio.com"
});

/**
 * Upload file to remote storage
 * @param  {string}   stream - The file stream.
 * @param  {string}   path - The storage path including file name and extension
 * @return {string}   The final location
 */
const upload = async (stream, path) => {
  await Drive.disk('s3').put(path, stream)

  if (await Drive.disk('s3').exists(path)) {
    return await Drive.disk('s3').getUrl(path)
  }
}

/**
 * Generate "random" alpha-numeric string.
 *
 * @param  {int}      length - Length of the string
 * @return {string}   The result
 */
const str_random = async (length = 40) => {
  let string = ''
  let len = string.length

  if (len < length) {
    let size = length - len
    let bytes = await crypto.randomBytes(size)
    let buffer = new Buffer(bytes)

    string += buffer
      .toString('base64')
      .replace(/[^a-zA-Z0-9]/g, '')
      .substr(0, size)
  }

  return string
}

/**
 * Generate "random" alpha-numeric string.
 *
 * @param  {int}      length - Length of the string
 * @return {string}   The result
 */
const push_notification = async (id_pelanggan, title, body,images, pages, params) => {  
  const dataPush = await Database
        .table('in_push_notification')
          .where('id_user', id_pelanggan)
  var TampungPush = [];
  for (var i = 0; i < dataPush.length; i++) {
    TampungPush.push(dataPush[i].token_notification);                
  }
  const findDuplicates  = arr => arr.filter((item, index) => arr.indexOf(item) == index)    
  const ResultData      = findDuplicates(TampungPush);   
  var registrationToken = ResultData;
  var payload = {
    notification: {
      title: title,
      body:  body,
      sound: "default", 
      badge: "1",
      image: images,
    },
    data: {
      pages: pages,
      params: params
    }
  };
  var options = {
    priority: "high",
    timeToLive: 60 * 60 *24,
    // data: data
  };

  return admin.messaging().sendToDevice(registrationToken, payload, options).then(function(response) {
    return "Successfully sent message:"+ response
  })
  .catch(function(error) {
    return error
  });
}


const bebas_akses = async (id_kelas) => {  
  const ada  = [11,10,9,8,7,6]
  return ada.includes(parseFloat(id_kelas))
}

module.exports = {
  upload,
  str_random,
  push_notification,
  bebas_akses
}