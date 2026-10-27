// Script to populate ~250 valid collegiate sample members into MongoDB
const { MongoClient } = require("mongodb");
const bCrypt = require("bcrypt");
const sampleNames = require("./sampleMembersData");

const uri = process.env.MONGO_URI || "mongodb://localhost:27017";
const client = new MongoClient(uri);

async function seedMembers() {
    try {
        await client.connect();
        const dbName = process.env.DB_NAME || "the_club_hub";
        const db = client.db(dbName);
        const studentCol = db.collection("student");

        const existingCount = await studentCol.countDocuments();
        console.log(`Current member count in ${dbName}: ${existingCount}`);

        // Generate bcrypt hash once for efficiency
        const defaultPasswordHash = await bCrypt.hash("Member@123", 10);

        const now = Date.now();
        const docs = [];

        for (let i = 0; i < sampleNames.length; i++) {
            const name = sampleNames[i];
            const cleanSlug = name.toLowerCase().replace(/[^a-z0-9]/g, ".");
            const email = `${cleanSlug}.${i + 101}@student.clubhub.edu`;

            // Stagger createdAt between 85 days ago and 3 days ago
            // So any newly registered member (now) will be strictly newer than all sample members
            const daysAgo = 85 - Math.floor((i / sampleNames.length) * 82);
            const hourOffset = (i % 24) * 3600 * 1000;
            const createdAt = new Date(now - (daysAgo * 24 * 3600 * 1000) - hourOffset);

            const age = 18 + (i % 5); // 18 to 22 years old

            docs.push({
                name: name,
                email: email,
                password: defaultPasswordHash,
                age: age,
                status: "user",
                createdAt: createdAt,
            });
        }

        // Check for existing emails to avoid collisions
        const existingEmails = new Set(
            (await studentCol.find({}, { projection: { email: 1 } }).toArray()).map((u) => u.email)
        );

        const toInsert = docs.filter((d) => !existingEmails.has(d.email));

        if (toInsert.length > 0) {
            const res = await studentCol.insertMany(toInsert);
            console.log(`Successfully added ${res.insertedCount} sample members to ${dbName}.`);
        } else {
            console.log("All sample members already exist.");
        }

        const totalNow = await studentCol.countDocuments();
        console.log(`Total members now: ${totalNow}`);
    } catch (err) {
        console.error("Error seeding sample members:", err);
    } finally {
        await client.close();
    }
}

if (require.main === module) {
    seedMembers();
}

module.exports = seedMembers;
