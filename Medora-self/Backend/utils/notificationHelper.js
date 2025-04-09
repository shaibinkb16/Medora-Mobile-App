/* const { Expo } = require("expo-server-sdk");
const User = require("../models/User");

const expo = new Expo();

/**
 * Send push notification to a user, with optional delay.
 * @param {string} userId - The user's ID.
 * @param {string} title - Notification title.
 * @param {string} message - Notification body.
 * @param {number} [delay=0] - Delay in milliseconds (default is 0 for instant notifications).
 */
/*exports.pushNotification = async (userId, title, message, delay = 0) => {

  try {
    const user = await User.findById(userId);
    if (!user || !user.expoPushToken) {
      console.warn(`❌ No Expo push token found for User: ${userId}`);
      return;
    }

    const pushToken = user.expoPushToken;

    if (!Expo.isExpoPushToken(pushToken)) {
      console.warn(`❌ Invalid Expo push token for User: ${userId}`);
      return;
    }

    const sendNotification = async () => {
      const messages = [
        {
          to: pushToken,
          sound: "default",
          title,
          body: message,
          data: { userId, title, message }, // Include extra data if needed
        },
      ];

      const receipts = await expo.sendPushNotificationsAsync(messages);
      console.log(`✅ Push notification sent to User: ${userId}`, receipts);
    };

    if (delay > 0) {
      console.log(`⏳ Notification for User: ${userId} will be sent in ${delay} ms`);
      setTimeout(sendNotification, delay);
    } else {
      await sendNotification();
    }
  } catch (error) {
    console.error("❌ Error sending push notification:", error);
  }
};
 */


const { Expo } = require("expo-server-sdk");
const User = require("../models/User");
const Notification = require("../models/Notification");

const expo = new Expo();

exports.pushNotification = async (userId, title, message, delay = 0) => {
  try {
    const user = await User.findById(userId);
    if (!user || !user.expoPushToken) {
      console.warn(`❌ No Expo push token for user: ${userId}`);
      return;
    }

    const pushToken = user.expoPushToken;

    if (!Expo.isExpoPushToken(pushToken)) {
      console.warn(`❌ Invalid Expo token for user: ${userId}`);
      return;
    }

    const send = async () => {
      // ✅ Save notification to DB first
      const notification = new Notification({
        userId,
        title,
        message,
        role: "user", // optional, based on your schema
      });
      await notification.save();
      console.log(`📦 Notification saved to DB for ${user.email}`);

      // ✅ Send push notification
      const messages = [{
        to: pushToken,
        sound: "default",
        title,
        body: message,
        data: { title, message },
      }];

      const receipts = await expo.sendPushNotificationsAsync(messages);
      console.log(`✅ Push sent to ${user.email}`, receipts);
    };

    delay > 0 ? setTimeout(send, delay) : await send();
  } catch (error) {
    console.error("❌ Push error:", error);
  }
};
