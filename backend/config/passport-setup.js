const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const prisma = require('../lib/prisma'); // Pastikan path ini sesuai dengan struktur project Anda

passport.use(
  new GoogleStrategy(
    {
      // Opsi untuk Strategy Google
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: '/auth/google/callback',
    },
    async (accessToken, refreshToken, profile, done) => {
      //  Callback function setelah user login dengan Google
      // 'profile' berisi info dari Google
      try {
        // Cek apakah user sudah ada di DB kita berdasarkan googleId
        let user = await prisma.user.findUnique({
          where: { googleId: profile.id },
        });

        if (user) {
          // Jika user sudah ada, langsung return user
          done(null, user);
        } else {
          // Jika belum ada, buat user baru di DB kita
          newUser = await prisma.user.create({
            data: {
              googleId: profile.id,
              name: profile.displayName,
              email: profile.emails[0].value, // Ambil email dari profile
              password: '', // Password kosong karena login via Google
            },
          });
          done(null, newUser); // Return user baru
        }
      } catch (error) {
        done(error, null); // Jika ada error, return error
      }
    }
  )
);
