-- 1. Tampilkan seluruh data mahasiswa beserta nama jurusannya
SELECT mahasiswa.nim, mahasiswa.nama, mahasiswa.alamat, jurusan.namajurusan
FROM mahasiswa
JOIN jurusan ON mahasiswa.jurusan = jurusan.id;

-- 2. Tampilkan mahasiswa yang memiliki umur di bawah 20 tahun
SELECT * FROM mahasiswa
WHERE (strftime('%Y', 'now') - strftime('%Y', tgl_lahir)) < 20;

-- 3. Tampilkan mahasiswa yang memiliki nilai 'B' ke atas
SELECT * FROM mahasiswa
WHERE nilai IN ('A', 'B');

-- 4. Tampilkan mahasiswa yang memiliki jumlah SKS lebih dari 10
SELECT mahasiswa.nim, mahasiswa.nama, SUM(matakuliah.sks) as total_sks
FROM mahasiswa
JOIN kontrakmk ON mahasiswa.nim = kontrakmk.nim
JOIN matakuliah ON kontrakmk.kode_mk = matakuliah.kode_mk
GROUP BY mahasiswa.nim
HAVING total_sks > 10;

-- 5. Tampilkan mahasiswa yang mengontrak mata kuliah 'data mining'
SELECT mahasiswa.nim, mahasiswa.nama
FROM mahasiswa
JOIN kontrakmk ON mahasiswa.nim = kontrakmk.nim
JOIN matakuliah ON kontrakmk.kode_mk = matakuliah.kode_mk
WHERE matakuliah.nama = 'data mining';

-- 6. Tampilkan jumlah mahasiswa untuk setiap dosen
SELECT dosen.nama, COUNT(mahasiswa.nim) as jumlah_mahasiswa
FROM dosen
JOIN kontrakmk ON dosen.id = kontrakmk.id_dosen
JOIN mahasiswa ON kontrakmk.nim = mahasiswa.nim
GROUP BY dosen.id;

-- 7. Urutkan mahasiswa berdasarkan umurnya
SELECT * FROM mahasiswa
ORDER BY (strftime('%Y', 'now') - strftime('%Y', tgl_lahir));

-- 8. Tampilkan kontrak matakuliah yang harus diulang (nilai D & E) dengan data lengkap mahasiswa, jurusan, dosen
SELECT mahasiswa.nim, mahasiswa.nama, jurusan.namajurusan, dosen.nama as dosen, matakuliah.nama as matakuliah, kontrakmk.nilai
FROM kontrakmk
JOIN mahasiswa ON kontrakmk.nim = mahasiswa.nim
JOIN jurusan ON mahasiswa.jurusan = jurusan.id
JOIN dosen ON kontrakmk.id_dosen = dosen.id
JOIN matakuliah ON kontrakmk.kode_mk = matakuliah.kode_mk
WHERE kontrakmk.nilai IN ('D', 'E');


-- Jurusan
INSERT INTO jurusan (id, namajurusan) VALUES
(1, 'Teknik Informatika'),
(2, 'Sistem Informasi'),
(3, 'Data Science');

-- Mahasiswa
INSERT INTO mahasiswa (nim, nama, alamat, tgl_lahir, jurusan) VALUES
('M001', 'Andi', 'Jakarta', '2005-05-10', 1),
('M002', 'Budi', 'Bandung', '2002-08-15', 2),
('M003', 'Citra', 'Surabaya', '2004-03-20', 3),
('M004', 'Dewi', 'Depok', '2001-12-05', 1);

-- Dosen
INSERT INTO dosen (id, nama) VALUES
(1, 'Dr. Rudi'),
(2, 'Prof. Sari');

-- Mata Kuliah
INSERT INTO matakuliah (kode_mk, nama, sks) VALUES
('MK001', 'Pemrograman', 4),
('MK002', 'Basis Data', 3),
('MK003', 'Data Mining', 4),
('MK004', 'Statistik', 3);

-- KontrakMK
INSERT INTO kontrakmk (nim, kode_mk, id_dosen, nilai) VALUES
('M001', 'MK001', 1, 'A'),
('M001', 'MK002', 2, 'B'),
('M002', 'MK003', 1, 'D'),
('M003', 'MK001', 2, 'E'),
('M003', 'MK003', 1, 'B'),
('M004', 'MK004', 2, 'A');
