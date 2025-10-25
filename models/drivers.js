const mongoose = require('mongoose');

const driverSchema = new mongoose.Schema({
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
        default: 'driver',
        enum: ['driver']
    },

    // You can add driver-specific fields below, such as:
    // licenseNumber: {
    //     type: String,
    //     required: false,
    //     trim: true
    // },
    //
    // busNumber: {
    //     type: String,
    //     required: false,
    //     trim: true
    // }

}, { timestamps: true });

module.exports = mongoose.model('Driver', driverSchema, 'drivers');
