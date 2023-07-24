const axios = require('axios');
const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    cooldown: 15,
    data: new SlashCommandBuilder()
        .setName('track')
        .setNameLocalizations({
            "fr": 'suivre',
            "es-ES": 'rastrear',
            "de": 'verfolgen',
            "pt-BR": 'rastrear',
            "it": 'tracciare'
        })
        .setDescription('Lets you track a parcel and get notified in your DMs.')
        .setDescriptionLocalizations({
            "fr": 'Vous laisse suivre un colis et être notifié dans vos MPs.',
            "es-ES": 'Te permite rastrear un paquete y recibir notificaciones en tus MTs.',
            "de": 'Ermöglicht es Ihnen, ein Paket zu verfolgen und in Ihren DNs benachrichtigt zu werden.',
            "pt-BR": 'Permite que você rastreie um pacote e seja notificado em seus MDs.',
            "it": 'Permette di tracciare un pacco e di ricevere una notifica nei propri MDs.'
        })
        .addStringOption(option =>
            option.setName('track-id')
                .setNameLocalizations({
                    "fr": 'n-suivi',
                    "es-ES": 'n-rastrear',
                    "de": 'n-verfolgen',
                    "pt-BR": 'n-rastrear',
                    "it": 'n-tracciare'
                })
                .setDescription('Your Parcel\'s tracking ID.')
                .setDescriptionLocalizations({
                    "fr": 'Le numéro de suivi de votre paquet.',
                    "es-ES": 'Numero de rastrear de su paquete.',
                    "de": 'Die Verfolgen Nummer Ihres Pakets.',
                    "pt-BR": 'O número de rastreamento de sua encomenda.',
                    "it": 'Il numero di tracciamento del pacco.'
                })
                .setRequired(true)),
    async execute(interaction) {
        const trackId = interaction.options.getString('track-id');

        const data = JSON.stringify({
            "shipments": [
                {
                    "trackingId": trackId,
                    "destinationCountry": "Canada"
                }
            ],
            "language": "en",
            "apiKey": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOiJlOGM1YTdhMC0xZmVhLTExZWUtOGZmZi00NWYzMTIzNzFkNjQiLCJzdWJJZCI6IjY0YWQ1MjZjMTM2YjBmNjdkNjU0ZDk4ZiIsImlhdCI6MTY4OTA4MDQyOH0.yOEXSonnmnnUibv0mbHSCAqq4Ykb5Ed90JwdqMBt3Lg"
        });

        const config = {
            method: 'post',
            url: 'https://parcelsapp.com/api/v3/shipments/tracking',
            headers: {
                'Content-Type': 'application/json'
            },
            data: data
        };

        try {
            const response = await axios(config);
            const shipmentData = response.data; // Assuming the response data contains the shipment information

            if (shipmentData.error) {
                const replyInvalidTrackingLocales = {
                    "fr": 'Numéro de suivi invalide. Veuillez fournir un numéro de suivi valide.',
                    "es-ES": 'Número de seguimiento no válido. Proporcione un número de seguimiento válido.',
                    "de": 'Ungültige Kontrollnummer. Bitte geben Sie eine gültige Trackingnummer an.',
                    "pt-BR": 'Número de rastreamento inválido. Forneça um número de rastreamento válido.',
                    "it": 'Numero di tracciamento non valido. Si prega di fornire un numero di tracciamento valido.'                
                };
                await interaction.reply({ 
                    content: replyInvalidTrackingLocales[interaction.locale] ?? 'Invalid tracking number. Please provide a valid tracking number.',
                    ephemeral: true,
                });
                return;
            }
			
            const message = `
**Parcel Tracking**
🏷️ Tracking ID: ${trackId}
🧿 Status: ${shipmentData.status}
🗓️ Estimated Delivery Date: ${shipmentData.estimatedDeliveryDate}
📌 Destination: ${shipmentData.destinationCountry}
`;
            const replyLocales = {
                "fr": 'J\' envoyé les informations de votre colis dans vos MPs.',
                "es-ES": 'He enviado la información del envío a sus MTs.',
                "de": 'Ich habe die Versandinformationen an Ihre DNs geschickt.',
                "pt-BR": 'Enviei as informações de remessa para seus MDs.',
                "it": 'Ho inviato le informazioni sulla spedizione ai vostri MDs.'                
            };

            await interaction.user.send({ content: message, ephemeral: true });
            await interaction.reply({
				content: replyLocales[interaction.locale] ?? 'I have sent the shipment information to your DMs.',
				ephemeral: true,
			});
        } catch (error) {
            console.log(error);
            const replyErrorLocales = {
                "fr": 'Une erreur s\'est produite lors du suivi du colis.',
                "es-ES": 'Se ha producido un error al rastrear el paquete.',
                "de": 'Bei der Verfolgung des Pakets ist ein Fehler aufgetreten.',
                "pt-BR": 'Ocorreu um erro ao rastrear a encomenda.',
                "it": 'Si è verificato un errore durante il tracciamento del pacco.'                
            };
            await interaction.reply({
				content: replyErrorLocales[interaction.locale] ?? 'An error occurred while tracking the parcel.',
				ephemeral: true,
			});
        }
    },
};