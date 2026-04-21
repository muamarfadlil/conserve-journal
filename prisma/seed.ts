// prisma/seed.ts
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient({
  datasources: { db: { url: process.env.DIRECT_URL } }
})

async function main() {
  console.log('🌱 Memulai proses seed data CONSERVE Journal...')

  // -------------------------------------------------------
  // SEED USERS
  // -------------------------------------------------------
  const superAdminPassword = await bcrypt.hash('superadmin123', 12)
  const adminPassword = await bcrypt.hash('admin123', 12)

  await prisma.user.upsert({
    where: { email: 'superadmin@conservejournal.ac.id' },
    update: {},
    create: {
      name: 'Super Administrator',
      email: 'superadmin@conservejournal.ac.id',
      password: superAdminPassword,
      role: 'SUPER_ADMIN',
    }
  })

  await prisma.user.upsert({
    where: { email: 'admin@conservejournal.ac.id' },
    update: {},
    create: {
      name: 'Editor Admin',
      email: 'admin@conservejournal.ac.id',
      password: adminPassword,
      role: 'ADMIN',
    }
  })

  console.log('✅ Users berhasil dibuat:')
  console.log('   📧 superadmin@conservejournal.ac.id / superadmin123 (SUPER_ADMIN)')
  console.log('   📧 admin@conservejournal.ac.id / admin123 (ADMIN)')

  // -------------------------------------------------------
  // SEED JOURNAL DATA
  // -------------------------------------------------------

  await prisma.article.deleteMany()
  await prisma.author.deleteMany()
  await prisma.volume.deleteMany()

  const volume1 = await prisma.volume.create({
    data: { number: 1, issue: 1, year: 2024, month: 'Februari' }
  })
  console.log(`✅ Volume: Vol ${volume1.number} No ${volume1.issue} (${volume1.year})`)

  const articles = [
    {
      title: 'Pelatihan Academic Writing Secara Daring untuk Dosen Non Jabatan Fungsional Akademik Sekolah Tinggi Ilmu Kesehatan Indonesia Maju',
      abstract: 'Penelitian ini bertujuan untuk mendeskripsikan dan menganalisis pelaksanaan pelatihan penulisan akademik (academic writing) secara daring bagi dosen non jabatan fungsional akademik di Sekolah Tinggi Ilmu Kesehatan Indonesia Maju. Metode yang digunakan adalah pendekatan deskriptif kualitatif dengan teknik pengumpulan data berupa observasi, wawancara mendalam, dan studi dokumentasi. Hasil penelitian menunjukkan bahwa pelatihan yang dilaksanakan secara daring berhasil meningkatkan pemahaman dan kompetensi peserta dalam menyusun naskah ilmiah yang memenuhi standar publikasi internasional. Sebanyak 87% peserta menyatakan puas dengan metode penyampaian dan materi yang dihadirkan.',
      pages: '1-10',
      doi: '10.12345/conserve.v1i1.001',
      pdfUrl: '/papers/artikel-01.pdf',
      category: 'Pendidikan',
      keywords: ['academic writing', 'dosen', 'pelatihan daring', 'jabatan fungsional'],
      publishedAt: new Date('2024-02-01'),
      authors: [
        { name: 'Siti Rahmawati', affiliation: 'Universitas Indonesia' },
        { name: 'Ahmad Fauzi', affiliation: 'STIKES Indonesia Maju' },
        { name: 'Dewi Kusumawati', affiliation: 'STIKES Indonesia Maju' },
      ]
    },
    {
      title: 'Pemberdayaan Kelompok Nelayan Melalui Budidaya Rumput Laut Berkelanjutan di Pesisir Pantai Makassar',
      abstract: 'Program pengabdian kepada masyarakat ini difokuskan pada pemberdayaan kelompok nelayan tradisional di pesisir pantai Makassar melalui introduksi teknologi budidaya rumput laut (Eucheuma cottonii) yang berkelanjutan dan ramah lingkungan. Intervensi dilakukan selama enam bulan meliputi pelatihan teknis, pendampingan lapangan, dan akses ke pasar digital. Hasil evaluasi menunjukkan peningkatan pendapatan rata-rata nelayan sebesar 45% dibandingkan periode sebelum program.',
      pages: '11-22',
      doi: '10.12345/conserve.v1i1.002',
      pdfUrl: '/papers/artikel-02.pdf',
      category: 'Kelautan',
      keywords: ['rumput laut', 'nelayan', 'pemberdayaan', 'konservasi pesisir'],
      publishedAt: new Date('2024-02-01'),
      authors: [
        { name: 'Baharuddin Latif', affiliation: 'Universitas Hasanuddin' },
        { name: 'Nurul Hidayah', affiliation: 'Universitas Hasanuddin' },
      ]
    },
    {
      title: 'Sosialisasi dan Edukasi Pengelolaan Sampah Plastik Berbasis Komunitas di Wilayah Kepulauan Seribu',
      abstract: 'Permasalahan sampah plastik di kawasan kepulauan merupakan ancaman serius bagi ekosistem laut. Kegiatan pengabdian ini merancang dan mengimplementasikan program edukasi pengelolaan sampah plastik berbasis komunitas yang melibatkan warga kepulauan, sekolah dasar, dan kelompok nelayan di Kepulauan Seribu, DKI Jakarta. Setelah program berlangsung selama tiga bulan, volume sampah plastik yang dibuang ke laut menurun sebesar 62% dan terbentuk empat bank sampah baru di wilayah sasaran.',
      pages: '23-35',
      doi: '10.12345/conserve.v1i1.003',
      pdfUrl: '/papers/artikel-03.pdf',
      category: 'Lingkungan',
      keywords: ['sampah plastik', 'kepulauan seribu', 'komunitas', 'bank sampah'],
      publishedAt: new Date('2024-02-01'),
      authors: [
        { name: 'Indra Permana', affiliation: 'Universitas Indonesia' },
        { name: 'Lisa Andriani', affiliation: 'Universitas Indonesia' },
        { name: 'Hendra Saputra', affiliation: 'Pemerintah DKI Jakarta' },
      ]
    },
    {
      title: 'Pemanfaatan Teknologi Informasi dalam Pendampingan UMKM Kuliner Berbasis Produk Laut di Kota Bitung',
      abstract: 'Usaha Mikro, Kecil, dan Menengah (UMKM) berbasis produk laut di Kota Bitung memiliki potensi ekonomi yang sangat besar namun belum teroptimalkan, terutama dalam pemasaran digital. Program pengabdian ini memberikan pendampingan intensif kepada 25 UMKM kuliner dalam pemanfaatan platform media sosial, aplikasi e-commerce, dan sistem pencatatan keuangan digital. Rata-rata penjualan peserta meningkat 38% dan jangkauan pasar meluas hingga ke luar kota Bitung.',
      pages: '36-47',
      doi: '10.12345/conserve.v1i1.004',
      pdfUrl: '/papers/artikel-04.pdf',
      category: 'Ekonomi',
      keywords: ['UMKM', 'digital marketing', 'produk laut', 'Bitung'],
      publishedAt: new Date('2024-02-01'),
      authors: [
        { name: 'Margaretha Wulandari', affiliation: 'Universitas Sam Ratulangi' },
        { name: 'Eko Prasetyo', affiliation: 'Universitas Sam Ratulangi' },
      ]
    },
    {
      title: 'Pengembangan Modul Wisata Edukasi Konservasi Penyu Berbasis Kearifan Lokal di Pantai Sukamade, Banyuwangi',
      abstract: 'Pantai Sukamade di Banyuwangi merupakan salah satu habitat peneluran penyu terpenting di Indonesia. Program ini mengembangkan modul wisata edukasi konservasi penyu yang mengintegrasikan nilai-nilai kearifan lokal masyarakat Osing sebagai panduan bagi wisatawan dan pelajar. Uji coba modul pada 120 pelajar SMA menunjukkan peningkatan skor pengetahuan konservasi sebesar 71% dan peningkatan sikap pro-lingkungan yang terukur.',
      pages: '48-60',
      doi: '10.12345/conserve.v1i1.005',
      pdfUrl: '/papers/artikel-05.pdf',
      category: 'Konservasi',
      keywords: ['penyu', 'wisata edukasi', 'kearifan lokal', 'Banyuwangi'],
      publishedAt: new Date('2024-02-01'),
      authors: [
        { name: 'Ratna Sari Dewi', affiliation: 'Universitas Jember' },
        { name: 'Bambang Nugroho', affiliation: 'Taman Nasional Meru Betiri' },
        { name: 'Yuliana Putri', affiliation: 'Universitas Jember' },
      ]
    },
    {
      title: 'Penguatan Kapasitas Posyandu dalam Deteksi Dini Stunting Melalui Pelatihan Kader Berbasis Digital di Kabupaten Lombok Timur',
      abstract: 'Stunting masih menjadi permasalahan gizi serius di wilayah Nusa Tenggara Barat, khususnya Kabupaten Lombok Timur. Kegiatan pengabdian ini berfokus pada penguatan kapasitas kader Posyandu dalam melakukan deteksi dini stunting menggunakan aplikasi mobile berbasis Android yang dikembangkan secara khusus. Sebanyak 60 kader dari 15 Posyandu mengikuti pelatihan dua hari. Evaluasi enam minggu pasca-pelatihan menunjukkan peningkatan akurasi pengukuran dan pencatatan data gizi balita sebesar 83%.',
      pages: '61-74',
      doi: '10.12345/conserve.v1i1.006',
      pdfUrl: '/papers/artikel-06.pdf',
      category: 'Kesehatan',
      keywords: ['stunting', 'posyandu', 'kader', 'aplikasi mobile', 'Lombok'],
      publishedAt: new Date('2024-02-01'),
      authors: [
        { name: 'dr. Fathul Muin', affiliation: 'Universitas Mataram' },
        { name: 'Sri Wahyuni', affiliation: 'Dinas Kesehatan Lombok Timur' },
        { name: 'Ahmad Rizki Pratama', affiliation: 'Universitas Mataram' },
      ]
    },
  ]

  for (const article of articles) {
    const { authors, ...articleData } = article
    await prisma.article.create({
      data: {
        ...articleData,
        volumeId: volume1.id,
        authors: { create: authors }
      }
    })
  }

  console.log('✅ Semua artikel berhasil dimasukkan ke database!')
  console.log('🎉 Seed selesai!')
}

main()
  .catch((e) => {
    console.error('❌ Error saat seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
