const fs = require('fs');
const fetch = require('node-fetch');

const read = async (path) => {
  const raw = await fs.readFileSync(path);
  return JSON.parse(raw);
};

const write = async (path, content) => {
  const contentStr = typeof content === 'string' ? content : JSON.stringify(content);
  await fs.writeFileSync(path, contentStr);
};

const createError = (message, code) => {
  const error = new Error(message);
  error.code = code;
  throw error;
};

const calculateAge = (date) => {
  const ageDifMs = Date.now() - new Date(date).getTime();
  const ageDate = new Date(ageDifMs);
  return Math.abs(ageDate.getUTCFullYear() - 1970);
};

const MAPBOX_TOKEN =
  'pk.eyJ1IjoiZmVya2FuemFpIiwiYSI6ImNraTFvZGE1azBiY24yd3Fuc3RoYjZ1N3QifQ.825dTY3GMtTjgI5M90Ujrw';

const getPlace = async (long, lat) => {
  const URL = `https://api.mapbox.com/geocoding/v5/mapbox.places/${long},${lat}.json?types=region&access_token=${MAPBOX_TOKEN}`;

  const data = await fetch(URL).then((res) => res.json());

  return data;
};

const checkDate = (date) => {
  if (date.split(/[-\/]/).length === 1) {
    return new Date(`${date}-01-01`);
  } else if (date.split(/[-\/]/).length === 2) {
    return new Date(`${date}-01`);
  } else {
    return new Date(date);
  }
};

const itemsPerPage = 20;

const capitalize = (str) => str.slice(0, 1).toUpperCase() + str.slice(1);

const camelize = (str) =>
  str
    .split(/[$-/:-?{-~!"^_`\[\]]/)
    .map((word, index) => (index > 0 ? capitalize(word) : word))
    .join('');

const camelizeObject = (obj) => {
  const objectFormatted = Object.keys(obj).reduce((acc, next, index) => {
    const camelizedKey = camelize(next);

    return {
      ...acc,
      [camelizedKey]: obj[next],
    };
  }, {});
  return objectFormatted;
};

const getByMod = async ({ model, affiliatedNumber, mod }) => {
  const result = await model
    .find(
      { affiliatedNumber },
      {
        [mod]: 1,
        _id: 0,
      }
    )
    .lean();

  return result;
};

const checkIfUserDisabled = async ({ model, affiliatedNumber }) => {
  const result = await model.find({ affiliatedNumber }, { deleted: 1, _id: 0 });

  return result[0].deleted;
};

module.exports = {
  read,
  write,
  createError,
  calculateAge,
  getPlace,
  checkDate,
  itemsPerPage,
  camelizeObject,
  getByMod,
  checkIfUserDisabled,
};
