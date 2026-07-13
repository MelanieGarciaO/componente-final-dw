const mongoose = require('mongoose')

const systemSettingSchema = new mongoose.Schema(
  {
    theme: {
      type: String,
      enum: ['light', 'dark'],
      default: 'light',
    },
    institutionName: {
      type: String,
      default: 'Universidad Nacional',
    },
    maxLoanDays: {
      type: Number,
      default: 14,
    },
    fineDayAmount: {
      type: Number,
      default: 5,
    },
    reminderDays: {
      type: Number,
      default: 3,
    },
    notificationEmail: {
      type: String,
      default: 'sistema@biblioteca.edu',
    },
    sessionTimeout: {
      type: Number,
      default: 60,
    },
    maxLoginAttempts: {
      type: Number,
      default: 5,
    },
    autoBackup: {
      type: String,
      default: 'Diario',
    },
    historyRetentionDays: {
      type: Number,
      default: 365,
    },
  },
  { timestamps: true }
)

systemSettingSchema.statics.getOrCreateDefault = async function () {
  const existing = await this.findOne()
  if (existing) return existing

  const created = await this.create({
    theme: 'light',
    institutionName: 'Universidad Nacional',
    maxLoanDays: 14,
    fineDayAmount: 5,
    reminderDays: 3,
    notificationEmail: 'sistema@biblioteca.edu',
    sessionTimeout: 60,
    maxLoginAttempts: 5,
    autoBackup: 'Diario',
    historyRetentionDays: 365,
  })

  return created
}

module.exports = mongoose.model('SystemSetting', systemSettingSchema)
