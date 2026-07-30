'use strict';

const sharesService = require('./shares.service');
const Share = require('../../models/Share.model');
const File = require('../../models/File.model');

async function createShare(req, res, next) {
  try {
    const { resourceId, resourceType = 'file', expiresInDays } = req.body;
    const share = await sharesService.createShareLink(req.user.userId, resourceId, resourceType, expiresInDays);
    res.status(201).json(share);
  } catch (error) {
    next(error);
  }
}

async function getShare(req, res, next) {
  try {
    const { token } = req.params;
    const data = await sharesService.resolveShare(token);
    res.json(data);
  } catch (error) {
    next(error);
  }
}

async function revokeShare(req, res, next) {
  try {
    const { id } = req.params;
    await sharesService.revokeShare(req.user.userId, id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}

async function listMyShares(req, res, next) {
  try {
    const shares = await Share.find({ createdBy: req.user.userId, isRevoked: false })
      .sort({ createdAt: -1 })
      .lean();

    // Populate resource name/size/mimeType for file shares
    const enriched = await Promise.all(
      shares.map(async (share) => {
        let resource = null;
        if (share.resourceType === 'file') {
          resource = await File.findById(share.resourceId)
            .select('name size mimeType')
            .lean();
        }
        return { ...share, resource };
      })
    );

    res.json({ success: true, data: enriched });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createShare,
  getShare,
  revokeShare,
  listMyShares,
};
