const router = require('express').Router();
const LandingModel = require('../models/Landing');

const { createError, getPlace, itemsPerPage } = require('../utils');

let skip = 0;

router.get('/', async (req, res, next) => {
  try {
    const { minimum_mass, from, to } = req.query;
    let { page } = req.query;

    if (page) {
      skip = (Number(page) - 1) * itemsPerPage;
    } else {
      page = 1;
    }

    if (!minimum_mass && !from && !to) {
      const result = await LandingModel.find({}, { _id: 0 }).limit(itemsPerPage).skip(skip).lean();

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

    if (minimum_mass) {
      const result = await LandingModel.find(
        { $expr: { $gte: [{ $toDouble: '$mass' }, Number(minimum_mass)] } },
        { _id: 0, name: 1, mass: 1 }
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
        query = { $expr: { $gte: [{ $toDate: '$year' }, { $toDate: `${from}-01-01` }] } };
      } else if (!from && to) {
        query = { $expr: { $lte: [{ $toDate: '$year' }, { $toDate: `${to}-01-01` }] } };
      } else {
        query = {
          $and: [
            { $expr: { $gte: [{ $toDate: '$year' }, { $toDate: `${from}-01-01` }] } },
            { $expr: { $lte: [{ $toDate: '$year' }, { $toDate: `${to}-01-01` }] } },
          ],
        };
      }

      const result = await LandingModel.find(query, {
        _id: 0,
        name: 1,
        mass: 1,
        year: { $year: { $toDate: '$year' } },
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

router.get('/mass/:mass', async (req, res, next) => {
  try {
    const { mass } = req.params;
    let { page } = req.query;

    if (page) {
      skip = (Number(page) - 1) * itemsPerPage;
    } else {
      page = 1;
    }

    const result = await LandingModel.find(
      { $expr: { $eq: [{ $toDouble: '$mass' }, Number(mass)] } },
      { _id: 0, name: 1, mass: 1 }
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
  } catch (error) {
    next(error);
  }
});

router.get('/recclass/:recclass', async (req, res, next) => {
  try {
    const { recclass } = req.params;
    let { page } = req.query;

    if (page) {
      skip = (Number(page) - 1) * itemsPerPage;
    } else {
      page = 1;
    }

    const result = await LandingModel.find(
      { recclass: { $eq: recclass } },
      { _id: 0, name: 1, recclass: 1 }
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
  } catch (error) {
    next(error);
  }
});

router.get('/:name', async (req, res, next) => {
  try {
    const { name } = req.params;
    let { page } = req.query;

    if (page) {
      skip = (Number(page) - 1) * itemsPerPage;
    } else {
      page = 1;
    }

    const result = await LandingModel.find(
      { $expr: { $eq: [{ $toLower: '$name' }, name.toLowerCase()] } },
      { reclong: 1, reclat: 1, _id: 0 }
    );

    const nextPage = result.length < itemsPerPage ? null : Number(page) + 1;

    if (!result[0]) {
      createError('Name of landing not found', 404);
      return;
    }

    const { reclong, reclat } = result[0];

    // console.log(lat[0].reclat);
    const place = await getPlace(reclong, reclat);
    const placeName = place.features[0].place_name;

    res.status(200).json({
      data: {
        placeName,
      },
      nextPage,
      status: 'ok',
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
