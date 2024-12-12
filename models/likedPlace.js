const mongoose = require('mongoose');

const likedPlaceSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    placeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Place',
        required: true
    },
    likedAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.models.LikedPlace || mongoose.model('LikedPlace', likedPlaceSchema);