"use client";

import { useState } from "react";
import { AddRegular, DeleteRegular, SaveRegular, ArrowResetRegular } from "@fluentui/react-icons";
import { CuentaContable, DetallePartida, Partida } from "@/data/catalogo";

interface PartidasAjusteProps {
    partidasGuardadas: Partida[];
    setPartidasGuardadas: React.Dispatch<React.SetStateAction<Partida[]>>;
    catalogo: CuentaContable[];
}

const crearFila = () => ({
    id: Date.now().toString() + Math.random().toString(36).slice(2),
    codigoCuenta: "",
    debe: 0,
    haber: 0,
});

export default function PartidasAjuste({ partidasGuardadas, setPartidasGuardadas, catalogo }: PartidasAjusteProps) {
    const [fecha, setFecha] = useState(new Date().toISOString().slice(0, 10));
    const [concepto, setConcepto] = useState("Ajuste por periodificación");
    const [detalles, setDetalles] = useState<DetallePartida[]>([crearFila(), crearFila()]);

    const cuentasSeleccionables = catalogo.filter(cuenta => cuenta.nivel >= 3);
    const totalDebe = detalles.reduce((sum, detalle) => sum + detalle.debe, 0);
    const totalHaber = detalles.reduce((sum, detalle) => sum + detalle.haber, 0);
    const estaCuadrada = Math.abs(totalDebe - totalHaber) < 0.01 && totalDebe > 0;

    const actualizarDetalle = (id: string, campo: keyof DetallePartida, valor: number | string) => {
        setDetalles(prev => prev.map(detalle => {
            if (detalle.id !== id) return detalle;
            if (campo === "debe") {
                return { ...detalle, codigoCuenta: detalle.codigoCuenta, debe: Number(valor) || 0, haber: 0 };
            }
            if (campo === "haber") {
                return { ...detalle, codigoCuenta: detalle.codigoCuenta, debe: 0, haber: Number(valor) || 0 };
            }
            return { ...detalle, [campo]: valor };
        }));
    };

    const agregarFila = () => setDetalles(prev => [...prev, crearFila()]);

    const eliminarFila = (id: string) => {
        if (detalles.length > 2) {
            setDetalles(prev => prev.filter(detalle => detalle.id !== id));
        } else {
            alert("Una partida de ajuste debe tener al menos dos movimientos.");
        }
    };

    const limpiarFormulario = () => {
        setFecha(new Date().toISOString().slice(0, 10));
        setConcepto("Ajuste por periodificación");
        setDetalles([crearFila(), crearFila()]);
    };

    const guardarPartida = () => {
        if (!fecha || !concepto.trim()) {
            alert("Completa la fecha y el concepto.");
            return;
        }
        if (!estaCuadrada) {
            alert("La partida de ajuste no está cuadrada.");
            return;
        }
        if (detalles.some(detalle => !detalle.codigoCuenta || (detalle.debe === 0 && detalle.haber === 0))) {
            alert("Selecciona una cuenta y un importe para cada movimiento.");
            return;
        }

        const nuevaPartida: Partida = {
            numero: partidasGuardadas.length + 1,
            fecha,
            concepto: `Ajuste - ${concepto.trim()}`,
            detalles,
        };

        setPartidasGuardadas(prev => [...prev, nuevaPartida]);
        limpiarFormulario();
    };

    return (
        <div className="max-w-6xl mx-auto p-6">
            <h2 className="text-2xl font-bold mb-2">Partidas de Ajuste</h2>
            <p className="text-gray-500 mb-6">Registra los asientos necesarios para reflejar gastos, ingresos o depreciaciones del período.</p>

            <div className="bg-white rounded-xl border p-6 shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Fecha</label>
                        <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} className="w-full border rounded-lg px-3 py-2" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Concepto</label>
                        <input type="text" value={concepto} onChange={(e) => setConcepto(e.target.value)} className="w-full border rounded-lg px-3 py-2" />
                    </div>
                </div>

                <table className="w-full text-sm mb-4">
                    <thead>
                        <tr className="bg-gray-100">
                            <th className="px-2 py-2 text-left">Cuenta</th>
                            <th className="px-2 py-2 text-right">Debe</th>
                            <th className="px-2 py-2 text-right">Haber</th>
                            <th className="px-2 py-2"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {detalles.map(detalle => (
                            <tr key={detalle.id}>
                                <td className="px-2 py-2">
                                    <select value={detalle.codigoCuenta} onChange={(e) => actualizarDetalle(detalle.id, "codigoCuenta", e.target.value)} className="w-full border rounded px-2 py-1">
                                        <option value="">-- Selecciona --</option>
                                        {cuentasSeleccionables.map(cuenta => (
                                            <option key={cuenta.codigo} value={cuenta.codigo}>{cuenta.codigo} - {cuenta.nombre}</option>
                                        ))}
                                    </select>
                                </td>
                                <td className="px-2 py-2">
                                    <input type="number" min="0" value={detalle.debe || ""} onChange={(e) => actualizarDetalle(detalle.id, "debe", Number(e.target.value))} className="w-full border rounded px-2 py-1 text-right" />
                                </td>
                                <td className="px-2 py-2">
                                    <input type="number" min="0" value={detalle.haber || ""} onChange={(e) => actualizarDetalle(detalle.id, "haber", Number(e.target.value))} className="w-full border rounded px-2 py-1 text-right" />
                                </td>
                                <td className="px-2 py-2 text-center">
                                    <button onClick={() => eliminarFila(detalle.id)}><DeleteRegular className="text-red-500" /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <button onClick={agregarFila} className="flex items-center gap-1 text-blue-600 font-medium">
                            <AddRegular /> Agregar fila
                        </button>
                        <button onClick={limpiarFormulario} className="flex items-center gap-1 text-gray-600 font-medium">
                            <ArrowResetRegular /> Limpiar
                        </button>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className={`px-3 py-2 rounded font-semibold ${estaCuadrada ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
                            Debe: ${totalDebe.toFixed(2)} | Haber: ${totalHaber.toFixed(2)}
                        </span>
                        <button onClick={guardarPartida} disabled={!estaCuadrada} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-white font-semibold ${estaCuadrada ? "bg-blue-600 hover:bg-blue-700" : "bg-gray-400 cursor-not-allowed"}`}>
                            <SaveRegular /> Guardar ajuste
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}