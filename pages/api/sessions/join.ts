// pages/api/sessions/join.ts
import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Méthode non autorisée" });
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

    return res.status(200).json(session);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Erreur serveur" });
  }
}
