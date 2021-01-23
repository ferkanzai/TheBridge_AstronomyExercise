const router = require('express').Router()

router.use('/astronomy/landings/', require('./landings'))
router.use('/astronomy/neas/', require('./neas'))
router.use('/astronomy/guild/', require('./users'))

module.exports = router