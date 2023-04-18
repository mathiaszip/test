import mongoose from "mongoose";

const itemSchema = new mongoose.Schema({
    name: { type: String, required: true },
    expirationDate: { type: Date, required: true },
    place: { type: String, required: true }
  });

const userProfileSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    birthday: {
        type: Date,
        required: true
    },
    dateCreated: {
        type: Date,
        default: Date.now
    },
    items: [itemSchema]
  });
  
  const UserProfile = mongoose.model('UserProfile', userProfileSchema);

  export default UserProfile;
