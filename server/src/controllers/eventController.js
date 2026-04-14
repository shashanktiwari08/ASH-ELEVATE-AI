const Event = require('../models/Event');

exports.getEvents = async (req, res) => {
  try {
    const events = await Event.find({ businessId: req.user.businessId })
      .populate('Client_ID staffChecklist.verifiedBy statusTimeline.updatedBy')
      .sort({ Event_Date: -1 });
    
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getEventById = async (req, res) => {
  try {
    const event = await Event.findOne({ 
      _id: req.params.id, 
      businessId: req.user.businessId 
    }).populate('Client_ID staffChecklist.verifiedBy statusTimeline.updatedBy');
    
    if (event) res.json(event);
    else res.status(404).json({ message: 'Event not found' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createEvent = async (req, res) => {
  try {
    const event = await Event.create({
      ...req.body,
      businessId: req.user.businessId
    });
    
    await event.populate('Client_ID');
    
    res.status(201).json(event);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.updateEventStatus = async (req, res) => {
  try {
    const { status, location, notes } = req.body;
    
    const event = await Event.findOneAndUpdate(
      { _id: req.params.id, businessId: req.user.businessId },
      { 
        Status: status,
        $push: {
          statusTimeline: {
            status,
            updatedBy: req.user._id,
            location,
            notes
          }
        }
      },
      { new: true }
    ).populate('Client_ID statusTimeline.updatedBy');
    
    if (!event) return res.status(404).json({ message: 'Event not found' });
    
    res.json(event);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.updateChecklistItem = async (req, res) => {
  try {
    const { checklistItemId, isCompleted, photoProofUrl, notes } = req.body;
    
    const event = await Event.findOne({ 
      _id: req.params.id, 
      businessId: req.user.businessId 
    });
    
    if (!event) return res.status(404).json({ message: 'Event not found' });
    
    const checklistItem = event.staffChecklist.id(checklistItemId);
    if (!checklistItem) return res.status(404).json({ message: 'Checklist item not found' });
    
    checklistItem.isCompleted = isCompleted;
    checklistItem.photoProofUrl = photoProofUrl;
    checklistItem.completedAt = new Date();
    checklistItem.verifiedBy = req.user._id;
    checklistItem.notes = notes;
    
    await event.save();
    await event.populate('staffChecklist.verifiedBy');
    
    res.json(event);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getEventProgress = async (req, res) => {
  try {
    const event = await Event.findOne({ 
      _id: req.params.id, 
      businessId: req.user.businessId 
    }).select('Status progress statusTimeline staffChecklist');
    
    if (!event) return res.status(404).json({ message: 'Event not found' });
    
    // Calculate checklist completion
    const totalChecklist = event.staffChecklist.length;
    const completedChecklist = event.staffChecklist.filter(c => c.isCompleted).length;
    const checklistPercentage = totalChecklist > 0 ? Math.round((completedChecklist / totalChecklist) * 100) : 100;
    
    res.json({
      status: event.Status,
      progress: event.progress,
      checklistPercentage,
      totalChecklist,
      completedChecklist,
      timeline: event.statusTimeline
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};