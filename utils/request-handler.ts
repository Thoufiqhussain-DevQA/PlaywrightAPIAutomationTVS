import test, { APIRequestContext, expect } from "@playwright/test";
import { APILogger } from "./logger";

export class RequestHandler {

    private logger: APILogger;
    private apirequest: APIRequestContext;
    private baseUrl: string = '';
    private defaultBaseUrl: string = '';
    private apiPath: string = '';
    private queryParams: object = {};
    private apiHeaders: Record<string, string> = {};
    private apiBody: object = {};

    constructor(request: APIRequestContext, apiBaseUrl: string, logger: APILogger) {
        this.apirequest = request;
        this.defaultBaseUrl = apiBaseUrl;
        this.logger = logger;
    }


    url(url: string) {
        this.baseUrl = url;
        return this;
    }

    path(path: string) {
        this.apiPath = path;
        return this;
    }

    params(params: object) {
        this.queryParams = params;
        return this;
    }

    headers(headers: Record<string, string>) {
        this.apiHeaders = headers;
        return this;
    }

    body(body: object) {
        this.apiBody = body;
        return this;
    }

    private getUrl() {
        const url = new URL(`${this.defaultBaseUrl}${this.apiPath}`)
        for (const [key, value] of Object.entries(this.queryParams)) {
            url.searchParams.append(key, value);
        }

        return url.toString();
    }

    async getRequest(statusCode: number) {

        let responseJson: any;
        const url = this.getUrl();

        await test.step(`Get request to ${url}`, async () => {

            this.logger.logRequest('GET', url, this.apiHeaders);
            const response = await this.apirequest.get(url, {
                headers: this.apiHeaders
            })

            const actualStatus = response.status();
            responseJson = await response.json();

            this.logger.logResponse(actualStatus, responseJson);
            this.statusCodeValidator(actualStatus, statusCode, this.getRequest);
        })
        return responseJson;
    }

    async postRequest(statusCode: number) {

        let responseJson: any;
        const url = this.getUrl();
        await test.step(`POST request to ${url}`, async () => {

            this.logger.logRequest('POST', url, this.apiHeaders, this.apiBody);

            const response = await this.apirequest.post(url, {
                headers: this.apiHeaders,
                data: this.apiBody
            })

            const actualStatus = response.status();
            responseJson = await response.json();

            this.logger.logResponse(actualStatus, responseJson);
            this.statusCodeValidator(actualStatus, statusCode, this.postRequest);
        })
        return responseJson;
    }

    async putRequest(statusCode: number) {

        let responseJson: any;
        const url = this.getUrl();

        await test.step(`PUT request to ${url}`, async () => {
            this.logger.logRequest('PUT', url, this.apiHeaders, this.apiBody);

            const response = await this.apirequest.put(url, {
                headers: this.apiHeaders,
                data: this.apiBody
            })

            const actualStatus = response.status();
            responseJson = await response.json();

            this.logger.logResponse(actualStatus, responseJson);
            this.statusCodeValidator(actualStatus, statusCode, this.putRequest);

        })
        return responseJson;
    }

    async deleteRequest(statusCode: number) {
        const url = this.getUrl();

        await test.step(`DELETE request to ${url}`, async () => {
            this.logger.logRequest('DELETE', url, this.apiHeaders);

            const response = await this.apirequest.delete(url, {
                headers: this.apiHeaders
            })

            const actualStatus = response.status();
            this.logger.logResponse(actualStatus);

            this.statusCodeValidator(actualStatus, statusCode, this.deleteRequest);
        })
    }

    private statusCodeValidator(actualStatus: number, expectStatus: number, calling: Function) {
        if (actualStatus !== expectStatus) {
            const logs = this.logger.getRecentlogs();
            const error = new Error(`Expected Status ${expectStatus} but got ${actualStatus}\n\n Recent API Activity ${logs}`)
            Error.captureStackTrace(error, calling);
            throw error;
        }
    }
}
