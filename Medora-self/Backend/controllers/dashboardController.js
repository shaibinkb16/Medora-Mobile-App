const HealthMetric = require('../models/HealthMetric');
const Notification = require('../models/Notification');
const WellnessTip = require('../models/WellnessTip');

exports.getDashboardData = async (req, res) => {
  try {
    const userId = req.user.id;

    // Fetch health metrics
    const healthMetrics = await HealthMetric.find({ user: userId })
      .sort({ measured_date: -1 })
      .limit(5)
      .lean();

    // Format metrics with trends (for demo, static trend)
    const formattedMetrics = healthMetrics.map((metric) => ({
      type: metric.metric_type,
      value: metric.metric_value,
      unit: 'units', // Optional: you can pull from DB
      trend: 'stable', // Optional: implement trend logic if needed
    }));

    // Fetch notifications
    const notifications = await Notification.find({ user: userId })
      .sort({ created_at: -1 })
      .limit(5)
      .lean();

    const formattedNotifications = notifications.map((n) => ({
      id: n._id,
      title: n.notification_title,
      description: n.notification_text,
      type: n.notification_type,
      priority: n.priority || 'low',
    }));

    // Fetch wellness tips
    const wellnessTips = await WellnessTip.find().limit(5).lean();

    const formattedTips = wellnessTips.map((tip) => ({
      id: tip._id,
      title: tip.tip_title,
      content: tip.tip_content,
      category: tip.category || 'general',
    }));

    res.status(200).json({
      healthMetrics: formattedMetrics,
      notifications: formattedNotifications,
      wellnessTips: formattedTips,
    });
  } catch (err) {
    console.error('DashboardController Error:', err);
    res.status(500).json({ message: 'Server Error' });
  }
};
