const Notification = require('../models/Notification');

// Create Notification
exports.createNotification = async (req, res) => {
  try {
    const { message, userId } = req.body;

    
    if (!message || !userId) {
      return res.status(400).send('Message and userId are required.');
    }

    const note = new Notification({ message, userId });
    await note.save();

    res.redirect('/notifications'); 
  } catch (err) {
    console.error('Error creating notification:', err);
    res.status(500).send('Error creating notification');
  }
};


// View Notifications
exports.viewNotifications = async (req, res) => {
  try {
    
    const userId = req.session.userId;

    const notifications = await Notification.find({ userId }).sort({ date: -1 });
    res.render('notifications/index', { notifications });
  } catch (err) {
    console.error('Error fetching notifications:', err);
    res.status(500).send('Error fetching notifications');
  }
};
