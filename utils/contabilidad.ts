import { catalogoInicial, CuentaContable, Partida } from "@/data/catalogo";

export interface SaldoCuenta {
    codigo: string;
    debe: number;
    haber: number;
    saldo: number;
}

export const obtenerCuentaInfo = (codigo: string, catalogo: CuentaContable[] = catalogoInicial): CuentaContable | null => {
    // Buscar coincidencia exacta
    const cuenta = catalogo.find(item => item.codigo === codigo);
    if (cuenta) return cuenta;

    // Si no hay coincidencia exacta, buscar por el prefijo más largo que coincida
    let mejorCoincidencia: CuentaContable | null = null;
    let maxLongitud = 0;

    for (const item of catalogo) {
        if (codigo.startsWith(item.codigo) && item.codigo.length > maxLongitud) {
            mejorCoincidencia = item;
            maxLongitud = item.codigo.length;
        }
    }

    return mejorCoincidencia;
};

export const obtenerNaturaleza = (codigo: string, catalogo: CuentaContable[] = catalogoInicial): "Deudora" | "Acreedora" => {
    const cuenta = obtenerCuentaInfo(codigo, catalogo);
    if (cuenta?.naturaleza) return cuenta.naturaleza;

    // Fallbacks si no se encuentra en el catálogo según la nueva clasificación
    if (codigo.startsWith("1") || codigo.startsWith("4")) {
        return "Deudora";
    }

    return "Acreedora";
};

export const calcularSaldos = (partidas: Partida[], catalogo: CuentaContable[] = catalogoInicial) => {
    const saldos: Record<string, SaldoCuenta> = {};

    partidas.forEach(partida => {
        partida.detalles.forEach(detalle => {
            const cod = detalle.codigoCuenta;
            if (!saldos[cod]) {
                saldos[cod] = { codigo: cod, debe: 0, haber: 0, saldo: 0 };
            }
            saldos[cod].debe += detalle.debe;
            saldos[cod].haber += detalle.haber;
        });
    });

    Object.keys(saldos).forEach(cod => {
        const c = saldos[cod];
        const naturaleza = obtenerNaturaleza(cod, catalogo);

        c.saldo = naturaleza === "Deudora"
            ? c.debe - c.haber
            : c.haber - c.debe;
    });

    return saldos;
};