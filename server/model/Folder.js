// models/Folder.js

const mongoose = require("mongoose");

const folderSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  audioFiles: [
    {
      url: String,
      fileName: String,
    },
  ],
  userId: {
    // type: mongoose.Schema.Types.ObjectId,
    // ref: "User",
    // required: false,
    type: String,
    required: false,
  },
  status: {
    type: String,
    require: false,
  },
});

const Folder = mongoose.model("Folder", folderSchema);

module.exports = Folder;
