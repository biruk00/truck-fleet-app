process.env.NTBA_FIX_319 = 1;
process.env.NTBA_FIX_350 = 1;

import TelegramBot from 'node-telegram-bot-api';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

const token = process.env.TELEGRAM_BOT_TOKEN;
const chatId = process.env.TELEGRAM_CHAT_ID;
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const webAppUrl = process.env.WEB_APP_URL || 'https://your-deployed-app.vercel.app'; // Change this to your actual HTTPS URL

if (!token || token === 'your_telegram_bot_token_here') {
  console.error("Error: Please set your TELEGRAM_BOT_TOKEN in the .env file.");
  process.exit(1);
}

// Initialize Supabase Client
const supabase = createClient(supabaseUrl, supabaseKey);

// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(token, { polling: true });

console.log('🤖 Telegram Bot Service Started!');
if (!chatId || chatId === 'your_telegram_chat_id_here') {
    console.log('⚠️ Warning: TELEGRAM_CHAT_ID is not set in .env. The bot will not send automatic alerts.');
    console.log('To get your chat ID, send a message to the bot and check the console logs.');
}

// Handle /start command
bot.onText(/\/start/, (msg) => {
  const currentChatId = msg.chat.id;
  console.log(`[Command] /start received from ${currentChatId}`);
  bot.sendMessage(currentChatId, "Welcome to the TruckFleet Bot! 🚛\n\nI can help you monitor your fleet.\n\nCommands:\n/status [truck_number] - Get the current status of a truck\n/all - List all active trucks\n/admin - Launch the Admin Dashboard\n/help - List all commands")
     .catch(err => console.error("Error sending start message:", err));
  
  if (!chatId || chatId === 'your_telegram_chat_id_here') {
     console.log(`\n🔔 Your Chat ID is: ${currentChatId}`);
     console.log(`Add TELEGRAM_CHAT_ID=${currentChatId} to your .env file to receive automatic alerts!\n`);
  }
});

// Handle /help command
bot.onText(/\/help/, (msg) => {
  const currentChatId = msg.chat.id;
  console.log(`[Command] /help received from ${currentChatId}`);
  bot.sendMessage(currentChatId, "Available Commands:\n\n/status [truck_number] - e.g., /status TRK-001\n/all - List all active trucks\n/admin - Launch the full website to update states\n/help - Show this message\n\nI will also automatically send you alerts when a truck's status changes.")
     .catch(err => console.error("Error sending help message:", err));
});

// Handle /admin command
bot.onText(/\/admin/, (msg) => {
  const currentChatId = msg.chat.id;
  console.log(`[Command] /admin received from ${currentChatId}`);
  
  const options = {
    reply_markup: {
      inline_keyboard: [
        [{ text: "Launch Admin Dashboard 🚀", web_app: { url: webAppUrl } }]
      ]
    }
  };
  
  bot.sendMessage(currentChatId, "Click the button below to launch the Fleet Admin Dashboard. Note: You must be an authorized admin to update status and categories.", options)
     .catch(err => console.error("Error sending admin message:", err));
});

// Handle /status command
bot.onText(/\/status\s+(.+)/, async (msg, match) => {
  const currentChatId = msg.chat.id;
  const plateNumber = match[1].toUpperCase();
  console.log(`[Command] /status ${plateNumber} received from ${currentChatId}`);

  try {
    await bot.sendMessage(currentChatId, `🔍 Searching for truck ${plateNumber}...`);
    
    const { data: trucks, error } = await supabase
      .from('trucks')
      .select('*')
      .ilike('plate_no', `%${plateNumber}%`);

    if (error) {
       console.error("Supabase Error:", error);
       throw error;
    }

    if (!trucks || trucks.length === 0) {
      console.log(`Truck ${plateNumber} not found.`);
      await bot.sendMessage(currentChatId, `❌ Truck ${plateNumber} not found.`);
      return;
    }

    const truck = trucks[0];
    const statusEmoji = {
      'Available': '✅',
      'In Transit': '🚚',
      'Maintenance': '🔧',
      'Loading': '📦',
      'Unloading': '📤'
    }[truck.status] || '📍';

    const message = `
*Truck Info:*
Plate No: ${truck.plate_no}
Status: ${statusEmoji} ${truck.status}
Location: ${truck.current_location || 'Unknown'}
Category: ${truck.category || 'N/A'}
`;

    await bot.sendMessage(currentChatId, message, { parse_mode: 'Markdown' });
    console.log(`[Status] Reply sent for ${plateNumber}`);
  } catch (err) {
    console.error('Error fetching truck status:', err);
    bot.sendMessage(currentChatId, '⚠️ Sorry, there was an error fetching the truck status.')
       .catch(e => console.error("Error sending error message:", e));
  }
});

// Handle /all command
bot.onText(/\/all/, async (msg) => {
  const currentChatId = msg.chat.id;
  console.log(`[Command] /all received from ${currentChatId}`);

  try {
    await bot.sendMessage(currentChatId, `📊 Fetching full fleet daily report...`);
    
    const { data: trucks, error } = await supabase
      .from('trucks')
      .select('*')
      .order('plate_no', { ascending: true });

    if (error) {
       console.error("Supabase Error (/all):", error);
       throw error;
    }

    if (!trucks || trucks.length === 0) {
      console.log('No trucks found.');
      await bot.sendMessage(currentChatId, `❌ No trucks found in the database.`);
      return;
    }

    let historyRecords = [];
    try {
      const { data } = await supabase
        .from('trucks_history')
        .select('plate_no, status, changed_at')
        .order('changed_at', { ascending: false });
      if (data) historyRecords = data;
    } catch (err) {
      console.error('Could not fetch history for dates:', err);
    }

    const date = new Date();
    const dateString = date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
    const timeGreeting = date.getHours() < 12 ? 'Morning' : 'Afternoon';
    const timeDisplay = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    const getStatusDay = (t) => {
      const plateHistory = historyRecords.filter(h => h.plate_no === t.plate_no);
      let earliestStreakDate = null;
      if (plateHistory.length > 0) {
        for (let i = 0; i < plateHistory.length; i++) {
          if ((plateHistory[i].status || '').toLowerCase() === (t.status || '').toLowerCase()) {
            earliestStreakDate = plateHistory[i].changed_at;
          } else {
            break;
          }
        }
      }
      const d = earliestStreakDate ? new Date(earliestStreakDate) : date;
      const day = d.getDate();
      const monthStr = d.toLocaleString('en-US', { month: 'short' });
      return `Arrived ${day}/${monthStr}`;
    };

    const getCat = (t, cat) => (t.category || '').toLowerCase() === cat.toLowerCase();
    const getStat = (t, stat) => (t.status || '').toLowerCase() === stat.toLowerCase();
    const formatNote = (note) => note ? ` ${note.trim()}` : '';
    const groupBy = (array, key) => array.reduce((result, item) => {
      const k = item[key] || 'Unknown';
      (result[k] = result[k] || []).push(item);
      return result;
    }, {});

    const isInactiveStatus = (status) => {
      const s = (status || '').toLowerCase();
      return ['garage', 'parked', 'insurance'].includes(s) || s.includes('node') || s.includes('no driver');
    };
    const isActiveTruck = (t) => !isInactiveStatus(t.status);

    let report = `Dear all\n`;
    report += `Good ${timeGreeting} for u\nInformation here is today\n`;
    report += `All Heavy trucks status (${dateString} --- ${timeGreeting} ${timeDisplay})\n\n`;

    // --- DJIBOUTI SECTION ---
    const djibouti = trucks.filter(t => getCat(t, 'djibouti'));
    const djActive = djibouti.filter(isActiveTruck);
    
    const djCrossed = djActive.filter(t => 
      (t.destination || '').toLowerCase() === 'djibouti' && 
      (t.note || '').toLowerCase().includes('galafi')
    );
    
    const djOngoingEmpty = djActive.filter(t => 
      getStat(t, 'ongoing') && 
      (t.destination || '').toLowerCase() === 'djibouti' && 
      !(t.note || '').toLowerCase().includes('galafi')
    );

    const djOncomingEmpty = djActive.filter(t => 
      getStat(t, 'oncoming') && 
      (t.destination || '').toLowerCase() === 'djibouti' && 
      !(t.note || '').toLowerCase().includes('galafi')
    );

    const djLoadingAtDj = djActive.filter(t => 
      getStat(t, 'loading') && 
      (t.current_location || '').toLowerCase() === 'djibouti'
    );

    const djOthers = djActive.filter(t => !djCrossed.includes(t) && !djOngoingEmpty.includes(t) && !djOncomingEmpty.includes(t) && !djLoadingAtDj.includes(t));

    if (djActive.length > 0) {
      report += `DJIBOUTI (${djActive.length})\n`;

      if (djLoadingAtDj.length > 0) {
        report += `LOADING AT DJIBOUTI (${djLoadingAtDj.length})\n`;
        djLoadingAtDj.forEach(t => report += `${t.plate_no}${formatNote(t.note)} (${getStatusDay(t)})\n`);
        report += `=============================\n\n`;
      }

      if (djCrossed.length > 0) {
        report += `Empty Trucks Crossed to DJIBOUTI\n`;
        report += `On ${dateString}(${djCrossed.length})\n`;
        djCrossed.forEach(t => report += `${t.plate_no}\n`);
        report += `=============================\n\n`;
      }

      if (djOngoingEmpty.length > 0) {
        report += `ONGOING EMPTY TRUCKS TO DJIBOUTI (${djOngoingEmpty.length})\n`;
        djOngoingEmpty.forEach(t => report += `${t.plate_no} ==> ${t.current_location || '?'}${formatNote(t.note)}\n`);
        report += `============================\n\n`;
      }

      if (djOncomingEmpty.length > 0) {
        report += `ONCOMING EMPTY TRUCKS FROM DJIBOUTI (${djOncomingEmpty.length})\n`;
        djOncomingEmpty.forEach(t => report += `${t.plate_no} ==> ${t.current_location || '?'}${formatNote(t.note)}\n`);
        report += `============================\n\n`;
      }

      if (djOthers.length > 0) {
        report += `FERTLIZER (${djOthers.length})\n`;

        const djLoad = djOthers.filter(t => getStat(t, 'loading'));
        if (djLoad.length > 0) {
          const grouped = groupBy(djLoad, 'current_location');
          for (const [loc, trks] of Object.entries(grouped)) {
            report += `LOADING ${loc !== 'Unknown' && loc ? '📍 ' + loc : ''}\n`;
            trks.forEach(t => report += `${t.plate_no} ${formatNote(t.note)} (${getStatusDay(t)})\n`);
          }
          report += `\n`;
        }

        const djUnload = djOthers.filter(t => getStat(t, 'unloading'));
        if (djUnload.length > 0) {
          const grouped = groupBy(djUnload, 'current_location');
          for (const [loc, trks] of Object.entries(grouped)) {
            report += `UNLOADING ${loc !== 'Unknown' && loc ? '📍 ' + loc : ''}\n`;
            trks.forEach(t => report += `${t.plate_no} ${formatNote(t.note)} (${getStatusDay(t)})\n`);
            report += `\n`;
          }
        }

        const djOngoing = djOthers.filter(t => getStat(t, 'ongoing'));
        if (djOngoing.length > 0) {
          const grouped = groupBy(djOngoing, 'destination');
          for (const [dest, trks] of Object.entries(grouped)) {
            report += `DJIBOUTI TO ${dest !== 'Unknown' ? dest : '?'}\n`;
            trks.forEach(t => report += `${t.plate_no} ==> ${t.current_location || '?'}${formatNote(t.note)}\n`);
            report += `\n`;
          }
        }

        const djOncoming = djOthers.filter(t => getStat(t, 'oncoming'));
        if (djOncoming.length > 0) {
          const grouped = groupBy(djOncoming, 'destination');
          for (const [dest, trks] of Object.entries(grouped)) {
            report += `ONCOMING ➜ ${dest !== 'Unknown' ? dest : '?'}\n`;
            const onByFrom = groupBy(trks, 'from_location');
            for (const [fromLoc, fTrks] of Object.entries(onByFrom)) {
              report += `from ${fromLoc}\n`;
              fTrks.forEach(t => report += `${t.plate_no} ==> ${t.current_location || '?'}${formatNote(t.note)}\n`);
              report += `\n`;
            }
          }
        }
        report += `============================\n`;
      }
    }

    // --- BRANDS SECTION ---
    const brands = ['Walia', 'BGI', 'Leshato', 'Habesha', 'Unilever'];
    brands.forEach(brand => {
      const brandTrucks = trucks.filter(t => getCat(t, brand));
      const activeBrandTrucks = brandTrucks.filter(isActiveTruck);

      if (activeBrandTrucks.length === 0) return;

      report += `${brand.toUpperCase()} (${activeBrandTrucks.length})\n`;

      const loading = activeBrandTrucks.filter(t => getStat(t, 'loading'));
      report += `LOADING\n-------\n`;
      if (loading.length > 0) {
        const grouped = groupBy(loading, 'current_location');
        for (const [loc, trks] of Object.entries(grouped)) {
          if (loc !== 'Unknown' && loc) report += `${loc}\n`;
          trks.forEach(t => report += `${t.plate_no} ${formatNote(t.note)} (${getStatusDay(t)})\n`);
        }
      }
      report += `\n`;

      const unloading = activeBrandTrucks.filter(t => getStat(t, 'unloading'));
      report += `UNLOADING\n`;
      if (unloading.length > 0) {
        unloading.forEach(t => report += `${t.plate_no} ==> ${t.current_location || '?'}${formatNote(t.note)} (${getStatusDay(t)})\n`);
      }
      report += `\n`;

      const ongoing = activeBrandTrucks.filter(t => getStat(t, 'ongoing'));
      if (ongoing.length > 0) {
        const primaryFrom = ongoing[0]?.from_location || 'ORIGIN';
        report += `ONGOING TRUCKS FROM ${primaryFrom.toUpperCase()}\n\n`;
        const onByDest = groupBy(ongoing, 'destination');
        for (const [dest, trks] of Object.entries(onByDest)) {
          report += `to ${dest}\n`;
          trks.forEach(t => report += `${t.plate_no} ==> ${t.current_location || '?'}${formatNote(t.note)}\n`);
          report += `\n`;
        }
      }

      const oncoming = activeBrandTrucks.filter(t => getStat(t, 'oncoming'));
      if (oncoming.length > 0) {
        const primaryDest = oncoming[0]?.destination || 'DESTINATION';
        report += `ONCOMING TRUCKS TO ${primaryDest.toUpperCase()}\n\n`;
        const onByFrom = groupBy(oncoming, 'from_location');
        for (const [fromLoc, trks] of Object.entries(onByFrom)) {
          report += `from ${fromLoc}\n`;
          trks.forEach(t => report += `${t.plate_no} ==> ${t.current_location || '?'}${formatNote(t.note)}\n`);
          report += `\n`;
        }
      }
      report += `============================\n`;
    });

    // --- SPECIAL STATUSES ---
    const getSpecials = (statusName) => trucks.filter(t => getStat(t, statusName));

    const parkedTrucks = getSpecials('parked');
    if (parkedTrucks.length > 0) {
      report += `PARKED (${parkedTrucks.length})\n`;
      parkedTrucks.forEach(t => report += `${t.plate_no} = (${getStatusDay(t)})\n`);
      report += `===========================\n`;
    }

    const garageTrucks = getSpecials('garage');
    if (garageTrucks.length > 0) {
      report += `GARAGE (${garageTrucks.length})\n`;
      garageTrucks.forEach(t => report += `${t.plate_no} = (${getStatusDay(t)})\n`);
      report += `===========================\n`;
    }

    const nodeTrucks = trucks.filter(t => (t.status || '').toLowerCase().includes('node') || (t.status || '').toLowerCase().includes('no driver'));
    if (nodeTrucks.length > 0) {
      report += `Node / No Driver (${nodeTrucks.length})\n`;
      nodeTrucks.forEach(t => report += `${t.plate_no} = ${formatNote(t.note) || 'No Driver'}\n`);
      report += `=============================\n`;
    }

    const insuranceTrucks = getSpecials('insurance');
    if (insuranceTrucks.length > 0) {
      report += `INSURANCE (${insuranceTrucks.length})\n`;
      insuranceTrucks.forEach(t => report += `${t.plate_no}\n`);
      report += `=============================\n`;
    }

    report += `Good Day`;

    // Split report if it exceeds Telegram's 4096 char limit
    const MAX_LEN = 4000;
    if (report.length > MAX_LEN) {
      const parts = report.match(new RegExp(`[\\s\\S]{1,${MAX_LEN}}`, 'g'));
      for (const part of parts) {
        await bot.sendMessage(currentChatId, part);
      }
    } else {
      await bot.sendMessage(currentChatId, report);
    }
    console.log(`[All] Full Report sent successfully!`);
  } catch (err) {
    console.error('Error fetching all trucks summary:', err);
    bot.sendMessage(currentChatId, '⚠️ Sorry, there was an error fetching the fleet summary.')
       .catch(e => console.error("Error sending error message:", e));
  }
});

// Listen to all messages just to log chat IDs for easy setup
bot.on('message', (msg) => {
    // Only log if it's not a command
    if (msg.text && !msg.text.startsWith('/')) {
        if (!chatId || chatId === 'your_telegram_chat_id_here') {
             console.log(`\n🔔 Message received from Chat ID: ${msg.chat.id}`);
             console.log(`Add TELEGRAM_CHAT_ID=${msg.chat.id} to your .env file to receive automatic alerts!\n`);
        }
    }
});

// Setup Supabase Realtime alerts for Truck Status changes
if (chatId && chatId !== 'your_telegram_chat_id_here') {
    console.log('📡 Subscribing to Supabase Realtime for truck updates...');
    
    supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'trucks',
        },
        (payload) => {
          const oldStatus = payload.old.status;
          const newStatus = payload.new.status;
          const truckNumber = payload.new.plate_no;
          
          // Only alert if the status actually changed
          if (oldStatus !== newStatus) {
              const statusEmoji = {
                'Available': '✅',
                'In Transit': '🚚',
                'Maintenance': '🔧',
                'Loading': '📦',
                'Unloading': '📤'
              }[newStatus] || '📍';
              
              const message = `🚨 *Fleet Update*\n\nTruck *${truckNumber}* is now ${statusEmoji} *${newStatus}*\nLocation: ${payload.new.current_location || 'N/A'}`;
              
              bot.sendMessage(chatId, message, { parse_mode: 'Markdown' })
                .catch(err => console.error("Error sending Telegram alert:", err));
          }
        }
      )
      .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
              console.log('✅ Realtime subscription successful!');
          }
      });
}

// Error handling
bot.on("polling_error", console.log);

// Set Chat Menu Button to open the Web App
fetch(`https://api.telegram.org/bot${token}/setChatMenuButton`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    menu_button: {
      type: 'web_app',
      text: 'Admin Dashboard',
      web_app: { url: webAppUrl }
    }
  })
})
.then(res => res.json())
.then(data => console.log('Menu Button Setup:', data))
.catch(err => console.error("Failed to set Chat Menu Button:", err));
