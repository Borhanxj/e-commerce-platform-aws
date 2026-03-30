function requireProductManager(req, res, next) {
  if (!req.user || req.user.role !== 'product_manager') {
    return res.status(403).json({ error: 'Product manager access required' });
  }
  next();
}

module.exports = requireProductManager;
