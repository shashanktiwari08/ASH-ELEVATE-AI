const express = require('express');
const router = express.Router();
const { 
  getEvents, 
  getEventById, 
  createEvent, 
  updateEventStatus,
  updateChecklistItem,
  getEventProgress
} = require('../controllers/eventController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/', getEvents);
router.get('/:id', getEventById);
router.post('/', createEvent);
router.patch('/:id/status', updateEventStatus);
router.patch('/:id/checklist/:itemId', updateChecklistItem);
router.get('/:id/progress', getEventProgress);

// Public endpoint for client dashboard (no auth required)
router.get('/:id/client-progress', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .select('Status progress statusTimeline Event_Date Location Event_Type');
    
    if (!event) return res.status(404).json({ message: 'Event not found' });
    
    res.json({
      status: event.Status,
      progress: event.progress,
      timeline: event.statusTimeline.map(t => ({
        status: t.status,
        timestamp: t.timestamp
      })),
      eventDate: event.Event_Date,
      location: event.Location,
      eventType: event.Event_Type
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;