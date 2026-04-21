// prisma/seed.ts
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DIRECT_URL
    }
  }
})

async function main() {
  console.log('🌱 Memulai proses seed data CONSERVE Journal...')

  // Bersihkan data lama agar tidak duplikat jika seed dijalankan ulang
  // Urutan penghapusan penting: tabel yang punya foreign key dihapus duluan
  await prisma.article.deleteMany()
  await prisma.author.deleteMany()
  await prisma.volume.deleteMany()

  // -------------------------------------------------------
  // BUAT VOLUME — semua artikel ada di Volume 1, Nomor 1
  // -------------------------------------------------------
  const volume1 = await prisma.volume.create({
    data: {
      number: 1,
      issue: 1,
      year: 2024,
      month: 'Februari',
    }
  })
  console.log(`✅ Volume dibuat: Vol ${volume1.number} No ${volume1.issue} (${volume1.year})`)

  // -------------------------------------------------------
  // BUAT ARTIKEL — satu per satu beserta penulisnya
  // -------------------------------------------------------

  // Artikel 1
  await prisma.article.create({
    data: {
      title: 'Pelatihan Academic Writing Secara Daring untuk Dosen Non Jabatan Fungsional Akademik Sekolah Tinggi Ilmu Kesehatan Indonesia Maju',
      abstract: 'Penelitian ini bertujuan untuk mendeskripsikan dan menganalisis pelaksanaan pelatihan penulisan akademik (academic writing) secara daring bagi dosen non jabatan fungsional akademik di Sekolah Tinggi Ilmu Kesehatan Indonesia Maju. Metode yang digunakan adalah pendekatan deskriptif kualitatif dengan teknik pengumpulan data berupa observasi, wawancara mendalam, dan studi dokumentasi. Hasil penelitian menunjukkan bahwa pelatihan yang dilaksanakan secara daring berhasil meningkatkan pemahaman dan kompetensi peserta dalam menyusun naskah ilmiah yang memenuhi standar publikasi internasional. Sebanyak 87% peserta menyatakan puas dengan metode penyampaian dan materi yang dihadirkan. Program pengabdian masyarakat semacam ini dinilai krusial dalam mempercepat akselerasi jabatan akademik dosen di lingkungan perguruan tinggi kesehatan.',
      pages: '1-10',
      doi: '10.12345/conserve.v1i1.001',
      pdfUrl: '/papers/artikel-01.pdf',
      volumeId: volume1.id,
      authors: {
        create: [
          { name: 'Siti Rahmawati' },
          { name: 'Ahmad Fauzi' },
          { name: 'Dewi Kusumawati' },
        ]
      }
    }
  })

  // Artikel 2
  await prisma.article.create({
    data: {
      title: 'Pemberdayaan Kelompok Nelayan Melalui Budidaya Rumput Laut Berkelanjutan di Pesisir Pantai Makassar',
      abstract: 'Program pengabdian kepada masyarakat ini difokuskan pada pemberdayaan kelompok nelayan tradisional di pesisir pantai Makassar melalui introduksi teknologi budidaya rumput laut (Eucheuma cottonii) yang berkelanjutan dan ramah lingkungan. Intervensi dilakukan selama enam bulan meliputi pelatihan teknis, pendampingan lapangan, dan akses ke pasar digital. Hasil evaluasi menunjukkan peningkatan pendapatan rata-rata nelayan sebesar 45% dibandingkan periode sebelum program. Selain itu, terjadi peningkatan signifikan pada pengetahuan masyarakat tentang praktik konservasi ekosistem pesisir.',
      pages: '11-22',
      doi: '10.12345/conserve.v1i1.002',
      pdfUrl: '/papers/artikel-02.pdf',
      volumeId: volume1.id,
      authors: {
        create: [
          { name: 'Baharuddin Latif' },
          { name: 'Nurul Hidayah' },
        ]
      }
    }
  })

  // Artikel 3
  await prisma.article.create({
    data: {
      title: 'Sosialisasi dan Edukasi Pengelolaan Sampah Plastik Berbasis Komunitas di Wilayah Kepulauan Seribu',
      abstract: 'Permasalahan sampah plastik di kawasan kepulauan merupakan ancaman serius bagi ekosistem laut. Kegiatan pengabdian ini merancang dan mengimplementasikan program edukasi pengelolaan sampah plastik berbasis komunitas yang melibatkan warga kepulauan, sekolah dasar, dan kelompok nelayan di Kepulauan Seribu, DKI Jakarta. Metodologi yang digunakan adalah Participatory Action Research (PAR) yang menitikberatkan pada keterlibatan aktif masyarakat dalam proses perencanaan hingga evaluasi. Setelah program berlangsung selama tiga bulan, volume sampah plastik yang dibuang ke laut menurun sebesar 62% dan terbentuk empat bank sampah baru di wilayah sasaran.',
      pages: '23-35',
      doi: '10.12345/conserve.v1i1.003',
      pdfUrl: '/papers/artikel-03.pdf',
      volumeId: volume1.id,
      authors: {
        create: [
          { name: 'Indra Permana' },
          { name: 'Lisa Andriani' },
          { name: 'Hendra Saputra' },
        ]
      }
    }
  })

  // Artikel 4
  await prisma.article.create({
    data: {
      title: 'Pemanfaatan Teknologi Informasi dalam Pendampingan UMKM Kuliner Berbasis Produk Laut di Kota Bitung',
      abstract: 'Usaha Mikro, Kecil, dan Menengah (UMKM) berbasis produk laut di Kota Bitung memiliki potensi ekonomi yang sangat besar namun belum teroptimalkan, terutama dalam pemasaran digital. Program pengabdian ini memberikan pendampingan intensif kepada 25 UMKM kuliner dalam pemanfaatan platform media sosial, aplikasi e-commerce, dan sistem pencatatan keuangan digital. Selama delapan minggu pendampingan, rata-rata penjualan peserta meningkat 38% dan jangkauan pasar meluas hingga ke luar kota Bitung.',
      pages: '36-47',
      doi: '10.12345/conserve.v1i1.004',
      pdfUrl: '/papers/artikel-04.pdf',
      volumeId: volume1.id,
      authors: {
        create: [
          { name: 'Margaretha Wulandari' },
          { name: 'Eko Prasetyo' },
        ]
      }
    }
  })

  // Artikel 5
  await prisma.article.create({
    data: {
      title: 'Pengembangan Modul Wisata Edukasi Konservasi Penyu Berbasis Kearifan Lokal di Pantai Sukamade, Banyuwangi',
      abstract: 'Pantai Sukamade di Banyuwangi merupakan salah satu habitat peneluran penyu terpenting di Indonesia. Program ini mengembangkan modul wisata edukasi konservasi penyu yang mengintegrasikan nilai-nilai kearifan lokal masyarakat Osing sebagai panduan bagi wisatawan dan pelajar. Modul dirancang secara partisipatif bersama tokoh masyarakat, pengelola taman nasional, dan guru-guru sekolah setempat. Uji coba modul pada 120 pelajar SMA menunjukkan peningkatan skor pengetahuan konservasi sebesar 71% dan peningkatan sikap pro-lingkungan yang terukur.',
      pages: '48-60',
      doi: '10.12345/conserve.v1i1.005',
      pdfUrl: '/papers/artikel-05.pdf',
      volumeId: volume1.id,
      authors: {
        create: [
          { name: 'Ratna Sari Dewi' },
          { name: 'Bambang Nugroho' },
          { name: 'Yuliana Putri' },
        ]
      }
    }
  })

  // Artikel 6
  await prisma.article.create({
    data: {
      title: 'Penguatan Kapasitas Posyandu dalam Deteksi Dini Stunting Melalui Pelatihan Kader Berbasis Digital di Kabupaten Lombok Timur',
      abstract: 'Stunting masih menjadi permasalahan gizi serius di wilayah Nusa Tenggara Barat, khususnya Kabupaten Lombok Timur. Kegiatan pengabdian ini berfokus pada penguatan kapasitas kader Posyandu dalam melakukan deteksi dini stunting menggunakan aplikasi mobile berbasis Android yang dikembangkan secara khusus. Sebanyak 60 kader dari 15 Posyandu mengikuti pelatihan dua hari. Evaluasi enam minggu pasca-pelatihan menunjukkan peningkatan akurasi pengukuran dan pencatatan data gizi balita sebesar 83%, serta respons intervensi yang lebih cepat terhadap kasus yang terdeteksi.',
      pages: '61-74',
      doi: '10.12345/conserve.v1i1.006',
      pdfUrl: '/papers/artikel-06.pdf',
      volumeId: volume1.id,
      authors: {
        create: [
          { name: 'dr. Fathul Muin' },
          { name: 'Sri Wahyuni' },
          { name: 'Ahmad Rizki Pratama' },
        ]
      }
    }
  })

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