import ExcelJS from 'exceljs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function getTemplatePath(fileName) { return path.join(__dirname, '..', 'templates', fileName); }
function getOutPath(prefix) { return path.join(__dirname, '..', 'tmp', `${prefix}_${Date.now()}.xlsx`); }

const formatNombre = (str) => str ? String(str).toLowerCase().replace(/\b\w/g, l => l.toUpperCase()) : '';
const formatTexto = (str) => str ? String(str).charAt(0).toUpperCase() + String(str).slice(1) : '';
const formatSerial = (str) => str ? String(str).toUpperCase() : '';

function agregarFirma(workbook, sheet, base64Image, cellAddress) {
  if (!base64Image || base64Image.length < 100 || !base64Image.startsWith('data:image')) return;

  const imageId = workbook.addImage({ base64: base64Image, extension: 'png' });
  const cell = sheet.getCell(cellAddress);

  const colPosition = (cell.col - 1); + 0.25;
  const rowPosition = (cell.row - 1) + 0.25; 

  sheet.addImage(imageId, {
    tl: { col: colPosition, row: rowPosition },
    
    ext: { width: 250, height: 50 }, 
    
    editAs: 'twoCell' 
  });
  
  cell.value = '';
}

function procesarAuth(workbook, sheet, dataObj, cellAddress) {
    if (!dataObj || !dataObj.value) return;
    if (dataObj.type === 'img') agregarFirma(workbook, sheet, dataObj.value, cellAddress);
    else sheet.getCell(cellAddress).value = formatTexto(dataObj.value);
}

export async function generarInformeTecnico(metadata, items = [], repot = []) {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(getTemplatePath('Evaluación Técnica.xlsx'));
  const sheet = workbook.worksheets[0];

  sheet.getCell('B5').value = metadata.REGION || '';
  sheet.getCell('G5').value = formatNombre(metadata.NOMBRE);
  sheet.getCell('B6').value = metadata.CIUDAD || '';
  sheet.getCell('G6').value = formatSerial(metadata.CI);
  sheet.getCell('B7').value = formatTexto(metadata.UBICACION);
  sheet.getCell('G7').value = formatTexto(metadata.CARGO);
  sheet.getCell('B8').value = formatTexto(metadata.PISO);
  sheet.getCell('G8').value = formatTexto(metadata.TELEFONO);
  sheet.getCell('B9').value = metadata.FECHA_REPORTE || '';
  sheet.getCell('G9').value = formatSerial(metadata.P00);

  let rowIdx = 13;
  items.forEach(it => {
    const row = sheet.getRow(rowIdx);
    row.getCell('A').value = formatTexto(it.elemento);
    row.getCell('B').value = formatNombre(it.marca);
    row.getCell('C').value = formatSerial(it.modelo);
    row.getCell('D').value = formatSerial(it.serial);
    row.getCell('E').value = formatSerial(it.codInv);
    row.getCell('G').value = formatTexto(it.bienesPublicos);
    row.getCell('I').value = formatSerial(it.memoria);
    row.getCell('J').value = formatSerial(it.dd);
    rowIdx++;
  });

  sheet.getCell('A22').value = formatTexto(metadata.evaluacion);

  sheet.getCell('B29').value = formatNombre(metadata.atendidoPor);
  sheet.getCell('B30').value = formatSerial(metadata.p00Atendido);
  if (metadata.firmaAtendido) agregarFirma(workbook, sheet, metadata.firmaAtendido, 'B31');

  sheet.getCell('G29').value = formatNombre(metadata.solicitadoPor);
  sheet.getCell('G30').value = formatSerial(metadata.p00Solicitado);
  if (metadata.firmaSolicitado) agregarFirma(workbook, sheet, metadata.firmaSolicitado, 'G31');

  if (repot && repot.length > 0) {
      let repRow = 35; 
      repot.forEach(rp => {
        const row = sheet.getRow(repRow);
        row.getCell('A').value = formatTexto(rp.pieza);
        row.getCell('B').value = formatNombre(rp.marca);
        row.getCell('C').value = formatSerial(rp.noParte);
        row.getCell('F').value = formatSerial(rp.capacidad);
        row.getCell('G').value = formatTexto(rp.observaciones);
        repRow++;
      });
  }

  sheet.getCell('A43').value = formatNombre(metadata.tecnicoCampo);
  sheet.getCell('B44').value = formatSerial(metadata.p00Tecnico);
  procesarAuth(workbook, sheet, metadata.authTecnico, 'A45');

  sheet.getCell('C43').value = formatNombre(metadata.coordinadorCampo);
  sheet.getCell('D44').value = formatSerial(metadata.p00Coordinador);
  procesarAuth(workbook, sheet, metadata.authCoordinador, 'C45');

  sheet.getCell('G43').value = formatNombre(metadata.gteSeguridad);
  sheet.getCell('H44').value = formatSerial(metadata.p00Gte);
  procesarAuth(workbook, sheet, metadata.authGte, 'G45');

  const out = getOutPath('InformeTecnico');
  await workbook.xlsx.writeFile(out);
  return out;
}

export async function generarOrdenCierre(metadata) {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(getTemplatePath('Orden de Cierre.xlsx'));
  const sheet = workbook.worksheets[0];

  sheet.getCell('B4').value = metadata.REGION || '';
  sheet.getCell('I4').value = metadata.ESTADO || '';
  sheet.getCell('B5').value = metadata.CIUDAD || '';
  sheet.getCell('I5').value = formatTexto(metadata.OFICINA);
  sheet.getCell('B6').value = formatNombre(metadata.USUARIO);
  sheet.getCell('I6').value = formatTexto(metadata.CARGO);
  sheet.getCell('B7').value = formatTexto(metadata.TELEFONO);
  sheet.getCell('I7').value = metadata.CORREO ? metadata.CORREO.toLowerCase() : '';
  sheet.getCell('B8').value = metadata.FECHA_CIERRE || '';
  sheet.getCell('I8').value = formatSerial(metadata.P00);
  
  sheet.getCell('A14').value = formatTexto(metadata.trabajoRealizado);
  sheet.getCell('A36').value = formatTexto(metadata.observaciones);
  
  if (metadata.problemaSolucionado === 'SI') sheet.getCell('F42').value = 'X'; 
  else sheet.getCell('F43').value = 'X';

  sheet.getCell('I42').value = formatNombre(metadata.atendidoPor);
  sheet.getCell('I43').value = formatSerial(metadata.p00Atendido);
  sheet.getCell('I45').value = formatNombre(metadata.verificadoPor);
  sheet.getCell('I46').value = formatSerial(metadata.p00Verificado);

  const sat = metadata.satisfaccion;
  if (sat === 'Muy Satisfecho') sheet.getCell('F45').value = 'X';
  else if (sat === 'Satisfecho') sheet.getCell('F46').value = 'X';
  else if (sat === 'Insatisfecho') sheet.getCell('F47').value = 'X';
  else if (sat === 'Muy Insatisfecho') sheet.getCell('F48').value = 'X';

  sheet.getCell('F50').value = formatTexto(metadata.oficinaOperativa);
  sheet.getCell('D52').value = formatTexto(metadata.obsCliente);

  if (metadata.firmaTecnico) agregarFirma(workbook, sheet, metadata.firmaTecnico, 'A55');
  if (metadata.firmaCliente) agregarFirma(workbook, sheet, metadata.firmaCliente, 'I55');

  const out = getOutPath('OrdenCierre');
  await workbook.xlsx.writeFile(out);
  return out;
}

export async function generarOrdenReparacion(metadata) {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(getTemplatePath('Orden de Reparación.xlsx'));
  const sheet = workbook.worksheets[0];

  sheet.getCell('B6').value = metadata.REGION || '';
  sheet.getCell('I6').value = metadata.ESTADO || ''; 
  sheet.getCell('B7').value = metadata.CIUDAD || '';
  sheet.getCell('I7').value = formatTexto(metadata.OFICINA); 
  sheet.getCell('B8').value = formatNombre(metadata.NOMBRE);
  sheet.getCell('I8').value = formatTexto(metadata.CARGO); 
  sheet.getCell('B9').value = formatTexto(metadata.TELEFONO);
  sheet.getCell('I9').value = metadata.CORREO ? metadata.CORREO.toLowerCase() : ''; 
  sheet.getCell('I10').value = formatSerial(metadata.P00); 
  sheet.getCell('B10').value = metadata.FECHA_REPORTE || '';

  if (metadata.tipoAtencion === 'SOFTWARE') sheet.getCell('E12').value = 'X'; else sheet.getCell('E13').value = 'X';
  sheet.getCell('J12').value = formatTexto(metadata.problemaReportado); 
  sheet.getCell('A22').value = formatTexto(metadata.trabajoRealizado);

  if (metadata.hw_teclado) sheet.getCell('F26').value = 'X'; if (metadata.hw_mouse) sheet.getCell('F27').value = 'X';
  if (metadata.hw_disco) sheet.getCell('F28').value = 'X'; if (metadata.hw_memoria) sheet.getCell('F29').value = 'X';
  if (metadata.sw_win7) sheet.getCell('L26').value = 'X'; if (metadata.sw_office) sheet.getCell('L27').value = 'X';

  sheet.getCell('B32').value = formatTexto(metadata.equipo_tipo); 
  sheet.getCell('E32').value = formatNombre(metadata.equipo_marca);
  sheet.getCell('K32').value = formatSerial(metadata.equipo_modelo);
  sheet.getCell('B34').value = formatSerial(metadata.ip); 
  sheet.getCell('H34').value = formatTexto(metadata.observaciones);

  if (metadata.solucionado100 === 'SI') sheet.getCell('F40').value = 'X'; else sheet.getCell('F41').value = 'X';
  
  sheet.getCell('I40').value = formatNombre(metadata.atendidoPor); 
  sheet.getCell('I41').value = formatSerial(metadata.p00Atendido);
  sheet.getCell('I43').value = formatNombre(metadata.verificadoPor);
  sheet.getCell('I44').value = formatSerial(metadata.p00Verificado);

  const sat = metadata.satisfaccion;
  if (sat === 'Muy Satisfecho') sheet.getCell('F43').value = 'X'; 
  else if (sat === 'Satisfecho') sheet.getCell('F44').value = 'X';
  else if (sat === 'Insatisfecho') sheet.getCell('F45').value = 'X'; 
  else if (sat === 'Muy Insatisfecho') sheet.getCell('F46').value = 'X';

  sheet.getCell('H47').value = formatTexto(metadata.obsCliente);
  
  sheet.getCell('E48').value = metadata.ticketAtendido || '';
  sheet.getCell('E49').value = metadata.solicitud100 || '';

  if (metadata.firmaTecnico) agregarFirma(workbook, sheet, metadata.firmaTecnico, 'A51');
  if (metadata.firmaCliente) agregarFirma(workbook, sheet, metadata.firmaCliente, 'I51');
  
  const out = getOutPath('OrdenReparacion');
  await workbook.xlsx.writeFile(out);
  return out;
}