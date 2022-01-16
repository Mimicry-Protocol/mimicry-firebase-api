const functions = require('firebase-functions');
const fetch = require('node-fetch');
const ccxt = require('ccxt');
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
exports = module.exports = functions
    .https
    .onRequest(async (request, response) => {
        try {
            // Initialize config
            // const config = functions.config();

            // Get the data from the request
            const { 
                slug
            } = request.body;

            // Return an error if needed
            if (slug == undefined || slug == '')
                throw new Error("A `slug` must be set.");

            // Get the collection data from OpenSea
            // @TODO Use an API key once granted
            const collectionInfo = await fetch('https://api.opensea.io/collection/' + slug + '?format=json', {
                method: 'get',
                headers: { 'Content-Type': 'application/json' },
            });

            console.log(collectionInfo);


            // Connect to Coinbase via CCXT
            // We need this to get the price of ETH/USD
            // @TODO move this price lookup to Chainlink
            // const exchange = new ccxt['coinbasepro']({
            //     apiKey: config.coinbasepro.key,
            //     secret: config.coinbasepro.secret,
            //     password: config.coinbasepro.password
            // });
            response.status(200).send(collectionInfo);

            // Terminate the function
            response.end();

        } catch (err) {
            functions.logger.error(err, { structuredData: true });
            error(response, 400, err.message);
        }
    });