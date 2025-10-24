# Snow on Tabs

> **Note**: This is a fork of [IamMoosa/rain-on-tabs](https://github.com/IamMoosa/rain-on-tabs) that transforms the original rain animation into a beautiful snowflake experience.

Beautiful snowflake animation appears on your browser tab after a few seconds of inactivity. The snowflakes fade away as soon as you interact with the page.

## Demo

![Rain demo](./assets/demo.gif)

## Features

- Animated snowflake overlay after idle period (default: 5 seconds)
- Mixed movement patterns: gentle floating and dramatic swirling snowflakes
- Detailed 6-pointed snowflake shapes with intricate patterns
- Ground accumulation effect - snowflakes build up at the bottom
- Winter-themed light blue background tint
- Fades in/out smoothly
- Disappears on any user interaction (mouse, keyboard, scroll, touch)
- Lightweight, no external dependencies

## Installation (Local/Unpacked)

1. **Clone or Download the Repository**
	- Download this folder to your computer, or clone with:
	  ```sh
	  git clone https://github.com/uzairayed/snow-on-tabs.git
	  ```

2. **Open Chrome Extensions Page**
	- Go to `chrome://extensions` in your browser.
	- Enable **Developer mode** (toggle in the top right).

3. **Load Unpacked Extension**
	- Click **Load unpacked**.
	- Select the folder containing this project (the folder with `manifest.json`).

4. **Verify Installation**
	- The extension should appear in your list, with the snowflake icon.
	- Open any webpage or new tab to test.

## Usage

1. **Wait for Inactivity**
	- After 5 seconds of no mouse, keyboard, scroll, or touch activity, a snowflake animation will fade in over the page.

2. **Interact to Dismiss**
	- Move your mouse, press any key, scroll, click, or touch the page to instantly fade out the snowflake overlay.

3. **Repeat**
	- The snowflakes will reappear after another idle period, and accumulation will gradually build up.

## Customization

You can change the idle delay or snowflake intensity by editing `content.js`:

- **Idle Delay**: At the top of `content.js`, change the value of `IDLE_DELAY` (milliseconds).
  ```js
  const IDLE_DELAY = 5000; // ms
  ```
- **Snowflake Intensity**: Change `maxSnowflakes` or spawn rate in `content.js` for more or fewer snowflakes.
- **Movement Mix**: Adjust the ratio of gentle vs dramatic snowflakes (currently 70% gentle, 30% dramatic).
- **Accumulation**: Modify `maxAccumulation` to control how much snow builds up at the bottom.

## Troubleshooting

- **Snowflakes don't appear?**
  - Make sure the extension is enabled and loaded in Developer mode.
  - Reload the extension after making code changes.
  - Try on a regular webpage (some Chrome pages block content scripts).
- **Performance issues?**
  - The animation is optimized for smooth performance. If you experience lag, try reducing `maxSnowflakes` in `content.js`.
  - If you use display scaling (e.g., 125%, 150%), the animation should still look correct. If not, report the issue.

## Uninstalling

1. Go to `chrome://extensions`.
2. Find "Snow on Tabs" and click **Remove**.

## License

MIT License. See [License](LICENSE) for details.

## Credits

**Snow on Tabs** - Snowflake animation conversion by [Syed Uzair Ahmed](https://github.com/uzairayed)

**Original "Rain on Tabs"** - Created with ❤️ by [Moosa Raza](https://www.linkedin.com/in/syed-moosa-raza-rizvi)
- Original repository: [IamMoosa/rain-on-tabs](https://github.com/IamMoosa/rain-on-tabs)
- This project is a fork that transforms the rain animation into a winter snowflake experience