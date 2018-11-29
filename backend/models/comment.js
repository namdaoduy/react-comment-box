import mongoose from 'mongoose';
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const CommentsSchema = new Schema({
  user_id: ObjectId,
  message: String,
}, { timestamps: true });

export default mongoose.model('Comment', CommentsSchema);