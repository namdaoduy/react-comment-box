import mongoose from 'mongoose';
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const UsersSchema = new Schema({
  _id: ObjectId,
  username: String,
  name: String,
  password: String
}, { timestamps: true });

export default mongoose.model('User', UsersSchema);