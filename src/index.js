const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, Events, GatewayIntentBits } = require('discord.js');
const { token } = require('./../config.json');

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.DirectMessages] });

client.commands = new Collection();
const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
	const commandsPath = path.join(foldersPath, folder);
	const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		const command = require(filePath);
		if ('data' in command && 'execute' in command) {
			client.commands.set(command.data.name, command);
		} else {
			console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
		}
	}
}

client.once(Events.ClientReady, () => {
	console.log('Ready to track!');
});

client.on(Events.InteractionCreate, async interaction => {
	if (!interaction.isChatInputCommand()) return;

	const command = client.commands.get(interaction.commandName);

	if (!command) return;

	try {
		await command.execute(interaction);
	} catch (error) {
		console.error(error);
		if (interaction.replied || interaction.deferred) {
			const followUpLocales = {
				"fr": 'Une erreur s\'est produite lors de l\'exécution de cette commande !',
				"es-ES": 'Se ha producido un error al ejecutar este comando.',
				"de": 'Beim Ausführen dieses Befehls ist ein Fehler aufgetreten!',
				"pt-BR": 'Ocorreu um erro ao executar esse comando!',
				"it": 'Si è verificato un errore durante l\'esecuzione di questo comando!'
			}
			await interaction.followUp({
				content: followUpLocales[interaction.locale] ?? 'There was an error while executing this command!',
				ephemeral: true,
			});
		} else {
			const replyLocales = {
				"fr": 'Une erreur s\'est produite lors de l\'exécution de cette commande !',
				"es-ES": 'Se ha producido un error al ejecutar este comando.',
				"de": 'Beim Ausführen dieses Befehls ist ein Fehler aufgetreten!',
				"pt-BR": 'Ocorreu um erro ao executar esse comando!',
				"it": 'Si è verificato un errore durante l\'esecuzione di questo comando!'
			}
			await interaction.reply({
				content: replyLocales[interaction.locale] ?? 'There was an error while executing this command!',
				ephemeral: true,
			});
		}
	}
});

client.cooldowns = new Collection();

client.login(token);