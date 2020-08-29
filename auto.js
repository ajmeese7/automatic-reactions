// Unchanging variables
const Discord = require('discord.js');
const client = new Discord.Client();
const fs = require('fs');
const fileName = "./store/users.json";

// Bot config
const config = require('./config.json');
const prefix = config.prefix;
client.config = config;
client.once('ready', () => console.log('Ready to react!'));

// Get the existing users from users.json, first initializing
// the file if it does not yet exist.
const getUserList = () => {
  if (fs.existsSync(fileName))
    return JSON.parse(fs.readFileSync(fileName)).users;

  // Initialize for the first time
  let users = { id: "users", users: [] }
  fs.writeFileSync(fileName, JSON.stringify(users));
  return getUserList();
}

var userList = getUserList();
client.on('message', (message) => {
  reactIfApplicable(message);

  // If the prefix isn't present, nothing else is necessary since the
  // reaction process has already been carried out.
  let prefixIndex = message.content.substring(0, prefix.length);
  if (message.author.id !== client.user.id) return;
  if (prefixIndex != prefix) return;

  // Deletes the command message
  let mentionedUser = getMentionedUser(message);
  message.member.lastMessage.delete().catch(console.error);

  // Index is -1 if the userList doesn't exist, so the program won't
  // error out if no reactions have been defined yet.
  let userIndex = userList ? userList.findIndex( record => record.user === mentionedUser) : -1;
  const args = message.content.slice(prefix.length).trim().split(/ +/g);
  const command = args.shift().toLowerCase();

  if (command == "add") {
      if (!mentionedUser) return console.log("Specify a user to add to the reaction list!");
      if (args.length == 1)
        return console.log(`${prefix}add doesn't work that way! You need to include at least one reaction.`);

      // Add the user and their reaction array to the userList
      let reactionArray = generateReactionArray(args);
      if (userIndex == -1) {
        // Inserts the new user
        let newUser = { user: mentionedUser, reactions: reactionArray, channels: [] }
        userList.push(newUser);
      } else {
        // Update the current record instead of making a new one
        let currentReactions = userList[userIndex].reactions;
        userList[userIndex].reactions = currentReactions.concat(reactionArray);
      }

      updateUserList(userList);
  } else if (command == "remove") {
      if (!mentionedUser) return console.log("Specify a user to remove from the reaction list!");

      // Check if the user's records exist to be deleted
      let userIndex = userList.findIndex( record => record.user === mentionedUser);
      if (userIndex == -1) return console.log("That user is not on the reaction list!");

      // Deletes the applicable records and updates the list
      userList.splice(userIndex, 1);
      updateUserList(userList);
  } else if (command == "channels") {
      if (!mentionedUser) return console.log("Specify a user to add to the reaction list!");

      // Removes the command from the args
      args.shift();

      // Switches from `<#channelID>` to `channelID`
      let channels = args.map(channel => channel.substring(2, channel.length - 1));
      userList[userIndex].channels = channels;
      updateUserList(userList);
  } else if (command == "clear") {
      let users = [];
      updateUserList(users);
  }
});

/**
 * Goes over the user list to see if the author is on it, and if
 * they are it reacts the reaction array in order to their message.
 * @param {object} message - the sent message object
 */
function reactIfApplicable(message) {
  if (!userList) return;

  // Iterate over user list to see if user is on it
  userList.forEach(async (userData) => {
    // Move on to next user if not a match
    let userId = userData.user;
    if (message.author.id != userId) return;

    // If channels are specified and this channel doesn't fit, break
    let channel = message.channel.id;
    if (userData.channels.length != 0 && userData.channels.indexOf(channel) == -1) return;
    
    // Copied almost entirely from my multiple-reactions repository
    let reactions = userData.reactions;
    let breakLoop = false;

    // Iterate over reaction array to add all reactions in order
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
          // TODO: Clean up this code
          console.log("Emoji not available on server or your client..."); 
        }
    }
  });
}

/**
 * Either returns the mentioned user if there is one or null
 * if there wasn't a user mentioned.
 * @param {object} message - the sent message object
 */
function getMentionedUser(message) {
  // Gets required user before message deletion
  let mentionedUser = message.mentions.users.first();
  return mentionedUser ? mentionedUser.id : "";
}

/**
 * Adds new file if it doesn't exist and overwrites it if it does
 * with the new list of users to react to.
 * @param {array} newUserArray - list of user IDs to send to file
 */
function updateUserList(newUserArray) {
  let newUserList = { id: "users", users: newUserArray }
  fs.writeFileSync(fileName, JSON.stringify(newUserList));
  console.log("Successfully modified reaction list!");
  userList = newUserArray;
}

/**
 * Iterates over arguments passed and turns that into a list of
 * reactions that will be sent when the command is called.
 * @param {array} args - array of arguments passed from user
 * @returns {array} array of reaction emojis
 */
function generateReactionArray(args) {
  // Get reactions from arguments after `/set {commandName}`
  args.shift();
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