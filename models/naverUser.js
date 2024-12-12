const mongoose = require('mongoose');

const naverUserSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true
    },
    snsId: {
        type: String,
        required: true,
        unique: true
    },
    provider: {
        type: String,
        default: 'naver-2'
    },
    accessToken: String,
    refreshToken: String,
    isVerified: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('NaverUser', naverUserSchema);