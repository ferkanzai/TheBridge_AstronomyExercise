const router = require('express').Router();
const NeaModel = require('../models/Neas');

const { checkDate, itemsPerPage, createError } = require('../utils');

let skip = 0;

router.get('/', async (req, res, next) => {
  try {
    const { orbit_class, from, to, pha } = req.query;
    let { page } = req.query;

    if (page) {
      skip = (Number(page) - 1) * itemsPerPage;
    } else {
      page = 1;
    }

    if (!orbit_class && !from && !to && !pha) {
      const result = await NeaModel.find({}, { _id: 0 }).limit(itemsPerPage).skip(skip).lean();

      const nextPage = result.length < itemsPerPage ? null : Number(page) + 1;

      res.status(200).json({
        data: {
          result,
        },
        nextPage,
        status: 'ok',
      });
      return;
    }

    if (orbit_class) {
      const result = await NeaModel.find(
        { $expr: { $eq: [{ $toLower: '$orbit_class' }, orbit_class.toLowerCase()] } },
        { _id: 0, designation: 1, period_yr: 1 }
      )
        .limit(itemsPerPage)
        .skip(skip)
        .lean();

      const nextPage = result.length < itemsPerPage ? null : Number(page) + 1;

      res.status(200).json({
        data: {
          result,
        },
        nextPage,
        status: 'ok',
      });
      return;
    }

    if (from || to) {
      let query = {};

      if (from && !to) {
        query = { $expr: { $gte: [{ $toDate: '$discovery_date' }, checkDate(from)] } };
      } else if (!from && to) {
        query = { $expr: { $lte: [{ $toDate: '$discovery_date' }, checkDate(to)] } };
      } else {
        query = {
          $and: [
            { $expr: { $gte: [{ $toDate: '$discovery_date' }, checkDate(from)] } },
            { $expr: { $lte: [{ $toDate: '$discovery_date' }, checkDate(to)] } },
          ],
        };
      }

      const result = await NeaModel.find(query, {
        _id: 0,
        designation: 1,
        period_yr: 1,
        discovery_date: 1,
      })
        .limit(itemsPerPage)
        .skip(skip)
        .lean();

      const nextPage = result.length < itemsPerPage ? null : Number(page) + 1;

      res.status(200).json({
        data: {
          result,
        },
        nextPage,
        status: 'ok',
      });
      return;
    }

    if (pha) {
      let query = {};

      if (Number(pha) === 1) {
        query = {
          $and: [
            { pha: { $eq: 'Y' } },
            { $expr: { $lte: [{ $toDouble: '$moid_au' }, 0.05] } },
            { $expr: { $lte: [{ $toDouble: '$h_mag' }, 22.0] } },
          ],
        };
      }

      if (Number(pha) === 0) {
        query = {
          $and: [
            { pha: { $eq: 'N' } },
            { $expr: { $gt: [{ $toDouble: '$moid_au' }, 0.05] } },
            { $expr: { $gt: [{ $toDouble: '$h_mag' }, 22.0] } },
          ],
        };
      }

      if (Number(pha) === -1) {
        query = { pha: { $eq: 'n/a' } };
      }

      const result = await NeaModel.find(query, {
        designation: 1,
        discovery_date: 1,
        period_yr: 1,
        _id: 0,
      })
        .limit(itemsPerPage)
        .skip(skip)
        .lean();

      const nextPage = result.length < itemsPerPage ? null : Number(page) + 1;

      res.status(200).json({
        data: {
          result,
        },
        nextPage,
        status: 'ok',
      });
      return;
    }
  } catch (error) {
    next(error);
  }
});

router.get('/periods', async (req, res, next) => {
  try {
    const { from, to } = req.query;
    let { page } = req.query;

    if (page) {
      skip = (Number(page) - 1) * itemsPerPage;
    } else {
      page = 1;
    }

    if (!from && !to) {
      createError('Bad Request: from and to query params missing', 400);
    }

    if (from || to) {
      let query = {};

      if (from && !to) {
        query = { $expr: { $gt: [{ $toDouble: '$period_yr' }, Number(from)] } };
      } else if (!from && to) {
        query = { $expr: { $lt: [{ $toDouble: '$period_yr' }, Number(to)] } };
      } else {
        query = {
          $and: [
            { $expr: { $gt: [{ $toDouble: '$period_yr' }, Number(from)] } },
            { $expr: { $lt: [{ $toDouble: '$period_yr' }, Number(to)] } },
          ],
        };
      }

      const result = await NeaModel.find(query, {
        _id: 0,
        designation: 1,
        period_yr: 1,
        discovery_date: 1,
      })
        .limit(itemsPerPage)
        .skip(skip)
        .lean();

      const nextPage = result.length < itemsPerPage ? null : Number(page) + 1;

      res.status(200).json({
        data: {
          result,
        },
        nextPage,
        status: 'ok',
      });
      return;
    }
  } catch (error) {
    next(error);
  }
});

module.exports = router;
