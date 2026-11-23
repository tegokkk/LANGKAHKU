# Protokol validasi dan uji terbatas

Status: instrumen siap; belum ada peserta, izin sekolah, atau penilaian ahli. Jangan mengisi hasil atau menghitung skor seolah pengujian sudah dilakukan. Seluruh simulasi pengembang memakai data fiktif dan tidak mewakili uji siswa nyata.

## Kesiapan dan persetujuan

Penanggung jawab sekolah menetapkan prosedur persetujuan siswa/wali, jam/kontak bantuan, retensi, penanganan keluhan, pembagian petugas dan lokasi data. Verifikasi gerbang teknis, akses lintas akun/sekolah, cache, ekspor/penghapusan dan restore sebelum merekrut peserta. Siswa berpartisipasi sukarela, boleh melewati pertanyaan, dan dapat berhenti tanpa konsekuensi akademik. Jangan menyalin isi jurnal/refleksi ke catatan uji.

## Skenario dan lembar observasi

| ID | Tugas | Bukti yang dicatat |
|---|---|---|
| T1 | Baca privasi, daftar, masuk, jelaskan siapa melihat data | Berhasil/tidak, bantuan, waktu, pemahaman izin wali terpisah |
| SA | Superadmin meninjau pending, approve/reject dengan alasan, verifikasi wali terpisah | Keputusan, riwayat, status siswa; tanpa isi pribadi |
| T2 | Isi/lewati enam langkah, konfirmasi, buka ulang | Sasaran <=10 menit, ringkasan sesuai input, tidak ada skor |
| T3 | Temukan sumber SNBT dan satu jalur kerja | Sasaran <=2 menit per jalur; dapat membedakan demo/tahun berjalan |
| T4 | Simpan 2–3 opsi, 1–5/belum tahu dan alasan | Bertahan setelah reload; siswa menjelaskan alasan tanpa “pemenang” |
| T5 | Pilih tujuan/cadangan, simpan tiga langkah, tandai satu, buka ulang | Isi/checklist benar dan cetak hanya semester dipilih |
| T6 | Pratinjau/kirim rencana saja atau tanpa lampiran, cabut izin | BK melihat tepat izin; jurnal tidak terbagikan; akses berikutnya tertutup |
| T7 | BK menjadwalkan, meninjau agregat, membuat draf konten | Scope benar; kelompok kecil disembunyikan; tidak ada drill-down |
| HD | Ekspor tanpa jurnal, hapus per fitur/akun | Autentikasi ulang, isi ekspor tepat, akses diblokir, job selesai |
| OF | Unduh materi publik, gunakan luring, keluar perangkat bersama | Materi tersedia, data privat tidak tersedia/cache, tidak ada kirim otomatis |

Lembar per tugas: kode peserta acak; versi build; ukuran/perangkat/jaringan; waktu mulai/akhir; selesai ya/tidak; jumlah bantuan; kesalahan; komentar anonim; prioritas; tindakan perbaikan; uji ulang. Jangan catat kata sandi, kode pemulihan, nama, kelas rinci, atau jawaban pribadi.

## Ahli

Minta satu ahli materi BK dan satu ahli media, laporkan terpisah. Skala 1–4 (1 belum layak, 2 perlu banyak revisi, 3 perlu sedikit revisi, 4 layak). Materi: relevansi tujuan; alur refleksi; keseimbangan jalur; kebenaran/sumber/periode informasi; bahasa; otonomi; privasi; batas layanan dan persetujuan. Media: tata letak desktop; label; navigasi; keterbacaan/kontras; keyboard/pembaca layar; state gagal; luring; cetak; bantuan. Sertakan komentar dan tindakan per butir. Persentase = skor diperoleh / skor maksimum ×100%; sasaran >=75%; revisi butir di bawah ambang.

## Peserta dan angket

Target 5–8 siswa XI/XII dan satu guru BK dengan izin. Jika memakai mahasiswa pemeran, nyatakan simulasi dan laporkan terpisah. Sasaran >=80% tugas tanpa bantuan. Jangan menyebut hasil usability sebagai bukti efektivitas bimbingan.

SUS, skala 1–5 sangat tidak setuju sampai sangat setuju:

1. Saya ingin menggunakan sistem ini lagi.
2. Sistem terasa terlalu rumit.
3. Sistem mudah digunakan.
4. Saya memerlukan bantuan teknis untuk menggunakan sistem.
5. Bagian sistem terasa terpadu dengan baik.
6. Sistem terasa tidak konsisten.
7. Orang lain dapat belajar menggunakannya dengan cepat.
8. Sistem terasa merepotkan.
9. Saya percaya diri menggunakannya.
10. Saya perlu banyak belajar sebelum dapat mulai.

SUS per peserta = jumlah (jawaban−1) butir ganjil + (5−jawaban) butir genap, dikali 2,5. Hanya hitung peserta dengan jawaban lengkap; laporkan data hilang. Sasaran rata-rata >=68.

Keterpahaman, skala 1–4: tujuan refleksi; perbedaan jalur; arti nilai pribadi/belum tahu; cara membuat rencana; siapa melihat jurnal/ringkasan; cara mencabut/menghapus. Laporkan persentase setiap butir, sasaran >=75%.

Prioritas: setiap kebocoran atau kegagalan privasi memblokir penggunaan; tugas yang gagal pada >=2 peserta diprioritaskan. Simpan log masalah → perbaikan → bukti uji ulang. Pada pilot kecil, agregat harus disembunyikan; demonstrasi grafik lengkap memakai dataset fiktif yang memenuhi ambang.
