const mongoose = require('mongoose');

const passengerSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },

    username: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },

    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please provide a valid email address']
    },

    password: {
        type: String,
        required: true
    },

    role: {
        type: String,
        default: 'passenger',
        enum: ['passenger']
    }

}, { timestamps: true });

module.exports = mongoose.model('Passenger', passengerSchema, 'passengers');
