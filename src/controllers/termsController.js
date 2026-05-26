const TermsModel = require('../models/termsModel');
const { ErrorTypes } = require('../middleware/errorHandler');

const termsController = {
    async getLatest(req, res, next) {
        try {
            const terms = await TermsModel.getLatest();
            res.json({ success: true, terms });
        } catch (error) {
            next(error);
        }
    },

    async updateTerms(req, res, next) {
        try {
            const { content } = req.body;
            if (!content) {
                throw ErrorTypes.ValidationError('Content is required');
            }

            const terms = await TermsModel.create(content);
            res.status(201).json({ success: true, terms });
        } catch (error) {
            next(error);
        }
    },

    async checkStatus(req, res, next) {
        try {
            const userId = req.user.userId;
            const latestTerms = await TermsModel.getLatest();
            
            if (!latestTerms) {
                return res.json({ success: true, accepted: true });
            }

            const accepted = await TermsModel.checkAcceptance(userId, latestTerms.id);
            res.json({ success: true, accepted, termsId: latestTerms.id });
        } catch (error) {
            next(error);
        }
    },

    async acceptTerms(req, res, next) {
        try {
            const userId = req.user.userId;
            const { termsId } = req.body;

            if (!termsId) {
                throw ErrorTypes.ValidationError('Terms ID is required');
            }

            await TermsModel.accept(userId, termsId);
            res.json({ success: true, message: 'Terms accepted successfully' });
        } catch (error) {
            next(error);
        }
    }
};

module.exports = termsController;
