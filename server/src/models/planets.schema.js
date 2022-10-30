import mongoose from 'mongoose';

const planetsSchema = new mongoose.Schema({
    keplerName: {
        type: String,
        required: true
    }
});

// Connects the planetsSchema with the planets collection
export default mongoose.model('Planet', planetsSchema);