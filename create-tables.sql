CREATE TABLE kinds (
    id serial,
    kind varchar(15)
);

CREATE TABLE pets (
    id serial,
    age integer,
    kind_id integer NOT NULL,
    name varchar(15),

    CONSTRAINT kindspets FOREIGN KEY(kind_id) REFERENCES kinds(id) on DELETE CASCADE;
);

INSERT INTO kinds (kind) VALUES ('rainbow');
INSERT INTO kinds (kind) VALUES ('snake');

INSERT INTO pets (age, kind_id, name) VALUES (7, 1, 'Fido');
INSERT INTO pets (age, kind_id, name) VALUES (5, 2, 'Buttons');
