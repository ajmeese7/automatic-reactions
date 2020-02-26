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
        console.error("Problem loading user list:", err);
        var users = {
            id: "users",
            users: []
        }

        // Initialize for the first time
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

    // TODO: Add an else for this that catches if false
    if (!!userList)
    userList.forEach(function (userId) {
        if (message.author.id == userId) {
            // IDEA: Have way to custom select emoji here, or do they have
            // to manually add it?
            // IDEA: Could make each user have their own reaction array with sub-arrays
            message.react("673643185997873182")
            .then(console.log("Reacted to user!"))
            .catch(function(err) {
                console.error("[ERROR] Problem reacting! Message was probably deleted, but here's the full output anyways =>", err);
            });
        }
    });

    if (command == "add") {
        // TODO: Abstract into function since code is repeated
        var mentionedUser;

        // Gets required user before message deletion
        if (message.mentions.users.first()) {
            mentionedUser = message.mentions.users.first().id;
        } else {
            console.log("This user is not valid! Exiting function...");
            return;
        }

        // Deletes the command message
        message.member.lastMessage.delete().catch(console.error);

        if (!!mentionedUser) {
            var currentUserList;
            store.load("users", function(err, json) {
                if (err) {
                    console.error("Problem loading user list:", err);
                } else {
                    currentUserList = json.users;
                    currentUserList.push(mentionedUser);

                    // To make it wait until the dat has been retrieved
                    updateUserList(currentUserList);
                }
            });
        } else {
            // Last message sent; user not specified
            console.log("Specify a user to add to list!");
        }
    } else if (command == "remove") {
        var mentionedUser;

        // Gets required user before message deletion
        if (message.mentions.users.first()) {
            mentionedUser = message.mentions.users.first().id;
        } else {
            console.log("This user is not valid! Exiting function...");
            return;
        }

        // Deletes the command message
        message.member.lastMessage.delete().catch(console.error);

        if (!!mentionedUser) {
            var index = userList.indexOf(mentionedUser);
     
            if (index > -1) {
                userList.splice(index, 1);
                updateUserList(userList);
            } else {
                console.log("That user is not on the reaction list!");
            }
        } else {
            // Last message sent; user not specified
            console.log("Specify a user to remove from the reaction list!");
        }
    }
});

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

client.login(config.botToken);