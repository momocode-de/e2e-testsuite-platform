module.exports = class FixtureManager {
    constructor() {
        this.fixtures = Cypress.config('momoFixtures');
        this.fixtureTypes = Cypress.config('momoFixtureTypes');
        this.createdFixtures = [];
        this.loadedData = {};
    }

    createFixture(type, overwrites = {}) {
        // Throw error if type does not exist
        if (this.fixtureTypes[type] === undefined) {
            throw `Fixture type "${type}" does not exist!`;
        }

        // If the fixture with this type is already created, return
        if (this.createdFixtures.includes(type)) {
            return cy.wait(0);
        }

        // Create all required fixtures first
        return this._createRequiredFixtures(this.fixtureTypes[type].requirements, overwrites).then(() => {
            // Then Load the required data
            return this._loadData(this.fixtureTypes[type].load);
        }).then(() => {
            // And then create the fixtures
            return this._createFixtures(type, this.fixtures[type], overwrites);
        }).then(() => {
            // Mark current fixture as created
            this.createdFixtures.push(type);
        });
    }

    reset() {
        this.createdFixtures = [];
    }

    _createRequiredFixtures(requirements = [], overwrites = {}) {
        return cy.wrap(requirements).each((requirement) => {
            this.createFixture(requirement, overwrites[requirement]).then(() => {
                delete overwrites[requirement];
            });
        });
    }

    _loadData(requiredLoads = []) {
        return cy.wrap(requiredLoads).each((options) => {
            // Notice: This check will not match if multiple loads with the same key are provided
            // to one function call. But if the same key is provided in multiple calls of this
            // function, this check should work.
            if (!this.loadedData[options.key]) {
                cy.searchViaAdminApi(options.apiData).then((response) => {
                    if (!response) {
                        throw `Data not found: ${JSON.stringify(options)}`;
                    }

                    this.loadedData[options.key] = response;
                });
            }
        }).then(() => this.loadedData);
    }

    _createFixtures(type, fixtures = [], overwrites = {}) {
        return cy.wrap(fixtures).each((fixture) => {
            const data = Cypress._.cloneDeep(fixture);

            // Insert loaded data
            if (Array.isArray(this.fixtureTypes[type].load)) {
                this.fixtureTypes[type].load.forEach((options) => {
                    Cypress._.set(data, options.into, this.loadedData[options.key][options.requiredField]);
                });
            }

            // Insert overwrites
            Object.keys(overwrites).forEach((key) => {
                Cypress._.set(data, key, overwrites[key]);
            });

            // Create the fixture
            if (this.fixtureTypes[type].method) {
                cy[this.fixtureTypes[type].method](data);
            }
        });
    }
}
