// =============================
// TAILWIND-CONFIG.JS - Shared Tailwind CSS Configuration
// Konfigurasi Tailwind terpusat agar tidak duplikat
// =============================

window.TailwindConfig = {
  theme: {
    extend: {
      fontFamily: {
        inter: ['Inter', 'sans-serif'],
      },
      colors: {
        'fraud-primary': '#1e3a8a',
        'fraud-secondary': '#1d4ed8',
        'fraud-accent': '#6366f1',
        'fraud-success': '#16a34a',
        'fraud-warning': '#f59e0b',
        'fraud-danger': '#dc2626',
        'fraud-teal': '#059669',
        'fraud-gray': '#64748b',
        'fraud-light': '#f8fafc',
      },
    },
  },
};

// =============================
// Terapkan konfigurasi ke Tailwind jika tersedia
// =============================
if (typeof tailwind !== 'undefined') {
  tailwind.config = window.TailwindConfig;
}
