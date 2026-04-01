const express = require('express')
const cors = require('cors')

const authRouter = require('./routes/auth')
const adminRouter = require('./routes/admin')
const adminProductsRouter = require('./routes/admin-products')
const adminOrdersRouter = require('./routes/admin-orders')
const adminSettingsRouter = require('./routes/admin-settings')

const app = express()

app.use(cors())
app.use(express.json())

app.use('/api/auth', authRouter)
app.use('/api/admin/products', adminProductsRouter)
app.use('/api/admin/orders', adminOrdersRouter)
app.use('/api/admin/settings', adminSettingsRouter)
app.use('/api/admin', adminRouter)

module.exports = app
