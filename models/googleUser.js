const mongoose = require('mongoose');

const googleUserSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    googleId: { type: String, required: true },
    isVerified: { type: Boolean, default: true }
}, { collection: 'googleUsers' });

const GoogleUser = mongoose.model('GoogleUser', googleUserSchema);

module.exports = GoogleUser;