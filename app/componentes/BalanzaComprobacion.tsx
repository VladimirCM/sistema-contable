"use client";

import { CuentaContable, Partida } from "@/data/catalogo";
import { calcularSaldos, obtenerNaturaleza } from "@/utils/contabilidad";
import { CheckmarkCircleRegular, ErrorCircleRegular } from "@fluentui/react-icons";

interface BalanzaProps {
    partidas: Partida[];
    catalogo: CuentaContable[];
}

export default function BalanzaComprobacion({ partidas, catalogo }: BalanzaProps) {
    const saldos = calcularSaldos(partidas, catalogo);
    
    // Obtenemos cuentas de detalle (nivel >= 3)
    const cuentasParaMostrar = catalogo
        .filter(c => c.nivel >= 3)
        .sort((a, b) => a.codigo.localeCompare(b.codigo));

    const filasBalanza = cuentasParaMostrar.map(cuenta => {
        const s = saldos[cuenta.codigo] || { debe: 0, haber: 0, saldo: 0 };
        const nat = obtenerNaturaleza(cuenta.codigo, catalogo);
        return {
            codigo: cuenta.codigo,
            nombre: cuenta.nombre,
            sumaDebe: s.debe,
            sumaHaber: s.haber,
            deudor: nat === "Deudora" ? s.saldo : 0,
            acreedor: nat === "Acreedora" ? s.saldo : 0,
        };
    });

    const totalMovimientosDebe = filasBalanza.reduce((acc, f) => acc + f.sumaDebe, 0);
    const totalMovimientosHaber = filasBalanza.reduce((acc, f) => acc + f.sumaHaber, 0);
    const totalSaldoDeudor = filasBalanza.reduce((acc, f) => acc + f.deudor, 0);
    const totalSaldoAcreedor = filasBalanza.reduce((acc, f) => acc + f.acreedor, 0);

    const hayDatos = partidas.length > 0;
    const estaCuadradaMov = Math.abs(totalMovimientosDebe - totalMovimientosHaber) < 0.01;
    const estaCuadradaSal = Math.abs(totalSaldoDeudor - totalSaldoAcreedor) < 0.01;

    return (
        <div className="flex flex-col items-center justify-start p-6 w-full max-w-6xl mx-auto h-full overflow-y-auto">
            <div className="w-full mb-6 flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Balanza de Comprobación</h1>
                    <p className="text-gray-500 mt-1">Verificación de la exactitud matemática de los saldos del Mayor</p>
                </div>
                <button
                    type="button"
                    onClick={() => window.print()}
                    className="print:hidden px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700"
                >
                    Guardar / Imprimir PDF
                </button>
            </div>

            {!hayDatos ? (
                <div className="w-full text-center p-10 bg-gray-50 text-gray-500 rounded-lg border border-dashed border-gray-300">
                    Aún no hay transacciones para generar la balanza de comprobación.
                </div>
            ) : (
                <div className="w-full bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <table className="w-full text-sm text-left border-collapse">
                        {/* ENCABEZADO A DOS NIVELES */}
                        <thead className="bg-blue-900 text-white">
                            <tr>
                                <th rowSpan={2} className="py-2 px-4 font-semibold border-r border-blue-800 w-24 text-center">CÓDIGO</th>
                                <th rowSpan={2} className="py-2 px-4 font-semibold border-r border-blue-800">NOMBRE DE LA CUENTA</th>
                                <th colSpan={2} className="py-2 px-4 font-semibold border-r border-blue-800 text-center">MOVIMIENTOS</th>
                                <th colSpan={2} className="py-2 px-4 font-semibold text-center">SALDOS</th>
                            </tr>
                            <tr className="bg-blue-800">
                                <th className="py-2 px-4 font-semibold border-r border-blue-700 text-right w-32">Debe</th>
                                <th className="py-2 px-4 font-semibold border-r border-blue-700 text-right w-32">Haber</th>
                                <th className="py-2 px-4 font-semibold border-r border-blue-700 text-right w-32">Deudor</th>
                                <th className="py-2 px-4 font-semibold text-right w-32">Acreedor</th>
                            </tr>
                        </thead>
                        
                        {/* CUERPO DE LA TABLA */}
                        <tbody className="divide-y divide-gray-100 text-gray-800">
                            {filasBalanza.map((fila, index) => (
                                <tr key={index} className="hover:bg-blue-50 transition-colors">
                                    <td className="py-2 px-4 text-center">{fila.codigo}</td>
                                    <td className="py-2 px-4 font-medium">{fila.nombre}</td>
                                    <td className="py-2 px-4 text-right">${fila.sumaDebe.toLocaleString('en-US', {minimumFractionDigits: 2})}</td>
                                    <td className="py-2 px-4 text-right">${fila.sumaHaber.toLocaleString('en-US', {minimumFractionDigits: 2})}</td>
                                    <td className="py-2 px-4 text-right bg-gray-50">${fila.deudor > 0 ? fila.deudor.toLocaleString('en-US', {minimumFractionDigits: 2}) : '-'}</td>
                                    <td className="py-2 px-4 text-right bg-gray-50">${fila.acreedor > 0 ? fila.acreedor.toLocaleString('en-US', {minimumFractionDigits: 2}) : '-'}</td>
                                </tr>
                            ))}
                        </tbody>

                        {/* TOTALES (SUMAS IGUALES) */}
                        <tfoot className="bg-gray-100 font-bold border-t-2 border-gray-400">
                            <tr>
                                <td colSpan={2} className="py-3 px-4 text-right text-gray-700 uppercase">Sumas Iguales:</td>
                                <td className={`py-3 px-4 text-right border-b-4 border-double ${estaCuadradaMov ? 'text-green-700 border-green-600' : 'text-red-600 border-red-600'}`}>
                                    ${totalMovimientosDebe.toLocaleString('en-US', {minimumFractionDigits: 2})}
                                </td>
                                <td className={`py-3 px-4 text-right border-b-4 border-double ${estaCuadradaMov ? 'text-green-700 border-green-600' : 'text-red-600 border-red-600'}`}>
                                    ${totalMovimientosHaber.toLocaleString('en-US', {minimumFractionDigits: 2})}
                                </td>
                                <td className={`py-3 px-4 text-right border-b-4 border-double ${estaCuadradaSal ? 'text-green-700 border-green-600' : 'text-red-600 border-red-600'}`}>
                                    ${totalSaldoDeudor.toLocaleString('en-US', {minimumFractionDigits: 2})}
                                </td>
                                <td className={`py-3 px-4 text-right border-b-4 border-double ${estaCuadradaSal ? 'text-green-700 border-green-600' : 'text-red-600 border-red-600'}`}>
                                    ${totalSaldoAcreedor.toLocaleString('en-US', {minimumFractionDigits: 2})}
                                </td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            )}

            {/* MENSAJE DE VALIDACIÓN */}
            {hayDatos && estaCuadradaMov && estaCuadradaSal && (
                <div className="mt-6 flex items-center justify-center gap-2 text-green-700 bg-green-50 px-6 py-3 rounded-lg border border-green-200 font-medium">
                    <CheckmarkCircleRegular fontSize={24} />
                    La Balanza de Comprobación cuadra perfectamente. ¡Excelente trabajo contable!
                </div>
            )}
            {hayDatos && (!estaCuadradaMov || !estaCuadradaSal) && (
                <div className="mt-6 flex items-center justify-center gap-2 text-red-700 bg-red-50 px-6 py-3 rounded-lg border border-red-200 font-medium">
                    <ErrorCircleRegular fontSize={24} />
                    Advertencia: Hay un descuadre en los cálculos. Revisa las partidas ingresadas.
                </div>
            )}
        </div>
    );
}