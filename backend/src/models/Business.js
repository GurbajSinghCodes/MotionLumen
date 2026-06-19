const mongoose = require('mongoose');

const businessSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    slug: {
      type: String,
      required: true,
      unique: true,
    },

    ownerName: String,

    email: {
      type: String,
      required: true,
      unique: true,
    },

    password: {
      type: String,
      required: true,
    },

    phone: String,

    logoUrl: String,

    city: String,

    whatsapp: String,

    instagram: String,

    headline: {
      type: String,
      default: 'Premium photography and films',
    },

    about: {
      type: String,
      default:
        'We capture cinematic love stories with photography, video and drone shoots.',
    },

    role: {
      type: String,
      enum: ['superadmin', 'business'],
      default: 'business',
    },

    plan: {
      type: String,
      enum: ['trial', 'subscription'],
      default: 'trial',
    },

    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },

    subscriptionStartDate: {
      type: Date,
      default: Date.now,
    },

    subscriptionEndDate: {
      type: Date,
      default: null,
    },

    trialDays: {
      type: Number,
      default: 0,
    },

    subscriptionMonths: {
      type: Number,
      default: 0,
    },

    autoDisable: {
      type: Boolean,
      default: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Business',
      default: null,
    },

    deletedAt: {
      type: Date,
      default: null,
    },

    gallery: [
      {
        type: {
          type: String,
          enum: ['image', 'video'],
          default: 'image',
        },

        title: String,

        url: String,

        thumbnail: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Business', businessSchema);