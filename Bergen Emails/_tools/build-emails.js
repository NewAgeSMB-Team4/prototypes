/* Bergen Kids - transactional email templates.

   Structure: the logo stands alone on the cream page - cream is the ground the
   mark is drawn for, so it needs no box behind it. The colour lives inside the
   card, as a hero strip carrying the eyebrow and the headline, closed by a rule
   in the logo's yellow and orange. The footer is quiet type on the same cream,
   with a small three-colour accent instead of a heavy band.

   Palette: logo green #007f49, yellow #ffcf00, orange #ff8a00; brand #20643d,
   navy #1a2e4a, cream #fdf8f0, mint #e3f2e9, teal #1e8c7a, danger #a3271c.
   Source is ASCII only; anything typographic goes in as an HTML entity. */
const fs = require('fs');
const path = require('path');

const OUT = path.resolve(__dirname, '..');   // the Bergen Emails folder
const LOGO = 'https://bergenapi.newagesmb.com/cdn/images/article-banner/1785744082552-dfd2662f-bf1e-46fe-825f-bf45f3484aa5.png';
const SANS = "'Inter',-apple-system,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif";
const SERIF = "Georgia,'Times New Roman',Times,serif";

/* ---------- pieces ---------- */

const spacer = h => `
                      <tr><td height="${h}" style="height:${h}px; line-height:${h}px; font-size:0;">&nbsp;</td></tr>`;

// yellow into orange: closes the hero strip
const warmRule = (h = 6) => `
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td width="62%" height="${h}" bgcolor="#ffcf00" style="height:${h}px; line-height:${h}px; font-size:0; background-color:#ffcf00;">&nbsp;</td>
                  <td width="38%" height="${h}" bgcolor="#ff8a00" style="height:${h}px; line-height:${h}px; font-size:0; background-color:#ff8a00;">&nbsp;</td>
                </tr>
              </table>`;

// three short blocks in the logo's colours - the footer's only ornament
const dotRule = `
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center">
                <tr>
                  <td width="26" height="4" bgcolor="#007f49" style="width:26px; height:4px; line-height:4px; font-size:0; background-color:#007f49; border-radius:2px;">&nbsp;</td>
                  <td width="6" style="width:6px; font-size:0;">&nbsp;</td>
                  <td width="26" height="4" bgcolor="#ffcf00" style="width:26px; height:4px; line-height:4px; font-size:0; background-color:#ffcf00; border-radius:2px;">&nbsp;</td>
                  <td width="6" style="width:6px; font-size:0;">&nbsp;</td>
                  <td width="26" height="4" bgcolor="#ff8a00" style="width:26px; height:4px; line-height:4px; font-size:0; background-color:#ff8a00; border-radius:2px;">&nbsp;</td>
                </tr>
              </table>`;

// bulletproof button: VML for Outlook, padded anchor everywhere else
const button = (label, href, fill, width) => `
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">${spacer(26)}
                      <tr>
                        <td align="left">
                          <!--[if mso]>
                          <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word"
                            href="${href}" style="height:52px; v-text-anchor:middle; width:${width}px;" arcsize="27%" stroke="f" fillcolor="${fill}">
                            <w:anchorlock/>
                            <center style="color:#ffffff; font-family:Arial,sans-serif; font-size:16px; font-weight:bold;">${label}</center>
                          </v:roundrect>
                          <![endif]-->
                          <!--[if !mso]><!-- -->
                          <a class="btn-a" href="${href}" style="display:inline-block; background-color:${fill}; color:#ffffff; font-family:${SANS}; font-size:16px; font-weight:700; line-height:52px; height:52px; text-align:center; text-decoration:none; padding:0 36px; border-radius:14px; mso-hide:all;">${label}</a>
                          <!--<![endif]-->
                        </td>
                      </tr>
                    </table>`;

// the coloured status panel
const panel = (title, body, { bg, border, accent, ink }) => `
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td class="panel" bgcolor="${bg}" style="background-color:${bg}; border:1px solid ${border}; border-left:5px solid ${accent}; border-radius:16px; padding:20px 22px;">
                          <p class="panel-t" style="margin:0 0 6px 0; font-family:${SANS}; font-size:12px; line-height:1.35; font-weight:700; letter-spacing:0.1em; text-transform:uppercase; color:${ink};">${title}</p>
                          <p class="panel-b" style="margin:0; font-family:${SANS}; font-size:14.5px; line-height:1.6; color:#12233a;">${body}</p>
                        </td>
                      </tr>
                    </table>`;

/* Every support link opens a pre-addressed mail with a subject already in it,
   so the reply lands in the right queue instead of arriving blank. One query
   parameter only - a second would need &amp; and some clients mangle it. */
const supportMail = subject => `mailto:{{support_email}}?subject=${encodeURIComponent(subject).replace(/'/g, '%27')}`;

const linkLine = (lead, href, label) => `
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td class="body-link" style="padding:14px 0 0 0; font-family:${SANS}; font-size:12.5px; line-height:1.6; color:#465569;">
                          ${lead} <a href="${href}" style="color:#20643d; text-decoration:underline; word-break:break-all;">${label}</a>
                        </td>
                      </tr>
                    </table>`;

/* ---------- the shell ---------- */
function shell(t) {
  return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office" lang="en">

<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <meta name="x-apple-disable-message-reformatting" />
  <!-- Pinned to the light design. The wordmark is dark green on transparency,
       so an inverted ground either swallows it or forces a plate behind it;
       declaring light keeps Apple Mail and Outlook from re-colouring anything. -->
  <meta name="color-scheme" content="light" />
  <meta name="supported-color-schemes" content="light" />
  <title>${t.subject}</title>
  <!--[if mso]>
  <noscript><xml><o:OfficeDocumentSettings>
    <o:AllowPNG/><o:PixelsPerInch>96</o:PixelsPerInch>
  </o:OfficeDocumentSettings></xml></noscript>
  <![endif]-->
  <style type="text/css">
    /* ---------- resets ---------- */
    :root { color-scheme:light; supported-color-schemes:light; }
    body, table, td, a { -webkit-text-size-adjust:100%; -ms-text-size-adjust:100%; }
    table, td { mso-table-lspace:0pt; mso-table-rspace:0pt; border-collapse:collapse; }
    img { -ms-interpolation-mode:bicubic; border:0; outline:none; text-decoration:none; display:block; }
    body { margin:0 !important; padding:0 !important; width:100% !important; background-color:#e9efe8; }
    a { color:#20643d; }
    .body-link a, .foot a { color:#20643d !important; text-decoration:underline; }

    /* ---------- phones ---------- */
    @media only screen and (max-width:620px) {
      .wrap { width:100% !important; }
      .hpad { padding-left:24px !important; padding-right:24px !important; }
      .vpad { padding-top:30px !important; padding-bottom:32px !important; }
      .hero-pad { padding:24px 24px 22px 24px !important; }
      .mark-pad { padding:20px 24px 14px 24px !important; }
      .foot-pad { padding:24px 22px 26px 22px !important; }
      .logo { width:142px !important; max-width:142px !important; }
      .h1 { font-size:25px !important; line-height:1.24 !important; }
      .body-text { font-size:16px !important; }
      .otp { font-size:32px !important; letter-spacing:9px !important; }
      .btn-a { display:block !important; width:100% !important; box-sizing:border-box !important; padding:0 !important; text-align:center !important; }
    }
  </style>
</head>

<body style="margin:0; padding:0; background-color:#e9efe8;">
  <!-- inbox preview line -->
  <div style="display:none; font-size:1px; line-height:1px; max-height:0; max-width:0; opacity:0; overflow:hidden; mso-hide:all;">${t.preheader}
    &#847;&zwnj;&nbsp;&#847;&zwnj;&nbsp;&#847;&zwnj;&nbsp;&#847;&zwnj;&nbsp;&#847;&zwnj;&nbsp;&#847;&zwnj;&nbsp;&#847;&zwnj;&nbsp;&#847;&zwnj;&nbsp;&#847;&zwnj;&nbsp;&#847;&zwnj;&nbsp;&#847;&zwnj;&nbsp;&#847;&zwnj;&nbsp;
  </div>

  <table role="presentation" class="page" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#e9efe8;">
    <tr>
      <td align="center" style="padding:34px 12px 40px 12px;">

        <!--[if mso]><table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0"><tr><td><![endif]-->
        <table role="presentation" class="wrap" width="600" cellpadding="0" cellspacing="0" border="0" style="width:600px; max-width:600px;">

          <!-- ==================== one card: mark, message, footer ==================== -->
          <tr>
            <td class="card" style="border:1px solid #e2ddd1; border-radius:20px; overflow:hidden;">

              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">

                <!-- the mark, on cream: the ground it is drawn for, so nothing
                     is boxed around it, and it belongs to the card rather than
                     floating above it -->
                <tr>
                  <td class="mark-pad" align="center" bgcolor="#fdf8f0"
                    style="background-color:#fdf8f0; border-radius:19px 19px 0 0; padding:22px 30px 16px 30px;">
                    <a href="{{site_url}}" style="text-decoration:none;">
                      <img class="logo" src="${LOGO}" width="160" height="105" alt="Bergen Kids"
                        style="display:block; border:0; width:160px; max-width:160px; height:auto; margin:0 auto; font-family:${SERIF}; font-size:21px; font-weight:bold; color:#20643d;" />
                    </a>
                  </td>
                </tr>

                <!-- hero strip: where the colour is -->
                <tr>
                  <td class="hero-pad" bgcolor="${t.hero.solid}"
                    style="background-color:${t.hero.solid}; background-image:linear-gradient(135deg,${t.hero.from} 0%,${t.hero.solid} 55%,${t.hero.to} 100%); padding:26px 44px 24px 44px;">

                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="left">
                      <tr>
                        <td bgcolor="${t.hero.pillBg}" style="background-color:${t.hero.pillBg}; border-radius:999px; padding:6px 14px; font-family:${SANS}; font-size:11px; line-height:1; font-weight:700; letter-spacing:0.12em; text-transform:uppercase; color:${t.hero.pillInk}; white-space:nowrap;">${t.eyebrow}</td>
                      </tr>
                    </table>

                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="padding:14px 0 0 0;">
                          <h1 class="h1" style="margin:0; font-family:${SERIF}; font-size:29px; line-height:1.2; font-weight:700; color:#ffffff;">${t.headline}</h1>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- the logo's warm colours, closing the strip -->
                <tr>
                  <td style="font-size:0; line-height:0;">${warmRule(6)}
                  </td>
                </tr>

                <!-- ==================== the message ==================== -->
                <tr>
                  <td class="sheet hpad vpad" bgcolor="#ffffff" style="background-color:#ffffff; padding:34px 44px 32px 44px;">

                    <!-- ======= body copy: matches the admin / QA sheet ======= -->
                    <p class="body-text" style="margin:0 0 16px 0; font-family:${SANS}; font-size:16px; line-height:1.65; color:#12233a;">Hello,</p>
                    <p class="body-text" style="margin:0 0 26px 0; font-family:${SANS}; font-size:16px; line-height:1.65; color:#12233a;">${t.body}</p>
${t.feature}
${t.cta}

                    <!-- ======= sign-off ======= -->
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">${spacer(28)}
                      <tr><td class="rule-line" style="border-top:1px solid #eceff3; font-size:0; line-height:0; height:1px;">&nbsp;</td></tr>
                      <tr>
                        <td class="sign-off" style="padding:22px 0 0 0; font-family:${SANS}; font-size:16px; line-height:1.6; color:#12233a;">
                          Regards,<br /><strong style="color:#1a2e4a;">Bergen Kids</strong>
                        </td>
                      </tr>
                    </table>

                  </td>
                </tr>

                <!-- ==================== footer: cream again, closing the card
                     on the same ground the mark stands on ==================== -->
                <tr>
                  <td class="foot foot-pad" align="center" bgcolor="#fdf8f0"
                    style="background-color:#fdf8f0; border-top:1px solid #f0e7d8; border-radius:0 0 19px 19px; padding:26px 34px 28px 34px;">
${dotRule}
                    <p class="foot-name" style="margin:14px 0 0 0; font-family:${SERIF}; font-size:17px; line-height:1.3; font-weight:700; color:#20643d;">Bergen Kids</p>
                    <p class="foot-tag" style="margin:5px 0 0 0; font-family:${SANS}; font-size:10.5px; line-height:1.5; font-weight:700; letter-spacing:0.2em; text-transform:uppercase; color:#5b8a6d;">Discover&nbsp;&middot;&nbsp;Explore&nbsp;&middot;&nbsp;Grow</p>
                    <p class="foot-line" style="margin:15px 0 0 0; font-family:${SANS}; font-size:12.5px; line-height:1.7; color:#6d7a6f;">
                      This is an automated message about your Bergen Kids account.<br />
                      Need a hand? <a href="${t.supportHref}" style="color:#20643d; text-decoration:underline;">{{support_email}}</a>
                    </p>
                    <p class="foot-fine" style="margin:12px 0 0 0; font-family:${SANS}; font-size:11px; line-height:1.6; color:#a89f8f;">
                      &copy; {{year}} Bergen Kids. All rights reserved.
                    </p>
                  </td>
                </tr>

              </table>
            </td>
          </tr>

        </table>
        <!--[if mso]></td></tr></table><![endif]-->

      </td>
    </tr>
  </table>
</body>

</html>
`;
}

/* ---------- palettes ---------- */
const MINT = { bg: '#e3f2e9', border: '#c3e0cf', accent: '#20643d', ink: '#20643d', darkBg: '#17251d', darkInk: '#7ac795' };
const ROSE = { bg: '#fbe4e1', border: '#f2ccc6', accent: '#a3271c', ink: '#a3271c', darkBg: '#2b1b1a', darkInk: '#f0a79e' };
const TEAL = { bg: '#ddf1ec', border: '#b9dfd6', accent: '#1e8c7a', ink: '#14685a', darkBg: '#14231f', darkInk: '#6fd0bd' };
const AMBER = { bg: '#fdeed5', border: '#f5dcb0', accent: '#e0550f', ink: '#8a5200', darkBg: '#2a2015', darkInk: '#f5c37a' };

// hero strips: brand green for the good news, navy for the block notice
const HERO_GREEN = { solid: '#0b7048', from: '#00874e', to: '#17836b', pillBg: '#ffcf00', pillInk: '#4a3300' };
const HERO_TEAL = { solid: '#0f7059', from: '#0b7a52', to: '#1e8c7a', pillBg: '#ffcf00', pillInk: '#4a3300' };
const HERO_NAVY = { solid: '#1a2e4a', from: '#22415f', to: '#16324a', pillBg: '#ffcf00', pillInk: '#4a3300' };

/* ---------- the four messages ---------- */
const TEMPLATES = [
  {
    file: 'verify-email.html',
    subject: 'Verify Your Email',
    headline: 'Verify Your Email',
    preheader: 'Your Bergen Kids verification code is inside.',
    eyebrow: 'Account verification',
    supportHref: supportMail('Bergen Kids - email verification'),
    hero: HERO_GREEN,
    panel: AMBER,
    body: 'Welcome to Bergen Kids! Please use the verification code below to verify your email address:',
    // the code, in the logo's yellow on the brand green
    feature: `
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td class="otp-box" align="center" bgcolor="#0d5b3c"
                          style="background-color:#0d5b3c; background-image:linear-gradient(135deg,#0b6b45 0%,#0d5b3c 55%,#14705f 100%); border-radius:18px; padding:28px 18px 26px 18px;">
                          <p style="margin:0 0 12px 0; font-family:${SANS}; font-size:11.5px; line-height:1.3; font-weight:700; letter-spacing:0.16em; text-transform:uppercase; color:#a8dcc0;">Your verification code</p>
                          <p class="otp" style="margin:0; font-family:${SANS}; font-size:38px; line-height:1.1; font-weight:700; letter-spacing:12px; color:#ffcf00; mso-line-height-rule:exactly;">{{OTP}}</p>
                        </td>
                      </tr>
                    </table>`,
    cta: '',
  },
  {
    file: 'advertiser-approved.html',
    subject: 'Advertiser Account Approved',
    headline: 'Advertiser Account Approved',
    preheader: 'Your advertiser account is approved &mdash; you can log in now.',
    eyebrow: 'Advertiser account',
    supportHref: supportMail('Bergen Kids - advertiser account'),
    hero: HERO_GREEN,
    panel: MINT,
    body: 'Congratulations! Your Advertiser account has been approved. You can now log in and access your dashboard.',
    feature: panel('Status &middot; Approved',
      'Your account is live. Publish listings, run campaigns and follow how they perform &mdash; all from the advertiser dashboard.', MINT),
    cta: button('Log in to your dashboard', '{{login_url}}', '#007f49', 272) +
      linkLine('Or paste this into your browser:', '{{login_url}}', '{{login_url}}'),
  },
  {
    file: 'advertiser-blocked.html',
    subject: 'Advertiser Account Blocked',
    headline: 'Advertiser Account Blocked',
    preheader: 'Your advertiser account has been blocked.',
    eyebrow: 'Advertiser account',
    supportHref: supportMail('Bergen Kids - blocked advertiser account'),
    hero: HERO_NAVY,
    panel: ROSE,
    body: 'Your Advertiser account has been blocked. If you believe this is an error, please contact our support team for assistance.',
    feature: panel('Status &middot; Blocked',
      'Sign-in, listings and campaigns are paused while the account is blocked. Nothing you have published has been deleted.', ROSE),
    cta: button('Email support', supportMail('Bergen Kids - blocked advertiser account'), '#1a2e4a', 206) +
      linkLine('Or write to us at', supportMail('Bergen Kids - blocked advertiser account'), '{{support_email}}'),
  },
  {
    file: 'advertiser-reactivated.html',
    subject: 'Advertiser Account Reactivated',
    headline: 'Advertiser Account Reactivated',
    preheader: 'Your advertiser account has been reactivated.',
    eyebrow: 'Advertiser account',
    supportHref: supportMail('Bergen Kids - advertiser account'),
    hero: HERO_TEAL,
    panel: TEAL,
    body: 'Your Advertiser account has been reactivated. You can now log in and continue using Bergen Kids.',
    feature: panel('Status &middot; Reactivated',
      'Everything is back where you left it &mdash; your listings, campaigns and analytics are all live again.', TEAL),
    cta: button('Log in to Bergen Kids', '{{login_url}}', '#007f49', 236) +
      linkLine('Or paste this into your browser:', '{{login_url}}', '{{login_url}}'),
  },
];

for (const t of TEMPLATES) {
  fs.writeFileSync(path.join(OUT, t.file), shell(t), 'utf8');
  console.log('wrote', t.file);
}
