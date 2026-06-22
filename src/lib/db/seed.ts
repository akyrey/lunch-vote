import { createClient } from "@libsql/client/http";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./schema";
import * as dotenv from "process";

// Load env vars manually for tsx script
const TURSO_DATABASE_URL = process.env.TURSO_DATABASE_URL!;
const TURSO_AUTH_TOKEN = process.env.TURSO_AUTH_TOKEN;
const ADMIN_EMAILS = (process.env.ADMIN_EMAILS ?? "").split(",").map((e) => e.trim()).filter(Boolean);

if (!TURSO_DATABASE_URL) {
  console.error("TURSO_DATABASE_URL is required");
  process.exit(1);
}

const client = createClient({ url: TURSO_DATABASE_URL, authToken: TURSO_AUTH_TOKEN });
const db = drizzle(client, { schema });

const SEED_PLACES = [
  {
    name: "Trattoria da Enzo",
    cuisine: "Roman trattoria",
    priceTier: "$$" as const,
    avgPrice: 18,
    walkingMinutes: 7,
    dietaryFlags: [] as string[],
    tags: ["classic", "pasta"],
    colorHue: 18,
    address: "Via dei Vascellari 29",
    openingHours: "12:00–15:30",
    isActive: true,
  },
  {
    name: "Pizzeria ai Marmi",
    cuisine: "Roman pizza",
    priceTier: "$$" as const,
    avgPrice: 14,
    walkingMinutes: 5,
    dietaryFlags: ["vegetarian"],
    tags: ["pizza", "lively"],
    colorHue: 8,
    address: "Viale di Trastevere 53",
    openingHours: "12:00–15:00",
    isActive: true,
  },
  {
    name: "Bonci Pizzarium",
    cuisine: "Pizza al taglio",
    priceTier: "$" as const,
    avgPrice: 9,
    walkingMinutes: 12,
    dietaryFlags: ["vegetarian"],
    tags: ["quick", "cheap"],
    colorHue: 36,
    address: "Via della Meloria 43",
    openingHours: "11:00–22:00",
    isActive: true,
  },
  {
    name: "Sushi Sen",
    cuisine: "Japanese",
    priceTier: "$$$" as const,
    avgPrice: 29,
    walkingMinutes: 9,
    dietaryFlags: ["glutenFree"],
    tags: ["sushi", "treat"],
    colorHue: 200,
    address: "Via dei Gracchi 87",
    openingHours: "12:30–15:00",
    isActive: true,
  },
  {
    name: "Mercato Centrale",
    cuisine: "Food hall",
    priceTier: "$$" as const,
    avgPrice: 15,
    walkingMinutes: 4,
    dietaryFlags: ["vegetarian", "vegan", "glutenFree"],
    tags: ["variety", "fast"],
    colorHue: 150,
    address: "Via Giovanni Giolitti 36",
    openingHours: "08:00–24:00",
    isActive: true,
  },
  {
    name: "Ginger Sapori",
    cuisine: "Healthy bowls",
    priceTier: "$$" as const,
    avgPrice: 17,
    walkingMinutes: 3,
    dietaryFlags: ["vegetarian", "vegan", "glutenFree"],
    tags: ["healthy", "bowls"],
    colorHue: 95,
    address: "Via Borgognona 43",
    openingHours: "09:00–23:00",
    isActive: true,
  },
  {
    name: "Roscioli Salumeria",
    cuisine: "Italian deli",
    priceTier: "$$$" as const,
    avgPrice: 30,
    walkingMinutes: 8,
    dietaryFlags: [] as string[],
    tags: ["deli", "wine"],
    colorHue: 340,
    address: "Via dei Giubbonari 21",
    openingHours: "12:30–16:00",
    isActive: true,
  },
  {
    name: "Pastificio Guerra",
    cuisine: "Fresh pasta",
    priceTier: "$" as const,
    avgPrice: 5,
    walkingMinutes: 10,
    dietaryFlags: ["vegetarian"],
    tags: ["cheap", "cult"],
    colorHue: 45,
    address: "Via della Croce 8",
    openingHours: "13:00–21:00",
    isActive: true,
  },
];

async function seed() {
  console.log("🌱 Seeding database…");

  // Insert places
  for (const place of SEED_PLACES) {
    await db.insert(schema.places).values(place).onConflictDoNothing();
  }
  console.log(`✅ Inserted ${SEED_PLACES.length} places`);

  // Mark admin users
  if (ADMIN_EMAILS.length > 0) {
    console.log(`👑 Admin emails configured: ${ADMIN_EMAILS.join(", ")}`);
    console.log(
      "   (isAdmin will be set on first sign-in via the Auth.js createUser event)"
    );
  }

  console.log("✅ Seed complete");
  process.exit(0);
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
