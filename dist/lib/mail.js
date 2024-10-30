"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendRefusedNotificationEmail = exports.sendApprovalNotificationEmail = exports.sendGuestConfirmationEmail = exports.sendLandlordNotificationEmail = void 0;
const resend_1 = require("resend");
const resend = new resend_1.Resend(process.env.RESEND_API_KEY);
const domain = process.env.NEXT_PUBLIC_APP_URL;
const sendLandlordNotificationEmail = async (email, roomTitle) => {
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
          <table align="center" style="border-width:1px; border-style:solid; border-color:#eaeaea; border-radius:5px; margin-top:40px; max-width:465px; padding:20px;">
            <tbody>
              <tr>
                <td>
                  <img src="https://i.imgur.com/ruySKLQ.png" alt="Logo" height="130" style="display:block;margin:0 auto;">
                  <h1 style="text-align:center; font-size:24px;">Nueva solicitud de reserva 🏠</h1><br></br>
                  <p style="font-size:14px;">¡Hola! Parece que alguien quiere mudarse y ha solicitado chatear contigo sobre tu habitación: "${roomTitle}"</p>
                    <table align="center" width="100%" border="0" cellPadding="0" cellSpacing="0" role="presentation" style="text-align:center;margin-top:32px;margin-bottom:32px">
                      <tbody>
                       <tr>
                        <td><a href="${domain}/dashboard" style="background-color:rgb(0,0,0);border-radius:0.25rem;color:rgb(255,255,255);font-size:12px;font-weight:600;text-decoration-line:none;text-align:center;padding-left:1.25rem;padding-right:1.25rem;padding-top:0.75rem;padding-bottom:0.75rem;line-height:100%;text-decoration:none;display:inline-block;max-width:100%;mso-padding-alt:0px;padding:12px 20px 12px 20px" target="_blank"><span><!--[if mso]><i style="mso-font-width:500%;mso-text-raise:18" hidden>&#8202;&#8202;</i><![endif]--></span><span style="max-width:100%;display:inline-block;line-height:120%;mso-padding-alt:0px;mso-text-raise:9px">Ir al Dashboard</span><span><!--[if mso]><i style="mso-font-width:500%" hidden>&#8202;&#8202;&#8203;</i><![endif]--></span></a></td>
                      </tr>
                     </tbody>
                  </table>
                  <p style="font-size:14px;">UniRoom, haciendo que cada chat cuente 🌟</p>
                </td>
              </tr>
            </tbody>
          </table>
        </body>
      </html>`
    });
};
exports.sendLandlordNotificationEmail = sendLandlordNotificationEmail;
const sendGuestConfirmationEmail = async (email) => {
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
          <table align="center" style="border-width:1px; border-style:solid; border-color:#eaeaea; border-radius:5px; margin-top:40px; max-width:465px; padding:20px;">
            <tbody>
              <tr>
                <td>
                  <img src="https://i.imgur.com/ruySKLQ.png" alt="Logo" height="130" style="display:block;margin:0 auto;">
                  <h1 style="text-align:center; font-size:24px;">Solicitud Enviada ✨</h1><br></br>
                   <p style="font-size:19px;">Tu solicitud de chat fue enviada exitosamente 🥳</p>
                   <p style="font-size:14px;">Ahora, solo falta un pequeño paso: ¡espera a que el propietario revise y acepte la solicitud! 🫠</p>
                    <br></br>
                  <p style="font-size:14px;">Gracias por confiar en UniRoom. 🫶</p>
                </td>
              </tr>
            </tbody>
          </table>
        </body>
      </html>`
    });
};
exports.sendGuestConfirmationEmail = sendGuestConfirmationEmail;
const sendApprovalNotificationEmail = async (email, roomTitle) => {
    await resend.emails.send({
        from: "UniRoom <no-reply@uniroom.app>",
        to: email,
        subject: "¡Solicitud de chat aprobada! 🎉",
        html: `
         <!DOCTYPE html>
      <html lang="es">
        <head>
          <meta charset="UTF-8">
        </head>
        <body>
          <table align="center" style="border-width:1px; border-style:solid; border-color:#eaeaea; border-radius:5px; margin-top:40px; max-width:465px; padding:20px;">
            <tbody>
              <tr>
                <td>
                  <img src="https://i.imgur.com/ruySKLQ.png" alt="Logo" height="130" style="display:block;margin:0 auto;">
                  <h1 style="text-align:center; font-size:24px;">¡Tu solicitud fue aprobada! 🎊<br></br></h1>
                   <p style="font-size:19px;">El propietario ha aprobado tu solicitud de chat para la habitación: "${roomTitle}"</p>
                  <p style="font-size:14px;">Puedes iniciar la conversación y resolver cualquier duda que tengas. 🗣️💬</p>
                    <br></br>
                  <p style="font-size:14px;">¡Gracias por elegir UniRoom! 🏠✨</p>
                </td>
              </tr>
            </tbody>
          </table>
        </body>
      </html>
        `
    });
};
exports.sendApprovalNotificationEmail = sendApprovalNotificationEmail;
const sendRefusedNotificationEmail = async (email, roomTitle) => {
    await resend.emails.send({
        from: "UniRoom <no-reply@uniroom.app>",
        to: email,
        subject: "Actualización sobre tu solicitud de habitación 🏠",
        html: `
      <!DOCTYPE html>
      <html lang="es">
        <head>
          <meta charset="UTF-8">
        </head>
        <body>
          <table align="center" style="border-width:1px; border-style:solid; border-color:#eaeaea; border-radius:5px; margin-top:40px; max-width:465px; padding:20px;">
            <tbody>
              <tr>
                <td>
                  <img src="https://i.imgur.com/ruySKLQ.png" alt="Logo" height="130" style="display:block;margin:0 auto;">
                  <h1 style="text-align:center; font-size:24px;">Lo sentimos, tu solicitud no fue aprobada 😞</h1>
                  <p style="font-size:19px;">El propietario ha decidido no aprobar tu solicitud para la habitación: "${roomTitle}"</p>
                  <p style="font-size:14px;">Sabemos que esto puede ser decepcionante, pero no te desanimes. Hay muchas opciones disponibles en UniRoom, y estamos aquí para ayudarte a encontrar el lugar ideal. 🌟</p>
                  <br>
                  <p style="font-size:14px;">Gracias por confiar en UniRoom y ¡sigue buscando, tu próximo hogar te espera! 🏠✨</p>
                </td>
              </tr>
            </tbody>
          </table>
        </body>
      </html>
    `
    });
};
exports.sendRefusedNotificationEmail = sendRefusedNotificationEmail;
