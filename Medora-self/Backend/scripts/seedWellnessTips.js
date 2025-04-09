const mongoose = require('mongoose');
const WellnessTip = require('../models/WellnessTip');

const wellnessTips = [
  {
    title: 'Stay Hydrated',
    content: 'Drink at least 8 glasses of water daily to maintain optimal health.',
    category: 'nutrition',
    tags: ['hydration', 'health']
  },
  {
    title: 'Daily Exercise',
    content: 'Aim for 30 minutes of moderate exercise most days of the week.',
    category: 'fitness',
    tags: ['exercise', 'fitness']
  },
  {
    title: 'Mindfulness Meditation',
    content: 'Practice 10 minutes of meditation daily to reduce stress and improve mental health.',
    category: 'mental_health',
    tags: ['meditation', 'stress-relief']
  },
  // Add more tips...
];

async function seedWellnessTips() {
  try {
    await WellnessTip.deleteMany({});
    await WellnessTip.insertMany(wellnessTips);
    console.log('Wellness tips seeded successfully');
  } catch (error) {
    console.error('Error seeding wellness tips:', error);
  } finally {
    mongoose.connection.close();
  }
}

seedWellnessTips();