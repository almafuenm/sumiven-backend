import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

/**
 * Envía un email con PDF y Excel adjuntos personalizados
 * @param {string} pdfPath - Ruta al PDF
 * @param {string} excelPath - Ruta al Excel
 * @param {string} [to] - Destinatario (opcional)
 * @param {string} [formName] - Nombre del formulario para asunto y archivos
 */
export async function sendEmailWithPDF(pdfPath, excelPath, to = null, formName = 'Formulario') {
  
  // --- AQUÍ ESTÁ EL CAMBIO IMPORTANTE ---
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",  // Host explícito
    port: 587,               // Puerto 587 (TLS) que SÍ funciona en la nube
    secure: false,           // false es obligatorio para el puerto 587
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    },
    tls: {
      rejectUnauthorized: false // Ayuda a evitar errores de certificados en Docker
    }
  });
  // --------------------------------------

  const mailOptions = {
    // 1. REMITENTE
    from: `"Sumiven" <${process.env.SMTP_USER}>`,           
    
    to: to || process.env.EMAIL_TO,                            
    
    // 2. ASUNTO DINÁMICO
    subject: `Informe "${formName}" completado - PDF adjunto`,
    
    text: `Adjunto encontrarás el PDF y Excel correspondientes al formulario de ${formName}.`,
    
    // 3. NOMBRES DE ARCHIVOS DINÁMICOS
    attachments: [
      { filename: `${formName}.pdf`, path: pdfPath },
      { filename: `${formName}.xlsx`, path: excelPath }
    ]
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Correo enviado, messageId:', info.messageId);
    return info;
  } catch (error) {
    console.error("Error enviando email:", error);
    throw error; // Re-lanzar error para que el server.js se entere
  }
}