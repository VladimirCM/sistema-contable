// data/catalogo.ts

// 1. Definimos la estructura exacta que tendrá cada cuenta en el sistema
export interface CuentaContable {
    codigo: string;       // Ej: "1", "11", "1101"
    nombre: string;       // Ej: "Activos", "Caja", "Caja General"
    tipo: "Activo" | "Pasivo" | "Patrimonio" | "Ingreso" | "Gasto" | "Costo"; 
    naturaleza: "Deudora" | "Acreedora"; // ¡CRÍTICO para la Partida Doble!
    nivel: number;        // Nivel 1 (Cuenta Mayor), Nivel 2 (Subcuenta), etc.
}

// 2. Catálogo inicial adaptado exactamente al caso práctico "Industrias Ilomodas"
export const catalogoInicial: CuentaContable[] = [
    // --- ACTIVOS (Naturaleza Deudora) ---
    { codigo: "1", nombre: "ACTIVOS", tipo: "Activo", naturaleza: "Deudora", nivel: 1 },
    { codigo: "11", nombre: "Activos Corrientes", tipo: "Activo", naturaleza: "Deudora", nivel: 2 },
    { codigo: "1101", nombre: "Efectivo y Equivalentes de Efectivo", tipo: "Activo", naturaleza: "Deudora", nivel: 3 },
    { codigo: "110101", nombre: "Caja", tipo: "Activo", naturaleza: "Deudora", nivel: 4 },
    { codigo: "110102", nombre: "Bancos", tipo: "Activo", naturaleza: "Deudora", nivel: 4 },
    { codigo: "1103", nombre: "Cuentas por Cobrar", tipo: "Activo", naturaleza: "Deudora", nivel: 3 },
    { codigo: "1107", nombre: "Inventarios", tipo: "Activo", naturaleza: "Deudora", nivel: 3 },
    { codigo: "110701", nombre: "Inventario de Materia Prima", tipo: "Activo", naturaleza: "Deudora", nivel: 4 },
    { codigo: "110702", nombre: "Inventario de Material Directo", tipo: "Activo", naturaleza: "Deudora", nivel: 4 },
    { codigo: "110703", nombre: "Inventario de Material Indirecto", tipo: "Activo", naturaleza: "Deudora", nivel: 4 },
    { codigo: "1110", nombre: "Anticipo a Cuenta del ISR", tipo: "Activo", naturaleza: "Deudora", nivel: 3 },
    
    { codigo: "12", nombre: "Activos No Corrientes", tipo: "Activo", naturaleza: "Deudora", nivel: 2 },
    { codigo: "1201", nombre: "Propiedad, Planta y Equipo", tipo: "Activo", naturaleza: "Deudora", nivel: 3 },
    { codigo: "120101", nombre: "Equipo y Maquinaria de Producción", tipo: "Activo", naturaleza: "Deudora", nivel: 4 },
    { codigo: "120102", nombre: "Mobiliario y Equipo de Oficina", tipo: "Activo", naturaleza: "Deudora", nivel: 4 },
    { codigo: "1202", nombre: "Depreciación Acumulada", tipo: "Activo", naturaleza: "Acreedora", nivel: 3 },
    { codigo: "120201", nombre: "Depreciación Acumulada Maquinaria y Equipo", tipo: "Activo", naturaleza: "Acreedora", nivel: 4 },
    { codigo: "120202", nombre: "Depreciación Acumulada Mobiliario y Equipo", tipo: "Activo", naturaleza: "Acreedora", nivel: 4 },

    // --- PASIVOS (Naturaleza Acreedora) ---
    { codigo: "2", nombre: "PASIVOS", tipo: "Pasivo", naturaleza: "Acreedora", nivel: 1 },
    { codigo: "21", nombre: "Pasivos Corrientes", tipo: "Pasivo", naturaleza: "Acreedora", nivel: 2 },
    { codigo: "2104", nombre: "Tributos por Pagar", tipo: "Pasivo", naturaleza: "Acreedora", nivel: 3 },
    { codigo: "2106", nombre: "Retenciones por Pagar", tipo: "Pasivo", naturaleza: "Acreedora", nivel: 3 },
    { codigo: "2108", nombre: "Aportes Patronales por Pagar", tipo: "Pasivo", naturaleza: "Acreedora", nivel: 3 },

    // --- PATRIMONIO / CAPITAL (Naturaleza Acreedora) ---
    { codigo: "3", nombre: "PATRIMONIO", tipo: "Patrimonio", naturaleza: "Acreedora", nivel: 1 },
    { codigo: "31", nombre: "Capital Contable", tipo: "Patrimonio", naturaleza: "Acreedora", nivel: 2 },
    { codigo: "3101", nombre: "Capital Social", tipo: "Patrimonio", naturaleza: "Acreedora", nivel: 3 },
    { codigo: "3201", nombre: "Reserva Legal", tipo: "Patrimonio", naturaleza: "Acreedora", nivel: 3 },
    { codigo: "33", nombre: "Resultados de Ejercicios", tipo: "Patrimonio", naturaleza: "Acreedora", nivel: 2 },
    { codigo: "3301", nombre: "Utilidad del Ejercicio", tipo: "Patrimonio", naturaleza: "Acreedora", nivel: 3 },
    { codigo: "3302", nombre: "Pérdida del Ejercicio", tipo: "Patrimonio", naturaleza: "Deudora", nivel: 3 },
    { codigo: "3303", nombre: "Pérdidas y Ganancias", tipo: "Patrimonio", naturaleza: "Acreedora", nivel: 3 },

    // --- COSTOS Y GASTOS (Naturaleza Deudora / Excepciones) ---
    { codigo: "4", nombre: "COSTOS Y GASTOS", tipo: "Costo", naturaleza: "Deudora", nivel: 1 },
    { codigo: "41", nombre: "Costo de Ventas", tipo: "Costo", naturaleza: "Deudora", nivel: 2 },
    { codigo: "4102", nombre: "Costos de Venta", tipo: "Costo", naturaleza: "Deudora", nivel: 3 },
    { codigo: "43", nombre: "Costos Indirectos de Fabricación", tipo: "Costo", naturaleza: "Deudora", nivel: 2 },
    { codigo: "4301", nombre: "Costos Indirectos de Fabricación Control", tipo: "Costo", naturaleza: "Deudora", nivel: 3 },
    { codigo: "4302", nombre: "Costos Indirectos de Fabricación Aplicados", tipo: "Costo", naturaleza: "Acreedora", nivel: 3 },
    { codigo: "44", nombre: "Gastos de Operación", tipo: "Gasto", naturaleza: "Deudora", nivel: 2 },
    { codigo: "4401", nombre: "Gasto de Administración", tipo: "Gasto", naturaleza: "Deudora", nivel: 3 },
    { codigo: "4402", nombre: "Gasto de Venta", tipo: "Gasto", naturaleza: "Deudora", nivel: 3 },

    // --- INGRESOS (Naturaleza Acreedora) ---
    { codigo: "5", nombre: "INGRESOS", tipo: "Ingreso", naturaleza: "Acreedora", nivel: 1 },
    { codigo: "51", nombre: "Ingresos Operacionales", tipo: "Ingreso", naturaleza: "Acreedora", nivel: 2 },
    { codigo: "5101", nombre: "Ingresos Operacionales", tipo: "Ingreso", naturaleza: "Acreedora", nivel: 3 }
];

export interface DetallePartida {
    id: string;
    codigoCuenta: string;
    debe: number;
    haber: number;
}

export interface Partida {
    numero: number;
    fecha: string;
    concepto: string;
    detalles: DetallePartida[];
}