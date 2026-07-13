const express = require('express')
const { getSystemSettings, updateSystemSettings } = require('../controllers/systemSettingController')
const { protect, authorize } = require('../middleware/auth')

const router = express.Router()

router.get('/', protect, getSystemSettings)
router.put('/', protect, authorize('admin'), updateSystemSettings)

module.exports = router
