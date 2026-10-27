const express = require("express");
const { MongoClient, ObjectId } = require("mongodb");
const bodyparser = require("body-parser");
const bCrypt = require("bcrypt");
const jwtToken = require("jsonwebtoken");
const cors = require("cors");
const sampleMembersData = require("./sampleMembersData");

const app = express();
app.use(cors());
app.use(bodyparser.json());

const uri = "mongodb://localhost:27017";
const client = new MongoClient(uri);
const port = 5000;

// Same secret your teacher used. Change it for anything real.
const SECRET = process.env.JWT_SECRET || "MY_SECRET_TOKEN";
// Whoever signs up with this email becomes an admin
const ADMIN_EMAILS = [
    (process.env.ADMIN_EMAIL || "").toLowerCase(),
    "admin@theclubhub.com",
    "admin@flexi.com",
].filter(Boolean);
const isAdminEmail = (email) => ADMIN_EMAILS.includes(String(email || "").trim().toLowerCase());

const DB_NAME = process.env.DB_NAME || "the_club_hub";
const myDb = client.db(DB_NAME);
const students = () => myDb.collection("student");      // teacher's collection = our users
const events = () => myDb.collection("events");
const announcements = () => myDb.collection("announcements");

async function ensureDbMigration() {
    try {
        const targetDb = client.db(DB_NAME);
        const collections = ["student", "events", "announcements"];

        // Migrate from legacy storeroom or sitSecB if the_club_hub is brand new
        for (const legacyName of ["storeroom", "sitSecB"]) {
            const legacyDb = client.db(legacyName);
            for (const col of collections) {
                const countInTarget = await targetDb.collection(col).countDocuments();
                if (countInTarget === 0) {
                    const countInLegacy = await legacyDb.collection(col).countDocuments();
                    if (countInLegacy > 0) {
                        const docs = await legacyDb.collection(col).find().toArray();
                        await targetDb.collection(col).insertMany(docs);
                        console.log(`Auto-migrated ${docs.length} documents from ${legacyName}.${col} to ${DB_NAME}.${col}`);
                    }
                }
            }
        }

        // Sanitize any announcements with FLEXI in storeroom
        const announcementsCol = targetDb.collection("announcements");
        const allAnnouncements = await announcementsCol.find().toArray();
        for (const a of allAnnouncements) {
            if (/flexi/i.test(a.title) || /flexi/i.test(a.message)) {
                await announcementsCol.updateOne(
                    { _id: a._id },
                    {
                        $set: {
                            title: (a.title || "").replace(/flexi\s*club\s*hub/gi, "The Club Hub").replace(/flexi/gi, "The"),
                            message: (a.message || "").replace(/flexi\s*club\s*hub/gi, "The Club Hub").replace(/flexi/gi, "The"),
                        },
                    }
                );
            }
        }

        // Ensure indexes in storeroom
        await targetDb.collection("student").createIndex({ email: 1 }, { unique: true }).catch(() => {});
        await targetDb.collection("events").createIndex({ date: 1 }).catch(() => {});
        await targetDb.collection("announcements").createIndex({ createdAt: -1 }).catch(() => {});

        // Update Admin name to "The Club Hub Admin" across database
        await targetDb.collection("student").updateMany(
            { status: "admin", name: { $in: ["Club Admin", "Admin"] } },
            { $set: { name: "The Club Hub Admin" } }
        );
        await targetDb.collection("events").updateMany(
            { "createdBy.name": "Club Admin" },
            { $set: { "createdBy.name": "The Club Hub Admin" } }
        );
        await targetDb.collection("announcements").updateMany(
            { "createdBy.name": "Club Admin" },
            { $set: { "createdBy.name": "The Club Hub Admin" } }
        );

        // Auto-seed admin if missing
        let admin = (await targetDb.collection("student").findOne({ email: "admin@theclubhub.com" })) ||
                    (await targetDb.collection("student").findOne({ email: "admin@flexi.com" }));
        if (!admin) {
            const result = await targetDb.collection("student").insertOne({
                name: "The Club Hub Admin",
                age: 30,
                email: "admin@theclubhub.com",
                password: await bCrypt.hash("admin123", 10),
                status: "admin",
                createdAt: new Date(),
            });
            admin = { _id: result.insertedId, name: "The Club Hub Admin" };
            console.log("Auto-created admin account -> admin@theclubhub.com / admin123");
        }
        const by = { _id: String(admin._id), name: admin.name };

        // Auto-seed sample events if empty
        if ((await targetDb.collection("events").countDocuments()) === 0) {
            const day = 24 * 60 * 60 * 1000;
            const at = (days, hour) => {
                const d = new Date(Date.now() + days * day);
                d.setHours(hour, 0, 0, 0);
                return d;
            };
            const base = { createdBy: by, attendees: [], createdAt: new Date() };
            await targetDb.collection("events").insertMany([
                { ...base, title: "Web Dev Workshop", description: "Hands-on intro to React and Node.", date: at(3, 15), location: "Lab 2", category: "Workshop", capacity: 40 },
                { ...base, title: "Inter-College Cricket Match", description: "Friendly match on the main ground.", date: at(6, 9), location: "Main Ground", category: "Sports", capacity: 0 },
                { ...base, title: "Cultural Night", description: "Music, dance and drama performances.", date: at(10, 18), location: "Auditorium", category: "Cultural", capacity: 200 },
                { ...base, title: "Hackathon 24h", description: "Build something cool in teams of four.", date: at(14, 10), location: "Innovation Hub", category: "Technical", capacity: 60 },
                { ...base, title: "Freshers Meet", description: "Meet the club members and seniors.", date: at(-5, 16), location: "Seminar Hall", category: "Social", capacity: 0 },
            ]);
            console.log("Auto-created default campus events.");
        }

        // Auto-seed sample announcements if empty
        if ((await targetDb.collection("announcements").countDocuments()) === 0) {
            await targetDb.collection("announcements").insertMany([
                { title: "Welcome to The Club Hub!", message: "Browse events, join the ones you like, and check this page for updates.", createdBy: by, createdAt: new Date() },
                { title: "Hackathon registrations open", message: "Join the Hackathon 24h event from the Events page. Seats are limited.", createdBy: by, createdAt: new Date() },
            ]);
            console.log("Auto-created default announcements.");
        }

        // Auto-seed ~250 valid collegiate sample members if collection is small
        const studentCol = targetDb.collection("student");
        const studentCount = await studentCol.countDocuments();
        if (studentCount < 50 && Array.isArray(sampleMembersData)) {
            const defaultPasswordHash = await bCrypt.hash("Member@123", 10);
            const now = Date.now();
            const docs = [];
            for (let i = 0; i < sampleMembersData.length; i++) {
                const name = sampleMembersData[i];
                const cleanSlug = name.toLowerCase().replace(/[^a-z0-9]/g, ".");
                const email = `${cleanSlug}.${i + 101}@student.clubhub.edu`;
                const daysAgo = 85 - Math.floor((i / sampleMembersData.length) * 82);
                const hourOffset = (i % 24) * 3600 * 1000;
                docs.push({
                    name: name,
                    email: email,
                    password: defaultPasswordHash,
                    age: 18 + (i % 5),
                    status: "user",
                    createdAt: new Date(now - (daysAgo * 24 * 3600 * 1000) - hourOffset),
                });
            }
            const existingEmails = new Set(
                (await studentCol.find({}, { projection: { email: 1 } }).toArray()).map((u) => u.email)
            );
            const toInsert = docs.filter((d) => !existingEmails.has(d.email));
            if (toInsert.length > 0) {
                await studentCol.insertMany(toInsert);
                console.log(`Auto-seeded ${toInsert.length} valid sample members into ${DB_NAME}.`);
            }
        }

        // Auto-seed club leaders
        const CLUB_LEADERS_DATA = [
            { name: "Alex Vance", email: "alex.vance@clubhub.internal" },
            { name: "Kevin Miller", email: "kevin.miller@clubhub.internal" },
            { name: "Marcus Ray", email: "marcus.ray@clubhub.internal" },
            { name: "Maya Sen", email: "maya.sen@clubhub.internal" },
            { name: "Sarah Jenkins", email: "sarah.jenkins@clubhub.internal" },
            { name: "Neil Deshmukh", email: "neil.deshmukh@clubhub.internal" },
            { name: "Priya Sharma", email: "priya.s@clubhub.internal" },
            { name: "Rohit Verma", email: "rohit.v@clubhub.internal" },
            { name: "Tanvi Joshi", email: "tanvi.j@clubhub.internal" },
            { name: "Aaron Paul", email: "aaron.p@clubhub.internal" },
            { name: "Devansh Mehta", email: "devansh.m@clubhub.internal" },
            { name: "Sneha Patil", email: "sneha.p@clubhub.internal" },
            { name: "Kabir Khanna", email: "kabir.k@clubhub.internal" },
            { name: "Ananya Roy", email: "ananya.r@clubhub.internal" },
            { name: "Sameer Khan", email: "sameer.k@clubhub.internal" },
            { name: "Riya Gupta", email: "riya.g@clubhub.internal" },
            { name: "Ishaan Grover", email: "ishaan.g@clubhub.internal" },
            { name: "Kritika Nair", email: "kritika.n@clubhub.internal" },
        ];
        const leaderHash = await bCrypt.hash("Leader@123", 10);
        for (const l of CLUB_LEADERS_DATA) {
            const hasLeader = await studentCol.findOne({ email: l.email });
            if (!hasLeader) {
                await studentCol.insertOne({
                    name: l.name,
                    email: l.email,
                    password: leaderHash,
                    age: 21,
                    status: "user",
                    createdAt: new Date("2026-08-01T10:00:00Z"),
                });
            }
        }
    } catch (err) {
        console.error("Migration notice:", err.message);
    }
}

async function connectToMongoDb() {
    try {
        await client.connect();
        console.log(`Connection successfully done with mongodb (database: ${DB_NAME})`);
        await ensureDbMigration();

        app.listen(port, () => {
            console.log("Server started at port : " + port);
        });
    } catch (error) {
        console.log("Connection failed to mongodb : " + error);
    }
}

// Only connect when run directly (lets the file be imported for testing)
if (require.main === module) {
    connectToMongoDb();
}

const CATEGORIES = ["Workshop", "Sports", "Cultural", "Technical", "Social"];

// ---------- helpers ----------

// "status" field of the student document is used as the role: "admin" or "user"
const roleOf = (u) => (u.status === "admin" ? "admin" : "user");
const createdAtOf = (u) =>
    u.createdAt || (u._id && u._id.getTimestamp ? u._id.getTimestamp() : null);

const publicUser = (u) => ({
    id: String(u._id),
    name: u.name,
    email: u.email,
    role: roleOf(u),
    createdAt: createdAtOf(u),
});

const validId = (id) => ObjectId.isValid(id) && String(id).length === 24;

// Verifies the JWT, loads the user from MongoDB and puts it on req.user
async function protect(req, res, next) {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;
    if (!token) return res.status(401).send({ msg: "Not authorized, no token" });

    let payload;
    try {
        payload = jwtToken.verify(token, SECRET);
    } catch {
        return res.status(401).send({ msg: "Not authorized, token invalid or expired" });
    }

    if (!validId(payload.id)) return res.status(401).send({ msg: "Invalid token" });
    const user = await students().findOne({ _id: new ObjectId(payload.id) });
    if (!user) return res.status(401).send({ msg: "User no longer exists" });

    req.user = user;
    next();
}

function adminOnly(req, res, next) {
    if (roleOf(req.user) === "admin") return next();
    res.status(403).send({ msg: "Admin access required" });
}

// Validates event input. Returns { error } or { data }
function cleanEvent(body, partial = false) {
    const data = {};

    if (!partial || body.title !== undefined) {
        const title = String(body.title || "").trim();
        if (!title) return { error: "Title is required" };
        if (title.length > 100) return { error: "Title is too long (max 100)" };
        data.title = title;
    }
    if (!partial || body.date !== undefined) {
        const d = new Date(body.date);
        if (!body.date || isNaN(d.getTime())) return { error: "A valid date is required" };
        data.date = d;
    }
    if (!partial || body.location !== undefined) {
        data.location = String(body.location || "").trim() || "TBA";
    }
    if (!partial || body.description !== undefined) {
        const desc = String(body.description || "").trim();
        if (desc.length > 1000) return { error: "Description is too long (max 1000)" };
        data.description = desc;
    }
    if (!partial || body.category !== undefined) {
        const cat = body.category || "Social";
        if (!CATEGORIES.includes(cat)) return { error: "Invalid category" };
        data.category = cat;
    }
    if (!partial || body.capacity !== undefined) {
        const cap = Number(body.capacity || 0);
        if (!Number.isInteger(cap) || cap < 0) return { error: "Capacity must be 0 or more" };
        data.capacity = cap;
    }
    return { data };
}

const canModify = (ev, user) =>
    roleOf(user) === "admin" || (ev.createdBy && ev.createdBy._id === String(user._id));

async function findEvent(id) {
    if (!validId(id)) return null;
    return events().findOne({ _id: new ObjectId(id) });
}

// ---------- teacher's original routes (kept, now admin-protected) ----------

app.get("/getall", protect, adminOnly, async (req, res) => {
    const data = await students().find().toArray();
    res.send(
        data.map((u) => ({
            _id: u._id,
            name: u.name,
            age: u.age,
            email: u.email,
            status: roleOf(u),
            createdAt: createdAtOf(u),
        }))
    );
});

app.get("/get/:id", protect, adminOnly, async (req, res) => {
    if (!validId(req.params.id)) return res.status(400).send({ msg: "Invalid id" });
    const student = await students().findOne({ _id: new ObjectId(req.params.id) });
    if (!student) return res.status(404).send({ msg: "Student Id Invalid" });
    res.send({ ...publicUser(student), age: student.age, status: roleOf(student) });
});

// Signup
app.post("/create", async (req, res) => {
    const { name, age, password, email } = req.body;

    if (!name || !email || !password) {
        return res.status(400).send({ msg: "Name, email and password are required" });
    }
    if (String(name).trim().length < 2) {
        return res.status(400).send({ msg: "Name must be at least 2 characters" });
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) {
        return res.status(400).send({ msg: "Please enter a valid email" });
    }
    if (String(password).length < 6) {
        return res.status(400).send({ msg: "Password must be at least 6 characters" });
    }

    const cleanEmail = String(email).trim().toLowerCase();
    const exists = await students().findOne({ email: cleanEmail });
    if (exists) return res.status(409).send({ msg: "An account with this email already exists" });

    const hashedPass = await bCrypt.hash(password, 10);

    // The role is decided here, never taken from the request
    const status = isAdminEmail(cleanEmail) ? "admin" : "user";

    const response = await students().insertOne({
        name: String(name).trim(),
        age: age === undefined || age === "" ? null : Number(age),
        status: status,
        password: hashedPass,
        email: cleanEmail,
        createdAt: new Date(),
    });

    res.status(201).send({ msg: "Account created successfully", insertedId: response.insertedId });
});

// Login
app.post("/login", async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).send({ msg: "Email and password are required" });
    }

    const student = await students().findOne({ email: String(email).trim().toLowerCase() });

    if (student == null) {
        return res.status(422).send({ msg: "Invalid Email" });
    }

    const isCorrect = await bCrypt.compare(password, student.password);
    if (!isCorrect) {
        return res.status(401).send({ msg: "Invalid email or password" });
    }

    const payLoad = {
        id: String(student._id),
        subject: student.name,
        email: student.email,
        role: roleOf(student),
    };

    res.send({ jwtToken: jwtToken.sign(payLoad, SECRET, { expiresIn: "7d" }) });
});

// Change a user's role (admin only)
app.put("/update/:id", protect, adminOnly, async (req, res) => {
    const id = req.params.id;
    if (!validId(id)) return res.status(400).send({ msg: "Invalid id" });

    const student = await students().findOne({ _id: new ObjectId(id) });
    if (student == null) return res.status(404).send({ msg: "Student Id Invalid" });

    const { status } = req.body;
    if (!["admin", "user"].includes(status)) {
        return res.status(400).send({ msg: "Status must be 'admin' or 'user'" });
    }
    if (id === String(req.user._id)) {
        return res.status(400).send({ msg: "You cannot change your own role" });
    }

    const response = await students().updateOne({ _id: new ObjectId(id) }, { $set: { status: status } });
    res.send(response);
});

// Delete a user (admin only)
app.delete("/delete/:id", protect, adminOnly, async (req, res) => {
    const id = req.params.id;
    if (!validId(id)) return res.status(400).send({ msg: "Invalid id" });
    if (id === String(req.user._id)) {
        return res.status(400).send({ msg: "You cannot delete yourself" });
    }

    const response = await students().deleteOne({ _id: new ObjectId(id) });
    if (response.deletedCount === 0) return res.status(404).send({ msg: "Student Id Invalid" });
    res.send(response);
});

// ---------- new: current user, members, stats ----------

app.get("/me", protect, (req, res) => {
    res.send({ user: publicUser(req.user) });
});

// Member directory (no emails)
app.get("/members", protect, async (req, res) => {
    const all = await students().find().toArray();
    const members = all
        .map((u) => ({ _id: u._id, name: u.name, role: roleOf(u), createdAt: createdAtOf(u) }))
        .sort((a, b) => {
            // Admin always at the very top
            if (a.role === "admin" && b.role !== "admin") return -1;
            if (a.role !== "admin" && b.role === "admin") return 1;
            if (a.role === "admin" && b.role === "admin") {
                return new Date(a.createdAt) - new Date(b.createdAt);
            }
            // Regular members: newest joined member shows at top (directly below admin)
            return new Date(b.createdAt) - new Date(a.createdAt);
        });
    res.send({ members });
});

app.get("/stats", protect, async (req, res) => {
    const now = Date.now();
    const uid = String(req.user._id);
    const [allEvents, allAnnouncements, allStudents] = await Promise.all([
        events().find().toArray(),
        announcements().find().toArray(),
        students().find().toArray(),
    ]);
    const upcoming = allEvents.filter((e) => new Date(e.date).getTime() >= now);
    res.send({
        events: allEvents.length,
        upcoming: upcoming.length,
        announcements: allAnnouncements.length,
        members: allStudents.length,
        joined: upcoming.filter((e) => (e.attendees || []).includes(uid)).length,
    });
});

// ---------- new: events ----------

app.get("/events", protect, async (req, res) => {
    const all = await events().find().toArray();
    all.sort((a, b) => new Date(a.date) - new Date(b.date));
    res.send({ events: all });
});

app.post("/events", protect, async (req, res) => {
    const { error, data } = cleanEvent(req.body);
    if (error) return res.status(400).send({ msg: error });

    const doc = {
        ...data,
        createdBy: { _id: String(req.user._id), name: req.user.name },
        attendees: [],
        createdAt: new Date(),
    };
    const response = await events().insertOne(doc);
    res.status(201).send({ event: { ...doc, _id: response.insertedId } });
});

app.put("/events/:id", protect, async (req, res) => {
    const ev = await findEvent(req.params.id);
    if (!ev) return res.status(404).send({ msg: "Event not found" });
    if (!canModify(ev, req.user)) {
        return res.status(403).send({ msg: "You can only edit your own events" });
    }

    const { error, data } = cleanEvent(req.body, true);
    if (error) return res.status(400).send({ msg: error });

    await events().updateOne({ _id: ev._id }, { $set: data });
    res.send({ event: { ...ev, ...data } });
});

app.delete("/events/:id", protect, async (req, res) => {
    const ev = await findEvent(req.params.id);
    if (!ev) return res.status(404).send({ msg: "Event not found" });
    if (!canModify(ev, req.user)) {
        return res.status(403).send({ msg: "You can only delete your own events" });
    }
    await events().deleteOne({ _id: ev._id });
    res.send({ msg: "Event deleted" });
});

app.post("/events/:id/join", protect, async (req, res) => {
    const ev = await findEvent(req.params.id);
    if (!ev) return res.status(404).send({ msg: "Event not found" });

    const uid = String(req.user._id);
    const attendees = ev.attendees || [];

    if (attendees.includes(uid)) return res.status(400).send({ msg: "You already joined this event" });
    if (ev.capacity > 0 && attendees.length >= ev.capacity) {
        return res.status(400).send({ msg: "This event is full" });
    }
    if (new Date(ev.date).getTime() < Date.now()) {
        return res.status(400).send({ msg: "This event has already happened" });
    }

    const updated = [...attendees, uid];
    await events().updateOne({ _id: ev._id }, { $set: { attendees: updated } });
    res.send({ event: { ...ev, attendees: updated } });
});

app.post("/events/:id/leave", protect, async (req, res) => {
    const ev = await findEvent(req.params.id);
    if (!ev) return res.status(404).send({ msg: "Event not found" });

    const uid = String(req.user._id);
    const updated = (ev.attendees || []).filter((a) => a !== uid);
    await events().updateOne({ _id: ev._id }, { $set: { attendees: updated } });
    res.send({ event: { ...ev, attendees: updated } });
});

// ---------- new: announcements ----------

app.get("/announcements", protect, async (req, res) => {
    const all = await announcements().find().toArray();
    all.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.send({ announcements: all });
});

app.post("/announcements", protect, adminOnly, async (req, res) => {
    const title = String(req.body.title || "").trim();
    const message = String(req.body.message || "").trim();
    if (!title || !message) return res.status(400).send({ msg: "Title and message are required" });
    if (title.length > 120) return res.status(400).send({ msg: "Title is too long (max 120)" });
    if (message.length > 2000) return res.status(400).send({ msg: "Message is too long (max 2000)" });

    const doc = {
        title,
        message,
        createdBy: { _id: String(req.user._id), name: req.user.name },
        createdAt: new Date(),
    };
    const response = await announcements().insertOne(doc);
    res.status(201).send({ announcement: { ...doc, _id: response.insertedId } });
});

app.delete("/announcements/:id", protect, adminOnly, async (req, res) => {
    if (!validId(req.params.id)) return res.status(400).send({ msg: "Invalid id" });
    const response = await announcements().deleteOne({ _id: new ObjectId(req.params.id) });
    if (response.deletedCount === 0) return res.status(404).send({ msg: "Announcement not found" });
    res.send({ msg: "Announcement deleted" });
});

// ---------- fallbacks ----------

app.use((req, res) => res.status(404).send({ msg: "Route not found" }));

// Express 5 forwards errors from async handlers here
app.use((err, req, res, next) => { // eslint-disable-line no-unused-vars
    console.error(err);
    res.status(500).send({ msg: "Server error" });
});

module.exports = app;
