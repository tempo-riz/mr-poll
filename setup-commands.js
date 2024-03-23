import fs from "fs";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";
import { REST, Routes, Collection } from "discord.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


export async function setupCommands(client) {

    const jsonCommands = [];
    const rest = new REST().setToken(process.env.DISCORD_TOKEN);

    client.commands = new Collection();

    const commandsFolderPath = path.join(__dirname, "commands");

    try {
        const commandFiles = fs.readdirSync(commandsFolderPath);

        for (const file of commandFiles) {
            if (!file.endsWith(".js")) continue;
            const filePath = pathToFileURL(path.join(commandsFolderPath, file));
            try {
                const { data, execute } = await import(filePath);

                if (data && execute) {
                    client.commands.set(data.name, { data, execute });
                    jsonCommands.push(data.toJSON());

                } else {
                    console.log(
                        `[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`
                    );
                }
            } catch (error) {
                console.error(`Error importing command from ${filePath}:`, error);
            }
        }
    } catch (error) {
        console.error("Error reading directory:", error);
    }

    try {
        console.log(
            `Started refreshing ${jsonCommands.length} application (/) commands.`
        );

        // The put method is used to fully refresh all commands in the guild with the current set
        const data = await rest.put(
            Routes.applicationCommands(process.env.APPLICATION_ID),
            { body: jsonCommands }
        );

        console.log(
            `Successfully reloaded ${data.length} application (/) commands.`
        );
    } catch (error) {
        // And of course, make sure you catch and log any errors!
        console.error(error);
    }
}
