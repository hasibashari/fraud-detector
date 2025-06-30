// =========================
// Import Library
// =========================
const jwt = require('jsonwebtoken');
const prisma = require('../lib/prisma');

// =========================
// Middleware: Proteksi Route dengan JWT
// =========================
// Middleware ini akan memeriksa token JWT pada header Authorization.
// Jika valid, data user akan diambil dari database dan ditempelkan ke req.user.
exports.protect = async (req, res, next) => {
  let token;

  // 1. Cek apakah header Authorization ada dan menggunakan Bearer
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // 2. Ambil token dari header (setelah kata Bearer)
      token = req.headers.authorization.split(' ')[1];
      // 3. Verifikasi token menggunakan secret key dari environment variable
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // 4. Ambil data user dari database berdasarkan ID yang ada di token
      //    dan lampirkan ke object 'req' agar bisa diakses oleh route selanjutnya.
      //    Kita tidak menyertakan password.
      req.user = await prisma.user.findUnique({
        where: { id: decoded.id },
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true,
          updatedAt: true,
          // Jangan sertakan password
        },
      });

      // Jika user tidak ditemukan di database
      if (!req.user) {
        return res.status(401).json({ message: 'Not authorized, user not found' });
      }

      // 5. Lanjutkan ke middleware atau route selanjutnya
      next();
    } catch (error) {
      // Jika token tidak valid atau error lain
      console.error('Error in authMiddleware:', error);
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  } else {
    // Jika tidak ada token, kembalikan error
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
};
