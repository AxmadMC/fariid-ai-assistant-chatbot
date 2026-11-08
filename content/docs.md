---
title: Antibot Email Shield documentation
url: https://docs.ahmedmc.com/email-shield/
---
## What Antibot Email Shield does #overview
Antibot Email Shield protects the email addresses on a WordPress website from spam bots. Instead of showing the email on the page, it shows a "Show email address" button. When a real person clicks it and passes a quick Cloudflare Turnstile check, the website double-checks the result with Cloudflare, the email appears as a link, and it hides again after 25 seconds. Setting it up takes about 10 minutes.

## Requirements #requirements
The plugin needs WordPress 6.0 or newer and PHP 7.4 or newer, a free Cloudflare account (the website does not need to use Cloudflare for anything else), and the email addresses you want to protect.

## Installing the plugin #install
In the WordPress dashboard go to Plugins, then Add New, then Upload Plugin. Click Choose File, select antibot-email-shield.zip, click Install Now, then Activate. A Settings link appears under the plugin's name on the Plugins page, and the settings are also under Settings, then Antibot Email Shield.

## Creating a Cloudflare account and Turnstile widget #turnstile
Create a free account at dash.cloudflare.com/sign-up and verify your email. You do not need to add your website to Cloudflare for Turnstile. Then sign in, go to Protect & Connect, then Application security, then Turnstile, and click Add widget. Give it a name, add your domain as a hostname without https:// (also add the www version if your site uses it), choose Managed widget mode, choose No for pre-clearance, and click Create. Cloudflare menus can change, so check Cloudflare's Turnstile documentation if something looks different.

## Getting the Turnstile site key and secret key #turnstile
After creating the widget, Cloudflare shows a Site Key and a Secret Key, each with a copy button. The Secret Key must be kept private like a password; the Site Key is public and safe to share.

## Adding the Turnstile keys #keys
In WordPress go to Settings, then Antibot Email Shield. Paste the Site Key into the Turnstile site key box and the Secret Key into the Turnstile secret key box, then click Save Changes. After saving, the secret key box looks empty on purpose to keep the key hidden, but the key is still saved.

## Adding protected emails and ids #emails
In the Protected emails box, type each email you want to protect, one per line, then click Save Changes. Each email gets an id, which is the part before the @: support@yourdomain.com has the id support. To choose your own id, write the id, a colon, then the email, for example help: support@yourdomain.com. After saving, a Saved list shows each id next to its email.

## Using the shortcode #shortcode
Add the shortcode [email_shield id="support"] where the email should appear, changing the id to match a saved email (for admin@yourdomain.com use [email_shield id="admin"]). In the WordPress block editor, add a Shortcode block and paste it. In Elementor, add a Shortcode widget and paste it. The shortcode [antibot_email_shield id="support"] always works even if another plugin uses [email_shield], and the older names [protected_email] and [unbotted] still work.

## Customizing the plugin #options
Optional settings: "Hide again after" sets how long the email stays visible (default 25 seconds, 0 keeps it visible); "Button label" sets the button text (default "Show email address"); "Rate limit" sets how many times one visitor can reveal emails in 10 minutes (default 10). To change one button's text, add a label, for example [email_shield id="support" label="Email our support team"].

## Privacy policy note for the plugin #privacy
When a visitor clicks the button, Cloudflare Turnstile checks their browser (such as IP address and browser details) to confirm they are human. Site owners should mention Cloudflare Turnstile in their privacy policy; the documentation includes text that can be copied.

## Plugin support and bug reports #support
Antibot Email Shield is a free plugin developed by Ahmed MC. Report bugs and security issues using the "Show bug report email" button in the Support section of the documentation, including what happened, steps to repeat it, WordPress and plugin versions, and a screenshot if possible.
