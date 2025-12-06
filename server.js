import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import dotenv from "dotenv";
import cors from "cors";
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Imports de funciones
import { generarInformeTecnico, generarOrdenCierre, generarOrdenReparacion } from "./src/excel.js";
import { sendEmailWithPDF } from "./src/mailer.js";
import { convertirExcelAPDF } from "./src/converter.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

const app = express();
app.use(express.json({ limit: '50mb' })); 
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

// Asegurar carpeta tmp
const TMP_DIR = path.join(__dirname, "tmp");
if (!fs.existsSync(TMP_DIR)) fs.mkdirSync(TMP_DIR);

const upload = multer({ dest: TMP_DIR });

app.post("/api/submit", upload.none(), async (req, res) => {
  try {
    const metadataRaw = req.body.metadata || JSON.stringify(req.body);
    const metadata = typeof metadataRaw === "string" ? JSON.parse(metadataRaw) : metadataRaw;

    let formName = "Documento";
    let excelPath;

    // 1. GENERAR EXCEL
    if (metadata.formType === "Informe") {
      formName = "Evaluación Técnica";
      excelPath = await generarInformeTecnico(metadata, metadata.items || [], metadata.repot || []);
    } else if (metadata.formType === "Cierre") {
      formName = "Orden de Cierre";
      excelPath = await generarOrdenCierre(metadata);
    } else if (metadata.formType === "Reparacion") {
      formName = "Orden de Reparación";
      excelPath = await generarOrdenReparacion(metadata);
    } else {
      throw new Error("formType inválido");
    }

    // 2. CONVERTIR ESE EXCEL A PDF
    const pdfPath = await convertirExcelAPDF(excelPath, TMP_DIR, `${metadata.formType}_${Date.now()}`);

    // 3. ENVIAR EMAIL (Con el PDF convertido del Excel)
    const clientEmail = metadata.email_to || null; 
    await sendEmailWithPDF(pdfPath, excelPath, clientEmail, formName);

    // 4. LIMPIEZA
    setTimeout(() => {
        try {
            if(fs.existsSync(pdfPath)) fs.unlinkSync(pdfPath);
            if(fs.existsSync(excelPath)) fs.unlinkSync(excelPath);
            console.log("Archivos temporales borrados.");
        } catch (err) {
            console.warn("Error limpiando archivos:", err);
        }
    }, 5000); // Esperar 5 seg para asegurar que el correo salió

    res.json({ ok: true, message: "Formulario procesado y enviado" });

  } catch (err) {
    console.error("Error en /api/submit:", err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server listening on http://localhost:${PORT}`));