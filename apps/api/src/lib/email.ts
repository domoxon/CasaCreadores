// Envío de emails.
//
// El MVP no tiene un proveedor de email conectado. Mientras no lo haya, el
// backend NO puede exigir verificación por email: el usuario nunca recibiría
// el enlace y quedaría sin poder iniciar sesión. Por eso el flujo de registro
// consulta `isEmailDeliveryConfigured()` para decidir si exige verificación
// o si activa la cuenta directamente.
//
// Para activar la verificación real basta con configurar SMTP_HOST + SMTP_USER
// (y el resto de credenciales) e implementar el envío en `deliverEmail`.

export function isEmailDeliveryConfigured(): boolean {
  // ¡Cuidado! `sendVerificationEmail` todavía NO envía nada: es un stub que
  // solo escribe en los logs. Si esta función devuelve true sin un proveedor
  // real, cada registro queda bloqueado para siempre esperando un email que
  // nunca llega (exactamente lo que pasó en producción con SMTP_HOST/SMTP_USER
  // configurados en Railway). Hasta integrar un proveedor de verdad, la
  // verificación por email queda desactivada sin importar las variables.
  return false;
}

export async function sendVerificationEmail(to: string, verificationUrl: string): Promise<void> {
  if (!isEmailDeliveryConfigured()) {
    // Sin proveedor configurado dejamos rastro en logs para poder depurar,
    // pero el registro no depende de este enlace (ver auth.routes.ts).
    console.log("=".repeat(60));
    console.log(`[EMAIL NO CONFIGURADO] Verificación para: ${to}`);
    console.log(`Enlace de verificación: ${verificationUrl}`);
    console.log("=".repeat(60));
    return;
  }

  // Punto de extensión: integrar el proveedor real (nodemailer, Resend, SendGrid).
  console.log(`[EMAIL] Enviando verificación a ${to} -> ${verificationUrl}`);
}
