import Message from '../models/message.js'

export const sendMessage = async (req, res) => {
  const { recipient, subject, content } = req.body
  const sender = req.body.sender

  if (!recipient || !subject || !content || !sender) {
    return res.status(400).json({ success: false, error: 'Alle felt er påkrevd' })
  }

  if (sender === recipient) {
    return res.status(400).json({ success: false, error: 'Du kan ikke sende melding til deg selv' })
  }

  try {
    const message = new Message({ sender, recipient, subject, content })
    await message.save()
    const populated = await Message.findById(message._id)
      .populate('sender', 'name email')
      .populate('recipient', 'name email')
    return res.status(200).json({ success: true, data: populated })
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message })
  }
}

export const getInbox = async (req, res) => {
  const userId = req.params.userId
  try {
    const messages = await Message.find({ recipient: userId, recipientDeleted: false })
      .populate('sender', 'name email')
      .populate('recipient', 'name email')
      .sort({ createdAt: -1 })
    return res.json({ success: true, data: messages })
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message })
  }
}

export const getSent = async (req, res) => {
  const userId = req.params.userId
  try {
    const messages = await Message.find({ sender: userId, senderDeleted: false })
      .populate('sender', 'name email')
      .populate('recipient', 'name email')
      .sort({ createdAt: -1 })
    return res.json({ success: true, data: messages })
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message })
  }
}

export const getMessage = async (req, res) => {
  try {
    const message = await Message.findById(req.params.id)
      .populate('sender', 'name email')
      .populate('recipient', 'name email')
    if (!message) {
      return res.status(404).json({ success: false, error: 'Melding ikke funnet' })
    }
    return res.json({ success: true, data: message })
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message })
  }
}

export const markAsRead = async (req, res) => {
  try {
    const message = await Message.findByIdAndUpdate(req.params.id, { read: true }, { new: true })
      .populate('sender', 'name email')
      .populate('recipient', 'name email')
    if (!message) {
      return res.status(404).json({ success: false, error: 'Melding ikke funnet' })
    }
    return res.json({ success: true, data: message })
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message })
  }
}

export const deleteMessage = async (req, res) => {
  const { userId } = req.body
  try {
    const message = await Message.findById(req.params.id)
    if (!message) {
      return res.status(404).json({ success: false, error: 'Melding ikke funnet' })
    }

    if (message.sender.toString() === userId) {
      message.senderDeleted = true
    }
    if (message.recipient.toString() === userId) {
      message.recipientDeleted = true
    }
    await message.save()
    return res.json({ success: true })
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message })
  }
}

export const getUnreadCount = async (req, res) => {
  const userId = req.params.userId
  try {
    const count = await Message.countDocuments({ recipient: userId, read: false, recipientDeleted: false })
    return res.json({ success: true, count })
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message })
  }
}
