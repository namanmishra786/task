require('dotenv').config();
const express = require('express');
const sequelize = require('./models/index');
const authRoutes = require('./routes/auth');

const app = express();

app.use(express.json());
app.use('/api/auth', authRoutes);

sequelize.authenticate()
  .then(() => sequelize.sync())
  .then(() => console.log('✅ DB Connected & Synced'))
  .catch(err => console.error('DB Error:', err));

app.listen(process.env.PORT, () =>
  console.log(`✅ Server running at http://localhost:${process.env.PORT}`)
);
