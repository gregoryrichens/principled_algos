export const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS attempts (
  id                BIGSERIAL PRIMARY KEY,
  attempted_on      DATE        NOT NULL,
  problem           INTEGER     NOT NULL CHECK (problem > 0),
  title             TEXT        NOT NULL DEFAULT '',
  chosen_principle  SMALLINT    CHECK (chosen_principle BETWEEN 1 AND 18),
  correct_principle SMALLINT    CHECK (correct_principle BETWEEN 1 AND 18),
  outcome           TEXT        NOT NULL CHECK (outcome IN
                      ('clean','slow','bug','wrong-principle','read-solution')),
  note              TEXT        NOT NULL DEFAULT '',
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS attempts_problem_idx ON attempts (problem, attempted_on, id);
`;
