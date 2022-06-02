export default class Route {
    constructor(url, alias, method) {
        this.url = url;
        this.alias = alias;
        this.method = method;
    }

    register() {
        cy.route({
            url: this.url,
            method: this.method
        }).as(this.alias);
    }

    wait(expectedStatus) {
        return cy.wait(`@${this.alias}`).then((xhr) => {
            expect(xhr).to.have.property('status', expectedStatus);
        });
    }
}
