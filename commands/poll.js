import { SlashCommandBuilder, EmbedBuilder, Colors } from 'discord.js';

// Emojis representing letters (a, b, c, ...)
const emojis = ['🇦', '🇧', '🇨', '🇩', '🇪', '🇫', '🇬', '🇭', '🇮', '🇯'];
const letters = emojis.map((emoji, index) => String.fromCharCode(97 + index));


export const data = new SlashCommandBuilder()
    .setName('poll')
    .setDescription('Creates a poll')
    .addStringOption(option => option.setName('question').setDescription('The question to ask').setRequired(true));

for (let i = 0; i < emojis.length; i++) {
    data.addStringOption(option => option.setName(`choice_${letters[i]}`).setDescription(`The ${i + 1}th option`));
}

export async function execute(interaction) {
    const question = interaction.options.getString('question');
    const options = [];

    const embed = new EmbedBuilder()
        .setTitle(question)
        .setColor('#945C8B')

    // Extracting options from the interaction
    for (let i = 0; i < letters.length; i++) {
        const option = interaction.options.getString(`choice_${letters[i]}`);
        if (option) {
            options.push(option);
        }
    }

    // If there are less than 2 options, create a simple poll with thumbs up and thumbs down reactions
    if (options.length < 2) {
        const pollMessage = await interaction.reply({
            embeds: [embed],
            fetchReply: true
        });
        await pollMessage.react('👍');
        await pollMessage.react('👎');
        return;
    }

    const description = options.map((option, index) => `${emojis[index]} ${option}`).join('\n');

    embed.setDescription(description)


    const pollMessage = await interaction.reply({
        embeds: [embed],
        fetchReply: true
    });

    // Reacting with letter emojis to the poll message
    for (let i = 0; i < options.length; i++) {
        await pollMessage.react(emojis[i]);
    }
}
