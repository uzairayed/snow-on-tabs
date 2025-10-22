# Rain on Tabs

Calm rain animation appears on your browser tab after a few seconds of inactivity. The rain fades away as soon as you interact with the page.

## Demo

![Rain demo](./assets/demo.gif)

## Features

- Animated rain overlay after idle period (default: 5 seconds)
- Fades in/out smoothly
- Disappears on any user interaction (mouse, keyboard, scroll, touch)
- Lightweight, no external dependencies

## Installation (Local/Unpacked)

1. **Clone or Download the Repository**
	- Download this folder to your computer, or clone with:
	  ```sh
	  git clone https://github.com/IamMoosa/rain-on-tabs.git
	  ```

2. **Open Chrome Extensions Page**
	- Go to `chrome://extensions` in your browser.
	- Enable **Developer mode** (toggle in the top right).

3. **Load Unpacked Extension**
	- Click **Load unpacked**.
	- Select the folder containing this project (the folder with `manifest.json`).

4. **Verify Installation**
	- The extension should appear in your list, with the rain icon.
	- Open any webpage or new tab to test.

## Usage

1. **Wait for Inactivity**
	- After 5 seconds of no mouse, keyboard, scroll, or touch activity, a rain animation will fade in over the page.

2. **Interact to Dismiss**
	- Move your mouse, press any key, scroll, click, or touch the page to instantly fade out the rain overlay.

3. **Repeat**
	- The rain will reappear after another idle period.

## Customization

You can change the idle delay or rain intensity by editing `content.js`:

- **Idle Delay**: At the top of `content.js`, change the value of `IDLE_DELAY` (milliseconds).
  ```js
  const IDLE_DELAY = 5000; // ms
  ```
- **Rain Intensity**: Change `maxDrops` or `spawnRate` in `content.js` for more or fewer raindrops.

## Troubleshooting

- **Rain doesn't appear?**
  - Make sure the extension is enabled and loaded in Developer mode.
  - Reload the extension after making code changes.
  - Try on a regular webpage (some Chrome pages block content scripts).
- **Artifacts or flicker?**
  - Ensure you have the latest code. The animation is designed to be smooth and streak-like, not a single square.
  - If you use display scaling (e.g., 125%, 150%), the animation should still look correct. If not, report the issue.

## Uninstalling

1. Go to `chrome://extensions`.
2. Find "Rain on Tabs" and click **Remove**.

## License

MIT License. See [License](LICENSE) for details.

## Credits

Vibe Coded with ❤️ by [Moosa Raza](https://www.linkedin.com/in/syed-moosa-raza-rizvi).