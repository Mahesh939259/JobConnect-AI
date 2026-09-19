const jwt = require('jsonwebtoken');

const generateToken = (userId, role) => {
  return jwt.sign(
    { id: userId, role },
    process.env.JWT_SECRET || 'jobconnect_super_secret_jwt_key_998877_dev_production',
    {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    }
  );
};

const verifyToken = (token) => {
  return jwt.verify(
    token,
    process.env.JWT_SECRET || 'jobconnect_super_secret_jwt_key_998877_dev_production'
  );
};

module.exports = { generateToken, verifyToken };
