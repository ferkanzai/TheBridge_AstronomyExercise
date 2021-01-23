const mongoose = require('mongoose');
const { Schema } = mongoose;

const NeaSchema = new Schema({
  designation: String,
  discovery_date: String,
  h_mag: String,
  q_au_1: String,
  q_au_2: String,
  period_yr: String,
  i_deg: String,
  pha: String,
  orbit_class: String,
});

const Neas = mongoose.model('Neas', NeaSchema);

module.exports = Neas;
