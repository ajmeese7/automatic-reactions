// Unchanging variables
const Discord = require('discord.js');
const client = new Discord.Client();
const fs = require('fs');
const fileName = "./store/reactions.json";

// Bot config
const config = require('./config.json');
const prefix = config.prefix;
client.config = config;
client.once('ready', () => console.log('Ready to react!'));

// Get the existing data from reactions.json, first initializing
// the file if it does not yet exist.
const getReactionList = () => {
  if (fs.existsSync(fileName))
    return JSON.parse(fs.readFileSync(fileName));

  // Initialize for the first time
  const reactions = { users: [], channels: [] }
  fs.writeFileSync(fileName, JSON.stringify(reactions));
  return getReactionList();
}

var reactionList = getReactionList();
client.on('message', (message) => {
  reactIfApplicable(message);

  // If the prefix isn't present, nothing else is necessary since the
  // reaction process has already been carried out.
  const prefixIndex = message.content.substring(0, prefix.length);
  if (message.author.id !== client.user.id) return;
  if (prefixIndex != prefix) return;

  // Deletes the command message
  const mentionedUser = getMentionedUser(message);
  message.member.lastMessage.delete().catch(console.error);

  const userIndex = reactionList ? reactionList.users.findIndex( record => record.user === mentionedUser) : -1;
  const channelID = message.channel.id;
  const channelIndex = reactionList ? reactionList.channels.findIndex( record => record.channelID === channelID) : -1;
  
  const args = message.content.slice(prefix.length).trim().split(/ +/g);
  const command = args.shift().toLowerCase();

  if (command == "add") {
      if (!mentionedUser) return console.log("Specify a user to add to the reaction list!");
      if (args.length == 1)
        return console.log(`${prefix}add doesn't work that way! You need to include at least one reaction.`);

      // Add the user and their reaction array to the reactionList
      args.shift();
      let reactionArray = generateReactionArray(args);
      if (userIndex == -1) {
        // Inserts the new user
        const newUser = { user: mentionedUser, reactions: reactionArray, channels: [] }
        reactionList.users.push(newUser);
      } else {
        // Update the current record instead of making a new one
        const currentReactions = reactionList.users[userIndex].reactions;
        reactionList.users[userIndex].reactions = currentReactions.concat(reactionArray);
      }

      updateReactionList(reactionList);
  } else if (command == "remove") {
      if (!mentionedUser) return console.log("Specify a user to remove from the reaction list!");

      // Check if the user's records exist to be deleted
      if (userIndex == -1) return console.log("That user is not on the reaction list!");

      // Deletes the applicable records and updates the list
      reactionList.users.splice(userIndex, 1);
      updateReactionList(reactionList);
  } else if (command == "channels") {
      if (!mentionedUser) return console.log("Specify a user to add to the reaction list!");

      // Removes the command from the args
      args.shift();

      // Switches from `<#channelID>` to `channelID`
      const channels = args.map(channel => channel.substring(2, channel.length - 1));
      reactionList[userIndex].channels = channels;
      updateReactionList(reactionList);
  } else if (command == "autochannels") {
      const channels = args.filter(arg => arg.includes('#'));
      const reactionArray = generateReactionArray(args.filter(arg => !arg.includes('#')));
      channels.forEach(channel => {
        if (channelIndex == -1) {
          // Inserts the new channel
          const newChannel = {
            // Switches from `<#channelID>` to `channelID`
            channelID: channel.substring(2, channel.length - 1),
            reactions: reactionArray
          };
          reactionList.channels.push(newChannel);
        } else {
          // Update the current record instead of making a new one
          const currentReactions = reactionList.channels[channelIndex].reactions;
          reactionList.channels[channelIndex].reactions = currentReactions.concat(reactionArray);
        }
      });
      
      updateReactionList(reactionList);
  } else if (command == "clear") {
      updateReactionList([]);
  }
});

/**
 * Goes over the reaction list to see if the author is on it or if the message
 * is in an automatic channel, and if they are it reacts the reaction array in 
 * order to the matching message.
 * @param {object} message - the sent message object
 */
async function reactIfApplicable(message) {
  if (!reactionList) return;
  const channelID = message.channel.id;
  const channelIndex = reactionList.channels.findIndex( record => record.channelID === channelID);
  var reactions = [];

  if (channelIndex != -1) {
    reactions = reactionList.channels[channelIndex].reactions;
  } else {
    const userID = message.author.id;
    const userIndex = reactionList.users.findIndex( record => record.user === userID);
    if (userIndex == -1) return;
    const user = reactionList.users[userIndex];
    if (user.channels.length != 0 && user.channels.indexOf(channel) == -1) return;
    reactions = user.reactions;
  }

  // Iterate over reaction array to add all reactions in order
  let breakLoop = false;
  for (let i = 0; i < reactions.length; i++) {
      if (breakLoop) break;
      let userReaction = client.emojis.get(reactions[i]);
      
      // Discord native emoji or server/Nitro
      if (reactions[i].length < 8 || userReaction) {
        // https://discordjs.guide/popular-topics/reactions.html#reacting-in-order
        await message.react(reactions[i]).catch(err => {
          console.log("The last message that user sent was deleted! Cannot react...");
          breakLoop = true;
        });
      } else {
        console.log("Emoji not available on server or your client..."); 
      }
  }
}

/**
 * Either returns the mentioned user if there is one or null
 * if there wasn't a user mentioned.
 * @param {object} message - the sent message object
 */
function getMentionedUser(message) {
  // Gets required user before message deletion
  const mentionedUser = message.mentions.users.first();
  return mentionedUser ? mentionedUser.id : "";
}

/**
 * Adds new file if it doesn't exist and overwrites it if it does
 * with the new list of users to react to.
 * @param {array} newReactionArray - list of users and channels to be reacted to
 */
function updateReactionList(newReactionArray) {
  fs.writeFileSync(fileName, JSON.stringify(newReactionArray));
  console.log("Successfully modified reaction list!");
  reactionList = newReactionArray;
}

/**
 * Iterates over arguments passed and turns that into a list of
 * reactions that will be sent when the command is called.
 * @param {array} args - array of arguments passed from user
 * @returns {array} array of reaction emojis
 */
function generateReactionArray(args) {
  let reactionArray = [];
  for (i = 0; i < args.length; i++) {
    // Gets the ID, not just the emoji
    let emojiCode = "\\" + args[i];
    if (emojiCode.indexOf(':') != -1) {
      // Gets the emoji ID of custom emojis
      console.log("Gathering custom emoji ID...");
      emojiCode = emojiCode.split(':')[2];
      emojiCode = emojiCode.substring(0, emojiCode.length - 1);
    } else {
      // Remove the backslashes
      emojiCode = args[i];
    }

    reactionArray[i] = emojiCode;
  }

  return reactionArray;
}

client.login(config.botToken);