const router = require('express').Router();
const UserModel = require('../models/User');
const BadgesService = require('../services/badges.service');

const { calculateAge, createError, getByMod } = require('../utils/');

// UserModel.counterReset('affiliatedNumber', (err) => {});

router.get('/:affiliatedNumber/:mod?', async (req, res, next) => {
  try {
    const { affiliatedNumber, mod } = req.params;

    const mods = ['badges', 'neas', 'necs', 'points'];

    if (!mod) {
      const birthdate = await UserModel.find({ affiliatedNumber }, { birthdate: 1, _id: 0 });

      const age = birthdate.length
        ? calculateAge(birthdate[0].birthdate)
        : createError('User not found', 404);

      let result = await UserModel.find(
        { affiliatedNumber },
        {
          name: 1,
          occupation: 1,
          affiliatedNumber: 1,
          astronomicalPoints: 1,
          affiliationDate: 1,
          _id: 0,
        }
      ).lean();

      result = { ...result[0], age };

      res.status(200).json({
        data: {
          result,
        },
        status: 'ok',
      });
      return;
    }

    if (mods.includes(mod)) {
      if (mod === 'badges') {
        const result = await getByMod({ model: UserModel, affiliatedNumber, mod });

        res.status(200).json({
          data: {
            result,
          },
          status: 'ok',
        });
        return;
      }

      if (mod === 'neas') {
        const result = await getByMod({ model: UserModel, affiliatedNumber, mod });

        res.status(200).json({
          data: {
            result,
          },
          status: 'ok',
        });
        return;
      }

      if (mod === 'necs') {
        const result = await getByMod({ model: UserModel, affiliatedNumber, mod });

        res.status(200).json({
          data: {
            result,
          },
          status: 'ok',
        });
        return;
      }

      if (mod === 'points') {
        const result = await getByMod({ model: UserModel, affiliatedNumber, mod });

        res.status(200).json({
          data: {
            result,
          },
          status: 'ok',
        });
        return;
      }
    } else {
      createError('Endpoint not found', 404);
    }
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const { name, nickname, occupation, birthdate } = req.body;

    const result = await UserModel.create({
      name,
      nickname,
      occupation,
      birthdate,
    }).catch((err) => createError('Error registering user: nickname already in use ', 500));

    res.status(201).json({
      data: {
        result,
      },
      status: 'ok',
    });
  } catch (error) {
    next(error);
  }
});

router.put('/:affiliatedNumber/:mod?', async (req, res, next) => {
  try {
    const { affiliatedNumber, mod } = req.params;
    const { nickname, occupation, nea, nec } = req.body;

    const user = await BadgesService.getUser(affiliatedNumber);

    if (!user) {
      createError('User not found', 404);
    }

    const mods = ['neas', 'necs', 'delete', 'restart'];

    if (!mod) {
      if (!nickname && !occupation) {
        createError('Bad request: nickname or occupation nedeed to modify the user', 400);
      }

      let result = {};

      if (nickname && !occupation) {
        result = await UserModel.findOneAndUpdate(
          { affiliatedNumber },
          { nickname },
          { new: true }
        );
      } else if (!nickname && occupation) {
        result = await UserModel.findOneAndUpdate(
          { affiliatedNumber },
          { occupation },
          { new: true }
        );
      } else {
        result = await UserModel.findOneAndUpdate(
          { affiliatedNumber },
          { nickname, occupation },
          { new: true }
        );
      }

      res.status(200).json({
        data: {
          result,
        },
        status: 'ok',
      });
    }

    if (mods.includes(mod)) {
      if (mod === 'restart') {
        await UserModel.findOneAndUpdate({ affiliatedNumber }, { deleted: false });

        res.status(200).json({
          data: {
            result: 'User enabled',
          },
          status: 'ok',
        });
      }

      if (mod === 'delete') {
        await UserModel.findOneAndUpdate({ affiliatedNumber }, { deleted: true });

        res.status(200).json({
          data: {
            result: 'User disabled',
          },
          status: 'ok',
        });
      }

      if (mod === 'neas') {
        if (!nea) {
          createError('Bad Request: nea name necessary in body', 400);
        }
        const result = await BadgesService.giveNea(affiliatedNumber, nea);

        res.status(200).json({
          data: {
            result,
          },
          status: 'ok',
        });
      }

      if (mod === 'necs') {
        if (!nec) {
          createError('Bad Request: nec name necessary in body', 400);
        }

        const result = await BadgesService.giveNec(affiliatedNumber, nec);

        res.status(200).json({
          data: {
            result,
          },
          status: 'ok',
        });
      }
    } else {
      createError('Endpoint not found', 404);
    }
  } catch (error) {
    next(error);
  }
});

router.delete('/:affiliatedNumber', async (req, res, next) => {
  try {
    const { affiliatedNumber } = req.params;

    const user = await BadgesService.getUser(affiliatedNumber);

    if (!user) {
      createError('User not found', 404);
    }

    await UserModel.findOneAndRemove({ affiliatedNumber });

    res.status(200).json({
      data: {
        result: 'User deleted permanently',
      },
      status: 'ok',
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
