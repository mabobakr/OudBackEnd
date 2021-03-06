const { PlayHistory } = require('../models');
const _ = require('lodash');
const mongoose = require('mongoose');

/**
 * Get History with the given `userId` and `ops`
 * 
 * @function
 * @public
 * @async
 * @author Abdelrahman Tarek
 * @param {String} userId User ID
 * @param {Object} [ops] Options Object
 * @param {number} [ops.limit] The maximum number of items to return. Default: `20`. Minimum: `1`. Maximum: `50`
 * @param {number} [ops.after] A Unix timestamp in milliseconds. Returns all items after (but not including) this cursor position. If after is specified, before must not be specified
 * @param {number} [ops.before] A Unix timestamp in milliseconds. Returns all items before (but not including) this cursor position. If before is specified, after must not be specified
 * @returns {Array<Document>} history
 * @summary Get History 
 */
const getHistory = async (userId, ops = {
  limit: 20,
  after: undefined,
  before: undefined
}) => {
  const history = PlayHistory.find({ user: userId })
    .limit(ops.limit)
    .sort({ playedAt: -1 })
    .select('-_id -__v')
    .populate({
      path: 'context.item',
      select: 'image images name _id displayName artists',
      populate: {
        path: 'artists',
        select: 'images name _id, displayName'
      }
    })
    .lean({ virtuals: true })

  if (ops.after)
    history.gt('playedAt', new Date(ops.after));
  else if (ops.before)
    history.lt('playedAt', new Date(ops.before));

  return await history;
};


/**
 * Add Track to history
 * 
 * @function
 * @public
 * @async
 * @author Abdelrahman Tarek
 * @param {String} userId User ID
 * @param {Object} [context] context Object
 * @param {String} [context.type] context type enum = [`album`, `artist`, `playlist`, `unknown`] \
 * (default = `unknown`)
 * @param {String} [context.id] context ID
 * @throws {MongooseError}
 * @returns {Document} history
 * @summary Add Track to history
 */
const addToHistory = async (userId, context = {
  type: 'unknown',
  id: undefined
}) => {
  const query = {
    user: userId,
    context: {
      type: _.capitalize(context.type),
      item: context.id
    }
  };

  const update = {
    playedAt: new Date()
  };

  const options = {
    upsert: true,
    new: true,
    setDefaultsOnInsert: true
  };

  // if no context or context type is unknown don't add it to history
  if (!context || context.type === 'unknown' || context.id === undefined) return;

  const history = await PlayHistory.findOneAndUpdate(query, update, options);

  return history;
};

module.exports = { getHistory, addToHistory };