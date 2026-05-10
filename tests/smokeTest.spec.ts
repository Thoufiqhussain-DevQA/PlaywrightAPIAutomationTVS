import { test } from '../utils/fixtures';
import { expect } from '../utils/custom-expect';
import { createToken } from '../helpers/createToken';
import { validateSchema } from '../utils/schema-validator';
import articleRequestPayload from '../request-objects/POST-article.json';
import { faker } from '@faker-js/faker';
import { getNewRandomArticle } from '../utils/data-generator';

let tokenJWTValue: string;

test.beforeAll("This will execute before all the tests", async ({ api, config }) => {

    tokenJWTValue = await createToken(config.userEmail, config.userPassword);

});

test("Get All Articles", async ({ api }) => {

    const response = await api
        .url("https://conduit-api.bondaracademy.com/api")
        .path("/articles")
        .params({ limit: 10, offset: 0 })
        .getRequest(200);

    console.log(response);
    expect(response.articles.length).toBeLessThanOrEqual(10);
    expect(response.articlesCount).not.shouldEqual(9);

});

test("Get Test Tags", async ({ api }) => {

    const tagsResponse = await api
        .path("/tags")
        .params({ limit: 10, offset: 0 })
        .getRequest(200);

    await validateSchema("tags", "GET_tags", tagsResponse);

    console.log(tagsResponse);
    expect(tagsResponse.tags[0]).toEqual('Test');
    expect(tagsResponse.tags.length).toBeLessThanOrEqual(10);
});

test("Publish and Delete Article", async ({ api }) => {

    // we added the below line to make each test has it's own instance of the articleRequestPayload
    //const articleRequest = JSON.parse(JSON.stringify(articleRequestPayload));

    const articleRequest = getNewRandomArticle();
    const newArticleResponse = await api
        .path("/articles")
        .headers({ Authorization: tokenJWTValue })
        .body(articleRequest)
        .postRequest(201);

    expect(newArticleResponse.article.title).toEqual(articleRequest.article.title);
    const slugArticleId = newArticleResponse.article.slug;

    // now in the below we are verifying the article published is getting retrieved

    const response = await api
        .url("https://conduit-api.bondaracademy.com/api")
        .path("/articles")
        .params({ limit: 10, offset: 0 })
        .getRequest(200);

    expect(response.articles[0].title).toEqual(articleRequest.article.title);

    //below snippet is to delete the article created by using the param slugArticleId.

    await api.path(`/articles/${slugArticleId}`)
        .headers({ Authorization: tokenJWTValue })
        .deleteRequest(204)

    // now in the below we are verifying the article published is not getting shown 

    const responsePostDelete = await api
        .url("https://conduit-api.bondaracademy.com/api")
        .path("/articles")
        .params({ limit: 10, offset: 0 })
        .getRequest(200);
    expect(responsePostDelete.articles[0].title).not.toEqual(articleRequest.article.title);

});

test("Publish Update and Delete Article", async ({ api }) => {

    const articleTitle = faker.lorem.sentence(5);
    const articleRequest = JSON.parse(JSON.stringify(articleRequestPayload));
    articleRequest.article.title = articleTitle

    const newArticleResponse = await api
        .path("/articles")
        .headers({ Authorization: tokenJWTValue })
        .body(articleRequest)
        .postRequest(201);

    expect(newArticleResponse.article.title).toEqual(articleTitle);
    const slugArticleId = newArticleResponse.article.slug;

    const articleTitleTwo = faker.lorem.sentence(5);
    articleRequest.article.title = articleTitleTwo
    const updateArticleResponse = await api
        .path(`/articles/${slugArticleId}`)
        .headers({ Authorization: tokenJWTValue })
        .body(articleRequest)
        .putRequest(200);

    expect(updateArticleResponse.article.title).toEqual(articleTitleTwo);
    const newSlugArticleId = updateArticleResponse.article.slug;

    // now in the below we are verifying the article published is getting retrieved

    const response = await api
        .url("https://conduit-api.bondaracademy.com/api")
        .path("/articles")
        .params({ limit: 10, offset: 0 })
        .getRequest(200);

    expect(response.articles[0].title).toEqual(articleTitleTwo);

    //below snippet is to delete the article created by using the param slugArticleId.

    await api.path(`/articles/${newSlugArticleId}`)
        .headers({ Authorization: tokenJWTValue })
        .deleteRequest(204)

    // now in the below we are verifying the article published is not getting shown 

    const responsePostDelete = await api
        .url("https://conduit-api.bondaracademy.com/api")
        .path("/articles")
        .params({ limit: 10, offset: 0 })
        .getRequest(200);
    expect(responsePostDelete.articles[0].title).not.toEqual(articleTitleTwo);

});