const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const uniqueValidator = require('mongoose-unique-validator')
const passwordValidator = require('password-validator')

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    minlength: 3, // Minimum length for the username
    maxlength: 20, // Maximum length for the username
    validate: {
      validator: function (value) {
        // Regular expression to validate permitted characters for the username
        return /^[a-zA-Z0-9._]+$/.test(value)
      },
      message:
        'Username can only contain letters, numbers, dots, and underscores.',
    },
  },
  name: {
    type: String,
    trim: true,
    minlength: 2,
    maxlength: 50,
  },
  password: {
    type: String,
    required: true,
    minlength: 8,
    maxlength: 100,
    validate: {
      validator: function (password) {
        const schema = new passwordValidator()

        // Add password validation rules
        schema
          .is()
          .min(8) // Minimum length of 8 characters
          .is()
          .max(100) // Maximum length of 100 characters
          .has()
          .uppercase() // Must have at least one uppercase letter
          .has()
          .lowercase() // Must have at least one lowercase letter
          .has()
          .digits() // Must have at least one digit
          .has()
          .symbols() // Must have at least one special character

        return schema.validate(password)
      },
      message:
        'Password must be between 8 and 100 characters long and contain at least one uppercase letter, one lowercase letter, one digit, and one special character.',
    },
  },
  blogs: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Blog',
    },
  ],
})

userSchema.plugin(uniqueValidator)

// Hash the password before saving to the database
userSchema.pre('save', async function (next) {
  const user = this

  // Avoid rehashing the password unnecessarily when other fields
  // of the user object are updated and the password remains unchanged.
  if (!user.isModified('password')) {
    return next()
  }

  try {
    const saltRounds = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(user.password, saltRounds)
    user.password = hashedPassword
    next()
  } catch (error) {
    return next(error)
  }
})

// Applied when sending back the response (e.g. res.json())
userSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
    // the passwordHash should not be revealed
    delete returnedObject.password
  },
})

const User = mongoose.model('User', userSchema)

module.exports = User
