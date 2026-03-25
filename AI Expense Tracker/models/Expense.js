const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    category: { type: String, default: 'Other' },
    amount: { type: Number, required: true },
    description: { type: String, default: '' },
    isFixed: { type: Boolean, default: false },
    date: { type: Date, default: Date.now }
  },
  {
    toJSON: {
      virtuals: true,
      versionKey: false,
      transform(_doc, ret) {
        ret.id = ret._id.toString();
        delete ret._id;
        if (ret.userId) ret.userId = ret.userId.toString();
        return ret;
      }
    }
  }
);

module.exports = mongoose.model('Expense', expenseSchema);
