const prisma = require('../lib/prisma');
const bcrypt = require('bcryptjs');
const e = require('express');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
  // 1. Ambil nama, email, dan password dari request body
  const { name, email, password } = req.body;

  try {
    // 2. Validasi input: pastikan nama, email, dan password tidak kosong
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // 3. Cek apakah email sudah terdaftar
    const existingUser = await prisma.user.findUnique({
      where: { email: email },
    });
    // 4. Jika email sudah terdaftar, kembalikan error
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // 5. Hash password menggunakan bcrypt
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 6. Simpan user baru ke database
    const newUser = await prisma.user.create({
      data: {
        name: name,
        email: email,
        password: hashedPassword,
      },
    });

    // 7. Kirim respons sukses (tanpa password)
    // Hapus password dari objek sebelum mengirim respons
    delete newUser.password;
    res.status(201).json({
      message: 'User registered successfully',
      user: newUser,
    });
  } catch (error) {
    // 8. Tangani error
    console.error('Error during registration:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

exports.login = async (req, res) => {
  // 1. Ambil email dan password dari request body
  const { email, password } = req.body;

  try {
    // 2. Cari user berdasarkan email
    const user = await prisma.user.findUnique({
      where: { email: email },
    });
    // Jika user tidak ditemukan, kembalikan error
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }
    // 3. Bandingkan password yang dikirim dengan hashed password di database
    const isPasswordValid = await bcrypt.compare(password, user.password);

    // Jika password tidak valid, kembalikan error
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // 4. Jika valid, buat JWT Payload
    const payload = {
      id: user.id,
      email: user.email,
      name: user.name,
    };

    // 5. Buat dan tandatangani JWT
    const token = jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '1h' } // Token berlaku selama 1 jam
    );

    // 6. Kirim token sebagai respons
    res.status(200).json({
      message: 'Login successful',
      token: token,
    });
  } catch (error) {
    console.error('Error during login:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// Untuk mendapatkan data user saat ini
// Middleware 'protect' sudah digunakan untuk melindungi route ini
// @desc    Get current user data
// @route   GET /api/auth/me
// @access  Private
exports.getMe = (req, res) => {
  // Data 'req.user' sudah dilampirkan oleh middleware 'protect'
  res.status(200).json(req.user);
};
