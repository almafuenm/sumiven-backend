import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

export async function sendEmailWithPDF(pdfPath, excelPath, to = null, formName = 'Formulario') {
  
  // --- INTENTO #2: PUERTO 587 (STARTTLS) ---
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,               // Cambiamos al puerto estándar
    secure: false,           // OBLIGATORIO false para 587
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    },
    tls: {
      rejectUnauthorized: false
    },
    family: 4,               // Mantenemos IPv4 forzado
    logger: true,            // ACTIVAMOS LOGS EN RENDER
    debug: true              // ACTIVAMOS DEBUG
  });
  // ----------------------------------------

  const mailOptions = {
    from: `"Sumiven" <${process.env.SMTP_USER}>`,
    to: to || process.env.EMAIL_TO,
    subject: `Informe "${formName}" completado - PDF adjunto`,
    text: `Adjunto encontrarás el PDF y Excel correspondientes al formulario de ${formName}.`,
    attachments: [
      { filename: `${formName}.pdf`, path: pdfPath },
      { filename: `${formName}.xlsx`, path: excelPath }
    ]
  };

  try {
    console.log("Iniciando conexión con Gmail por puerto 587...");
    await transporter.verify(); 
    console.log("Conexión SMTP verificada correctamente.");

    const info = await transporter.sendMail(mailOptions);
    console.log('Correo enviado, messageId:', info.messageId);
    return info;
  } catch (error) {
    console.error("Error DETALLADO enviando email:", error);
    throw error;
  }
}