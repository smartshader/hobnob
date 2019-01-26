import assert from 'assert';
import superagent from 'superagent';
import { When, Then } from 'cucumber';

When(/^the client creates a (GET|POST|PATCH|PUT|DELETE|OPTIONS|HEAD) request to ([/\w-:.]+)$/, function (method, path) {
    this.request = superagent(
        method,
        `${process.env.SERVER_HOSTNAME}:${process.env.SERVER_PORT}${path}`
    );
});

When(/^attaches a generic (.+) payload$/, function (payloadType) {
    switch (payloadType) {
        case 'malformed':
            this.request
                .send('{"email": "smartshader@gmail.com", name: }')
                .set('Content-Type', 'application/json');
            break;
        case 'non-JSON':
            this.request
                .send('<?xml version="1.0" encoding="UTF-8" ?><email>smartshader@gmail.com</email>')
                .set('Content-Type', 'text/xml');
            break;
        case 'empty':
        default:
    }
});

When(/^sends the request$/, function (callback) {
    this.request
        .then((response) => {
            this.response = response.res;
            callback();
        })
        .catch((error) => {
            this.response = error.response;
            callback();
        });
});

Then(/^our API should respond with a ([1-5]\d{2}) HTTP status code$/, function (statusCode) {
    assert.strictEqual(this.response.statusCode, Number(statusCode));
});

Then(/^the payload of the response should be a JSON object$/, function () {
    // Check Content-Type header
    const contentType = this.response.headers['Content-Type'] || this.response.headers['content-type'];
    if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Response not of Content-Type application/json');
    }

    // Check it is valid JSON
    try {
        this.responsePayload = JSON.parse(this.response.text);
    } catch (e) {
        throw new Error('Response not a valid JSON object');
    }
});

Then(/^contains a message property which says (?:"|')(.*)(?:"|')$/, function (message) {
    assert.strictEqual(this.responsePayload.message, message);
});
