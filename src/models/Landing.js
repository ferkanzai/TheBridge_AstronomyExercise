const mongoose = require('mongoose')
const { Schema } = mongoose

const LandingSchema = new Schema({ 
  name: String,
  id: String,
  nametype: String,
  recclass: String,
  mass: String,
  fall: String,
  year: String,
  reclat: String,
  reclong: String,
  geolocation: Object,
});

const Landing = mongoose.model('Landings', LandingSchema)

module.exports = Landing