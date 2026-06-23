"use client";

import { useState } from "react";
import { CuentaContable, Partida, DetallePartida } from "@/data/catalogo";
import { AddRegular, SaveRegular, DeleteRegular, ArrowResetRegular } from "@fluentui/react-icons";

interface TransaccionesProps {
    partidasGuardadas: Partida[];
    setPartidasGuardadas: React.Dispatch<React.SetStateAction<Partida[]>>;
    catalogo: CuentaContable[];
}

export default function Transacciones({ partidasGuardadas, setPartidasGuardadas, catalogo }: TransaccionesProps) {
    const crearFila = () => ({
        id: Date.now().toString() + Math.random().toString(36).slice(2),
        codigoCuenta: "",
        debe: 0,
        haber: 0,
    });

    // Estado para la partida que estamos creando en este momento
    const [fecha, setFecha] = useState("");
    const [concepto, setConcepto] = useState("");
    const [detalles, setDetalles] = useState<DetallePartida[]>([crearFila(), crearFila()]);

    // Filtrar solo las cuentas de detalle (Nivel 3 o 4)
    const cuentasSeleccionables = catalogo.filter(c => c.nivel >= 3);

    // --- LÓGICA DE PARTIDA DOBLE ---
    const totalDebe = detalles.reduce((sum, det) => sum + det.debe, 0);
    const totalHaber = detalles.reduce((sum, det) => sum + det.haber, 0);
    const estaCuadrada = Math.abs(totalDebe - totalHaber) < 0.01 && totalDebe > 0;

    const agregarFila = () => {
        setDetalles(prev => [...prev, crearFila()]);
    };

    const actualizarDetalle = (id: string, campo: keyof DetallePartida, valor: any) => {
        setDetalles(prev => prev.map(det => {
            if (det.id !== id) return det;
            if (campo === "debe") {
                return { ...det, codigoCuenta: det.codigoCuenta, debe: Number(valor) || 0, haber: 0 };
            }
            if (campo === "haber") {
                return { ...det, codigoCuenta: det.codigoCuenta, debe: 0, haber: Number(valor) || 0 };
            }
            return { ...det, [campo]: valor };
        }));
    };

    const eliminarFila = (id: string) => {
        if (detalles.length > 2) {
            setDetalles(prev => prev.filter(det => det.id !== id));
        } else {
            alert("Una partida debe tener al menos dos movimientos.");
        }
    };

    const limpiarFormulario = () => {
        setFecha("");
        setConcepto("");
        setDetalles([crearFila(), crearFila()]);
    };

    const guardarPartida = () => {
        if (!fecha || !concepto.trim()) {
            alert("Falta la fecha o el concepto de la partida.");
            return;
        }
        if (!estaCuadrada) {
            alert("La partida no está cuadrada. Revisa el Debe y el Haber.");
            return;
        }
        if (detalles.some(d => d.codigoCuenta === "" || (d.debe === 0 && d.haber === 0))) {
            alert("Todas las filas deben tener una cuenta seleccionada y un importe.");
            return;
        }

        const nuevaPartida: Partida = {
            numero: partidasGuardadas.length + 1,
            fecha,
            concepto: concepto.trim(),
            detalles,
        };

        setPartidasGuardadas(prev => [...prev, nuevaPartida]);
        limpiarFormulario();
    };

    return (
        <div className="flex flex-col items-center justify-start p-6 w-full max-w-6xl mx-auto h-full overflow-y-auto">
            <div className="w-full mb-6">
                <h1 className="text-3xl font-bold text-gray-900">Libro Diario (Transacciones)</h1>
                <p className="text-gray-500 mt-1">Registro de operaciones diarias aplicando Partida Doble</p>
            </div>

            {/* FORMULARIO DE NUEVA PARTIDA */}
            <div className="w-full bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
                <h2 className="text-xl font-bold text-blue-900 mb-4 border-b pb-2">Nueva Partida</h2>
                
                <div className="flex gap-4 mb-6">
                    <div className="w-1/4">
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Fecha</label>
                        <input 
                            type="date" 
                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                            value={fecha}
                            onChange={(e) => setFecha(e.target.value)}
                        />
                    </div>
                    <div className="w-3/4">
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Concepto / Explicación</label>
                        <input 
                            type="text" 
                            placeholder="Ej: Venta de mercadería al contado..."
                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                            value={concepto}
                            onChange={(e) => setConcepto(e.target.value)}
                        />
                    </div>
                </div>

                {/* TABLA DE DETALLES */}
                <table className="w-full text-left border-collapse mb-4">
                    <thead className="bg-gray-100 text-gray-700">
                        <tr>
                            <th className="py-2 px-4 font-semibold text-sm rounded-tl-lg">Cuenta Contable</th>
                            <th className="py-2 px-4 font-semibold text-sm w-40 text-right">Debe ($)</th>
                            <th className="py-2 px-4 font-semibold text-sm w-40 text-right">Haber ($)</th>
                            <th className="py-2 px-4 font-semibold text-sm w-16 text-center rounded-tr-lg"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {detalles.map((det) => (
                            <tr key={det.id} className="border-b border-gray-100">
                                <td className="py-2 px-2">
                                    <select 
                                        className="w-full px-2 py-1 border rounded focus:ring-2 focus:ring-blue-500"
                                        value={det.codigoCuenta}
                                        onChange={(e) => actualizarDetalle(det.id, "codigoCuenta", e.target.value)}
                                    >
                                        <option value="">-- Selecciona una cuenta --</option>
                                        {cuentasSeleccionables.map(c => (
                                            <option key={c.codigo} value={c.codigo}>
                                                {c.codigo} - {c.nombre}
                                            </option>
                                        ))}
                                    </select>
                                </td>
                                <td className="py-2 px-2">
                                    <input 
                                        type="number" 
                                        min="0"
                                        className="w-full px-2 py-1 border rounded text-right focus:ring-2 focus:ring-blue-500"
                                        value={det.debe || ""}
                                        onChange={(e) => actualizarDetalle(det.id, "debe", Number(e.target.value))}
                                        disabled={det.haber > 0} // Si hay Haber, no puede haber Debe en la misma línea
                                    />
                                </td>
                                <td className="py-2 px-2">
                                    <input 
                                        type="number" 
                                        min="0"
                                        className="w-full px-2 py-1 border rounded text-right focus:ring-2 focus:ring-blue-500"
                                        value={det.haber || ""}
                                        onChange={(e) => actualizarDetalle(det.id, "haber", Number(e.target.value))}
                                        disabled={det.debe > 0} // Si hay Debe, no puede haber Haber en la misma línea
                                    />
                                </td>
                                <td className="py-2 px-2 text-center">
                                    <button onClick={() => eliminarFila(det.id)} className="text-red-400 hover:text-red-600">
                                        <DeleteRegular fontSize={20} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* TOTALES Y BOTONES */}
                <div className="flex justify-between items-center mt-4">
                    <div className="flex items-center gap-3">
                        <button onClick={agregarFila} className="flex items-center gap-1 text-blue-600 hover:text-blue-800 font-medium text-sm">
                            <AddRegular fontSize={18} /> Agregar fila
                        </button>
                        <button onClick={limpiarFormulario} className="flex items-center gap-1 text-gray-600 hover:text-gray-800 font-medium text-sm">
                            <ArrowResetRegular fontSize={18} /> Limpiar
                        </button>
                    </div>
                    
                    <div className="flex items-center gap-6">
                        <div className={`text-right font-bold flex gap-8 p-3 rounded-lg ${estaCuadrada ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                            <span>Total Debe: ${totalDebe.toFixed(2)}</span>
                            <span>Total Haber: ${totalHaber.toFixed(2)}</span>
                        </div>
                        <button 
                            onClick={guardarPartida}
                            disabled={!estaCuadrada}
                            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-bold text-white transition-colors
                                ${estaCuadrada ? 'bg-blue-600 hover:bg-blue-700 shadow-md' : 'bg-gray-400 cursor-not-allowed'}`}
                        >
                            <SaveRegular fontSize={20} /> Registrar Partida
                        </button>
                    </div>
                </div>
            </div>

            {/* HISTORIAL DE PARTIDAS GUARDADAS */}
            <div className="w-full">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Historial del Libro Diario</h3>
                {partidasGuardadas.length === 0 ? (
                    <div className="text-center p-8 bg-gray-50 rounded-lg border border-dashed border-gray-300 text-gray-500">
                        No hay partidas registradas aún.
                    </div>
                ) : (
                    <div className="space-y-4">
                        {partidasGuardadas.map((partida) => (
                            <div key={partida.numero} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                                <div className="flex justify-between items-center border-b pb-2 mb-2">
                                    <span className="font-bold text-blue-900">Partida #{partida.numero}</span>
                                    <span className="text-sm text-gray-600">Fecha: {partida.fecha}</span>
                                </div>
                                <p className="text-sm text-gray-700 mb-3 italic">"{partida.concepto}"</p>
                                <table className="w-full text-sm">
                                    <tbody>
                                        {partida.detalles.map((det, index) => {
                                            const cuenta = catalogo.find(c => c.codigo === det.codigoCuenta);
                                            return (
                                                <tr key={index}>
                                                    <td className={`py-1 ${det.haber > 0 ? 'pl-8' : ''}`}>
                                                        {cuenta?.codigo} - {cuenta?.nombre}
                                                    </td>
                                                    <td className="text-right w-24 py-1">{det.debe > 0 ? `$${det.debe.toFixed(2)}` : ''}</td>
                                                    <td className="text-right w-24 py-1">{det.haber > 0 ? `$${det.haber.toFixed(2)}` : ''}</td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}