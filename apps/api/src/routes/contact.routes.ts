import { Router } from "express";
import { getAdminNotifyEmail, renderEmail, sendEmail } from "../lib/mailer";
import { prisma } from "../lib/prisma";
import { contactLimiter } from "../middleware/rateLimit";
import { validateBody } from "../middleware/validate";
import { contactMessageSchema } from "../validators/contact.validators";

const router = Router();

// Formulario de contacto público. Los mensajes se guardan en base de datos y
// se revisan desde el panel de administración; no dependemos de un buzón de
// email externo para no perder consultas.
router.post("/", contactLimiter, validateBody(contactMessageSchema), async (req, res, next) => {
  try {
    const { name, email, message } = req.body;

    await prisma.contactMessage.create({ data: { name, email, message } });
    console.log(`[CONTACTO] Nuevo mensaje de ${email}`);
    const admin = getAdminNotifyEmail();
    if (admin) {
      const mail = renderEmail({
        title: `Nuevo mensaje de ${name}`,
        paragraphs: ["Alguien escribió desde el formulario de contacto de la web."],
        rows: [["Nombre", name], ["Email", email], ["Mensaje", message]],
      });
      await sendEmail({ to: admin, subject: `Contacto web: ${name}`, ...mail });
    }

    res.status(201).json({ message: "Gracias por escribirnos. Te responderemos pronto." });
  } catch (err) {
    next(err);
  }
});

export default router;
