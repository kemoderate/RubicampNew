-- Tabel Jurusan
CREATE TABLE jurusan (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nama_jurusan TEXT NOT NULL
);

-- Tabel Mahasiswa
CREATE TABLE mahasiswa (
    nim TEXT PRIMARY KEY,
    nama TEXT NOT NULL,
    alamat TEXT,
    jurusan_id INTEGER,
    FOREIGN KEY (jurusan_id) REFERENCES jurusan(id)
);

-- Tabel Dosen
CREATE TABLE dosen (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nama TEXT NOT NULL
);

-- Tabel Matakuliah
CREATE TABLE matakuliah (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nama TEXT NOT NULL,
    sks INTEGER NOT NULL
);

-- Tabel Mengajar (relasi Dosen - Matakuliah)
CREATE TABLE mengajar (
    dosen_id INTEGER,
    matakuliah_id INTEGER,
    PRIMARY KEY (dosen_id, matakuliah_id),
    FOREIGN KEY (dosen_id) REFERENCES dosen(id),
    FOREIGN KEY (matakuliah_id) REFERENCES matakuliah(id)
);

-- Isi data jurusan
INSERT INTO jurusan (nama_jurusan) VALUES
('Informatika'),
('Sistem Informasi'),
('Teknik Elektro');

-- Isi data mahasiswa
INSERT INTO mahasiswa (nim, nama, alamat, jurusan_id) VALUES
('M001', 'Andi', 'Jl. Mawar 1', 1),
('M002', 'Budi', 'Jl. Melati 2', 2),
('M003', 'Citra', 'Jl. Anggrek 3', 1);

-- Isi data dosen
INSERT INTO dosen (nama) VALUES
('Dr. Siti'),
('Dr. Andi'),
('Prof. Budi');

-- Isi data matakuliah
INSERT INTO matakuliah (nama, sks) VALUES
('Basis Data', 3),
('Pemrograman Web', 3),
('Jaringan Komputer', 4);

-- Relasi dosen mengajar matakuliah
INSERT INTO mengajar (dosen_id, matakuliah_id) VALUES
(1, 1),
(2, 2),
(3, 3);

