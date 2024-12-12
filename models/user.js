const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

    const userSchema = new mongoose.Schema({
        name: { type: String, required: true },
        email: { type: String, required: true },
        password: { type: String, required: true },
        isVerified: { type: Boolean, default: false },
        provider: { type: String, default: 'local' },
        snsId: { type: String },
        googleData: {
            googleId: { type: String },
            accessToken: { type: String },
            refreshToken: { type: String }
        },
        jwtToken: {
            type: String,
            unique: false,
            default: null
        },
        likedPlaces: [{
            placeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Place' },
            timestamp: { type: Date, default: Date.now }
        }],
        preferences: {
            categories: [String],
            regions: [String],
            tags: [String]
        }
    }, { collection: 'users' });

userSchema.index({ email: 1, provider: 1 }, { unique: true });

userSchema.methods.hashPassword = async function(password) {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password,   salt);
};

userSchema.methods.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

userSchema.pre('save', async function(next) {
    if (this.isNew) {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
    }
    next();
});

const User = mongoose.model('User', userSchema);

module.exports = User;