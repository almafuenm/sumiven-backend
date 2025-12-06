import libre from 'libreoffice-convert';
import path from 'path';
import fs from 'fs';
import { promisify } from 'util';

// Convertimos la función de libreoffice a una promesa para usar async/await
const convertAsync = promisify(libre.convert);

/**
 * Convierte un archivo Excel a PDF usando LibreOffice
 * @param {string} excelPath - Ruta del archivo Excel origen
 * @param {string} outputDir - Carpeta donde guardar el PDF
 * @param {string} pdfName - Nombre del archivo PDF final (sin extensión)
 * @returns {string} Ruta completa del PDF generado
 */
export async function convertirExcelAPDF(excelPath, outputDir, pdfName) {
    try {
        // 1. Leer el archivo Excel generado
        const excelBuffer = fs.readFileSync(excelPath);

        // 2. Convertir a PDF (formato '.pdf')
        // undefined es para opciones de filtro (usamos el default)
        const pdfBuffer = await convertAsync(excelBuffer, '.pdf', undefined);

        // 3. Guardar el PDF en disco
        const pdfPath = path.join(outputDir, `${pdfName}.pdf`);
        fs.writeFileSync(pdfPath, pdfBuffer);

        return pdfPath;
    } catch (err) {
        console.error("Error convirtiendo a PDF:", err);
        throw new Error("Error al convertir Excel a PDF. Asegúrate de tener LibreOffice instalado.");
    }
}