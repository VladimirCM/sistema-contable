"use client";

import { CuentaContable, Partida, DetallePartida } from "@/data/catalogo";
import { calcularSaldos, obtenerCuentaInfo, obtenerNaturaleza } from "@/utils/contabilidad";

interface PartidasCierreProps {
    partidasGuardadas: Partida[];
    setPartidasGuardadas: React.Dispatch<React.SetStateAction<Partida[]>>;
    catalogo: CuentaContable[];
}

export default function PartidasCierre({ partidasGuardadas, setPartidasGuardadas, catalogo }: PartidasCierreProps) {
    const saldos = calcularSaldos(partidasGuardadas, catalogo);

    // Calcular ingresos, costos y gastos usando tipos reales del catálogo
    const ingresos = Object.values(saldos)
        .filter(saldo => {
            const info = obtenerCuentaInfo(saldo.codigo, catalogo);
            return info?.tipo === "Ingreso";
        })
        .reduce((sum, saldo) => sum + (saldo.haber - saldo.debe), 0);

    const costos = Object.values(saldos)
        .filter(saldo => {
            const info = obtenerCuentaInfo(saldo.codigo, catalogo);
            return info?.tipo === "Costo";
        })
        .reduce((sum, saldo) => sum + (saldo.debe - saldo.haber), 0);

    const gastos = Object.values(saldos)
        .filter(saldo => {
            const info = obtenerCuentaInfo(saldo.codigo, catalogo);
            return info?.tipo === "Gasto";
        })
        .reduce((sum, saldo) => sum + (saldo.debe - saldo.haber), 0);

    const utilidad = ingresos - costos - gastos;

    const cerrarEjercicio = () => {
        if (Math.abs(ingresos - costos - gastos) < 0.01 && partidasGuardadas.length === 0) {
            alert("No hay movimientos o resultados para cerrar en este período.");
            return;
        }

        const fecha = new Date().toISOString().slice(0, 10);
        const numeroBase = Math.max(0, ...partidasGuardadas.map(p => p.numero));

        // --- 1. ASINTO DE CIERRE DE INGRESOS ---
        const detallesIngresos: DetallePartida[] = [];
        let totalIngresosCierre = 0;

        Object.values(saldos).forEach(s => {
            const info = obtenerCuentaInfo(s.codigo, catalogo);
            if (info?.tipo === "Ingreso") {
                const balance = s.haber - s.debe;
                if (Math.abs(balance) > 0.01) {
                    if (balance > 0) {
                        detallesIngresos.push({
                            id: `cierre-ing-det-${s.codigo}`,
                            codigoCuenta: s.codigo,
                            debe: balance,
                            haber: 0
                        });
                        totalIngresosCierre += balance;
                    } else {
                        detallesIngresos.push({
                            id: `cierre-ing-det-${s.codigo}`,
                            codigoCuenta: s.codigo,
                            debe: 0,
                            haber: Math.abs(balance)
                        });
                        totalIngresosCierre -= Math.abs(balance);
                    }
                }
            }
        });

        if (totalIngresosCierre !== 0) {
            detallesIngresos.push({
                id: "cierre-ing-puente",
                codigoCuenta: "3303", // Pérdidas y Ganancias
                debe: totalIngresosCierre < 0 ? Math.abs(totalIngresosCierre) : 0,
                haber: totalIngresosCierre > 0 ? totalIngresosCierre : 0
            });
        }

        const cierreIngresos: Partida = {
            numero: numeroBase + 1,
            fecha,
            concepto: "Cierre de cuentas de resultado - Ingresos",
            detalles: detallesIngresos
        };

        // --- 2. ASIENTO DE CIERRE DE COSTOS Y GASTOS ---
        const detallesCostosGastos: DetallePartida[] = [];
        let totalCostosGastosCierre = 0;

        Object.values(saldos).forEach(s => {
            const info = obtenerCuentaInfo(s.codigo, catalogo);
            if (info?.tipo === "Costo" || info?.tipo === "Gasto") {
                const balance = s.debe - s.haber;
                if (Math.abs(balance) > 0.01) {
                    if (balance > 0) {
                        detallesCostosGastos.push({
                            id: `cierre-cg-det-${s.codigo}`,
                            codigoCuenta: s.codigo,
                            debe: 0,
                            haber: balance
                        });
                        totalCostosGastosCierre += balance;
                    } else {
                        detallesCostosGastos.push({
                            id: `cierre-cg-det-${s.codigo}`,
                            codigoCuenta: s.codigo,
                            debe: Math.abs(balance),
                            haber: 0
                        });
                        totalCostosGastosCierre -= Math.abs(balance);
                    }
                }
            }
        });

        if (totalCostosGastosCierre !== 0) {
            detallesCostosGastos.push({
                id: "cierre-cg-puente",
                codigoCuenta: "3303", // Pérdidas y Ganancias
                debe: totalCostosGastosCierre > 0 ? totalCostosGastosCierre : 0,
                haber: totalCostosGastosCierre < 0 ? Math.abs(totalCostosGastosCierre) : 0
            });
        }

        const cierreCostosGastos: Partida = {
            numero: numeroBase + 2,
            fecha,
            concepto: "Cierre de cuentas de resultado - Costos y Gastos",
            detalles: detallesCostosGastos
        };

        // --- 3. TRASPASO DE PÉRDIDAS Y GANANCIAS A UTILIDAD O PÉRDIDA ---
        const detallesPuente: DetallePartida[] = [];
        const utilidadNeta = totalIngresosCierre - totalCostosGastosCierre;

        if (Math.abs(utilidadNeta) > 0.01) {
            if (utilidadNeta > 0) {
                // Hay utilidad: Debitar Pérdidas y Ganancias, acreditar Utilidad del Ejercicio
                detallesPuente.push({
                    id: "cierre-puente-3303",
                    codigoCuenta: "3303",
                    debe: utilidadNeta,
                    haber: 0
                });
                detallesPuente.push({
                    id: "cierre-puente-3301",
                    codigoCuenta: "3301", // Utilidad del Ejercicio
                    debe: 0,
                    haber: utilidadNeta
                });
            } else {
                // Hay pérdida: Acreditar Pérdidas y Ganancias, debitar Pérdida del Ejercicio
                detallesPuente.push({
                    id: "cierre-puente-3303",
                    codigoCuenta: "3303",
                    debe: 0,
                    haber: Math.abs(utilidadNeta)
                });
                detallesPuente.push({
                    id: "cierre-puente-3302",
                    codigoCuenta: "3302", // Pérdida del Ejercicio
                    debe: Math.abs(utilidadNeta),
                    haber: 0
                });
            }
        }

        const cierrePuente: Partida = {
            numero: numeroBase + 3,
            fecha,
            concepto: utilidadNeta >= 0 
                ? "Determinación de la Utilidad del Ejercicio" 
                : "Determinación de la Pérdida del Ejercicio",
            detalles: detallesPuente
        };

        // --- 4. ASIENTO DE CIERRE DE CUENTAS DE BALANCE (Dejar todo a cero) ---
        // Simulamos saldos incluyendo las 3 partidas de resultados anteriores
        const partidasConResultadosCerrados = [
            ...partidasGuardadas, 
            cierreIngresos, 
            cierreCostosGastos, 
            cierrePuente
        ];
        const saldosSimulados = calcularSaldos(partidasConResultadosCerrados, catalogo);

        const detallesCierreBalance: DetallePartida[] = [];
        Object.values(saldosSimulados).forEach(s => {
            const balance = s.debe - s.haber;
            if (Math.abs(balance) > 0.01) {
                if (balance > 0) {
                    // Saldo deudor: acreditar para saldar
                    detallesCierreBalance.push({
                        id: `cierre-bal-det-${s.codigo}`,
                        codigoCuenta: s.codigo,
                        debe: 0,
                        haber: balance
                    });
                } else {
                    // Saldo acreedor: debitar para saldar
                    detallesCierreBalance.push({
                        id: `cierre-bal-det-${s.codigo}`,
                        codigoCuenta: s.codigo,
                        debe: Math.abs(balance),
                        haber: 0
                    });
                }
            }
        });

        const cierreBalance: Partida = {
            numero: numeroBase + 4,
            fecha,
            concepto: "Asiento de cierre anual de cuentas de Balance",
            detalles: detallesCierreBalance
        };

        // --- 5. ASIENTO DE REAPERTURA (El día siguiente) ---
        const parts = fecha.split("-");
        const dt = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
        dt.setDate(dt.getDate() + 1);
        const fechaReapertura = dt.toISOString().slice(0, 10);

        const detallesReapertura = detallesCierreBalance.map(d => ({
            id: `reap-${d.id}`,
            codigoCuenta: d.codigoCuenta,
            debe: d.haber, // Intercambiamos Debe y Haber
            haber: d.debe
        }));

        const cierreApertura: Partida = {
            numero: numeroBase + 5,
            fecha: fechaReapertura,
            concepto: "Asiento de reapertura de saldos iniciales del ciclo siguiente",
            detalles: detallesReapertura
        };

        // Guardar todas las partidas de cierre generadas en el historial
        const nuevasPartidas = [cierreIngresos, cierreCostosGastos, cierrePuente, cierreBalance, cierreApertura]
            .filter(p => p.detalles.length > 0);

        setPartidasGuardadas(prev => [...prev, ...nuevasPartidas]);
        alert("Cierre de ejercicio generado exitosamente. Se han creado las partidas de cierre de resultados, determinación de utilidad, cierre de balance y reapertura.");
    };

    return (
        <div className="max-w-5xl mx-auto p-6">
            <h2 className="text-2xl font-bold mb-2">Partidas de Cierre</h2>
            <p className="text-gray-500 mb-6">Genera de forma automática la secuencia de cierre contable: saldar cuentas de resultados, determinar la utilidad o pérdida, cerrar el balance y reaperturar el ejercicio siguiente.</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-blue-50 p-4 rounded-xl">
                    <p className="text-sm text-gray-500">Ingresos</p>
                    <p className="text-xl font-bold">${ingresos.toLocaleString("en-US", { minimumFractionDigits: 2 })}</p>
                </div>
                <div className="bg-red-50 p-4 rounded-xl">
                    <p className="text-sm text-gray-500">Costos + Gastos</p>
                    <p className="text-xl font-bold">${(costos + gastos).toLocaleString("en-US", { minimumFractionDigits: 2 })}</p>
                </div>
                <div className={`p-4 rounded-xl ${utilidad >= 0 ? "bg-green-50" : "bg-orange-50"}`}>
                    <p className="text-sm text-gray-500">{utilidad >= 0 ? "Utilidad del ejercicio" : "Pérdida del ejercicio"}</p>
                    <p className="text-xl font-bold">${Math.abs(utilidad).toLocaleString("en-US", { minimumFractionDigits: 2 })}</p>
                </div>
            </div>

            <div className="bg-white rounded-xl border p-6 shadow-sm">
                <h3 className="font-semibold mb-3">Secuencia de Asientos de Cierre</h3>
                <ul className="text-sm text-gray-600 space-y-2 list-disc pl-5 mb-4">
                    <li><strong>Asiento 1:</strong> Traspaso de cuentas de ingresos con saldo acreedor a la cuenta puente "Pérdidas y Ganancias".</li>
                    <li><strong>Asiento 2:</strong> Traspaso de cuentas de costos y gastos con saldo deudor a la cuenta puente "Pérdidas y Ganancias".</li>
                    <li><strong>Asiento 3:</strong> Traspaso del saldo de "Pérdidas y Ganancias" a la cuenta patrimonial "Utilidad del Ejercicio" o "Pérdida del Ejercicio".</li>
                    <li><strong>Asiento 4:</strong> Cierre general de cuentas de Balance, saldando a cero todos los Activos, Pasivos y Patrimonio.</li>
                    <li><strong>Asiento 5:</strong> Reapertura de las cuentas de Balance para el siguiente ejercicio fiscal.</li>
                </ul>
                <button onClick={cerrarEjercicio} className="mt-2 px-5 py-2.5 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors shadow-sm">
                    Aplicar cierre de ciclo contable
                </button>
            </div>
        </div>
    );
}