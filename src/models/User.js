const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);
const { Schema } = mongoose;

const UserSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  nickname: {
    type: String,
    unique: true,
  },
  affiliationDate: {
    type: Date,
    default: Date.now,
  },
  occupation: String,
  birthdate: Date,
  deleted: {
    type: Boolean,
    default: false,
  },
  astronomicalPoints: {
    type: Number,
    default: 10,
  },
  badges: {
    type: Array,
    of: Object,
    default: [
      {
        name: 'My first day as astro-rookie!',
        given: true,
        info: 'given by joining to astronomy guild',
        points: 10,
      },
      {
        name: 'First NEA discovered!',
        given: false,
        info: 'given by discovering your first near-earth asteroid',
        points: 100,
      },
      {
        name: 'First NEC discovered!',
        given: false,
        info: 'given by discovering your first near-earth comet',
        points: 100,
      },
      {
        name: 'Road to NE-lhalla!',
        given: false,
        info: 'given by discovering 5 Objects between NEAs and NECs',
        points: 500,
      },
      {
        name: 'Master of universe!',
        given: false,
        info: 'given by discovering 10 Objects between NEAs and NECs',
        points: 1000,
      },
      {
        name: 'The best astronomer!',
        given: false,
        info: 'given by obtaining all previous badges',
        points: 10000,
      },
    ],
  },
  neasDiscovered: {
    type: Array,
    of: String,
    default: [],
  },
  necsDiscovered: {
    type: Array,
    of: String,
    default: [],
  },
});

UserSchema.plugin(AutoIncrement, { inc_field: 'affiliatedNumber' });
const User = mongoose.model('Guild', UserSchema);

module.exports = User;

// affiliatedNumber: {
//   type: Number,
//   required: true,
//   unique: true,
// },
