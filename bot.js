const { Client } = require('discord.js-selfbot-v13');
const { spawn } = require('child_process');
const fs = require('fs');
const player = require('play-sound')(opts = {});
const client = new Client({
    checkUpdate: false,
});

const data = fs.readFileSync('config.json', 'utf8');
const config = JSON.parse(data);
let lastUser = {};

// To Do 
// Date & Heure 
// Username quand $im
// Pas affiche speudo si déjà detecté 

function printColoredText(text, color) {
    const colors = {
      reset: '\x1b[0m',
      black: '\x1b[90m',
      red: '\x1b[31m',
      green: '\x1b[32m',
      yellow: '\x1b[33m',
      blue: '\x1b[34m',
      magenta: '\x1b[35m',
      cyan: '\x1b[36m',
      white: '\x1b[37m',
    };
  
    const colorCode = colors[color] || colors.reset;
    return `${colorCode}${text}${colors.reset}`;
}

function openDiscordWithLink(inviteURL) {
    const platform = process.platform;
    let command, args;
  
    switch (platform) {
        case 'win32':
            command = 'cmd';
            args = ['/c', 'start', inviteURL];
            break;
        case 'darwin':
            command = 'open';
            args = [inviteURL];
            break;
        case 'linux':
            command = 'xdg-open';
            args = [inviteURL];
            break;
        default:
            console.error('Plateforme non supportée.');
            return;
    }
  
    const child = spawn(command, args);
  
    child.on('error', (error) => {
        console.error('Erreur:', error.message);
    });
}

function claimCharacter(message,embed,delay){
    process.stdout.write(printColoredText("The character " + printColoredText(embed.author.name,"cyan") + printColoredText(" has been detected on the server ","green") + server + printColoredText(" !","green"),"green"))
    console.log(printColoredText(" ( rolled by " + username + printColoredText(" )","black"),"black"))
    setTimeout(async function(){
        try{
            const invite = await message.channel.createInvite({ maxAge: 0, maxUses: 0 });
            openDiscordWithLink(invite.url)
            console.log(printColoredText("                       ======> ","green") + printColoredText(invite.url,"magenta"))
        }catch(err){
            console.log(printColoredText(err,"red"));
        }
    },0)
    player.play("./notification.mp3")
    setTimeout(function(){
        message.clickButton({ row: 0, col: 0})
    },delay)
    return true
}

client.on('ready', async () => {
    console.log( printColoredText("Bot successfully logged as user ","green") + printColoredText(`${client.user.username}`,"yellow") + printColoredText(" !","green"));
})

var username;
var commandUsed;
var server;
client.on('messageCreate', (message) => {
    if(message.author == "432610292342587392"){
        message.embeds.forEach( (embed) => {
            try{
                if(embed.author.name == "" | embed.author.name.includes("harem")){ return false }
                const data = fs.readFileSync('config.json', 'utf8');
                const config = JSON.parse(data);
                const date = new Date();
                function formatDate(str){
                    return String(str).padStart(2,'0');
                }
                let dateStr = "[" + formatDate(date.getDate()) + "/" + formatDate(date.getMonth() + 1) + "/" + formatDate(date.getFullYear()) + "](" + formatDate(date.getHours()) + ":" + formatDate(date.getMinutes()) + ":" + formatDate(date.getSeconds()) + ")";
                if (message.interaction) {
                    username = message.interaction.user.username;
                    commandUsed = message.interaction.commandName;
                }else{
                    username = printColoredText(lastUser[message.guildId].author.username,"yellow");
                    commandUsed = lastUser[message.guildId].content;
                }
                server = printColoredText(message.guild.name,"yellow");
                if (embed.description.toLowerCase().includes("rank") | !embed.description.toLowerCase().includes(":kakera:")) {
                    if(embed.author.name != "" & commandUsed.includes("$im")){
                        process.stdout.write(printColoredText(dateStr + " ","black"))
                        console.log(username + " used " + printColoredText(commandUsed.includes("$ima") ? "ima" : "im","blue") + " command on " + printColoredText(embed.author.name.split("0/")[0],"cyan") + ".")
                    }
                    return false 
                }
                process.stdout.write(printColoredText(dateStr + " ","black"))
                for( const character of config.character ) {
                    if(character == embed.author.name){
                        return claimCharacter(message,embed,config.delaycharacter)
                    }
                }
                for( const category of config.category ) {
                    if(embed.description.toLowerCase().includes(category.toLowerCase())){
                        return claimCharacter(message,embed,config.delaycategory)
                    }
                }
                console.log(printColoredText(embed.author.name,"cyan") + " has been roll on the server " + server + " by " + username + ".");
            }catch(err){
                console.log(printColoredText(err,"red"));
            }
        });
    }else{
        lastUser[message.guildId] = message;
    }
})

// Minlo
//client.login('MzM3Mjk1NzU0NjA5ODE5NjUw.GNo2u-.JXqQppj2sjFhTP3r7wxIptnLh5i6HkClZk-O4M');
// Moi 
//client.login('MzMxODEzNjg4MjgzNDk2NDY4.G3ibH4.kfmHs4pNCZJJS3iEuHfevuVdBmcma1pLkTGkWs');
client.login(config.token);
