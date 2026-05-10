import { test } from '../utils/fixtures';
import { expect } from '../utils/custom-expect';

[
    { username: "dd", usernameErrorMessage: "is too short (minimum is 3 characters)" },
    { username: "ddd", usernameErrorMessage: "" },
    { username: "dddddddddddddddddddd", usernameErrorMessage: "" },
    { username: "ddddddddddddddddddddd", usernameErrorMessage: "is too long (maximum is 20 characters)" },

].forEach(({ username, usernameErrorMessage }) => {

    test(`Error Message Validation for ${username}`, async ({ api }) => {

        const errorResponse = await api
            .path("/users")
            .body({
                "user": {
                    "email": "aa",
                    "password": "aa",
                    "username": username
                }
            })
            .postRequest(422);

        if (username.length == 3 || username.length == 20) {
            expect(errorResponse.errors).not.toHaveProperty("username")
        } else {
            expect(errorResponse.errors.username[0]).toEqual(usernameErrorMessage)
        }
    })
})

