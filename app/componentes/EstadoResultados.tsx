"use client";

import { CuentaContable, Partida } from "@/data/catalogo";
import { calcularSaldos, obtenerCuentaInfo } from "@/utils/contabilidad";

export default function EstadoResultados({ partidas, catalogo }: { partidas: Partida[]; catalogo: CuentaContable[] }) {
    const saldos = calcularSaldos(partidas, catalogo);

    const ingresos = Object.values(saldos)
        .filter(saldo => {
            const info = obtenerCuentaInfo(saldo.codigo, catalogo);
            return info?.tipo === "Ingreso" && info?.nivel >= 3;
        })
        .reduce((sum, saldo) => sum + saldo.saldo, 0);

    const costos = Object.values(saldos)
        .filter(saldo => {
            const info = obtenerCuentaInfo(saldo.codigo, catalogo);
            return info?.tipo === "Costo" && info?.nivel >= 3;
        })
        .reduce((sum, saldo) => sum + saldo.saldo, 0);

    const gastos = Object.values(saldos)
        .filter(saldo => {
            const info = obtenerCuentaInfo(saldo.codigo, catalogo);
            return info?.tipo === "Gasto" && info?.nivel >= 3;
        })
        .reduce((sum, saldo) => sum + saldo.saldo, 0);

    const utilidadBruta = ingresos - costos;
    const utilidadNeta = utilidadBruta - gastos;

    const cuentasIngresos = catalogo.filter(cuenta => cuenta.tipo === "Ingreso" && cuenta.nivel >= 3);
    const cuentasCostos = catalogo.filter(cuenta => cuenta.tipo === "Costo" && cuenta.nivel >= 3);
    const cuentasGastos = catalogo.filter(cuenta => cuenta.tipo === "Gasto" && cuenta.nivel >= 3);

    const ultimaPartida = partidas[partidas.length - 1];
    const fechaReporte = ultimaPartida?.fecha || new Date().toISOString().slice(0, 10);

    return (
        <div className="p-6 bg-white shadow-lg rounded-lg max-w-4xl mx-auto border">
            <div className="flex justify-end print:hidden mb-3">
                <button
                    type="button"
                    onClick={() => window.print()}
                    className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700"
                >
                    Guardar / Imprimir PDF
                </button>
            </div>
            <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">INDUSTRIAS ILOMODAS, S.A. DE C.V.</h2>
                <p className="text-sm text-gray-500">Estado de Resultados</p>
                <p className="text-sm text-gray-500">Periodo al {fechaReporte}</p>
            </div>
            <div className="space-y-3">
                <div className="flex justify-between font-semibold text-gray-700">
                    <span>Ingresos</span>
                    <span>${ingresos.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="pl-4 text-sm text-gray-500 space-y-1">
                    {cuentasIngresos.map(cuenta => (
                        <div key={cuenta.codigo} className="flex justify-between">
                            <span>{cuenta.codigo} - {cuenta.nombre}</span>
                            <span>${(saldos[cuenta.codigo]?.saldo || 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
                        </div>
                    ))}
                </div>

                <div className="flex justify-between text-red-600 font-semibold">
                    <span>(-) Costos</span>
                    <span>${costos.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="pl-4 text-sm text-gray-500 space-y-1">
                    {cuentasCostos.map(cuenta => (
                        <div key={cuenta.codigo} className="flex justify-between">
                            <span>{cuenta.codigo} - {cuenta.nombre}</span>
                            <span>${(saldos[cuenta.codigo]?.saldo || 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
                        </div>
                    ))}
                </div>

                <div className="border-t pt-3 flex justify-between font-bold">
                    <span>Utilidad Bruta</span>
                    <span>${utilidadBruta.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
                </div>

                <div className="flex justify-between text-red-600 font-semibold">
                    <span>(-) Gastos</span>
                    <span>${gastos.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="pl-4 text-sm text-gray-500 space-y-1">
                    {cuentasGastos.map(cuenta => (
                        <div key={cuenta.codigo} className="flex justify-between">
                            <span>{cuenta.codigo} - {cuenta.nombre}</span>
                            <span>${(saldos[cuenta.codigo]?.saldo || 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
                        </div>
                    ))}
                </div>

                <div className="border-t-4 border-double pt-3 flex justify-between font-bold text-xl">
                    <span>Utilidad Neta</span>
                    <span>${utilidadNeta.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
                </div>
            </div>
        </div>
    );
}