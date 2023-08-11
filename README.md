<p align="center">
  <h1 align="center">😎Automatic Reactions😎</h1>
</p>

<p align="center">
  <a href="https://github.com/ajmeese7/automatic-reactions/search?l=javascript">
    <img src="https://img.shields.io/badge/language-javascript-blue?color=FF69B4" alt="JavaScript" />
  </a>
  <a href="https://github.com/ajmeese7/automatic-reactions/blob/master/LICENSE.md">
    <img src="https://img.shields.io/github/license/ajmeese7/automatic-reactions" alt="License" />
  </a>
  <a href="https://github.com/ajmeese7/automatic-reactions/stargazers">
    <img src="https://img.shields.io/github/stars/ajmeese7/automatic-reactions" alt="Stars" />
  </a>
  <a href="https://github.com/ajmeese7/automatic-reactions/network/members">
    <img src="https://img.shields.io/github/forks/ajmeese7/automatic-reactions" alt="Forks" />
  </a>
  <a href="https://github.com/ajmeese7/automatic-reactions/stargazers">
    <img src="https://img.shields.io/static/v1?label=%F0%9F%8C%9F&message=If%20Useful&style=style=flat&color=BC4E99" alt="Leave a Star!"/>
  </a>
</p>

<p align="center">
  <img alt="Automatic reaction usage GIF" src="https://user-images.githubusercontent.com/17814535/75614332-56efc000-5afd-11ea-8b2b-3f2c49ece2be.gif">
</p>

If you want to be *that* guy, you can now be *that* guy.

This project is perfect for mildly agitating that one guy that you don't vibe with in a passive-aggressive manner.
I love to use this as a way to get people to stop being stupid by reacting with the animated wheelchair emoji,
so I thought it would be useful for other people as well. Feel free to create an issue with feedback, and if you
like it leave a star!

If you're interested in this project, you'll like my other reaction-centric project: [multiple-reactions](https://github.com/ajmeese7/multiple-reactions).

**Note:** Using a selfbot may violate the [Discord terms of service](https://discordapp.com/terms). If you use this, your 
account could be shut down. I claim no responsibility if this happens to you. You have been warned.

## Downloading

In a command prompt in your projects folder (wherever that may be), run the following:

`git clone https://github.com/ajmeese7/automatic-reactions`

Once finished:

- Ensure you have NodeJS installed on your PC by running `npm`. If not, Google how to install it and do that now
- Download the repository, unzip it, and run `npm install` from a terminal in the project folder
- Edit `config.json` and enter *your* token and desired prefix. It should look like this afterwards:

```json
{
  "botToken": "YOUR_TOKEN_HERE",
  "prefix": "YOUR_DESIRED_PREFIX_HERE"
}
```

**NOTE**: This will not work if you are running `discord.js>=11.6.3`. This project will install
a working version of Discord.js by default, but if you are still having any issues you can try running the
following command:

`npm install discord.js@11.6.2`

## Getting your login token

Go to [this link](https://github.com/Tyrrrz/DiscordChatExporter/blob/master/.docs/Token-and-IDs.md) and follow the instructions
to get your login token.

> **KEEP YOUR TOKEN SECRET, AND NEVER SHARE IT WITH ANYONE**

## Controlling the bot

To start the bot, open a command prompt from the folder containing the repository and run:

`node auto`

To stop it, click on the terminal and press **CTRL+C**, which will kill the process. Clicking the big red x works just as well.

## Commands

The current supported commands are the following:

| Command | Arguments | Action |
|---------|---------------------------------------------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------|
| add | `user` - the user you want to be automatically reacted to. <br> `emojis` - as many emojis as you want to chain. At least one is required. | Creates and stores a JSON file with the emojis you want to react with and the user you want to react to. |
| remove | `user` - the user you want to remove from the list. | Removes the specified user from the list and leaves the rest of the list untouched. |
| channels | `user` - the user you want to change the channels for. | Only reacts to messages sent by the user in the specified channels. |
| autochannels | `channels` - the channels you want to automatically react in regardless of who sends the message. <br> `emojis` - as many emojis as you want to chain. At least one is required.  | Only reacts to messages sent by the user in the specified channels. |
| clear | n/a | Removes all the users and their reactions from the list to give you a fresh start. |

### Examples
These examples demonstrate the usage if your prefix is `!`:

- `!add @ajmeese7#4835 :heart: :eyes:`
  - Will automatically react to ajmeese7 in any channel with the heart and eyes emojis
- `!remove @ajmeeese7#4835`
  - Clears all reactions from ajmeese7
- `!channels @ajmeese7#4835 #general #bot-spam`
  - Adds support for reactions in only the general and bot-spam channels
  - NOTE: Must have the #, so the channel's ID can be extracted from the command
- `!channels @ajmeese7#4835`
  - Removes channel requirements, allowing automatic reactions in any channel
- `!autochannels #general #bot-spam :heart: :eyes:`
  - Adds support for reactions in the general and bot-spam channels for **any** user
- `!clear`
  - Removes all reactions for all users, giving you a fresh start

## Feature wishlist
- Add support for roles
