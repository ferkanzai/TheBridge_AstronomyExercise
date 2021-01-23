const mongoose = require('mongoose')

mongoose.connect('mongodb://localhost/astronomy', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
  useCreateIndex: true
})
  .then(() => console.info('> db connected!'))
  .catch(error => {
    console.error('> something went wrong:', error.message)
    process.exit(0)
  })

process.on('SIGINT', () => {
  mongoose.connection.close(() => {
    console.info('> mongoose succesfully disconnected!')
    process.exit(0)
  })
})