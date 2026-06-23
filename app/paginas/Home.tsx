"use client";

import { useCallback, useEffect, useState } from "react";
import Navbar from "../componentes/Navbar";
import BalanceInicial from "./BalanceInicial";
import CatalogoCuentas from "../componentes/CatalogoCuentas";
import Transacciones from "../componentes/Transacciones";
import Mayorizacion from "../componentes/Mayorizacion";
import BalanzaComprobacion from "../componentes/BalanzaComprobacion";
import BalanceGeneral from "../componentes/BalanceGeneral";
import EstadoResultados from "../componentes/EstadoResultados";
import PartidasAjuste from "../componentes/PartidasAjuste";
import PartidasCierre from "../componentes/PartidasCierre";
import Ratios from "../componentes/Ratios";
import AnalisisFinanciero from "../componentes/AnalisisFinanciero";
import FlujoCaja from "../componentes/FlujoCaja";

import { CuentaContable, Partida } from "@/data/catalogo";

export default function HomeComponent() {
    const [buttonOpcion, setButtonOption] = useState("Catálogo de Cuentas");
    const [selectedOption, setSelectedOption] = useState("Catálogo de Cuentas");
    const [catalogoGlobal, setCatalogoGlobal] = useState<CuentaContable[]>([]);
    const [partidasGlobales, setPartidasGlobales] = useState<Partida[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        const cargarDatos = async () => {
            try {
                const respuesta = await fetch("/api/contabilidad");
                const data = await respuesta.json();
                setCatalogoGlobal(data.catalogo || []);
                setPartidasGlobales(data.partidas || []);
            } catch (error) {
                console.error("Error cargando datos", error);
            } finally {
                setIsLoaded(true);
            }
        };

        cargarDatos();
    }, []);

    useEffect(() => {
        if (!isLoaded) return;

        const guardarDatos = async () => {
            try {
                await fetch("/api/contabilidad", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        catalogo: catalogoGlobal,
                        partidas: partidasGlobales,
                    }),
                });
            } catch (error) {
                console.error("Error guardando datos", error);
            }
        };

        guardarDatos();
    }, [catalogoGlobal, partidasGlobales, isLoaded]);

    const handleButtonClick = useCallback((opcion: string) => {
        setButtonOption(opcion);
        setSelectedOption(opcion);
    }, []);

    if (!isLoaded) {
        return (
            <div className="flex h-screen items-center justify-center bg-gray-50">
                <p className="text-gray-600">Cargando datos del sistema...</p>
            </div>
        );
    }

    return (
        <div className="flex h-screen overflow-hidden p-2 pl-0">
            <div className="py-4 pr-2">
                <Navbar onSelect={handleButtonClick} selectedOption={selectedOption} />
            </div>
            <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-3xl bg-white p-10">
                <div className="mb-4 shrink-0">
                    <h1 className="text-2xl font-bold">Bienvenido al Sistema Contable</h1>
                    <p className="text-gray-600">Gestión avanzada de procesos contables con reportes mensuales</p>
                </div>
                <div className="min-h-0 flex-1 overflow-y-auto">
                    {(() => {
                        switch (buttonOpcion) {
                            case "Catálogo de Cuentas":
                                return <CatalogoCuentas cuentas={catalogoGlobal} setCuentas={setCatalogoGlobal} />;
                            case "Balance Inicial":
                                return <BalanceInicial partidasGuardadas={partidasGlobales} setPartidasGuardadas={setPartidasGlobales} catalogo={catalogoGlobal} />;
                            case "Transacciones":
                                return <Transacciones partidasGuardadas={partidasGlobales} setPartidasGuardadas={setPartidasGlobales} catalogo={catalogoGlobal} />;
                            case "Mayorización":
                                return <Mayorizacion partidas={partidasGlobales} catalogo={catalogoGlobal} />;
                            case "Balanza":
                                return <BalanzaComprobacion partidas={partidasGlobales} catalogo={catalogoGlobal} />;
                            case "Balance General":
                                return <BalanceGeneral partidas={partidasGlobales} catalogo={catalogoGlobal} />;
                            case "Estado P&G":
                                return <EstadoResultados partidas={partidasGlobales} catalogo={catalogoGlobal} />;
                            case "Partidas de Ajuste":
                                return <PartidasAjuste partidasGuardadas={partidasGlobales} setPartidasGuardadas={setPartidasGlobales} catalogo={catalogoGlobal} />;
                            case "Partidas de Cierre":
                                return <PartidasCierre partidasGuardadas={partidasGlobales} setPartidasGuardadas={setPartidasGlobales} catalogo={catalogoGlobal} />;
                            case "Ratios":
                                return <Ratios partidas={partidasGlobales} catalogo={catalogoGlobal} />;
                            case "Analisis Financiero":
                                return <AnalisisFinanciero partidas={partidasGlobales} catalogo={catalogoGlobal} />;
                            case "Flujo de efectivo":
                                return <FlujoCaja partidas={partidasGlobales} catalogo={catalogoGlobal} />;
                            default:
                                return <div>Seleccione una opción del menú</div>;
                        }
                    })()}
                </div>
            </div>
        </div>
    );
}