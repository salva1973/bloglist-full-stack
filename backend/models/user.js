const mongoose = require('mongoose')
const uniqueValidator = require('mongoose-unique-validator')

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    minlength: 4, // Minimum length for the username
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
    required: true,
  },
  passwordHash: String, // how to validate the password?
  notes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Blog',
    },
  ],
})

userSchema.plugin(uniqueValidator)

userSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
    // the passwordHash should not be revealed
    delete returnedObject.passwordHash
  },
})

const User = mongoose.model('User', userSchema)

module.exports = User
