import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

export async function sendEmailWithPDF(pdfPath, excelPath, to = null, formName = 'Formulario') {
  
  // --- CONFIGURACIÓN "TODO TERRENO" PARA LA NUBE ---
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,               // Usamos puerto seguro SSL directo
    secure: true,            // Obligatorio true para puerto 465
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    },
    tls: {
      // Ignorar errores de certificado (común en servidores cloud)
      rejectUnauthorized: false
    },
    // --- EL TRUCO SECRETO ---
    // Forzar conexión IPv4 (evita que Docker intente IPv6 y se cuelgue)
    family: 4 
  });
  // ------------------------------------------------

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
    // Verificación previa de conexión (opcional, ayuda a debuggear)
    await transporter.verify(); 
    console.log("Conexión SMTP lista...");

    const info = await transporter.sendMail(mailOptions);
    console.log('Correo enviado, messageId:', info.messageId);
    return info;
  } catch (error) {
    console.error("Error enviando email:", error);
    throw error;
  }
}