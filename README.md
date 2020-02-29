# automatic-reactions
This is the cousin of one of my recent repositories, [multiple-reactions](https://github.com/ajmeese7/multiple-reactions).

![Automatic reaction usage GIF](https://user-images.githubusercontent.com/17814535/75614332-56efc000-5afd-11ea-8b2b-3f2c49ece2be.gif)

If you want to be *that* guy, you can now be *that* guy.

This project is perfect for mildly agitating that one guy that you don't vibe with in a passive-aggressive manner.
I love to use this as a way to get people to stop being stupid by reacting with the animated wheelchair emoji,
so I thought it would be useful for other people as well. Feel free to create an issue with feedback, and if you
like it leave a star!

**Note:** Using a selfbot may violate the [Discord terms of service](https://discordapp.com/terms). If you use this, your 
account could be shut down. I claim no responsibility if this happens to you. You have been warned.

## Downloading

In a command prompt in your projects folder (wherever that may be), run the following:

`git clone https://github.com/ajmeese7/automatic-reactions`

Once finished:

- Ensure you have NodeJS installed on your PC by running `npm`. If not, Google how to install it and do that now
- Download the repository, unzip it, and run `npm install` from a terminal in the project folder
- Edit `config.json` and enter your token and desired prefix. It should look like this afterwards:

```json
{
  "botToken": "YOUR_TOKEN_HERE",
  "prefix": "YOUR_DESIRED_PREFIX_HERE"
}
```

Your prefix can be anything you want, but I tend to use the `/` because you're unlikely to ever use it on accident.

## Getting your login token

0. Open either the web application or the installed Discord app
1. Use the **CTRL+SHIFT+I** keyboard shortcut.
2. This brings up the **Developer Tools**. Go to the **Application** tab
3. On the left, expand **Local Storage**, then click on the discordapp.com entry (it should be the only one).
4. Locate the entry called `token`, and copy it.

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
| clear | n/a | Removes all the users and their reactions from the list to give you a fresh start. |

## Feature wishlist
- Add support for roles
- Add support for specific channels