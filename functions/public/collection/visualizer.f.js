const functions = require('firebase-functions');
const cors = require('cors')({ origin: true });
const fetch = require('node-fetch');
const potrace = require('potrace');
const _ = require('lodash');
const _utils = require('./../../utils');

/**
 * Get the IPFS url for the SVG representation of a collection slug
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
                
                // Make sure the collection exists
                if (collectionInfo.success === false)
                    throw new Error("The collection '" + slug + "' was not found on OpenSea.");
                
                // Get the contract address
                const collectionContractAddress = collectionInfo.collection.primary_asset_contracts[0].address;

                // Get the total number of images
                const collectionCount = collectionInfo.collection.stats.count - 1;

                // Select a random collection asset
                const collectionAssetId = _.random(1, collectionCount);

                // Get a specific collection asset's metadata
                const collectionAssetResponse = await fetch('https://api.opensea.io/asset/'
                     + collectionContractAddress
                     + '/' + collectionAssetId, {
                    method: 'GET',
                    headers: { 'Content-Type': 'application/json' },
                });
                const collectionAssetInfo = await collectionAssetResponse.json();
                
                // Set bitmap to svg conversion params
                // @TODO change the color based on a person's public key
                const params = {
                    background: '#49ffd2',
                    // color: 'blue'
                };

                // Convert the collection asset art into an SVG
                potrace.trace(collectionAssetInfo.image_url, params, function(err, svg) {
                    if (err) throw err;

                    // Return a response to the client
                    response.status(200).send(svg);

                    // Terminate the function
                    response.end();
                });

            } catch (err) {
                functions.logger.error(err, { structuredData: true });
                _utils.error(response, 400, err.message);
            }
        })
    });