-- Apaga a tabela se ela já existir (útil se você rodar esse script de novo)
DROP TABLE IF EXISTS membros;

-- Cria a tabela que guarda quem está na fila e em que posição
CREATE TABLE membros (
  id    INTEGER PRIMARY KEY AUTOINCREMENT,
  nome  TEXT NOT NULL,
  ordem INTEGER NOT NULL   -- quanto MENOR, mais na frente da fila (0 = é a vez dessa pessoa)
);

-- Popula com a fila inicial, na mesma ordem que já estava no site
INSERT INTO membros (nome, ordem) VALUES
  ('Rubens', 0),
  ('Nathanael', 1),
  ('Heitor', 2),
  ('João Vitor', 3),
  ('Marco Antônio', 4),
  ('Natan', 5);
