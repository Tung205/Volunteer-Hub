
import mongoose from 'mongoose';
import { Registration } from './backend/src/models/registration.model.js';
import { User } from './backend/src/models/user.model.js';
import { Event } from './backend/src/models/event.model.js';
import dotenv from 'dotenv';

dotenv.config({ path: './backend/.env' });

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/volunteer-hub';

async function checkRegistrations() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log("Connected to DB");

        console.log("Checking Pending Registrations...");
        const pending = await Registration.find({ status: 'PENDING' }).lean();

        console.log(`Found ${pending.length} pending registrations.`);

        for (const reg of pending) {
            console.log("--------------------------------------------------");
            console.log(`Registration ID: ${reg._id}`);
            console.log(`Event ID: ${reg.eventId}`);
            console.log(`Volunteer ID (Raw): ${reg.volunteerId}`);
            console.log(`Stored Name: '${reg.volunteerName}'`);

            // Allow manual check
            const user = await User.findById(reg.volunteerId).lean();
            if (user) {
                console.log(`-> User Found: Name='${user.name}', Email='${user.email}'`);
            } else {
                console.log("-> USER NOT FOUND in Users collection!");
            }

            // Check populate
            const populated = await Registration.findById(reg._id).populate('volunteerId', 'name email').lean();
            console.log("-> Populated volunteerId:", populated.volunteerId);
        }

    } catch (err) {
        console.error("Error:", err);
    } finally {
        await mongoose.disconnect();
    }
}

checkRegistrations();
