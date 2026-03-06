
-- Table: movies (filmes gerais)
CREATE TABLE public.movies (
  id SERIAL PRIMARY KEY,
  titulo TEXT NOT NULL,
  tmdb_id TEXT,
  url TEXT,
  trailer TEXT,
  year TEXT,
  rating TEXT,
  description TEXT,
  poster TEXT,
  category TEXT,
  type TEXT DEFAULT 'movie'
);

-- Table: movies_kids (filmes infantis)
CREATE TABLE public.movies_kids (
  id SERIAL PRIMARY KEY,
  titulo TEXT NOT NULL,
  url TEXT,
  genero TEXT,
  year TEXT,
  rating TEXT,
  description TEXT,
  poster TEXT,
  type TEXT DEFAULT 'movie'
);

-- Table: series (séries gerais)
CREATE TABLE public.series (
  id SERIAL PRIMARY KEY,
  titulo TEXT NOT NULL,
  tmdb_id TEXT,
  trailer TEXT,
  identificador_archive TEXT,
  type TEXT DEFAULT 'serie'
);

-- Table: series_kids (séries infantis)
CREATE TABLE public.series_kids (
  id SERIAL PRIMARY KEY,
  titulo TEXT NOT NULL,
  identificador_archive TEXT,
  genero TEXT,
  year TEXT,
  rating TEXT,
  description TEXT,
  poster TEXT,
  type TEXT DEFAULT 'serie'
);

-- Enable RLS on all tables
ALTER TABLE public.movies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.movies_kids ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.series ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.series_kids ENABLE ROW LEVEL SECURITY;

-- Public read policies
CREATE POLICY "allow_public_read" ON public.movies FOR SELECT USING (true);
CREATE POLICY "allow_public_read" ON public.movies_kids FOR SELECT USING (true);
CREATE POLICY "allow_public_read" ON public.series FOR SELECT USING (true);
CREATE POLICY "allow_public_read" ON public.series_kids FOR SELECT USING (true);
