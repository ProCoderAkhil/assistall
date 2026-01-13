const mongoose = require('mongoose');

const AccessCodeSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  generatedBy: { type: String, default: 'Admin' },
  createdAt: { type: Date, default: Date.now, expires: 3600 } // Expires in 1 hour
});

module.exports = mongoose.model('AccessCode', AccessCodeSchema);