"use client";

import { useMemo, useState } from "react";
import { CuentaContable } from "@/data/catalogo";
import { EditRegular, DeleteRegular, AddSquareMultipleRegular, DismissRegular } from "@fluentui/react-icons";

const cuentaVacia = {
    codigo: "",
    nombre: "",
    tipo: "Activo" as const,
    naturaleza: "Deudora" as const,
    nivel: 1,
};

interface CatalogoCuentasProps {
    cuentas: CuentaContable[];
    setCuentas: React.Dispatch<React.SetStateAction<CuentaContable[]>>;
}

export default function CatalogoCuentas({ cuentas, setCuentas }: CatalogoCuentasProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modo, setModo] = useState<"crear" | "editar">("crear");
    const [codigoEditando, setCodigoEditando] = useState<string | null>(null);
    const [formCuenta, setFormCuenta] = useState<Partial<CuentaContable>>(cuentaVacia);
    const [errorMensaje, setErrorMensaje] = useState("");

    const cuentasOrdenadas = useMemo(
        () => [...cuentas].sort((a, b) => a.codigo.localeCompare(b.codigo)),
        [cuentas]
    );

    const tieneHijos = (codigo: string) =>
        cuentas.some(cuenta => cuenta.codigo !== codigo && cuenta.codigo.length > codigo.length && cuenta.codigo.startsWith(codigo));

    const puedeEliminar = (cuenta: CuentaContable) => cuenta.nivel > 2 && !tieneHijos(cuenta.codigo);

    const abrirModalCrear = () => {
        setModo("crear");
        setCodigoEditando(null);
        setFormCuenta(cuentaVacia);
        setErrorMensaje("");
        setIsModalOpen(true);
    };

    const abrirModalEditar = (cuenta: CuentaContable) => {
        setModo("editar");
        setCodigoEditando(cuenta.codigo);
        setFormCuenta({ ...cuenta });
        setErrorMensaje("");
        setIsModalOpen(true);
    };

    const cerrarModal = () => {
        setIsModalOpen(false);
        setErrorMensaje("");
        setFormCuenta(cuentaVacia);
        setCodigoEditando(null);
    };

    const actualizarForm = (campo: keyof CuentaContable, valor: string | number) => {
        setFormCuenta(prev => ({
            ...prev,
            [campo]: valor,
        }));
    };

    const eliminarCuenta = (codigo: string) => {
        const cuenta = cuentas.find(c => c.codigo === codigo);
        if (!cuenta) return;

        if (!puedeEliminar(cuenta)) {
            alert("No se pueden eliminar las cuentas principales ni las que aún tienen subcuentas asociadas.");
            return;
        }

        if (confirm(`¿Estás seguro de eliminar la cuenta ${codigo}?`)) {
            setCuentas(prev => prev.filter(c => c.codigo !== codigo));
        }
    };

    const guardarCuenta = (e: React.FormEvent) => {
        e.preventDefault();

        const codigo = formCuenta.codigo?.trim() || "";
        const nombre = formCuenta.nombre?.trim() || "";
        const tipo = formCuenta.tipo || "Activo";
        const naturaleza = formCuenta.naturaleza || "Deudora";
        const nivel = Number(formCuenta.nivel || 1);

        if (!codigo || !nombre) {
            setErrorMensaje("Completa el código y el nombre de la cuenta.");
            return;
        }

        const existe = cuentas.some(c => c.codigo === codigo && c.codigo !== codigoEditando);
        if (existe) {
            setErrorMensaje("Ya existe una cuenta con ese código.");
            return;
        }

        const cuentaNueva: CuentaContable = {
            codigo,
            nombre,
            tipo,
            naturaleza,
            nivel,
        };

        setCuentas(prev => {
            if (modo === "editar" && codigoEditando) {
                return prev.map(c => c.codigo === codigoEditando ? cuentaNueva : c);
            }
            return [...prev, cuentaNueva];
        });

        cerrarModal();
    };

    return (
        <div className="flex flex-col items-center justify-start p-6 w-full max-w-6xl mx-auto min-h-0 flex-1 overflow-y-auto relative">
            <div className="w-full flex justify-between items-end mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Catálogo de Cuentas</h1>
                    <p className="text-gray-500 mt-1">Administración de la estructura contable de la empresa</p>
                </div>
                <button
                    onClick={abrirModalCrear}
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-sm font-medium"
                >
                    <AddSquareMultipleRegular fontSize={20} />
                    Nueva Cuenta
                </button>
            </div>

            <div className="w-full bg-white rounded-lg shadow-sm border border-gray-200 overflow-y-auto max-h-[65vh]">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-blue-900 text-white">
                        <tr>
                            <th className="py-3 px-4 font-semibold text-sm w-32">Código</th>
                            <th className="py-3 px-4 font-semibold text-sm">Nombre de la Cuenta</th>
                            <th className="py-3 px-4 font-semibold text-sm w-32">Tipo</th>
                            <th className="py-3 px-4 font-semibold text-sm w-32">Naturaleza</th>
                            <th className="py-3 px-4 font-semibold text-sm w-24 text-center">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-gray-800">
                        {cuentasOrdenadas.map((cuenta) => (
                            <tr key={cuenta.codigo} className={`hover:bg-blue-50 transition-colors ${cuenta.nivel === 1 ? "bg-gray-50 font-bold" : ""}`}>
                                <td className="py-2 px-4 text-sm">{cuenta.codigo}</td>
                                <td className="py-2 px-4 text-sm flex items-center">
                                    <span style={{ marginLeft: `${(cuenta.nivel - 1) * 1.5}rem` }}>
                                        {cuenta.nivel === 1 ? "📁 " : cuenta.nivel === 2 ? "📂 " : "📄 "}
                                        {cuenta.nombre}
                                    </span>
                                </td>
                                <td className="py-2 px-4 text-sm">
                                    <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">{cuenta.tipo}</span>
                                </td>
                                <td className="py-2 px-4 text-sm">
                                    <span className={`px-2 py-1 rounded text-xs font-medium ${cuenta.naturaleza === "Deudora" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                                        {cuenta.naturaleza}
                                    </span>
                                </td>
                                <td className="py-2 px-4 text-sm flex justify-center gap-3">
                                    <button onClick={() => abrirModalEditar(cuenta)} className="text-blue-600 hover:text-blue-800" title="Editar">
                                        <EditRegular fontSize={20} />
                                    </button>
                                    <button
                                        onClick={() => eliminarCuenta(cuenta.codigo)}
                                        disabled={!puedeEliminar(cuenta)}
                                        className={` ${puedeEliminar(cuenta) ? "text-red-500 hover:text-red-700" : "text-gray-300 cursor-not-allowed"}`}
                                        title={puedeEliminar(cuenta) ? "Eliminar" : "No se puede eliminar esta cuenta"}
                                    >
                                        <DeleteRegular fontSize={20} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
                        <div className="bg-blue-900 px-6 py-4 flex justify-between items-center">
                            <h3 className="text-lg font-bold text-white">
                                {modo === "crear" ? "Registrar Nueva Cuenta" : "Editar Cuenta"}
                            </h3>
                            <button onClick={cerrarModal} className="text-white hover:text-gray-300">
                                <DismissRegular fontSize={24} />
                            </button>
                        </div>

                        <form onSubmit={guardarCuenta} className="p-6 flex flex-col gap-4">
                            {errorMensaje && (
                                <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-3 py-2">
                                    {errorMensaje}
                                </div>
                            )}

                            <div className="flex gap-4">
                                <div className="w-1/3">
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Código</label>
                                    <input
                                        type="text"
                                        placeholder="Ej: 110103"
                                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        value={formCuenta.codigo || ""}
                                        onChange={(e) => actualizarForm("codigo", e.target.value)}
                                    />
                                </div>
                                <div className="w-2/3">
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Nombre</label>
                                    <input
                                        type="text"
                                        placeholder="Ej: Caja Chica"
                                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        value={formCuenta.nombre || ""}
                                        onChange={(e) => actualizarForm("nombre", e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <div className="w-1/2">
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Tipo de Cuenta</label>
                                    <select
                                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                        value={formCuenta.tipo || "Activo"}
                                        onChange={(e) => actualizarForm("tipo", e.target.value)}
                                    >
                                        <option value="Activo">Activo</option>
                                        <option value="Pasivo">Pasivo</option>
                                        <option value="Patrimonio">Patrimonio</option>
                                        <option value="Ingreso">Ingreso</option>
                                        <option value="Gasto">Gasto</option>
                                        <option value="Costo">Costo</option>
                                    </select>
                                </div>
                                <div className="w-1/2">
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Naturaleza</label>
                                    <select
                                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                        value={formCuenta.naturaleza || "Deudora"}
                                        onChange={(e) => actualizarForm("naturaleza", e.target.value)}
                                    >
                                        <option value="Deudora">Deudora</option>
                                        <option value="Acreedora">Acreedora</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Nivel de la cuenta</label>
                                <select
                                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                    value={formCuenta.nivel || 1}
                                    onChange={(e) => actualizarForm("nivel", Number(e.target.value))}
                                >
                                    <option value={1}>Nivel 1 (Cuenta de Mayor General)</option>
                                    <option value={2}>Nivel 2 (Sub-grupo)</option>
                                    <option value={3}>Nivel 3 (Cuenta de Mayor)</option>
                                    <option value={4}>Nivel 4 (Sub-cuenta / Detalle)</option>
                                </select>
                            </div>

                            <div className="flex justify-end gap-3 mt-4 pt-4 border-t">
                                <button
                                    type="button"
                                    onClick={cerrarModal}
                                    className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg font-medium transition-colors"
                                >
                                    {modo === "crear" ? "Guardar Cuenta" : "Actualizar Cuenta"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}