CREATE TABLE data (
    id integer primary key autoincrement,
    name varchar(100) not null,
    height integer,
    weight float,
    birthdate date,
    married boolean default false
);