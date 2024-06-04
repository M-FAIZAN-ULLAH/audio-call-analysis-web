// models/Folder.js

const mongoose = require('mongoose');

const folderSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  audioFiles: [{ type: mongoose.Schema.Types.ObjectId, ref: 'AudioFile' }]
});

const Folder = mongoose.model('Folder', folderSchema);

module.exports = Folder;
