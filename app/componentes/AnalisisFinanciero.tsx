"use client";

import { calcularSaldos, obtenerCuentaInfo, obtenerNaturaleza } from "@/utils/contabilidad";
import { CuentaContable, Partida } from "@/data/catalogo";

interface AnalisisFinancieroProps {
    partidas: Partida[];
    catalogo: CuentaContable[];
}

export default function AnalisisFinanciero({ partidas, catalogo }: AnalisisFinancieroProps) {
    const saldos = calcularSaldos(partidas, catalogo);

    const totalActivo = Object.values(saldos)
        .filter(s => {
            const info = obtenerCuentaInfo(s.codigo, catalogo);
            return info?.tipo === "Activo";
        })
        .reduce((sum, s) => {
            const nat = obtenerNaturaleza(s.codigo, catalogo);
            return sum + (nat === "Deudora" ? s.saldo : -s.saldo);
        }, 0);

    const totalPasivo = Object.values(saldos)
        .filter(s => {
            const info = obtenerCuentaInfo(s.codigo, catalogo);
            return info?.tipo === "Pasivo";
        })
        .reduce((sum, s) => {
            const nat = obtenerNaturaleza(s.codigo, catalogo);
            return sum + (nat === "Acreedora" ? s.saldo : -s.saldo);
        }, 0);

    const totalCapital = Object.values(saldos)
        .filter(s => {
            const info = obtenerCuentaInfo(s.codigo, catalogo);
            return info?.tipo === "Patrimonio";
        })
        .reduce((sum, s) => {
            const nat = obtenerNaturaleza(s.codigo, catalogo);
            return sum + (nat === "Acreedora" ? s.saldo : -s.saldo);
        }, 0);

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
    const diferenciaCuadre = Math.abs(totalActivo - (totalPasivo + totalCapital));

    return (
        <div className="max-w-6xl mx-auto p-6">
            <h2 className="text-2xl font-bold mb-2">Análisis Financiero</h2>
            <p className="text-gray-500 mb-6">Resumen interpretativo basado en el estado financiero actual.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="bg-white border rounded-xl p-5 shadow-sm">
                    <p className="text-sm text-gray-500">Total activo</p>
                    <p className="text-2xl font-bold">${totalActivo.toLocaleString("en-US", { minimumFractionDigits: 2 })}</p>
                </div>
                <div className="bg-white border rounded-xl p-5 shadow-sm">
                    <p className="text-sm text-gray-500">Pasivo + Capital</p>
                    <p className="text-2xl font-bold">${(totalPasivo + totalCapital).toLocaleString("en-US", { minimumFractionDigits: 2 })}</p>
                </div>
                <div className="bg-white border rounded-xl p-5 shadow-sm">
                    <p className="text-sm text-gray-500">Utilidad neta</p>
                    <p className="text-2xl font-bold">${utilidadNeta.toLocaleString("en-US", { minimumFractionDigits: 2 })}</p>
                </div>
                <div className={`border rounded-xl p-5 shadow-sm ${diferenciaCuadre < 0.01 ? "bg-green-50" : "bg-red-50"}`}>
                    <p className="text-sm text-gray-500">Cuadre del balance</p>
                    <p className="text-2xl font-bold">{diferenciaCuadre < 0.01 ? "Correcto" : "Requiere revisión"}</p>
                </div>
            </div>

            <div className="bg-white border rounded-xl p-5 shadow-sm">
                <h3 className="font-semibold mb-2">Interpretación</h3>
                <p className="text-gray-600">
                    {utilidadNeta >= 0
                        ? "La empresa muestra un resultado positivo, lo que sugiere que las operaciones están generando rentabilidad."
                        : "El resultado del período es negativo, por lo que conviene revisar costos y gastos operativos."}
                </p>
                <p className="text-gray-600 mt-2">
                    {diferenciaCuadre < 0.01
                        ? "El balance se encuentra cuadrado, por lo que la estructura contable está coherente."
                        : "Existe un desajuste entre activo y pasivo + capital; se recomienda revisar las partidas registradas."}
                </p>
            </div>
        </div>
    );
}