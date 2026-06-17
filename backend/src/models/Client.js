const mongoose = require('mongoose');

const staffSchema = new mongoose.Schema({
  name: String,
  charge: {
    type: Number,
    default: 0,
  },
  paid: {
    type: Boolean,
    default: false,
  },
}, { _id: false });

const clientSchema = new mongoose.Schema({
  business: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Business',
    required: true,
  },

  invoiceId: {
    type: String,
    required: true,
  },

  clientName: {
    type: String,
    required: true,
  },

  preWeddingDate: {
    type: Date,
    required: true,
  },

  shootCharges: {
    type: Number,
    default: 0,
  },

  advanceAmount: {
    type: Number,
    default: 0,
  },

  amountReceived: {
    type: Number,
    default: 0,
  },

  photographers: [staffSchema],
  videographers: [staffSchema],
  droneOperators: [staffSchema],

  makeupArtist: String,

  makeupCharge: {
    type: Number,
    default: 0,
  },

  makeupPaid: {
    type: Boolean,
    default: false,
  },

  agentName: String,

  agentCommission: {
    type: Number,
    default: 0,
  },

  agentPaid: {
    type: Boolean,
    default: false,
  },

  food: {
    type: Number,
    default: 0,
  },

  setup: {
    type: Number,
    default: 0,
  },

  videoEdit: {
    type: Number,
    default: 0,
  },

  photoEdit: {
    type: Number,
    default: 0,
  },

  otherExpense: {
    type: Number,
    default: 0,
  },

  notes: String,
}, {
  timestamps: true,
  // ✅ Add this to include virtuals in all queries
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

clientSchema.index(
  {
    business: 1,
    invoiceId: 1,
  },
  {
    unique: true,
  }
);

clientSchema.virtual('totalExpenses').get(function () {
  const photoCost =
    (this.photographers || [])
      .reduce((sum, p) => sum + (p.charge || 0), 0);

  const videoCost =
    (this.videographers || [])
      .reduce((sum, p) => sum + (p.charge || 0), 0);

  const droneCost =
    (this.droneOperators || [])
      .reduce((sum, p) => sum + (p.charge || 0), 0);

  return (
    photoCost +
    videoCost +
    droneCost +
    (this.makeupCharge || 0) +
    (this.agentCommission || 0) +
    (this.food || 0) +
    (this.setup || 0) +
    (this.videoEdit || 0) +
    (this.photoEdit || 0) +
    (this.otherExpense || 0)
  );
});

clientSchema.virtual('profit').get(function () {
  return (
    (this.shootCharges || 0) -
    this.totalExpenses
  );
});

clientSchema.virtual('amountPending').get(function () {
  return (
    (this.shootCharges || 0) -
    (this.amountReceived || 0)
  );
});

module.exports = mongoose.model(
  'Client',
  clientSchema
);