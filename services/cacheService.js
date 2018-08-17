const mongoose = require('mongoose');
const redisUrl = require('./../config/keys').redisUrl;
const redisClient = require('redis').createClient(redisUrl);
const {promisify} = require('util');
redisClient.hget = promisify(redisClient.hget);

const exec = mongoose.Query.prototype.exec;

mongoose.Query.prototype.cache = function (options = {}) {
  this.useCache = true;
  this.hashKey = JSON.stringify(options.key || '');

  return this;
};

mongoose.Query.prototype.exec = async function (...args) {

  if (!this.useCache) {
    console.log('/// CACHE DISABLED! ' + this.mongooseCollection.name);
    return await exec.apply(this, args);
  }

  const key = JSON.stringify(Object.assign({}, this.getQuery(), {
    collection: this.mongooseCollection.name
  }));

  const cachedVal = await redisClient.hget(this.hashKey, key);
  if (cachedVal) {
    console.log('/// GETTING CACHED VALUE! ' + this.mongooseCollection.name);
    const doc = JSON.parse(cachedVal);
    return Array.isArray(doc)
      ? doc.map(d => new this.model(d))
      : new this.model(doc);
  }

  console.log('/// GETTING VALUE FROM MONGO! ' + this.mongooseCollection.name);
  const result = await exec.apply(this, arguments);
  redisClient.hset(this.hashKey, key, JSON.stringify(result), 'EX', 10);
  return result;
};

module.exports = {
  clearCache(hashKey) {
    redisClient.del(JSON.stringify(hashKey));
  }
};