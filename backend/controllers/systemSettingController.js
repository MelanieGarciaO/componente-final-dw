const SystemSetting = require('../models/SystemSetting')

exports.getSystemSettings = async (req, res, next) => {
  try {
    const settings = await SystemSetting.getOrCreateDefault()
    res.status(200).json({ success: true, settings })
  } catch (error) {
    next(error)
  }
}

exports.updateSystemSettings = async (req, res, next) => {
  try {
    const settings = await SystemSetting.getOrCreateDefault()

    const allowedFields = [
      'theme',
      'institutionName',
      'maxLoanDays',
      'fineDayAmount',
      'reminderDays',
      'notificationEmail',
      'sessionTimeout',
      'maxLoginAttempts',
      'autoBackup',
      'historyRetentionDays',
    ]

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        settings[field] = req.body[field]
      }
    })

    await settings.save()
    res.status(200).json({ success: true, settings })
  } catch (error) {
    next(error)
  }
}
