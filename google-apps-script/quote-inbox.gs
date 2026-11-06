// Summer Splash quote inbox.
// The website posts each quote request here, and this script emails it to the business inbox.
// Deploy from script.google.com while signed in as a summersplashpools.com account:
// Deploy > New deployment > Web app > Execute as: Me > Who has access: Anyone.

// Where every quote request is delivered.
const QUOTE_INBOX = 'info@summersplashpools.com';

// The fields the website sends, in the order they appear in the email.
const QUOTE_FIELDS = ['Name', 'Email', 'Phone', 'Pool Address', 'Service', 'Message'];

// Runs when the website sends a quote request.
function doPost(event) {
  try {
    // Read the request the website sent.
    const quote = JSON.parse(event.postData.contents);

    // Bots fill in the hidden "_honey" box; real visitors never see it, so quietly accept and drop.
    if (quote._honey) {
      return reply({ success: 'true' });
    }

    // A quote needs at least a name, an email and a message.
    requireField(quote, 'Name');
    requireField(quote, 'Email');
    requireField(quote, 'Message');

    // Email the request to the business, with "Reply" going straight to the visitor.
    MailApp.sendEmail({
      to: QUOTE_INBOX,
      replyTo: quote.Email,
      subject: 'Quote request from ' + quote.Name,
      htmlBody: buildEmailTable(quote)
    });

    return reply({ success: 'true' });
  } catch (error) {
    // Keep the technical reason in the script's log; the website shows its own short message.
    console.error(error);
    return reply({ success: 'false', message: 'Quote could not be sent' });
  }
}

// Stops the request when a required box was left empty.
function requireField(quote, fieldName) {
  if (!String(quote[fieldName] || '').trim()) {
    throw new Error('Missing field: ' + fieldName);
  }
}

// Lays the quote out as a simple two-column table, like the old FormSubmit email.
function buildEmailTable(quote) {
  const rows = QUOTE_FIELDS.map(function (fieldName) {
    const value = escapeHtml(quote[fieldName] || 'Not given').replace(/\n/g, '<br>');
    return '<tr><th align="left" style="padding:6px 12px;background:#f0f6f7">' + fieldName +
      '</th><td style="padding:6px 12px">' + value + '</td></tr>';
  });
  return '<p>New quote request from the Summer Splash website:</p>' +
    '<table style="border-collapse:collapse;font-family:Arial,sans-serif">' + rows.join('') + '</table>';
}

// Stops anything a visitor types from being treated as HTML in the email.
function escapeHtml(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// Sends a JSON answer back to the website.
function reply(body) {
  return ContentService.createTextOutput(JSON.stringify(body))
    .setMimeType(ContentService.MimeType.JSON);
}
