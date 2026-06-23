import fs from 'fs';
import path from 'path';
import https from 'https';

const url = 'https://raw.githubusercontent.com/dscottpi/bibles/master/RVR1960%20-%20Spanish.json';
const destFolder = path.join(process.cwd(), 'src', 'data');
const destFile = path.join(destFolder, 'bible.json');

if (!fs.existsSync(destFolder)) {
  fs.mkdirSync(destFolder, { recursive: true });
}

console.log('Descargando la Biblia Reina Valera 1960 desde GitHub...');
https.get(url, (res) => {
  if (res.statusCode !== 200) {
    console.error(`Error al descargar: código de estado ${res.statusCode}`);
    process.exit(1);
  }

  let rawData = '';
  res.on('data', (chunk) => {
    rawData += chunk;
  });

  res.on('end', () => {
    try {
      console.log('Descarga completada. Parseando JSON...');
      const parsed = JSON.parse(rawData);
      
      // Vamos a verificar y guardar la Biblia
      console.log(`Biblia cargada con éxito. Encontrados ${parsed.length || 0} libros.`);
      fs.writeFileSync(destFile, JSON.stringify(parsed, null, 2), 'utf-8');
      console.log(`Guardado correctamente en ${destFile}`);
    } catch (e) {
      console.error('Error al procesar el JSON de la Biblia:', e.message);
    }
  });
}).on('error', (err) => {
  console.error('Error en la petición de red:', err.message);
});
