# PocketAssistant

PocketAssistant helps you fetch and export Pocket data under specific conditions regularly.

## Usage

Make sure you've created file `profile.json` in root before trying to start app. Profile is private and unique, so it's ignored by git.

```json
{
  "consumer_key": "**"
}
```

Your _Consumer Key_ can be found in <https://getpocket.com/developer/apps/>.

Run `yarn start` locally, starting both static app and server.

- Server is in charge of the access authorization and HTTP communication with Pocket server. 
- Statis app provides interactions, such as fetching and exporting data.

## Tips

Everytime you start the dev servers, you are in one independent and anonymous environment for authorization.

Though, we use browser localStorage to help maintain the accessable status by holding tokens.

Jumping to Pocket Auth page is required when, the first time you login, the token has expired, or you cleanup the browser cache.

## Refs

- https://getpocket.com/developer/docs/overview
- https://getpocket.com/developer/apps/new
- https://getpocket.com/developer/docs/errors
