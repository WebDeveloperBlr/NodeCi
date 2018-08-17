const { clearCache } = require('../services/cacheService');

module.exports = async (req, res, next) => {
  try {
    await next();
    clearCache(req.user.id);
  } catch(err) {
    console.log('Catched error: ' + err.name);
  }
};