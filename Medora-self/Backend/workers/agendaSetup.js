const Agenda = require('agenda');
const { pushNotification } = require('../utils/notificationHelper');
const Notification = require('../models/Notification');

const createAgenda = (mongoUri) => {
  const agenda = new Agenda({
    db: {
      address: mongoUri,
      collection: 'agendaJobs',
      options: {
        useNewUrlParser: true,
        useUnifiedTopology: true
      }
    },
    processEvery: '30 seconds'
  });

  agenda.define('send notification', async (job) => {
    const { userId, title, message, reminderId } = job.attrs.data;
    
    try {
      await pushNotification(userId, title, message);
      await Notification.findOneAndUpdate(
        { reminderId },
        { isSent: true, sentAt: new Date() }
      );
      console.log(`Notification sent for reminder ${reminderId}`);
      await job.remove();
    } catch (error) {
      console.error(`Failed to send notification for reminder ${reminderId}:`, error);
      if (job.attrs.failCount >= 3) await job.remove();
    }
  });

  agenda.on('ready', () => {
    agenda.start();
    console.log('Agenda scheduler started');
  });

  process.on('SIGTERM', async () => await gracefulShutdown(agenda));
  process.on('SIGINT', async () => await gracefulShutdown(agenda));

  return agenda;
};

async function gracefulShutdown(agenda) {
  console.log('Stopping agenda scheduler...');
  await agenda.stop();
  console.log('Agenda scheduler stopped');
  process.exit(0);
}

module.exports = createAgenda;