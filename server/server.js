const express = require("express");
const { MongoClient, ObjectId } = require("mongodb");
const bodyparser = require("body-parser");
const bCrypt = require("bcrypt");
const jwtToken = require("jsonwebtoken");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(bodyparser.json());

const uri = "mongodb://localhost:27017";
const client = new MongoClient(uri);
const port = 5000;

// Same secret your teacher used. Change it for anything real.
const SECRET = process.env.JWT_SECRET || "MY_SECRET_TOKEN";
// Whoever signs up with this email becomes an admin
const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || "admin@flexi.com").toLowerCase();

async function connectToMongoDb() {
    try {
        await client.connect();
        console.log("Connection successfully done with mongodb");

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

const myDb = client.db("sitSecB");
const students = () => myDb.collection("student");      // teacher's collection = our users
const events = () => myDb.collection("events");
const announcements = () => myDb.collection("announcements");

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
    const status = cleanEmail === ADMIN_EMAIL ? "admin" : "user";

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
        .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
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
