"use client";

import { calcularSaldos, obtenerCuentaInfo, obtenerNaturaleza } from "@/utils/contabilidad";
import { CuentaContable, Partida } from "@/data/catalogo";

interface RatiosProps {
    partidas: Partida[];
    catalogo: CuentaContable[];
}

export default function Ratios({ partidas, catalogo }: RatiosProps) {
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

    const activoCorriente = Object.values(saldos)
        .filter(s => {
            const info = obtenerCuentaInfo(s.codigo, catalogo);
            return info?.tipo === "Activo" && s.codigo.startsWith("11");
        })
        .reduce((sum, s) => {
            const nat = obtenerNaturaleza(s.codigo, catalogo);
            return sum + (nat === "Deudora" ? s.saldo : -s.saldo);
        }, 0);

    const pasivoCorriente = Object.values(saldos)
        .filter(s => {
            const info = obtenerCuentaInfo(s.codigo, catalogo);
            return info?.tipo === "Pasivo" && s.codigo.startsWith("21");
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

    const utilidadBruta = ingresos - costos;
    const utilidadNeta = utilidadBruta - gastos;

    const razonCorriente = pasivoCorriente !== 0 ? activoCorriente / pasivoCorriente : 0;
    const endeudamiento = (totalPasivo + totalCapital) !== 0 ? totalPasivo / (totalPasivo + totalCapital) : 0;
    const margenBruto = ingresos !== 0 ? utilidadBruta / ingresos : 0;
    const margenNeto = ingresos !== 0 ? utilidadNeta / ingresos : 0;

    const cards = [
        { label: "Razón corriente", value: razonCorriente.toFixed(2), note: "Activo corriente / Pasivo corriente" },
        { label: "Endeudamiento", value: `${(endeudamiento * 100).toFixed(1)}%`, note: "Pasivo / (Pasivo + Capital)" },
        { label: "Margen bruto", value: `${(margenBruto * 100).toFixed(1)}%`, note: "Utilidad bruta / Ingresos" },
        { label: "Margen neto", value: `${(margenNeto * 100).toFixed(1)}%`, note: "Utilidad neta / Ingresos" },
    ];

    return (
        <div className="max-w-6xl mx-auto p-6">
            <div className="flex justify-end print:hidden mb-3">
                <button
                    type="button"
                    onClick={() => window.print()}
                    className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700"
                >
                    Guardar / Imprimir PDF
                </button>
            </div>
            <h2 className="text-2xl font-bold mb-2">Ratios Financieros</h2>
            <p className="text-gray-500 mb-6">Indicadores clave para evaluar la salud financiera del negocio.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                {cards.map(card => (
                    <div key={card.label} className="bg-white border rounded-xl p-4 shadow-sm">
                        <p className="text-sm text-gray-500">{card.label}</p>
                        <p className="text-2xl font-bold">{card.value}</p>
                        <p className="text-xs text-gray-400 mt-1">{card.note}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}