import articleRequestPayload from '../request-objects/POST-article.json';
import { faker } from '@faker-js/faker';

export function getNewRandomArticle(){

    const articleRequest = JSON.parse(JSON.stringify(articleRequestPayload));
    articleRequest.article.title = faker.lorem.sentence(5);
    articleRequest.article.description = faker.lorem.sentence(5);
    articleRequest.article.body = faker.lorem.sentence(8);

    return articleRequest;
}