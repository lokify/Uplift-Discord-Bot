// index.js
require("dotenv").config();
const { Client, GatewayIntentBits } = require("discord.js");
const fs = require("fs");
const path = require("path");
const keepAlive = require("./server.js");

console.log('Starting bot...');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ],
});

const dataPath = path.join(__dirname, "data.json");

function loadData() {
    if (fs.existsSync(dataPath)) {
        const data = fs.readFileSync(dataPath, "utf-8");
        return JSON.parse(data);
    }
    return { responding: true, encouragements: [] };
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
    if (msg.author.bot) return; // Ignore bot messages
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
        if (newEncouragement) {
            data.encouragements.push(newEncouragement);
            saveData(data);
            msg.channel.send("New encouragement added.");
        } else {
            msg.channel.send("Please provide a valid encouragement message.");
        }
    }

    if (msg.content.startsWith("$del")) {
        const index = parseInt(msg.content.split("$del ")[1]);
        if (!isNaN(index) && index >= 0 && index < data.encouragements.length) {
            data.encouragements.splice(index, 1);
            saveData(data);
            msg.channel.send("Encouragement deleted.");
        } else {
            msg.channel.send("Invalid index.");
        }
    }

    if (sadWords.some((word) => msg.content.toLowerCase().includes(word.toLowerCase()))) {
        const encouragement =
            data.encouragements[Math.floor(Math.random() * data.encouragements.length)];
        if (encouragement) {
            msg.reply(encouragement);
        }
    }

    if (msg.content === "$list") {
        if (data.encouragements.length > 0) {
            msg.channel.send(data.encouragements.join("\n"));
        } else {
            msg.channel.send("No encouragements found.");
        }
    }
});

try {
    client.login(process.env.TOKEN).then(() => {
        console.log("Login successful!");
    }).catch((error) => {
        console.error("Error during login:", error);
    });
} catch (error) {
    console.error("Unexpected error:", error);
}

// Start the keep-alive server
keepAlive();
