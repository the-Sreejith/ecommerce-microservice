module.exports = {
    jwt: {
      secret: process.env.JWT_SECRET || 'your-super-secret-key-change-in-production',
      expiresIn: process.env.JWT_EXPIRES_IN || '1d',
      refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
    },
    session: {
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    },
    passwordHash: {
      saltRounds: 10,
    },
    /* 
    // OAuth configurations (to be set up later)
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    // Phone auth configuration (to be set up later)
    phoneAuth: {
      twilioAccountSid: process.env.TWILIO_ACCOUNT_SID,
      twilioAuthToken: process.env.TWILIO_AUTH_TOKEN,
      twilioServiceSid: process.env.TWILIO_SERVICE_SID,
    }
    */
  };
  
  