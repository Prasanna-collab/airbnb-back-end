const mongoose = require("mongoose");

const placeSchema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  title: { type: String },
  address: { type: String },
  addedphotos: { type: [String] },
  description: { type: String },
  perks: { type: [String] },
  extraInfo: { type: String },
  checkIn: { type: Number },
  checkOut: { type: String },
  maxGuests: { type: String },
  price: { type: String },
});

const places = mongoose.model("places", placeSchema);

module.exports = places;
