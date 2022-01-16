const functions = require('firebase-functions');
const cors = require('cors')({ origin: true });
const fetch = require('node-fetch');
const _ = require('lodash');

/**
 * Return Clean Error Response
 * 
 * @param {Object} response Express response object
 * @param {Number} statusCode The status code to return
 * @param {String} message The error message
 */
function error(response, statusCode, message) {
    response.status(statusCode).send({
        "timestamp": Date.now(),
        "status": statusCode,
        "error": message
    });
    response.end();
}

/**
 * Get the price of a valid collection on OpenSea
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
                if (slug == undefined || slug == '')
                    throw new Error("An OpenSea colleciton `slug` must be set.");

                // Get the collection data from OpenSea
                // @TODO Use an API key once granted
                const collectionResponse = await fetch('https://api.opensea.io/collection/' + slug + '?format=json', {
                    method: 'GET',
                    headers: { 'Content-Type': 'application/json' },
                });
                const collectionInfo = await collectionResponse.json();
                console.log(collectionInfo);

                // Make sure the collection exists
                if (collectionInfo.success === false)
                    throw new Error("The collection '" + slug + "' was not found on OpenSea.");
                
                // Make sure the collection is safe-list-verified
                const safeListStatus = collectionInfo.collection.safelist_request_status;
                if (safeListStatus !== 'approved'
                    && safeListStatus !== 'verified')
                    throw new Error("Not verified. '" + slug + "' is not safe enough to trade.");

                // Ensure there is a resonable number of holders to prevent against fraud
                const holdersPercentage = collectionInfo.collection.stats.num_owners
                    / collectionInfo.collection.stats.total_supply;
                if (holdersPercentage < .2)
                    throw new Error("Too few holders. '" + slug + "' is not safe enough to trade.");
                    
                // Ensure there is a resonable amount of trading to prevent against fraud
                const numSalesPastSevenDays = collectionInfo.collection.stats.seven_day_sales;
                if (numSalesPastSevenDays < 50)
                    throw new Error("Too few sales. '" + slug + "' is not safe enough to trade.");

                // Get the average sale price
                const averagePriceInUsd = collectionInfo.collection.stats.seven_day_average_price
                    * collectionInfo.collection.payment_tokens[0].usd_price;

                // Return a response to the client
                response.status(200).send('{"price": ' + averagePriceInUsd + '}');

                // Terminate the function
                response.end();

            } catch (err) {
                functions.logger.error(err, { structuredData: true });
                error(response, 400, err.message);
            }
        })
    });