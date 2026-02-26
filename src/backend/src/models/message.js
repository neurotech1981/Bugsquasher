import mongoose from 'mongoose'
const Schema = mongoose.Schema

const MessageSchema = new Schema(
  {
    sender: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    recipient: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    subject: { type: String, required: true, trim: true },
    content: { type: String, required: true },
    read: { type: Boolean, default: false },
    senderDeleted: { type: Boolean, default: false },
    recipientDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
)

export default mongoose.model('Message', MessageSchema)
