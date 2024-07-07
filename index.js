require("dotenv").config();
console.log(`Loaded token: ${process.env.TOKEN ? "Token Loaded" : "No Token"}`); // Debugging line

const { Client, GatewayIntentBits } = require("discord.js");
const fs = require("fs");
const path = require("path");
const keepAlive = require("./server.js");

console.log('Starting bot...');

if (!process.env.TOKEN) {
    console.error("Bot token not found. Please set the TOKEN in your .env file.");
    process.exit(1);
}

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ],
});

const dataPath = path.join(__dirname, "data.json");

function loadData() {
    const data = fs.readFileSync(dataPath, "utf-8");
    return JSON.parse(data);
}

function saveData(data) {
    fs.writeFileSync(dataPath, JSON.stringify(data, null, 2), "utf-8");
}

const sadWords = [
    "sad",
    "depressed",
    "kyu nhi ho rhi padhai",
    "unhappy",
    "help me",
    "why always me",
];

async function getQuote() {
    const fetch = (await import("node-fetch")).default;
    return fetch("http://zenquotes.io/api/random")
        .then((res) => res.json())
        .then((data) => data[0]["q"] + " -" + data[0]["a"]);
}

client.once("ready", () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on("messageCreate", (msg) => {
    const data = loadData();

    if (msg.content === "$ping") {
        msg.channel.send("Pong! The bot is active.");
    }

    if (msg.content === "$toggle") {
        data.responding = !data.responding;
        saveData(data);
        msg.channel.send(`Bot responding is now ${data.responding ? "ON" : "OFF"}.`);
    }

    if (!data.responding) return;

    if (msg.content === "$inspire") {
        getQuote().then((quote) => msg.channel.send(quote));
    }

    if (msg.content.startsWith("$new")) {
        const newEncouragement = msg.content.split("$new ")[1];
        data.encouragements.push(newEncouragement);
        saveData(data);
        msg.channel.send("New encouragement added.");
    }

    if (msg.content.startsWith("$del")) {
        const index = parseInt(msg.content.split("$del ")[1]);
        if (index >= 0 && index < data.encouragements.length) {
            data.encouragements.splice(index, 1);
            saveData(data);
            msg.channel.send("Encouragement deleted.");
        } else {
            msg.channel.send("Invalid index.");
        }
    }

    if (sadWords.some((word) => msg.content.includes(word))) {
        const encouragement =
            data.encouragements[
                Math.floor(Math.random() * data.encouragements.length)
            ];
        msg.reply(encouragement);
    }

    if (msg.content === "$list") {
        msg.channel.send(data.encouragements.join("\n"));
    }
});

// Error handling for login
client.login(process.env.TOKEN).catch((error) => {
    console.error("Error logging in:", error);
});
