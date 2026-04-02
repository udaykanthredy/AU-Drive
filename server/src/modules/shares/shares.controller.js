'use strict';

const sharesService = require('./shares.service');

async function createShare(req, res, next) {
  try {
    const { resourceId, resourceType = 'file', expiresInDays } = req.body;
    const share = await sharesService.createShareLink(req.user.userId, resourceId, resourceType, expiresInDays);
    res.status(201).json(share);
  } catch (error) {
    next(error);
  }
}

async function listShares(req, res, next) {
  try {
    const shares = await sharesService.listMyShares(req.user.userId);
    res.json({ success: true, data: shares });
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

module.exports = {
  createShare,
  listShares,
  getShare,
  revokeShare
};
