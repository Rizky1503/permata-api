'use strict'

const Drive = use('Drive')
const moment = use('moment')
const crypto = use('crypto')
const Database = use('Database')
const Helpers = use('Helpers')



const bebasAkses = async (id_kelas) => {  
  const ada  = [11,10,9,8,7,6]
  return ada.includes(parseFloat(id_kelas))
}


module.exports = bebasAkses