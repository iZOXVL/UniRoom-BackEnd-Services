import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const domain = process.env.NEXT_PUBLIC_APP_URL;

export const sendLandlordNotificationEmail = async (email: string, roomTitle: string) => {
    await resend.emails.send({
      from: "UniRoom <no-reply@uniroom.app>",
      to: email,
      subject: "¡Tienes una nueva solicitud! 📬",
      html: `
        <!DOCTYPE html>
        <html lang="es">
          <head>
            <meta charset="UTF-8">
          </head>
          <body>
            <table align="center" style="border:1px solid #eaeaea; border-radius:5px; max-width:465px; padding:20px; margin-top:40px;">
              <tbody>
                <tr>
                  <td>
                    <img src="https://i.imgur.com/ruySKLQ.png" alt="Logo" height="130" style="display:block; margin:0 auto;">
                    <h1 style="text-align:center; font-size:24px;">Nueva Solicitud de Chat 🏠</h1>
                    <p style="font-size:14px; text-align:center;">¡Hola! Parece que alguien quiere mudarse y ha solicitado chatear contigo sobre tu habitación:</p>
                    <p style="font-size:16px; text-align:center; font-weight:bold;">"${roomTitle}"</p>
                    <p style="font-size:14px; text-align:center;">Accede a tu dashboard para ver los detalles y aceptar la solicitud.</p>
                    <div style="text-align:center; margin:20px;">
                      <a href="${domain}/dashboard" style="background-color:#007bff; color:white; padding:10px 20px; border-radius:5px; text-decoration:none;">Ir al Dashboard</a>
                    </div>
                    <p style="font-size:14px; text-align:center;">UniRoom: haciendo que cada chat cuente 🌟</p>
                  </td>
                </tr>
              </tbody>
            </table>
          </body>
        </html>
      `
    });
};

export const sendGuestConfirmationEmail = async (email: string) => {
    await resend.emails.send({
      from: "UniRoom <no-reply@uniroom.app>",
      to: email,
      subject: "¡Solicitud de chat enviada! 🎉",
      html: `
        <!DOCTYPE html>
        <html lang="es">
          <head>
            <meta charset="UTF-8">
          </head>
          <body>
            <table align="center" style="border:1px solid #eaeaea; border-radius:5px; max-width:465px; padding:20px; margin-top:40px;">
              <tbody>
                <tr>
                  <td>
                    <img src="https://i.imgur.com/ruySKLQ.png" alt="Logo" height="130" style="display:block; margin:0 auto;">
                    <h1 style="text-align:center; font-size:24px;">Solicitud Enviada ✨</h1>
                    <p style="font-size:14px; text-align:center;">Tu solicitud de chat fue enviada exitosamente. Ahora, solo falta un pequeño paso: ¡espera a que el propietario revise y acepte la solicitud!</p>
                    <p style="font-size:14px; text-align:center;">Gracias por confiar en UniRoom. 🫶</p>
                  </td>
                </tr>
              </tbody>
            </table>
          </body>
        </html>
      `
    });
};
