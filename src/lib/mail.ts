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


export const sendApprovalNotificationEmail = async (email: string, roomTitle: string) => {
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

export const sendRefusedNotificationEmail = async (email: string, roomTitle: string) => {
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

export const sendBetaEmail = async (name: string, email: string) => {
  await resend.emails.send({
    from: "UniRoom <newsletter@uniroom.app>",
    to: email,
    subject: "¡Gracias por su interés en UniRoom! 🏡✨",
    html: `
      <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
          <html dir="ltr" lang="en">

  <head>
    <link rel="preload" as="image" href="https://i.imgur.com/uKIVq1K.png" />
    <link rel="preload" as="image" href="https://i.imgur.com/qzOLE9P.png" />
    <link rel="preload" as="image" href="https://react-email-demo-3kjjfblod-resend.vercel.app/static/yelp-footer.png" />
    <meta content="text/html; charset=UTF-8" http-equiv="Content-Type" />
    <meta name="x-apple-disable-message-reformatting" /><!--$-->
  </head>

  <body style="background-color:#fff;font-family:-apple-system,BlinkMacSystemFont,&quot;Segoe UI&quot;,Roboto,Oxygen-Sans,Ubuntu,Cantarell,&quot;Helvetica Neue&quot;,sans-serif">
    <table align="center" width="100%" border="0" cellPadding="0" cellSpacing="0" role="presentation" style="max-width:37.5em">
      <tbody>
        <tr style="width:100%">
          <td>
            <table align="center" width="100%" border="0" cellPadding="0" cellSpacing="0" role="presentation" style="padding:30px 20px">
              <tbody>
                <tr>
                  <td><img src="https://i.imgur.com/QePbXJh.png" style="display:block;outline:none;border:none;text-decoration:none" /></td>
                </tr>
              </tbody>
            </table>
            <table align="center" width="100%" border="0" cellPadding="0" cellSpacing="0" role="presentation" style="border:1px solid rgb(0,0,0, 0.1);border-radius:3px;overflow:hidden">
              <tbody>
                <tr>
                  <td>
                    <table align="center" width="100%" border="0" cellPadding="0" cellSpacing="0" role="presentation">
                      <tbody style="width:100%">
                        <tr style="width:100%"><img src="https://i.imgur.com/qzOLE9P.png" style="display:block;outline:none;border:none;text-decoration:none;max-width:100%" width="620" /></tr>
                      </tbody>
                    </table>
                    <table align="center" width="100%" border="0" cellPadding="0" cellSpacing="0" role="presentation" style="padding:20px;padding-bottom:0">
                      <tbody style="width:100%">
                        <tr style="width:100%">
                          <td data-id="__react-email-column">
                            <h1 style="font-size:32px;font-weight:bold;text-align:center">Hola <!-- -->${name}<!-- -->,</h1>
                            <h2 style="font-size:26px;font-weight:bold;text-align:center">Gracias por tu interés por UniRoom 🫶</h2>
                            <p style="font-size:16px;line-height:24px;margin:16px 0"><b>Fecha de lanzamiento oficial: </b>15 de Noviembre de 2024</p>
                            <p style="font-size:16px;line-height:24px;margin:16px 0;margin-top:-5px"><b>Plataformas: </b>Play Store y Apple Store</p>
                            <p style="font-size:16px;line-height:24px;margin:16px 0">Pronto te enviaremos novedades y los links de descarga.</p>
                            <p style="font-size:16px;line-height:24px;margin:16px 0;margin-top:-5px">Saludos, equipo de UniRoom</p>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </td>
                </tr>
              </tbody>
            </table>
            <table align="center" width="100%" border="0" cellPadding="0" cellSpacing="0" role="presentation" style="padding:45px 0 0 0">
              <tbody>
                <tr>
                  <td><img src="https://react-email-demo-3kjjfblod-resend.vercel.app/static/yelp-footer.png" style="display:block;outline:none;border:none;text-decoration:none;max-width:100%" width="620" /></td>
                </tr>
              </tbody>
            </table>
            <p style="font-size:12px;line-height:24px;margin:16px 0;text-align:center;color:rgb(0,0,0, 0.7)">© 2024 | UniRoom, Tula de Allende, Hidalgo, 42836, México | uniroom.app</p>
          </td>
        </tr>
      </tbody>
    </table><!--/$-->
  </body>
            </html>
    `
  });
};