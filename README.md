# Instalar dependencias y todo lo que se ocupara
npm install

# Ejecutar el proyecto
npm run dev

# Host para ver el proyecto desde un navegador
http://localhost:3000

# Base de datos
Se esta usando SQLite para guardado de datos para que sea persistente, se guarda localmente los archivos que contienen la data y tablas son los siguientes

- sistema_contable.sqlite
- sistema_contable.sqlite-shm
- sistema_contable.sqlite-wal

## NOTA: 
Para reiniciar la base de datos, solo se necesita detener el "npm run dev" si esta corriendo usando "Ctrl + C", eliminar archivos mencionados anteriormente y volver a corre el proyecto con "npm run dev" para que se cree una base de datos vacía

# Balance Inicial
Se puede cambiar el nombre de la empresa simplemente tocando el texto y borrandolo