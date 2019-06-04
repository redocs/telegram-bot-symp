const Telegraf = require('telegraf');
const session = require('telegraf/session');
const Stage = require('telegraf/stage');
const Markup = require('telegraf/markup');
const WizardScene = require('telegraf/scenes/wizard');
require('dotenv').config();

let chatObject = {};
const superWizard = new WizardScene(
    'super-wizard',
    ctx => {
        ctx.reply(
            'Suggerisci un Contenuto a Symposium',
            Markup.inlineKeyboard([Markup.callbackButton('Partenza', 'next')]).extra()
        );
        console.log('Partenza', ctx.message);
        return ctx.wizard.next();
    },
    ctx => {
        ctx.reply('Step 2. Inserisci il Titolo');
        //console.log('Step 2', ctx.message);
        return ctx.wizard.next();
    },
    ctx => {
        ctx.reply('Step 3. Autore');
        chatObject.titolo = ctx.message.text;
        console.log('Titolo', ctx.message.text);
        return ctx.wizard.next();
    },
    ctx => {
        ctx.reply(
            'Step 4. Anno (opzionale)',
            Markup.inlineKeyboard([Markup.callbackButton('Salta', 'next')]).extra()
        );
        chatObject.autore = ctx.message.text;
        console.log('Autore', ctx.message.text);
        return ctx.wizard.next();
    },
    ctx => {
        ctx.reply(
            'Step 5. Categoria',
            Markup.keyboard([
                ['Cinema', 'Poesia', 'Arte'], // Row1 with 2 buttons
                ['Architettura', 'Pittura', 'Romanzo'], // Row2 with 2 buttons
                ['Fotografia', 'Fumetto', 'Scultura'] // Row3 with 3 buttons
            ])
            .oneTime()
            .resize()
            .extra()
        );
        if (ctx.message) {
            chatObject.anno = ctx.message.text;
            console.log('Anno', ctx.message.text);
        }
        return ctx.wizard.next();
    },
    ctx => {
        ctx.reply(
            'Step 6. Stato (opzionale)',
            Markup.inlineKeyboard([Markup.callbackButton('Salta', 'next')]).extra()
        );
        if (ctx.message) {
            chatObject.categoria = ctx.message.text;
            console.log('Categoria', ctx.message.text);
        }
        return ctx.wizard.next();
    },
    ctx => {
        ctx.reply(
            'Step 7. Carica Immagine, allega un Link a un Video o Inserisci il Testo'
        );
        if (ctx.message) {
            chatObject.stato = ctx.message.text;
            console.log('Stato', ctx.message.text);
        }
        return ctx.wizard.next();
    },
    ctx => {
        ctx.reply('Suggerimento ricevuto, grazie!');
        if (ctx.message) {
            if (typeof ctx.message.photo !== 'undefined') {
                sendMedia = ctx.message;
                console.log('Media', ctx.message);
            }
            if (typeof ctx.message.text !== 'undefined') {
                chatObject.media = ctx.message.text;
                console.log('Media', ctx.message.text);
            }
        }
        console.log({
            chatObject
        });
        var testo = '<b>Titolo:</b> ' + chatObject.titolo + '\n';
        testo += '<b>Autore:</b> ' + chatObject.autore + '\n';
        testo += chatObject.anno ? '<b>Anno:</b> ' + chatObject.anno + '\n' : '';
        testo += chatObject.categoria ?
            '<b>Categoria:</b> ' + chatObject.categoria + '\n' :
            '';
        testo += chatObject.stato ? '<b>Stato:</b> ' + chatObject.stato + '\n' : '';
        testo += chatObject.media ? '<b>Media:</b> ' + chatObject.media + '\n' : '';
        ctx.telegram.sendMessage(37052591, testo, {
            parse_mode: 'HTML'
        });
        if (typeof sendMedia !== 'undefined') {
            ctx.telegram.sendPhoto(37052591, sendMedia.photo[0].file_id);
        }
        return ctx.scene.leave();
    }
);

let configToken = process.env.TELEGRAF_TOKEN

const bot = new Telegraf(configToken);

const stage = new Stage([superWizard], {
    default: 'super-wizard'
});
bot.use(session());
bot.use(stage.middleware());
bot.launch();