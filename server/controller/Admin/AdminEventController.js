const AdminService = require("../../service/AdminService");

class AdminEventController{
    getAllEvents = async (req, res) => {
        const events = await AdminService.getAllEvents();
        res.status(200).json({message: 'Events retrieved successfully', data: events});
    }
    addEvent = async (req, res) => {
        try {
            if (req.file) {
                req.body.image = await AdminService.uploadImage(req.file);
            }
            if(req.body.etat){
                req.body.etat = req.body.etat === 'true';
            }
            const user = await AdminService.getAdmin(req.user.id);
            req.body.author = user.firstname + ' ' + user.lastname;
            console.log('author : ',req.body.author)

            const event = await AdminService.addEvent(req.body);
            res.status(200).json({message: 'Event created successfully', data: event});
        } catch (error) {
            return res.status(400).json({message: error.message});
        }
    }
    updateEvent = async (req, res) => {
        try {
            console.log(req.body)
            const eventId = req.params.id;
            if (!eventId) {
                throw new Error("Event not found");
            }
            if (req.file) {
                req.body.image = await AdminService.uploadImage(req.file);
            }
            if(req.body.etat){
                req.body.etat = req.body.etat === 'true';
            }
            const updatedEvent = await AdminService.updateEvent(eventId, req.body);
            if (!updatedEvent) {
                throw new Error("Event not found");
            } else {
                res.status(200).json({message: "Event updated successfully", data: updatedEvent});
            }
        } catch (error) {
            return res.status(400).json({message: error.message});
        }
    }
    deleteEvent = async (req, res) => {
        const eventId = req.params.id;
        try {
            const deleteById = await AdminService.deleteEvent(eventId);
            if (!deleteById) {
                throw new Error("Event not found");
            } else {
                res.status(200).json({message: "Event deleted successfully", data: deleteById});
            }
        } catch (error) {
            return res.status(400).json({message: error.message});
        }
    }
}

module.exports = new AdminEventController();