const UserModel = require('../models/User');

class BadgesService {
  constructor() {
    this.FIRST_BADGE = 'My first day as astro-rookie!';
    this.FIRST_NEA = 'First NEA discovered!';
    this.FIRST_NEC = 'First NEC discovered!';
    this.FIVE_OBJECTS = 'Road to NE-lhalla!';
    this.TEN_OBJECTS = 'Master of universe!';
    this.ALL_BADGES = 'The best astronomer!';
  }

  getUser = async (affiliatedNumber) => {
    return await UserModel.findOne({ affiliatedNumber });
  };

  getUserNeas = async (affiliatedNumber) => {
    const user = await this.getUser(affiliatedNumber);
    const neas = user.get('neasDiscovered');

    return neas;
  };

  getUserNecs = async (affiliatedNumber) => {
    const user = await this.getUser(affiliatedNumber);
    const necs = user.get('necsDiscovered');

    return necs;
  };

  moreThanXObjectsDiscovered = async (affiliatedNumber, nObjectsDiscovered) => {
    const neas = await this.getUserNeas(affiliatedNumber);
    const necs = await this.getUserNecs(affiliatedNumber);

    return neas.length + necs.length >= nObjectsDiscovered;
  };

  isDeleted = async (affiliatedNumber) => {
    const user = await this.getUser(affiliatedNumber);

    return user.get('deleted');
  };

  getUserBadges = async (affiliatedNumber) => {
    const user = await this.getUser(affiliatedNumber);
    const badges = user.get('badges');

    return badges;
  };

  getUserPoints = async (affiliatedNumber) => {
    const user = await this.getUser(affiliatedNumber);
    const points = user.get('astronomicalPoints');

    return points;
  };

  getBadgePoints = async (affiliatedNumber, badgeName) => {
    const user = await this.getUser(affiliatedNumber);
    const badges = user.get('badges');
    return badges.find((badge) => badge.name === badgeName).points;
  };

  updateNeas = (neas, neaName) => {
    if (!neas.includes(neaName)) {
      return [...neas, neaName];
    }
    return neas;
  };

  updateNecs = (necs, necName) => {
    if (!necs.includes(necName)) {
      return [...necs, necName];
    }
    return necs;
  };

  updateBadges = (badges, badgeName) =>
    badges.map((badge) => ({
      ...badge,
      given: badge.given || badge.name === badgeName,
    }));

  updatePoints = async (affiliatedNumber, points) => {
    await UserModel.findByIdAndUpdate(affiliatedNumber, { astronomicalPoints: points });
  };

  isGiven = async (affiliatedNumber, badgeName) => {
    const badges = await this.getUserBadges(affiliatedNumber);
    const filteredBadge = badges.filter((badge) => badge.name === badgeName);
    const given = filteredBadge.map((badge) => badge.given)[0];

    return given || filteredBadge.name === badgeName;
  };

  giveNea = async (affiliatedNumber, neaName) => {
    const badges = await this.getUserBadges(affiliatedNumber);
    const neas = await this.getUserNeas(affiliatedNumber);

    const newNeas = this.updateNeas(neas, neaName);

    const userPoints = await this.getUserPoints(affiliatedNumber);
    let newBadges = badges;
    let badgePoints = 0;

    if (!(await this.isGiven(affiliatedNumber, this.FIRST_NEA))) {
      badgePoints += await this.getBadgePoints(affiliatedNumber, this.FIRST_NEA);
      newBadges = this.updateBadges(newBadges, this.FIRST_NEA);
    }

    if (
      (await this.moreThanXObjectsDiscovered(affiliatedNumber, 5)) &&
      !(await this.isGiven(affiliatedNumber, this.FIVE_OBJECTS))
    ) {
      badgePoints += await this.getBadgePoints(affiliatedNumber, this.FIVE_OBJECTS);
      newBadges = this.updateBadges(newBadges, this.FIVE_OBJECTS);
    }

    if (
      (await this.moreThanXObjectsDiscovered(affiliatedNumber, 10)) &&
      !(await this.isGiven(affiliatedNumber, this.TEN_OBJECTS))
    ) {
      badgePoints += await this.getBadgePoints(affiliatedNumber, this.TEN_OBJECTS);
      newBadges = this.updateBadges(newBadges, this.TEN_OBJECTS);
    }

    if (
      !(await this.isGiven(affiliatedNumber, this.ALL_BADGES)) &&
      (await this.giveLastBadge(affiliatedNumber))
    ) {
      badgePoints += await this.getBadgePoints(affiliatedNumber, this.ALL_BADGES);
      newBadges = this.updateBadges(newBadges, this.ALL_BADGES);
    }

    const result = await UserModel.findOneAndUpdate(
      { affiliatedNumber },
      {
        badges: newBadges,
        astronomicalPoints: userPoints + badgePoints,
        neasDiscovered: newNeas,
      },
      { new: true }
    );

    return result;
  };

  giveNec = async (affiliatedNumber, necName) => {
    const badges = await this.getUserBadges(affiliatedNumber);
    const necs = await this.getUserNecs(affiliatedNumber);

    const newNecs = this.updateNecs(necs, necName);

    const userPoints = await this.getUserPoints(affiliatedNumber);
    let newBadges = badges;
    let badgePoints = 0;

    if (!(await this.isGiven(affiliatedNumber, this.FIRST_NEC))) {
      badgePoints += await this.getBadgePoints(affiliatedNumber, this.FIRST_NEC);
      newBadges = this.updateBadges(newBadges, this.FIRST_NEC);
    }

    if (
      (await this.moreThanXObjectsDiscovered(affiliatedNumber, 5)) &&
      !(await this.isGiven(affiliatedNumber, this.FIVE_OBJECTS))
    ) {
      badgePoints += await this.getBadgePoints(affiliatedNumber, this.FIVE_OBJECTS);
      newBadges = this.updateBadges(newBadges, this.FIVE_OBJECTS);
    }

    if (
      (await this.moreThanXObjectsDiscovered(affiliatedNumber, 10)) &&
      !(await this.isGiven(affiliatedNumber, this.TEN_OBJECTS))
    ) {
      badgePoints += await this.getBadgePoints(affiliatedNumber, this.TEN_OBJECTS);
      newBadges = this.updateBadges(newBadges, this.TEN_OBJECTS);
    }

    if (
      !(await this.isGiven(affiliatedNumber, this.ALL_BADGES)) &&
      (await this.giveLastBadge(affiliatedNumber))
    ) {
      badgePoints += await this.getBadgePoints(affiliatedNumber, this.ALL_BADGES);
      newBadges = this.updateBadges(newBadges, this.ALL_BADGES);
    }

    const result = await UserModel.findOneAndUpdate(
      { affiliatedNumber },
      {
        badges: newBadges,
        astronomicalPoints: userPoints + badgePoints,
        necsDiscovered: newNecs,
      },
      { new: true }
    );

    return result;
  };

  giveLastBadge = async (affiliatedNumber) => {
    const firstBadge = await this.isGiven(affiliatedNumber, this.FIRST_BADGE);
    const firstNea = await this.isGiven(affiliatedNumber, this.FIRST_NEA);
    const firstNec = await this.isGiven(affiliatedNumber, this.FIRST_NEC);
    const fiveObjects = await this.isGiven(affiliatedNumber, this.FIVE_OBJECTS);
    const tenObjects = await this.isGiven(affiliatedNumber, this.TEN_OBJECTS);

    return firstBadge && firstNea && firstNec && fiveObjects && tenObjects;
  };
}

module.exports = new BadgesService();
