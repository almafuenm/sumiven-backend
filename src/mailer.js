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
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });

  const mailOptions = {
    // 1. REMITNETE
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

  const info = await transporter.sendMail(mailOptions);
  console.log('Correo enviado, messageId:', info.messageId);
  return info;
}