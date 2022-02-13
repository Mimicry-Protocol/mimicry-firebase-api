const functions = require('firebase-functions');
const cors = require('cors')({ origin: true });
const fetch = require('node-fetch');
const _ = require('lodash');
const _utils = require('./../../utils');

/**
 * Determine the value of this collection
 * @TODO Support other marketplaces beyond Opensea
 */
exports = module.exports = functions.https
    .onRequest((request, response) => {
        cors(request, response, async () => {
            try {
                // Initialize config
                // @TODO use this later once we have an OpenSea API key
                // const config = functions.config();

                // Get the data from the request
                const { 
                    slug
                } = request.body;

                // Return an error if needed
                if (slug === undefined || slug === '')
                    throw new Error("An OpenSea colleciton `slug` must be set.");

                // Determine if this collection is eligible for inclusion
                const isTradableRunner = async () => await fetch(_utils.getBasepath()
                     + 'publicCollectionIsTradable', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 'slug': slug })
                });
                const isTradableRunnerResponse = await _utils.fetchSafely(isTradableRunner);
                const isTradable = await isTradableRunnerResponse.json();

                // End if there is an error
                if (isTradable.success === undefined) throw new Error(isTradable.error);

                // Get the collection data from OpenSea
                // @TODO Use an API key once granted
                const appraisalRunner = async () => await fetch('https://api.opensea.io/collection/' + slug + '?format=json', {
                    method: 'GET',
                    headers: { 'Content-Type': 'application/json' },
                });
                const appraisalRunnerResponse = await _utils.fetchSafely(appraisalRunner);
                const collectionInfo = await appraisalRunnerResponse.json();

                // Get the average sale price
                // @TODO Make this more sophisticated
                const averagePriceInUsd = collectionInfo.collection.stats.seven_day_average_price
                    * collectionInfo.collection.payment_tokens[0].usd_price;

                // Return a response to the client
                response.status(200).send('{"price": ' + averagePriceInUsd + '}');

                // Terminate the function
                response.end();

            } catch (err) {
                functions.logger.error(err, { structuredData: true });
                _utils.error(response, 400, err.message);
            }
        })
    });