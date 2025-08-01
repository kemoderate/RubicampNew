CREATE TABLE data (
    id integer primary key autoincrement,
    name varchar(100) not null,
    height integer,
    weight float,
    birthdate date,
    married boolean default false
);

"name": "Himawan",
    "height": 168,
    "weight": 80.52,
    "birthdate": "1991-03-12",
    "married": false

INSERT INTO data (name, height, weight, birthdate , married) VALUES
('Hilmi', 185, 59.6, 20),
('MK002', 'Basis Data', 3),
('MK003', 'Data Mining', 4),
('MK004', 'Statistik', 3);