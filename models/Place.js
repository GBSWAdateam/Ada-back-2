const mongoose = require('mongoose');

const placeSchema = new mongoose.Schema({
    name: String,
    address: String,
    lat: Number,
    lng: Number,
    description: String,
    category: String,
    rating: Number,
    images: [String],
    tags: [String],
    visitCount: { type: Number, default: 0 },
    likeCount: { type: Number, default: 0 },
    seasonalInfo: {
        spring: String,
        summer: String,
        autumn: String,
        winter: String
    },
    similarPlaces: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Place' }]
});

const Place = mongoose.model('Place', placeSchema);

module.exports = Place; 