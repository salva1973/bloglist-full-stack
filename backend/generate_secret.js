const crypto = require('crypto')

const generateJwtSecret = () => {
  const secret = crypto.randomBytes(32).toString('hex')
  return secret
}

const jwtSecret = generateJwtSecret()
console.log(jwtSecret)
