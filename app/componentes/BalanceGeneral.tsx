"use client";

import { CuentaContable, Partida } from "@/data/catalogo";
import { calcularSaldos, obtenerCuentaInfo, obtenerNaturaleza } from "@/utils/contabilidad";

export default function BalanceGeneral({ partidas, catalogo }: { partidas: Partida[]; catalogo: CuentaContable[] }) {
    const saldos = calcularSaldos(partidas, catalogo);

    const activos = Object.values(saldos).filter(s => {
        const info = obtenerCuentaInfo(s.codigo, catalogo);
        return info?.tipo === "Activo" && s.saldo !== 0;
    });
    
    const pasivos = Object.values(saldos).filter(s => {
        const info = obtenerCuentaInfo(s.codigo, catalogo);
        return info?.tipo === "Pasivo" && s.saldo !== 0;
    });

    const capital = Object.values(saldos).filter(s => {
        const info = obtenerCuentaInfo(s.codigo, catalogo);
        return info?.tipo === "Patrimonio" && s.saldo !== 0;
    });

    const totalActivo = activos.reduce((acc, s) => {
        const nat = obtenerNaturaleza(s.codigo, catalogo);
        return acc + (nat === "Deudora" ? s.saldo : -s.saldo);
    }, 0);

    const totalPasivo = pasivos.reduce((acc, s) => {
        const nat = obtenerNaturaleza(s.codigo, catalogo);
        return acc + (nat === "Acreedora" ? s.saldo : -s.saldo);
    }, 0);

    const totalCapital = capital.reduce((acc, s) => {
        const nat = obtenerNaturaleza(s.codigo, catalogo);
        return acc + (nat === "Acreedora" ? s.saldo : -s.saldo);
    }, 0);

    const ultimaPartida = partidas[partidas.length - 1];
    const fechaReporte = ultimaPartida?.fecha || new Date().toISOString().slice(0, 10);

    return (
        <div className="p-8 bg-white shadow-xl rounded-2xl max-w-4xl mx-auto border border-gray-100">
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
                <p className="text-sm text-gray-500">Balance General</p>
                <p className="text-sm text-gray-500">Al {fechaReporte}</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div>
                    <h3 className="font-bold text-blue-900 border-b-2 border-blue-900 pb-2 mb-4">ACTIVO</h3>
                    <div className="space-y-2">
                        {activos.map(a => {
                            const cuenta = catalogo.find(c => c.codigo === a.codigo);
                            const nat = obtenerNaturaleza(a.codigo, catalogo);
                            const valorMostrado = nat === "Deudora" ? a.saldo : -a.saldo;
                            return (
                                <div key={a.codigo} className="flex justify-between text-sm hover:bg-gray-50 p-1 rounded">
                                    <span className="text-gray-600">{a.codigo} - {cuenta?.nombre || "Cuenta"}</span>
                                    <span className="font-medium">${valorMostrado.toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
                                </div>
                            );
                        })}
                    </div>
                    <div className="mt-6 pt-4 border-t-2 border-gray-200 flex justify-between font-bold text-lg">
                        <span>TOTAL ACTIVO</span>
                        <span>${totalActivo.toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
                    </div>
                </div>
                
                <div>
                    <h3 className="font-bold text-blue-900 border-b-2 border-blue-900 pb-2 mb-4">PASIVO Y CAPITAL</h3>
                    <div className="space-y-4">
                        <div>
                            <p className="text-xs font-semibold text-gray-400 uppercase mb-2">Pasivos</p>
                            {pasivos.map(p => {
                                const cuenta = catalogo.find(c => c.codigo === p.codigo);
                                const nat = obtenerNaturaleza(p.codigo, catalogo);
                                const valorMostrado = nat === "Acreedora" ? p.saldo : -p.saldo;
                                return (
                                    <div key={p.codigo} className="flex justify-between text-sm py-1">
                                        <span className="text-gray-600">{p.codigo} - {cuenta?.nombre || "Cuenta"}</span>
                                        <span className="font-medium">${valorMostrado.toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
                                    </div>
                                );
                            })}
                        </div>
                        <div>
                            <p className="text-xs font-semibold text-gray-400 uppercase mb-2">Capital</p>
                            {capital.map(c => {
                                const cuenta = catalogo.find(cu => cu.codigo === c.codigo);
                                const nat = obtenerNaturaleza(c.codigo, catalogo);
                                const valorMostrado = nat === "Acreedora" ? c.saldo : -c.saldo;
                                return (
                                    <div key={c.codigo} className="flex justify-between text-sm py-1">
                                        <span className="text-gray-600">{c.codigo} - {cuenta?.nombre || "Cuenta"}</span>
                                        <span className="font-medium">${valorMostrado.toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                    <div className="mt-6 pt-4 border-t-2 border-gray-200 flex justify-between font-bold text-lg">
                        <span>TOTAL P + C</span>
                        <span>${(totalPasivo + totalCapital).toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
                    </div>
                </div>
            </div>

            <div className={`mt-10 p-4 text-center rounded-lg font-bold ${Math.abs(totalActivo - (totalPasivo + totalCapital)) < 0.01 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {Math.abs(totalActivo - (totalPasivo + totalCapital)) < 0.01 
                    ? "Balance Cuadrado: Activo = Pasivo + Capital" 
                    : "Descuadre detectado en el Balance"}
            </div>
        </div>
    );
}