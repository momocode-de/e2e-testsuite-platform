const path = require('path');

export default async (on, config) => {
    const fixturesFilePath = path.resolve(config.projectRoot + '/fixtures.js');
    const fixtureTypesFilePath = path.resolve(config.projectRoot + '/fixture-types.js');

    config.momoFixtures = await require(fixturesFilePath);
    config.momoFixtureTypes = await require(fixtureTypesFilePath);

    if (process.env.SHOPWARE_VERSION) {
        // This is for other systems
        config.shopwareVersion = process.env.SHOPWARE_VERSION;
    } else {
        // This is for shopware-lab only
        const baseUrl = config.baseUrl;
        const parts = baseUrl.split('-');
        config.shopwareVersion = parts[0].replace('https://v', '');
    }

    return config;
};
