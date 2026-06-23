"use client";

// Importé el ícono 'ListRegular' para el Catálogo (puedes cambiarlo luego si quieres)
import { ListRegular, BoardRegular, TrayItemRemoveRegular, MoneyHandRegular, EqualCircleRegular, DocumentDataRegular, CalculatorMultipleRegular, DataBarVerticalRegular, ReceiptMoneyRegular, DocumentTableCubeRegular, ArrowTrendingTextRegular, ScalesRegular } from "@fluentui/react-icons";

interface Dock {
    onSelect: (opcion: string) => void;
    selectedOption: string;
}

export default function Navbar({ onSelect, selectedOption }: Dock) {
    // 1. Agregamos "Catálogo de Cuentas" al inicio del arreglo
    const docks = ["Catálogo de Cuentas", "Balance Inicial", "Transacciones", "Mayorización", "Balanza", "Partidas de Ajuste", "Balance General", "Estado P&G", "Partidas de Cierre", "Ratios", "Analisis Financiero", "Flujo de efectivo"];

    // 2. Agregamos el ícono correspondiente en el objeto
    const icons = {
        "Catálogo de Cuentas": <ListRegular style={{ color: "white", width: 30, height: 30 }} />,
        "Balance Inicial": <BoardRegular style={{ color: "white", width: 30, height: 30 }} />,
        "Transacciones": <DocumentDataRegular style={{ color: "white", width: 30, height: 30 }} />,
        "Mayorización": <ArrowTrendingTextRegular style={{ color: "white", width: 30, height: 30 }} />,
        "Balanza": <ScalesRegular style={{ color: "white", width: 30, height: 30 }} />,
        "Partidas de Ajuste": <CalculatorMultipleRegular style={{ color: "white", width: 30, height: 30 }} />,
        "Balance General": <EqualCircleRegular style={{ color: "white", width: 30, height: 30 }} />,
        "Estado P&G": <ReceiptMoneyRegular style={{ color: "white", width: 30, height: 30 }} />,
        "Partidas de Cierre": <DocumentTableCubeRegular style={{ color: "white", width: 30, height: 30 }} />,
        "Ratios": <TrayItemRemoveRegular style={{ color: "white", width: 30, height: 30 }} />,
        "Analisis Financiero": <DataBarVerticalRegular style={{ color: "white", width: 30, height: 30 }} />,
        "Flujo de efectivo": <MoneyHandRegular style={{ color: "white", width: 30, height: 30 }} />
    };

    return (
        <nav className="flex flex-col items-center h-full w-full">
            {docks.map((dock) => (
                <div 
                    key={dock} 
                    className={`group relative h-12 w-14 mb-2 rounded flex items-center justify-center transition-colors
                    ${selectedOption === dock ? "border-l-2 border-blue-500" : "border-l-2 border-transparent"}`}
                >
                    <button
                        className="text-white rounded flex items-center justify-center w-full h-full"
                        onClick={() => onSelect(dock)}
                    >
                        {icons[dock as keyof typeof icons]}
                    </button>
                    <span className="absolute left-full ml-4 px-2 py-1 bg-gray-800 text-white text-sm rounded-md 
                                     opacity-0 invisible transition-all duration-200 shadow-lg z-50
                                     group-hover:opacity-100 group-hover:visible whitespace-nowrap">
                        {dock}
                    </span>
                </div>
            ))}
        </nav>
    );
}