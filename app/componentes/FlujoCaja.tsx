"use client";

import { calcularSaldos, obtenerCuentaInfo, obtenerNaturaleza } from "@/utils/contabilidad";
import { CuentaContable, Partida } from "@/data/catalogo";

interface FlujoCajaProps {
    partidas: Partida[];
    catalogo: CuentaContable[];
}

export default function FlujoCaja({ partidas, catalogo }: FlujoCajaProps) {
    const saldos = calcularSaldos(partidas, catalogo);

    // Identificar las cuentas de efectivo usando la cuenta principal del catálogo
    const cuentasEfectivo = catalogo.filter(cuenta => cuenta.codigo.startsWith("1101"));
    const cuentasActivosNoCorrientes = catalogo.filter(cuenta => {
        return cuenta.tipo === "Activo" && cuenta.codigo.startsWith("12") && cuenta.nivel >= 3;
    });
    const cuentasPasivos = catalogo.filter(cuenta => cuenta.tipo === "Pasivo" && cuenta.nivel >= 3);
    const cuentasPatrimonio = catalogo.filter(cuenta => cuenta.tipo === "Patrimonio" && cuenta.nivel >= 3);

    const ingresos = Object.values(saldos)
        .filter(s => {
            const info = obtenerCuentaInfo(s.codigo, catalogo);
            return info?.tipo === "Ingreso";
        })
        .reduce((sum, s) => sum + (s.haber - s.debe), 0);

    const costos = Object.values(saldos)
        .filter(s => {
            const info = obtenerCuentaInfo(s.codigo, catalogo);
            return info?.tipo === "Costo";
        })
        .reduce((sum, s) => sum + (s.debe - s.haber), 0);

    const gastos = Object.values(saldos)
        .filter(s => {
            const info = obtenerCuentaInfo(s.codigo, catalogo);
            return info?.tipo === "Gasto";
        })
        .reduce((sum, s) => sum + (s.debe - s.haber), 0);

    const utilidadNeta = ingresos - costos - gastos;

    // Calcular el efectivo disponible sumando los saldos reales de las cuentas de efectivo
    const efectivoDisponible = cuentasEfectivo
        .filter(c => c.nivel >= 3)
        .reduce((sum, cuenta) => {
            const s = saldos[cuenta.codigo];
            if (!s) return sum;
            const nat = obtenerNaturaleza(cuenta.codigo, catalogo);
            return sum + (nat === "Deudora" ? s.saldo : -s.saldo);
        }, 0);

    const flujoOperativo = utilidadNeta;

    // Flujo de inversión: variación en activos no corrientes (propiedad planta y equipo, etc.)
    const flujoInversion = -cuentasActivosNoCorrientes.reduce((sum, cuenta) => {
        const s = saldos[cuenta.codigo];
        if (!s) return sum;
        const nat = obtenerNaturaleza(cuenta.codigo, catalogo);
        return sum + (nat === "Deudora" ? s.saldo : -s.saldo);
    }, 0);

    // Flujo de financiamiento: variación en pasivo y patrimonio
    const flujoFinanciamiento = cuentasPasivos.concat(cuentasPatrimonio).reduce((sum, cuenta) => {
        const s = saldos[cuenta.codigo];
        if (!s) return sum;
        const nat = obtenerNaturaleza(cuenta.codigo, catalogo);
        return sum + (nat === "Acreedora" ? s.saldo : -s.saldo);
    }, 0);

    const saldoProyectado = efectivoDisponible + flujoOperativo + flujoInversion + flujoFinanciamiento;

    const observacion = saldoProyectado >= 0
        ? "La empresa mantiene suficiente liquidez para cubrir operaciones básicas y proyecta un saldo positivo de efectivo."
        : "El saldo proyectado es negativo; conviene revisar cobros, pagos y gastos para evitar problemas de liquidez.";

    return (
        <div className="max-w-6xl mx-auto p-6 space-y-6">
            <div>
                <h2 className="text-2xl font-bold mb-2">Flujo de Efectivo</h2>
                <p className="text-gray-500">Resumen de liquidez basado en el efectivo disponible y la operación del período.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white border rounded-xl p-5 shadow-sm">
                    <p className="text-sm text-gray-500">Efectivo disponible</p>
                    <p className="text-2xl font-bold">${efectivoDisponible.toLocaleString("en-US", { minimumFractionDigits: 2 })}</p>
                </div>
                <div className="bg-white border rounded-xl p-5 shadow-sm">
                    <p className="text-sm text-gray-500">Flujo operativo</p>
                    <p className="text-2xl font-bold">${flujoOperativo.toLocaleString("en-US", { minimumFractionDigits: 2 })}</p>
                </div>
                <div className="bg-white border rounded-xl p-5 shadow-sm">
                    <p className="text-sm text-gray-500">Flujo inversión</p>
                    <p className="text-2xl font-bold">${flujoInversion.toLocaleString("en-US", { minimumFractionDigits: 2 })}</p>
                </div>
                <div className="bg-white border rounded-xl p-5 shadow-sm">
                    <p className="text-sm text-gray-500">Saldo proyectado</p>
                    <p className="text-2xl font-bold">${saldoProyectado.toLocaleString("en-US", { minimumFractionDigits: 2 })}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white border rounded-xl p-5 shadow-sm">
                    <h3 className="font-semibold mb-3">Detalle operativo</h3>
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span>Ingresos</span>
                            <span>${ingresos.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
                        </div>
                        <div className="flex justify-between text-red-600">
                            <span>(-) Costos</span>
                            <span>${costos.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
                        </div>
                        <div className="flex justify-between text-red-600">
                            <span>(-) Gastos</span>
                            <span>${gastos.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
                        </div>
                        <div className="flex justify-between font-semibold border-t pt-2">
                            <span>Utilidad neta</span>
                            <span>${utilidadNeta.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
                        </div>
                    </div>
                </div>

                <div className="bg-white border rounded-xl p-5 shadow-sm">
                    <h3 className="font-semibold mb-3">Indicadores de liquidez</h3>
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span>Financiamiento estimado</span>
                            <span>${flujoFinanciamiento.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Cobertura de efectivo</span>
                            <span>{efectivoDisponible > 0 ? "Adecuada" : "Baja"}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Estado proyectado</span>
                            <span className={saldoProyectado >= 0 ? "text-green-600" : "text-red-600"}>
                                {saldoProyectado >= 0 ? "Positivo" : "Negativo"}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white border rounded-xl p-5 shadow-sm">
                <h3 className="font-semibold mb-2">Observación</h3>
                <p className="text-gray-600">{observacion}</p>
            </div>
        </div>
    );
}