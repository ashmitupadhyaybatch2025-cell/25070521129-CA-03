// Run once:  npm run seed
// Adds an admin account plus sample events and announcements to MongoDB.
const { MongoClient } = require("mongodb");
const bCrypt = require("bcrypt");

const client = new MongoClient("mongodb://localhost:27017");

const day = 24 * 60 * 60 * 1000;
const at = (days, hour) => {
    const d = new Date(Date.now() + days * day);
    d.setHours(hour, 0, 0, 0);
    return d;
};

async function seed() {
    await client.connect();
    const dbName = process.env.DB_NAME || "storeroom";
    const db = client.db(dbName);

    let admin = (await db.collection("student").findOne({ email: "admin@theclubhub.com" })) || (await db.collection("student").findOne({ email: "admin@flexi.com" }));
    if (!admin) {
        const result = await db.collection("student").insertOne({
            name: "The Club Hub Admin",
            age: 30,
            email: "admin@theclubhub.com",
            password: await bCrypt.hash("admin123", 10),
            status: "admin",
            createdAt: new Date(),
        });
        admin = { _id: result.insertedId, name: "The Club Hub Admin" };
        console.log("Created admin  ->  admin@theclubhub.com / admin123");
    } else if (admin.name !== "The Club Hub Admin") {
        await db.collection("student").updateOne({ _id: admin._id }, { $set: { name: "The Club Hub Admin" } });
        admin.name = "The Club Hub Admin";
    }
    const by = { _id: String(admin._id), name: admin.name };

    if ((await db.collection("events").countDocuments()) === 0) {
        const base = { createdBy: by, attendees: [], createdAt: new Date() };
        await db.collection("events").insertMany([
            { ...base, title: "Web Dev Workshop", description: "Hands-on intro to React and Node.", date: at(3, 15), location: "Lab 2", category: "Workshop", capacity: 40 },
            { ...base, title: "Inter-College Cricket Match", description: "Friendly match on the main ground.", date: at(6, 9), location: "Main Ground", category: "Sports", capacity: 0 },
            { ...base, title: "Cultural Night", description: "Music, dance and drama performances.", date: at(10, 18), location: "Auditorium", category: "Cultural", capacity: 200 },
            { ...base, title: "Hackathon 24h", description: "Build something cool in teams of four.", date: at(14, 10), location: "Innovation Hub", category: "Technical", capacity: 60 },
            { ...base, title: "Freshers Meet", description: "Meet the club members and seniors.", date: at(-5, 16), location: "Seminar Hall", category: "Social", capacity: 0 },
        ]);
        console.log("Added sample events");
    }

    if ((await db.collection("announcements").countDocuments()) === 0) {
        await db.collection("announcements").insertMany([
            { title: "Welcome to The Club Hub!", message: "Browse events, join the ones you like, and check this page for updates.", createdBy: by, createdAt: new Date() },
            { title: "Hackathon registrations open", message: "Join the Hackathon 24h event from the Events page. Seats are limited.", createdBy: by, createdAt: new Date() },
        ]);
        console.log("Added sample announcements");
    }

    await client.close();
    console.log(`Seed complete for database: ${dbName}`);
}

seed().catch((e) => {
    console.error(e);
    process.exit(1);
});
