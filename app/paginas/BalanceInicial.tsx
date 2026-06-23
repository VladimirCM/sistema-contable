"use client";

import { useState } from "react";
import { CuentaContable, Partida, DetallePartida } from "@/data/catalogo";

// Recibimos el estado global para poder guardar la Partida #1
interface BalanceProps {
    partidasGuardadas: Partida[];
    setPartidasGuardadas: React.Dispatch<React.SetStateAction<Partida[]>>;
    catalogo: CuentaContable[];
}

interface CuentaBalance {
    id: number;
    codigoCuenta: string;
    monto: string;
}

// 1. MOVEMOS ESTE COMPONENTE AFUERA PARA EVITAR QUE PIERDA EL FOCO
const SeccionSelect = ({ titulo, lista, setLista, opciones, handleChange, agregarFila, removerFila }: any) => (
    <div className="mb-4">
        <h4 className="font-semibold text-gray-700 mb-2 border-b pb-1">{titulo}</h4>
        {lista.map((cuenta: CuentaBalance) => (
            <div key={cuenta.id} className="flex gap-2 mb-2">
                <select 
                    className="w-2/3 px-2 py-1 border rounded text-sm bg-gray-50 focus:ring-1 focus:ring-blue-500"
                    value={cuenta.codigoCuenta}
                    onChange={(e) => handleChange(cuenta.id, "codigoCuenta", e.target.value, setLista)}
                >
                    <option value="">-- Selecciona cuenta --</option>
                    {opciones.map((op: any) => (
                        <option key={op.codigo} value={op.codigo}>{op.codigo} - {op.nombre}</option>
                    ))}
                </select>
                <input 
                    type="text"
                    inputMode="decimal"
                    pattern="[0-9]*[.]?[0-9]*"
                    placeholder="$0"
                    value={cuenta.monto}
                    onChange={(e) => handleChange(cuenta.id, "monto", e.target.value, setLista)}
                    className="w-1/3 px-2 py-1 border rounded text-sm text-right bg-gray-50 focus:ring-1 focus:ring-blue-500"
                />
                <button
                    type="button"
                    onClick={() => removerFila(cuenta.id, setLista)}
                    className="px-2 py-1 text-xs text-red-600 hover:text-red-800 border rounded"
                >
                    Borrar
                </button>
            </div>
        ))}
        <button onClick={() => agregarFila(setLista)} className="text-xs text-blue-600 hover:text-blue-800 mt-1">
            + Agregar fila
        </button>
    </div>
);

export default function BalanceInicial({ partidasGuardadas, setPartidasGuardadas, catalogo }: BalanceProps) {
    const [empresa, setEmpresa] = useState<string>("Empresa S.A. de C.V.");
    const [fecha, setFecha] = useState<string>("");
    
    // Estados clasificados (Solo guardamos el código y el monto)
    const [activos, setActivos] = useState<CuentaBalance[]>([{ id: 1, codigoCuenta: "", monto: "" }]);
    const [pasivos, setPasivos] = useState<CuentaBalance[]>([{ id: 2, codigoCuenta: "", monto: "" }]);
    const [capital, setCapital] = useState<CuentaBalance[]>([{ id: 3, codigoCuenta: "", monto: "" }]);

    const cuentasActivo = catalogo.filter(c => c.tipo === "Activo" && c.nivel >= 3);
    const cuentasPasivo = catalogo.filter(c => c.tipo === "Pasivo" && c.nivel >= 3);
    const cuentasCapital = catalogo.filter(c => c.tipo === "Patrimonio" && c.nivel >= 3);

    const totalActivos = activos.reduce((acc, curr) => acc + (Number(curr.monto) || 0), 0);
    const totalPasivos = pasivos.reduce((acc, curr) => acc + (Number(curr.monto) || 0), 0);
    const totalCapital = capital.reduce((acc, curr) => acc + (Number(curr.monto) || 0), 0);
    const totalPasivoCapital = totalPasivos + totalCapital;

    const handleChange = (id: number, campo: keyof CuentaBalance, valor: any, setLista: any) => {
        setLista((prev: any[]) => prev.map(cuenta => cuenta.id === id ? { ...cuenta, [campo]: valor } : cuenta));
    };

    const agregarFila = (setLista: any) => {
        setLista((prev: any[]) => [...prev, { id: Date.now() + Math.random(), codigoCuenta: "", monto: "" }]);
    };

    const removerFila = (id: number, setLista: any) => {
        setLista((prev: any[]) => prev.filter((cuenta: CuentaBalance) => cuenta.id !== id));
    };

    const resetearFormulario = () => {
        setActivos([{ id: Date.now(), codigoCuenta: "", monto: "" }]);
        setPasivos([{ id: Date.now() + 1, codigoCuenta: "", monto: "" }]);
        setCapital([{ id: Date.now() + 2, codigoCuenta: "", monto: "" }]);
    };

    const guardarBalance = () => {
        if (totalActivos !== totalPasivoCapital || totalActivos === 0) {
            alert("El balance debe estar cuadrado y ser mayor a 0 para poder guardarlo.");
            return;
        }
        if (!fecha) {
            alert("Debes seleccionar una fecha para el Balance Inicial.");
            return;
        }

        const detallesPartida: DetallePartida[] = [];
        activos.forEach(a => {
            if (a.codigoCuenta && Number(a.monto) > 0) {
                detallesPartida.push({ id: `${a.id}-debe`, codigoCuenta: a.codigoCuenta, debe: Number(a.monto), haber: 0 });
            }
        });

        pasivos.forEach(p => {
            if (p.codigoCuenta && Number(p.monto) > 0) {
                detallesPartida.push({ id: `${p.id}-haber`, codigoCuenta: p.codigoCuenta, debe: 0, haber: Number(p.monto) });
            }
        });
        capital.forEach(c => {
            if (c.codigoCuenta && Number(c.monto) > 0) {
                detallesPartida.push({ id: `${c.id}-haber`, codigoCuenta: c.codigoCuenta, debe: 0, haber: Number(c.monto) });
            }
        });

        if (detallesPartida.length === 0) {
            alert("Debes asignar al menos una cuenta con monto para registrar el balance inicial.");
            return;
        }

        const numeroPartida = Math.max(0, ...partidasGuardadas.map(p => p.numero)) + 1;
        const partidaApertura: Partida = {
            numero: numeroPartida,
            fecha,
            concepto: "Saldos iniciales por apertura del negocio (Balance Inicial)",
            detalles: detallesPartida,
        };

        const yaExisteApertura = partidasGuardadas.some(p => p.concepto.includes("Saldos iniciales por apertura del negocio"));

        setPartidasGuardadas(prev => {
            if (yaExisteApertura) {
                return prev.map(p =>
                    p.concepto.includes("Saldos iniciales por apertura del negocio")
                        ? partidaApertura
                        : p
                );
            }
            return [...prev, partidaApertura];
        });

        alert("¡Balance Inicial guardado exitosamente como Partida de Apertura!");
    };

    return (
        <div className="flex flex-col items-center p-6 w-full max-w-5xl mx-auto h-full overflow-y-auto">
            {/* ENCABEZADO */}
            <div className="w-full bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-6 text-center">
                <input 
                    type="text" value={empresa} onChange={(e) => setEmpresa(e.target.value)}
                    className="text-2xl font-bold text-gray-900 text-center w-full focus:outline-none"
                />
                <h2 className="text-xl font-semibold text-gray-700 mt-2">BALANCE INICIAL</h2>
                <div className="flex justify-center items-center gap-2 mt-2">
                    <span className="text-gray-600">Al</span>
                    <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} className="px-2 py-1 border rounded text-sm"/>
                </div>
            </div>

            {/* CUERPO */}
            <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-sm border flex flex-col justify-between">
                    <div>
                        <h3 className="font-bold text-blue-900 text-lg mb-4 text-center">ACTIVOS</h3>
                        {/* 2. PASAMOS LAS FUNCIONES COMO PROPS */}
                        <SeccionSelect 
                            titulo="Cuentas de Activo" 
                            lista={activos} 
                            setLista={setActivos} 
                            opciones={cuentasActivo} 
                            handleChange={handleChange} 
                            agregarFila={agregarFila} 
                            removerFila={removerFila} 
                        />
                    </div>
                    <div className="mt-6 pt-4 border-t-4 border-double border-blue-900 flex justify-between font-bold text-blue-900 text-lg">
                        <span>TOTAL ACTIVOS</span>
                        <span>${totalActivos.toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border flex flex-col justify-between">
                    <div>
                        <h3 className="font-bold text-blue-900 text-lg mb-4 text-center">PASIVOS Y PATRIMONIO</h3>
                        <SeccionSelect 
                            titulo="Cuentas de Pasivo" 
                            lista={pasivos} 
                            setLista={setPasivos} 
                            opciones={cuentasPasivo} 
                            handleChange={handleChange} 
                            agregarFila={agregarFila} 
                            removerFila={removerFila} 
                        />
                        <SeccionSelect 
                            titulo="Cuentas de Capital" 
                            lista={capital} 
                            setLista={setCapital} 
                            opciones={cuentasCapital} 
                            handleChange={handleChange} 
                            agregarFila={agregarFila} 
                            removerFila={removerFila} 
                        />
                    </div>
                    <div className="mt-6 pt-4 border-t-4 border-double border-blue-900 flex justify-between font-bold text-blue-900 text-lg">
                        <span>TOTAL PAS. + PATRIMONIO</span>
                        <span>${totalPasivoCapital.toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
                    </div>
                </div>
            </div>

            {/* BOTONES DE ACCIÓN */}
            <div className="w-full mt-6 flex justify-end gap-3">
                <button 
                    type="button"
                    onClick={resetearFormulario}
                    className="px-4 py-3 rounded-lg font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
                >
                    Limpiar formulario
                </button>
                <button 
                    onClick={guardarBalance}
                    disabled={totalActivos !== totalPasivoCapital || totalActivos === 0}
                    className={`px-6 py-3 rounded-lg font-bold text-white transition-colors
                        ${(totalActivos === totalPasivoCapital && totalActivos > 0) ? 'bg-green-600 hover:bg-green-700 shadow-md' : 'bg-gray-400 cursor-not-allowed'}`}
                >
                    Aprobar y Registrar Partida de Apertura
                </button>
            </div>
        </div>
    );
}