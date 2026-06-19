const mongoose = require('mongoose');

const businessProfileSchema = new mongoose.Schema({
    // ─── Reference ──────────────────────────────────────
    businessId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Business',
        required: true,
        unique: true,
    },

    // ─── Public Information ────────────────────────────
    name: {
        type: String,
        required: true,
    },
    ownerName: String,
    phone: String,

    // Contact email for enquiries
    contactEmail: String,

    // ─── Address ────────────────────────────────────────
    address: {
        street: String,
        city: String,
        state: String,
        pincode: String,
        country: {
            type: String,
            default: 'India',
        },
    },

    // ─── Branding ──────────────────────────────────────
    logoUrl: String,
    gstNumber: String,

    // ─── Invoice Settings ──────────────────────────────
    invoiceFooter: {
        type: String,
        default: 'Thank you for your business!',
    },

    // ─── Social Media ──────────────────────────────────
    instagram: String,
    whatsapp: String,

    // ─── Description ──────────────────────────────────
    headline: {
        type: String,
        default: 'Premium photography and films',
    },
    about: {
        type: String,
        default: 'We capture cinematic love stories with photography, video and drone shoots.',
    },

    // ─── Gallery ──────────────────────────────────────
    gallery: [{
        type: {
            type: String,
            enum: ['image', 'video'],
            default: 'image',
        },
        title: String,
        url: String,
        thumbnail: String,
    }],

}, {
    timestamps: true,
});


// Virtual for full address
businessProfileSchema.virtual('fullAddress').get(function () {
    const parts = [];
    if (this.address?.street) parts.push(this.address.street);
    if (this.address?.city) parts.push(this.address.city);
    if (this.address?.state) parts.push(this.address.state);
    if (this.address?.pincode) parts.push(this.address.pincode);
    if (this.address?.country) parts.push(this.address.country);
    return parts.join(', ');
});

businessProfileSchema.set('toJSON', { virtuals: true });
businessProfileSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('BusinessProfile', businessProfileSchema);