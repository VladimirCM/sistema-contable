import { NextResponse } from "next/server";
import { getAllData, saveAllData } from "@/lib/db";

export async function GET() {
  try {
    const data = getAllData();
    return NextResponse.json(data);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "No se pudieron cargar los datos" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    saveAllData({
      catalogo: body.catalogo,
      partidas: body.partidas,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "No se pudieron guardar los datos" },
      { status: 500 }
    );
  }
}
