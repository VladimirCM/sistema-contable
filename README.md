# Sistema Contable 📊

Este es un sistema contable que permite llevar el registro de partidas, manejar ciclos contables y visualizar estados financieros.

## 📋 Requisitos Previos
Antes de poder instalar y ejecutar el proyecto, asegúrate de tener instalado el siguiente programa en tu computadora:

* **Node.js**: Es necesario para poder ejecutar los comandos de instalación. Puedes descargarlo e instalarlo de forma gratuita desde su página oficial: [https://nodejs.org/](https://nodejs.org/) (se recomienda la versión LTS). Al instalar Node.js, automáticamente se instalará `npm`.

o ejecutar estos comandos en la terminal:

# Descarga e instala nvm:
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash
# en lugar de reiniciar la shell
\. "$HOME/.nvm/nvm.sh"
# Descarga e instala Node.js:
nvm install 22
# Verifica la versión de Node.js:
node -v # Debería mostrar "v22.23.0".
# Verifica versión de npm:
npm -v # Debería mostrar "10.9.8".


## 🚀 Cómo ejecutar el proyecto

Sigue estos pasos en tu terminal para hacer funcionar el proyecto de manera local:

## **Instalar dependencias:**
   npm install

## **Ejecutar el servidor de desarrollo:**
   npm run dev

## **Ver el proyecto:**
Abre tu navegador y entra a http://localhost:3000

## 💾 Base de Datos
El sistema utiliza SQLite para guardar los datos de manera persistente y local. Los archivos que contienen la base de datos y las tablas se generan automáticamente y son los siguientes:

- sistema_contable.sqlite
- sistema_contable.sqlite-shm
- sistema_contable.sqlite-wal

## ⚠️ Cómo reiniciar la base de datos (Limpiar datos)
Si necesitas probar el sistema desde cero con una base de datos vacía:

Detén el servidor en la terminal presionando Ctrl + C.

Elimina los tres archivos .sqlite mencionados arriba.

Vuelve a correr el proyecto con npm run dev y la base de datos limpia se creará automáticamente.

## 💡 Notas de Uso
Balance Inicial: Puedes cambiar el nombre de la empresa directamente en la interfaz, simplemente haciendo clic sobre el texto y escribiendo el nuevo nombre.