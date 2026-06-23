"use client";

import { CuentaContable, Partida } from "@/data/catalogo";

interface MayorizacionProps {
    partidas: Partida[];
    catalogo: CuentaContable[];
}

export default function Mayorizacion({ partidas, catalogo }: MayorizacionProps) {
    // 1. Obtener todas las cuentas únicas que han sido afectadas en las partidas
    const codigosAfectados = Array.from(
        new Set(partidas.flatMap(p => p.detalles.map(d => d.codigoCuenta)))
    ).filter(codigo => codigo !== "");

    return (
        <div className="flex flex-col items-center justify-start p-6 w-full max-w-6xl mx-auto h-full overflow-y-auto">
            <div className="w-full mb-6">
                <h1 className="text-3xl font-bold text-gray-900">Libro Mayor (Mayorización)</h1>
                <p className="text-gray-500 mt-1">Agrupación de movimientos en Cuentas T para determinar saldos finales</p>
            </div>

            {partidas.length === 0 ? (
                <div className="w-full text-center p-10 bg-blue-50 text-blue-600 rounded-lg border border-dashed border-blue-200">
                    Aún no hay transacciones registradas. Ve al "Libro Diario" y registra algunas partidas para ver las Cuentas T.
                </div>
            ) : (
                <div className="w-full flex flex-wrap gap-8 justify-center">
                    {/* Dibujamos una Cuenta T por cada cuenta afectada */}
                    {codigosAfectados.map(codigo => {
                        const cuenta = catalogo.find(c => c.codigo === codigo);
                        if (!cuenta) return null;

                        // Extraemos todos los movimientos de ESTA cuenta en específico
                        const movimientos = partidas.flatMap(p => 
                            p.detalles.filter(d => d.codigoCuenta === codigo)
                        );

                        const sumaDebe = movimientos.reduce((acc, curr) => acc + curr.debe, 0);
                        const sumaHaber = movimientos.reduce((acc, curr) => acc + curr.haber, 0);
                        
                        // Calculamos el saldo según su naturaleza
                        let saldoDeudor = 0;
                        let saldoAcreedor = 0;
                        if (cuenta.naturaleza === "Deudora") {
                            saldoDeudor = sumaDebe - sumaHaber;
                        } else {
                            saldoAcreedor = sumaHaber - sumaDebe;
                        }

                        return (
                            <div key={codigo} className="w-72 bg-white rounded-lg shadow-md border-2 border-gray-800 flex flex-col overflow-hidden">
                                {/* Encabezado de la Cuenta T */}
                                <div className="bg-gray-100 text-center py-2 px-1 border-b-2 border-gray-800 font-bold text-sm">
                                    {cuenta.codigo} - {cuenta.nombre}
                                </div>
                                <div className="flex font-bold text-xs text-center border-b-2 border-gray-800 bg-gray-50">
                                    <div className="w-1/2 py-1 border-r-2 border-gray-800">DEBE (Cargos)</div>
                                    <div className="w-1/2 py-1">HABER (Abonos)</div>
                                </div>

                                {/* Movimientos */}
                                <div className="flex min-h-[120px] text-sm">
                                    <div className="w-1/2 border-r-2 border-gray-800 p-2 flex flex-col gap-1 items-end">
                                        {movimientos.filter(m => m.debe > 0).map((m, i) => (
                                            <span key={i}>${m.debe.toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
                                        ))}
                                    </div>
                                    <div className="w-1/2 p-2 flex flex-col gap-1 items-end text-gray-700">
                                        {movimientos.filter(m => m.haber > 0).map((m, i) => (
                                            <span key={i}>${m.haber.toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
                                        ))}
                                    </div>
                                </div>

                                {/* Sumas */}
                                <div className="flex font-bold text-sm border-t-2 border-gray-800 bg-gray-50">
                                    <div className="w-1/2 p-2 text-right border-r-2 border-gray-800">
                                        ${sumaDebe.toLocaleString('en-US', {minimumFractionDigits: 2})}
                                    </div>
                                    <div className="w-1/2 p-2 text-right">
                                        ${sumaHaber.toLocaleString('en-US', {minimumFractionDigits: 2})}
                                    </div>
                                </div>

                                {/* Saldo Final */}
                                <div className="flex font-bold text-sm bg-blue-100 text-blue-900 border-t-2 border-gray-800">
                                    {cuenta.naturaleza === "Deudora" ? (
                                        <>
                                            <div className="w-1/2 p-2 text-right border-r-2 border-gray-800 border-b-4 border-b-double border-blue-900">
                                                S/ ${saldoDeudor.toLocaleString('en-US', {minimumFractionDigits: 2})}
                                            </div>
                                            <div className="w-1/2 p-2 bg-gray-100"></div>
                                        </>
                                    ) : (
                                        <>
                                            <div className="w-1/2 p-2 bg-gray-100 border-r-2 border-gray-800"></div>
                                            <div className="w-1/2 p-2 text-right border-b-4 border-b-double border-blue-900">
                                                S/ ${saldoAcreedor.toLocaleString('en-US', {minimumFractionDigits: 2})}
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}