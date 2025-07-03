import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";
import { getUserFromRequest } from "@/lib/auth";

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Méthode non autorisée" });
  }

  const user = await getUserFromRequest(req);
  if (!user) {
    return res.status(401).json({ error: "Non authentifié" });
  }

  const { code } = req.body;

  if (!code || typeof code !== "number") {
    return res.status(400).json({ error: "Code de session invalide" });
  }

  try {
    const session = await prisma.session.findUnique({
      where: { code },
    });

    if (!session) {
      return res.status(404).json({ error: "Session introuvable" });
    }

    const existing = await prisma.sessionUser.findFirst({
      where: {
        sessionId: session.id,
        userId: user.userId,
      },
    });

    if (existing) {
      return res.status(200).json({ message: "Déjà membre", sessionId: session.id });
    }

    await prisma.sessionUser.create({
      data: {
        sessionId: session.id,
        userId: user.userId,
      },
    });

    return res.status(200).json({ message: "Rejoint avec succès", sessionId: session.id });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Erreur serveur" });
  }
}
