import { expect, test } from '@playwright/test';

let tokenJWTValue: string;

test.beforeAll("This will execute before all the tests", async({request})=>{
    
    //in the below first snipped, we are retrieving the Token to feed into the Post Request for the Article Creation

    const tokenResponse = await request.post("https://conduit-api.bondaracademy.com/api/users/login", {
        data: {
            "user": {
                "email": "arashadobe@gmail.com",
                "password": "ThoufiqConduit@20"
            }
        }
    });

    const tokenResponseJson = await tokenResponse.json();
    tokenJWTValue = "Token "+tokenResponseJson.user.token;

});

test.afterAll("This will execute after all the tests", async({request})=>{
    
    console.log("After all the tests");
});

test("Get Test Tags", async ({ request }) => {

    const tagsResponse = await request.get("https://conduit-api.bondaracademy.com/api/tags");
    const tagsResponseJson = await tagsResponse.json();
    expect(tagsResponse.status()).toBe(200);
    expect(tagsResponseJson.tags[0]).toEqual('Test');
    expect(tagsResponseJson.tags.length).toBeLessThanOrEqual(10);
    console.log(tagsResponseJson);
});

test("Get All Articles", async ({ request }) => {

    const articleResponse = await request.get("https://conduit-api.bondaracademy.com/api/articles?limit=10&offset=0");
    const articleResponseJson = await articleResponse.json();
    console.log(articleResponseJson);
    expect(articleResponse.status()).toBe(200);
    expect(articleResponseJson.articles.length).toBeLessThanOrEqual(10);
    expect(articleResponseJson.articlesCount).toEqual(10);
});

test("Publish and Delete Article", async ({ request }) => {

    const newArticleResponse = await request.post("https://conduit-api.bondaracademy.com/api/articles/", {
        data: {
            "article": {
                "title": "Test",
                "description": "test",
                "body": "test plw",
                "tagList": []
            }
        },
        headers:{
            Authorization:tokenJWTValue
        }
    });

    const newArticleResponseJson = await newArticleResponse.json();
    expect(newArticleResponse.status()).toBe(201);
    expect(newArticleResponseJson.article.title).toEqual("Test");
    const slugArticleId = newArticleResponseJson.article.slug;

    // now in the below we are verifying the article published is getting retrieved

    const articleResponse = await request.get("https://conduit-api.bondaracademy.com/api/articles?limit=10&offset=0",{
        headers:{
             Authorization:tokenJWTValue
        }
    });
    const articleResponseJson = await articleResponse.json();
    expect(articleResponse.status()).toBe(200);
    expect(articleResponseJson.articles[0].title).toEqual("Test");


    //below snippet is to delete the article created by using the param slugArticleId.

    const deleteArticleResponse = await request.delete(`https://conduit-api.bondaracademy.com/api/articles/${slugArticleId}`,{

        headers:{
             Authorization:tokenJWTValue
        }
    });
    expect(deleteArticleResponse.status()).toEqual(204);
});

test("Publish Update and Delete Article", async ({ request }) => {

    const newArticleResponse = await request.post("https://conduit-api.bondaracademy.com/api/articles/", {
        data: {
            "article": {
                "title": "Test",
                "description": "test",
                "body": "test plw",
                "tagList": []
            }
        },
        headers:{
            Authorization:tokenJWTValue
        }
    });

    const newArticleResponseJson = await newArticleResponse.json();
    expect(newArticleResponse.status()).toBe(201);
    expect(newArticleResponseJson.article.title).toEqual("Test");
    const slugArticleId = newArticleResponseJson.article.slug;


    // in the below snippet, we are updating the title of the article

        const updateArticleResponse = await request.put(`https://conduit-api.bondaracademy.com/api/articles/${slugArticleId}`, {
        data: {
            "article": {
                "title": "Test New Title",
                "description": "test",
                "body": "test plw",
                "tagList": []
            }
        },
        headers:{
            Authorization:tokenJWTValue
        }
    });

    const updateArticleResponsejson = await updateArticleResponse.json();
    expect(updateArticleResponse.status()).toBe(200);
    expect(updateArticleResponsejson.article.title).toEqual("Test New Title");
    const newSlugArticleId = updateArticleResponsejson.article.slug;



    // now in the below we are verifying the article published is getting retrieved

    const articleResponse = await request.get("https://conduit-api.bondaracademy.com/api/articles?limit=10&offset=0",{
        headers:{
             Authorization:tokenJWTValue
        }
    });
    const articleResponseJson = await articleResponse.json();
    expect(articleResponse.status()).toBe(200);
    expect(articleResponseJson.articles[0].title).toEqual("Test New Title");


    //below snippet is to delete the article created by using the param slugArticleId.

    const deleteArticleResponse = await request.delete(`https://conduit-api.bondaracademy.com/api/articles/${newSlugArticleId}`,{

        headers:{
             Authorization:tokenJWTValue
        }
    });

    expect(deleteArticleResponse.status()).toEqual(204);

});