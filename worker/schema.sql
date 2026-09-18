
DROP TABLE IF EXISTS membros;

CREATE TABLE membros (
  id    INTEGER PRIMARY KEY AUTOINCREMENT,
  nome  TEXT NOT NULL,
  ordem INTEGER NOT NULL   
);

INSERT INTO membros (nome, ordem) VALUES
  ('Rubens', 0),
  ('Nathanael', 1),
  ('Heitor', 2),
  ('João Vitor', 3),
  ('Marco Antônio', 4),
  ('Natan', 5);
