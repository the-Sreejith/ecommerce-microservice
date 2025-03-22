const express = require('express');
const app = require('./config/app');
const userRoutes = require('./routes/userRoutes');
const authRoutes = require('./routes/authRoutes');

// Set up routes
app.use('/api/users', userRoutes);
app.use('/api/users', authRoutes);

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`User service running on port ${PORT}`);
});

module.exports = app; // For testing
