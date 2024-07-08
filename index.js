require("dotenv").config();
const { Client, GatewayIntentBits } = require("discord.js");
const fs = require("fs");
const path = require("path");
const keepAlive = require("./server.js");

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

const happyPlaylists = [
    "https://open.spotify.com/playlist/37i9dQZF1DX3rxVfibe1L0",
    "https://open.spotify.com/playlist/37i9dQZF1DX9XIFQuFvzM4",
    
];

const calmingPlaylists = [
    "https://open.spotify.com/playlist/37i9dQZF1DWZqd5JICZI0u",
    "https://open.spotify.com/playlist/37i9dQZF1DX3Ogo9pFvBkY",
    
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

client.on("messageCreate", async (msg) => {
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

        const playlist = calmingPlaylists[Math.floor(Math.random() * calmingPlaylists.length)];
        msg.channel.send(`I'm sorry you're feeling down. Here's a calming playlist that might help: ${playlist}`);
    }

    if (msg.content === "$happy") {
        const playlist = happyPlaylists[Math.floor(Math.random() * happyPlaylists.length)];
        msg.channel.send(`Here's a happy playlist to boost your mood: ${playlist}`);
    }

    if (msg.content === "$list") {
        msg.channel.send(data.encouragements.join("\n"));
    }
});

client.login(process.env.TOKEN);
