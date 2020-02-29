const Discord = require('discord.js');
const client = new Discord.Client();
const config = require('./config.json');
var store = require('json-fs-store')();
client.config = config;

client.once('ready', () => {
	console.log('Ready to react!');
});

// TODO: Make this cleaner, like an init function
var userList;
store.load("users", function(err, json) {
    if (err) {
        // Initialize for the first time
        var users = {
            id: "users",
            users: []
        }

        store.add(users, function(err) {
            if (err) {
                console.error("Problem creating user storage:", err);
            } else {
                console.log(`Created user storage!`);
                store.load("users", function(err, json) {
                    if (err) {
                        console.error("Problem setting userList after creation:", err);
                    } else {
                        console.log(`Successfully set userList variable!`);
                        userList = json.users;
                    }
                });
            }
        });
    } else {
        console.log("Set userList successfully!");
        userList = json.users;
    }
});

const prefix = config.prefix;
client.on('message', message => {
    const args = message.content.slice(prefix.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();
    reactIfUserOnList(message);

    if (command == "add") {
        if (args.length == 1) {
            console.log(`${prefix}add doesn't work that way! You need to include at least one reaction.`);
            return;
        }

        // Deletes the command message
        var mentionedUser = getMentionedUser(message);
        message.member.lastMessage.delete().catch(console.error);

        if (!!mentionedUser) {
            var currentUserList;
            store.load("users", function(err, json) {
                if (err) {
                    console.error("Problem loading user list:", err);
                } else {
                    var index = userList.indexOf(mentionedUser);
     
                    if (index < 0) {
                        currentUserList = json.users;
                        var newUser = {
                            user: mentionedUser,
                            reactions: generateReactionArray(args)
                        }

                        // Add the user and their reaction array to the currentUserList
                        currentUserList.push(newUser);
                        updateUserList(currentUserList);
                    } else {
                        console.log("That user is already on the reaction list!");
                    }
                }
            });
        } else {
            // Last message sent; user not specified
            console.log("Specify a user to add to the reaction list!");
        }
    } else if (command == "remove") {
        // Deletes the command message
        var mentionedUser = getMentionedUser(message);
        message.member.lastMessage.delete().catch(console.error);

        if (!!mentionedUser) {
            var userNotFound = true;
            userList.forEach(function (user, index) {
                if (user.user == mentionedUser) {
                    userList.splice(index, 1);
                    updateUserList(userList);
                    userNotFound = false;
                }
            });

            if (userNotFound) console.log("That user is not on the reaction list!");
        } else {
            // Last message sent; user not specified
            console.log("Specify a user to remove from the reaction list!");
        }
    } else if (command == "clear") {
        var users = [];
        updateUserList(users);
        message.member.lastMessage.delete().catch(console.error)
    }
});

/**
 * Goes over the user list to see if the author is on it, and if
 * they are it reacts the reaction array in order to their message.
 * @param {object} message - the sent message object
 */
function reactIfUserOnList(message) {
    if (!!userList) {
        // Iterate over user list to see if user is on it
        userList.forEach(async function (userData) {
            var userId = userData.user;
            if (message.author.id == userId) {
                // Copied almost entirely from my multiple-reactions repository
                var reactions = userData.reactions;
                var breakLoop = false;

                // Iterate over reaction array to add all reactions in order
                for (i = 0; i < reactions.length; i++) {
                    if (breakLoop) break;
                    var userReaction = client.emojis.get(reactions[i]);
                    
                    // Discord native emoji or server/Nitro
                    if (reactions[i].length < 8 || userReaction) {
                        // https://discordjs.guide/popular-topics/reactions.html#reacting-in-order
                        await message.react(reactions[i]).catch(function(err) {
                            console.log("The last message that user sent was deleted! Cannot react...");
                            breakLoop = true;
                        });
                    } else {
                        console.log("Emoji not available on server or your client..."); 
                    }
                }
            }
        });
    } else {
        console.log("There is no user list! Did you delete a file while the program was running or something?");
    }
}

// Either returns the mentioned user if there is one or null
// if there wasn't a user mentioned.
function getMentionedUser(message) {
    // Gets required user before message deletion
    if (message.mentions.users.first()) {
        var mentionedUser = message.mentions.users.first().id;
        return mentionedUser;
    } else {
        return "";
    }
}

/**
 * Adds new file if it doesn't exist and overwrites it if it does
 * with the new list of users to react to.
 * @param {array} newUserArray - list of user IDs to send to file
 */
function updateUserList(newUserArray) {
    var newUserList = {
        id: "users",
        users: newUserArray
    }

    store.add(newUserList, function(err) {
        if (err) {
            console.error("Problem adding new user:", err);
        } else {
            console.log("Successfully modified reaction list!");
            userList = newUserArray;
        }
    });
}


/**
 * Iterates over arguments passed and turns that into a list of
 * reactions that will be sent when the command is called.
 * @param {array} args - array of arguments passed from user
 * @returns {array} array of reaction emojis
 */
function generateReactionArray(args) {
    // Get reactions from arguments after `/set {commandName}`
    var reactionArray = [];
    for (i = 1; i < args.length; i++) {
        // Gets the ID, not just the emoji
        var emojiCode = "\\" + args[i];
        
        if (emojiCode.indexOf(':') != -1) {
            // Gets the emoji ID of custom emojis
            console.log("Gathering custom emoji ID...");
            emojiCode = emojiCode.split(':')[2];
            emojiCode = emojiCode.substring(0, emojiCode.length - 1);
        } else {
            // Remove the backslashes
            emojiCode = args[i];
        }

        // [i-1] to ignore the commandName and start at 0 for reactions
        reactionArray[i-1] = emojiCode;
    }

    return reactionArray;
}

client.login(config.botToken);