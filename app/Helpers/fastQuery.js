const Redis = use('Redis')
const deleteKey = await Redis.del('key');
const getKey = await Redis.get('key')
const insertKey = await Redis.set('key', json)
