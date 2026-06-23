import Database from "better-sqlite3";
import fs from "fs";
import path from "path";
import { catalogoInicial, CuentaContable, Partida } from "@/data/catalogo";

const DB_DIR = path.join(process.cwd(), "data");
const DB_PATH = path.join(DB_DIR, "sistema_contable.sqlite");

let dbInstance: Database.Database | null = null;

const ensureDbDir = () => {
  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }
};

export const initDb = () => {
  if (dbInstance) return dbInstance;

  ensureDbDir();
  dbInstance = new Database(DB_PATH);

  dbInstance.pragma("journal_mode = WAL");

  dbInstance.exec(`
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS catalogo (
      codigo TEXT PRIMARY KEY,
      nombre TEXT NOT NULL,
      tipo TEXT NOT NULL,
      naturaleza TEXT NOT NULL,
      nivel INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS partidas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      numero INTEGER NOT NULL,
      fecha TEXT NOT NULL,
      concepto TEXT NOT NULL,
      detalles TEXT NOT NULL
    );
  `);

  // Validar si la base de datos contiene el catálogo actualizado para el caso de Industrias Ilomodas.
  // La cuenta '1107' (Inventarios) no existía en el catálogo genérico inicial.
  const hasExerciseAccount = dbInstance.prepare("SELECT COUNT(*) as count FROM catalogo WHERE codigo = '1107'").get() as { count: number };
  if (hasExerciseAccount.count === 0) {
    // Si no está la cuenta 1107, limpiamos el catálogo viejo para forzar el re-seed con el nuevo
    dbInstance.exec("DELETE FROM catalogo");
  }

  const seedCatalogo = dbInstance.prepare("SELECT COUNT(*) as count FROM catalogo").get() as { count: number };
  if (seedCatalogo.count === 0) {
    const insertCuenta = dbInstance.prepare(`
      INSERT OR REPLACE INTO catalogo (codigo, nombre, tipo, naturaleza, nivel)
      VALUES (@codigo, @nombre, @tipo, @naturaleza, @nivel)
    `);

    const insertMany = dbInstance.transaction((cuentas: CuentaContable[]) => {
      for (const cuenta of cuentas) {
        insertCuenta.run(cuenta);
      }
    });

    insertMany(catalogoInicial);
  }

  return dbInstance;
};

export const getDb = () => initDb();

export const getCatalogo = (): CuentaContable[] => {
  const db = getDb();
  const rows = db.prepare("SELECT codigo, nombre, tipo, naturaleza, nivel FROM catalogo ORDER BY codigo").all() as CuentaContable[];
  return rows.length > 0 ? rows : catalogoInicial;
};

export const saveCatalogo = (catalogo: CuentaContable[]) => {
  const db = getDb();
  const insertCuenta = db.prepare(`
    INSERT OR REPLACE INTO catalogo (codigo, nombre, tipo, naturaleza, nivel)
    VALUES (@codigo, @nombre, @tipo, @naturaleza, @nivel)
  `);

  const transaction = db.transaction((cuentas: CuentaContable[]) => {
    db.exec("DELETE FROM catalogo");
    for (const cuenta of cuentas) {
      insertCuenta.run(cuenta);
    }
  });

  transaction(catalogo);
};

export const getPartidas = (): Partida[] => {
  const db = getDb();
  const rows = db.prepare("SELECT numero, fecha, concepto, detalles FROM partidas ORDER BY numero").all() as Array<{
    numero: number;
    fecha: string;
    concepto: string;
    detalles: string;
  }>;

  return rows.map(row => ({
    ...row,
    detalles: JSON.parse(row.detalles),
  }));
};

export const savePartidas = (partidas: Partida[]) => {
  const db = getDb();
  const deleteAll = db.prepare("DELETE FROM partidas");
  const insertPartida = db.prepare(`
    INSERT INTO partidas (numero, fecha, concepto, detalles)
    VALUES (@numero, @fecha, @concepto, @detalles)
  `);

  const transaction = db.transaction((lista: Partida[]) => {
    deleteAll.run();
    for (const partida of lista) {
      insertPartida.run({
        numero: partida.numero,
        fecha: partida.fecha,
        concepto: partida.concepto,
        detalles: JSON.stringify(partida.detalles),
      });
    }
  });

  transaction(partidas);
};

export const getAllData = () => ({
  catalogo: getCatalogo(),
  partidas: getPartidas(),
});

export const saveAllData = ({ catalogo, partidas }: { catalogo?: CuentaContable[]; partidas?: Partida[] }) => {
  if (catalogo) {
    saveCatalogo(catalogo);
  }

  if (partidas) {
    savePartidas(partidas);
  }
};
