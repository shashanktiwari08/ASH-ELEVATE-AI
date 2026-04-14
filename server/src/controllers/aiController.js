// Phase 2: AI Core Development Framework
const Recipe = require('../models/Recipe');
const Inventory = require('../models/Inventory');
const PurchaseOrder = require('../models/PurchaseOrder');
const AIChatMessage = require('../models/AIChatMessage');
const Event = require('../models/Event');
const Booking = require('../models/Booking');
const Invoice = require('../models/Invoice');

// Placeholder for Google Vision API / ChatGPT Vision OCR
exports.processMenuDocument = async (req, res) => {
    try {
        const { eventId, companyId, documentUrl } = req.body;
        // In a real scenario, we send documentUrl to an AI service here.
        // It returns an array of dishes like: ["Shahi Paneer", "Dal Makhani", "Naan"]
        
        // Mocked AI Response
        const detectedDishes = ["Shahi Paneer", "Dal Makhani"];
        
        res.json({ 
            success: true, 
            message: "Menu successfully scanned by AI.",
            dishesDetected: detectedDishes 
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Auto-Procurement logic: Calculates required raw materials based on Guest Count
exports.generateAutoProcurement = async (req, res) => {
    try {
        const { eventId, companyId, totalGuests, selectedDishes } = req.body;
        
        // 1. Fetch the recipes for the dishes
        const recipes = await Recipe.find({ dishName: { $in: selectedDishes }, Company_ID: companyId });
        
        const procurementMap = {};
        let totalEstimatedCost = 0;

        // 2. Extrapolate ingredients based on total Guests
        recipes.forEach(recipe => {
            recipe.ingredients.forEach(ing => {
                const totalRequired = ing.quantityRequired * totalGuests;
                
                if (procurementMap[ing.inventoryId]) {
                    procurementMap[ing.inventoryId].quantity += totalRequired;
                } else {
                    procurementMap[ing.inventoryId] = {
                        inventoryId: ing.inventoryId,
                        quantity: totalRequired,
                        unit: ing.unit
                    };
                }
            });
        });

        // 3. Assemble Purchase Order
        const procurementList = Object.values(procurementMap).map(item => ({
            inventoryId: item.inventoryId,
            quantityToBuy: item.quantity,
            unit: item.unit,
            estimatedCost: 0 // Will map to live market rates later
        }));

        const newPO = await PurchaseOrder.create({
            Company_ID: companyId,
            Event_ID: eventId,
            procurementList,
            status: 'Auto-Generated',
            totalEstimatedCost
        });

        res.json({
            success: true,
            message: "Auto-Procurement list successfully generated.",
            data: newPO
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Exclusive AI Chat Support for subscribed customers
exports.handleClientChat = async (req, res) => {
    try {
        const { message, sessionId, clientId, businessId, eventId, bookingId } = req.body;
        
        // Save user message
        await AIChatMessage.create({
            businessId,
            clientId,
            sessionId,
            role: 'user',
            content: message,
            context: { eventId, bookingId }
        });
        
        // Gather context data
        let context = {};
        if (eventId) {
            context.event = await Event.findById(eventId).select('Status Event_Date Location Event_Type');
        }
        if (bookingId) {
            context.booking = await Booking.findById(bookingId).select('totalAmount status services');
        }
        
        // AI Response Logic - Enterprise Hospitality Assistant
        const aiResponse = generateAIResponse(message, context);
        
        // Save AI response
        await AIChatMessage.create({
            businessId,
            clientId,
            sessionId,
            role: 'assistant',
            content: aiResponse,
            context: { eventId, bookingId }
        });
        
        res.json({
            success: true,
            response: aiResponse,
            timestamp: new Date()
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const generateAIResponse = (userMessage, context = {}) => {
    const message = userMessage.toLowerCase();
    
    // Event Status Queries
    if (message.includes('status') || message.includes('कहां') || message.includes('कब') || message.includes('progress') || message.includes('प्रोग्रेस')) {
        if (context.event) {
            const statusMessages = {
                'Upcoming': '🚀 आपका इवेंट जल्द शुरू होगा। टीम तैयारी कर रही है।',
                'Team on Way': '🚗 हमारी टीम रास्ते में है! वह जल्द ही आपके स्थान पर पहुंच जाएगी।',
                'Reached Site': '✅ टीम साइट पर पहुंच गई है। तैयारियां शुरू हो चुकी हैं।',
                'Prep Started': '👨‍🍳 तैयारियां जोरों पर है। सब कुछ समय पर होगा।',
                'Service Live': '🎉 सेवा शुरू हो चुकी है। मौजा लीजिए!',
                'Completed': '✅ इवेंट सफलतापूर्वक पूरा हो गया है। आपका बहुत बहुत धन्यवाद!'
            };
            return statusMessages[context.event.Status] || 'आपका इवेंट ठीक समय पर चल रहा है।';
        }
        return 'मैं आपको अपनी इवेंट की लाइव स्टेटस बता सकता हूं। कृपया इवेंट आईडी शेयर करें।';
    }
    
    // Payment Queries
    if (message.includes('payment') || message.includes('पेमेंट') || message.includes('बिल') || message.includes('invoice')) {
        if (context.booking) {
            return `💰 आपकी बुकिंग का कुल बिल ₹${context.booking.totalAmount} है।\nस्टेटस: ${context.booking.status}\n\nपेमेंट के लिए कोई सहायता चाहिए तो बताइए।`;
        }
        return 'आप अपनी बुकिंग आईडी डालकर बिल और पेमेंट की जानकारी ले सकते हैं।';
    }
    
    // Menu/Food queries
    if (message.includes('menu') || message.includes('खाना') || message.includes('food') || message.includes('डिश')) {
        return '🍽️ हमारे मेन्यू में सभी प्रकार के व्यंजन उपलब्ध हैं। आप अपनी पसंद का मेन्यू चुन सकते हैं। किसी खास डिश के बारे में पूछना चाहें तो बताइए।';
    }
    
    // Booking queries
    if (message.includes('book') || message.includes('बुक') || message.includes('order') || message.includes('आर्डर')) {
        return '📅 नई बुकिंग के लिए आप हमारी टीम को 8800878545 पर कॉल कर सकते हैं या वेबसाइट पर जा सकते हैं। हम 24 घंटे उपलब्ध हैं।';
    }
    
    // Complaints/Support
    if (message.includes('problem') || message.includes('समस्या') || message.includes('issue') || message.includes('गड़बड़')) {
        return '🙏 हमें खेद है कि आपको किसी तरह की परेशानी हुई है। कृपया अपनी समस्या विस्तार से बताइए, हम तुरंत इसे हल करेंगे। आप कॉल भी कर सकते हैं: 8800878545';
    }
    
    // Timing queries
    if (message.includes('time') || message.includes('समय') || message.includes('कितना समय')) {
        return '⏰ हमारी टीम हमेशा समय पर पहुंचती है। अगर किसी कारण से देरी हो रही है तो हम आपको पहले से ही सूचित कर देंगे।';
    }
    
    // Default greeting responses
    if (message.includes('hello') || message.includes('hi') || message.includes('नमस्ते') || message.includes('हैलो')) {
        return '🙏 नमस्ते! AEROSKY HOSPITALITY में आपका स्वागत है। मैं आपकी AI सहायक हूं। आप किसी भी प्रकार की मदद ले सकते हैं - इवेंट स्टेटस, बुकिंग, पेमेंट, या कोई अन्य प्रश्न।';
    }
    
    // Default response
    return '🙏 आपका संदेश प्राप्त हुआ है। मैं जल्द ही आपकी मदद करूंगा। तुरंत सहायता के लिए कॉल करें: 8800878545';
};

exports.getChatHistory = async (req, res) => {
    try {
        const { sessionId, businessId } = req.params;
        
        const messages = await AIChatMessage.find({
            businessId,
            sessionId
        }).sort({ timestamp: 1 }).limit(50);
        
        res.json({
            success: true,
            messages
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
