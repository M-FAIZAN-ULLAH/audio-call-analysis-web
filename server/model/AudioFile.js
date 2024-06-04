// models/AudioFile.js

const mongoose = require('mongoose');

const audioFileSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  path: {
    type: String,
    required: true
  },
  folder: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Folder'
  }
});

const AudioFile = mongoose.model('AudioFile', audioFileSchema);

module.exports = AudioFile;
