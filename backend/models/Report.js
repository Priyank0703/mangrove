const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000
  },
  category: {
    type: String,
    enum: ['cutting', 'dumping', 'reclamation', 'pollution', 'other'],
    required: true
  },
  severity: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  location: {
    coordinates: {
      latitude: {
        type: Number,
        required: true,
        min: -90,
        max: 90
      },
      longitude: {
        type: Number,
        required: true,
        min: -180,
        max: 180
      }
    },
    address: {
      street: String,
      city: String,
      state: String,
      country: String,
      postalCode: String
    },
    region: String
  },
  photos: [{
    filename: {
      type: String,
      required: true
    },
    originalName: String,
    path: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'under_investigation'],
    default: 'pending'
  },
  reporter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  validator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  validationNotes: {
    type: String,
    maxlength: 500
  },
  validatedAt: Date,
  tags: [String],
  estimatedArea: {
    value: Number,
    unit: {
      type: String,
      enum: ['sq_meters', 'sq_kilometers', 'acres', 'hectares'],
      default: 'sq_meters'
    }
  },
  impactAssessment: {
    biodiversity: {
      type: String,
      enum: ['none', 'low', 'medium', 'high', 'severe']
    },
    carbonStorage: {
      type: String,
      enum: ['none', 'low', 'medium', 'high', 'severe']
    },
    coastalProtection: {
      type: String,
      enum: ['none', 'low', 'medium', 'high', 'severe']
    }
  },
  followUpRequired: {
    type: Boolean,
    default: false
  },
  followUpNotes: String,
  isPublic: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for geospatial queries
reportSchema.index({ 'location.coordinates.latitude': 1, 'location.coordinates.longitude': 1 });

// Index for status and category queries
reportSchema.index({ status: 1, category: 1 });

// Index for reporter queries
reportSchema.index({ reporter: 1 });

// Index for date queries
reportSchema.index({ createdAt: -1 });

// Virtual for full location string
reportSchema.virtual('fullLocation').get(function() {
  if (this.location.address) {
    const addr = this.location.address;
    return `${addr.street || ''} ${addr.city || ''} ${addr.state || ''} ${addr.country || ''}`.trim();
  }
  return `${this.location.coordinates.latitude}, ${this.location.coordinates.longitude}`;
});

// Virtual for status color (for frontend)
reportSchema.virtual('statusColor').get(function() {
  const colors = {
    pending: 'yellow',
    approved: 'green',
    rejected: 'red',
    under_investigation: 'blue'
  };
  return colors[this.status] || 'gray';
});

// Method to approve report
reportSchema.methods.approve = function(validatorId, notes = '') {
  this.status = 'approved';
  this.validator = validatorId;
  this.validationNotes = notes;
  this.validatedAt = new Date();
  return this.save();
};

// Method to reject report
reportSchema.methods.reject = function(validatorId, notes = '') {
  this.status = 'rejected';
  this.validator = validatorId;
  this.validationNotes = notes;
  this.validatedAt = new Date();
  return this.save();
};

// Ensure virtual fields are serialized
reportSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Report', reportSchema);
