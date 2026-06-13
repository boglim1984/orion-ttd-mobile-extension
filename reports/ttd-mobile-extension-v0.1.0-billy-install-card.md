# Orion TTD Mobile Extension: v0.1.0 Billy Install Card

## Artifact Verification (PASS)
- **Local Zip Path:** `/Users/oflahertys/Desktop/Code Projects/ACTIVE/orion-ios-ttd-injector/ttd-mobile-extension/dist/v0.1.0/orion-ttd-mobile-extension-chrome-v0.1.0.zip`
- The zip contains `manifest.json` (Chrome-style v3) and `content.js` at the root.
- The extension logic is verified to be purely scaffolding. It exposes three globals and one console log.
- **Safety check:** No composer insertion, no submit loops, no data access.

## GitHub Pages Verification (PASS)
- **Public Pages Base:** `https://boglim1984.github.io/orion-ttd-mobile-extension/` (Live)
- **Chrome Update XML:** `https://boglim1984.github.io/orion-ttd-mobile-extension/updates/chrome-updates.xml` (Live)
- **Public Package URL:** `https://boglim1984.github.io/orion-ttd-mobile-extension/dist/v0.1.0/orion-ttd-mobile-extension-chrome-v0.1.0.zip` (Live)

## Easiest Transfer/Install Option
An `install-helper` folder has been prepared locally at `/Users/oflahertys/Desktop/Code Projects/ACTIVE/orion-ios-ttd-injector/ttd-mobile-extension/install-helper/`. 
It contains a copy of the zip and an `index.html` file. You can simply navigate to the public download link on your iPhone, or AirDrop the zip file from the helper folder directly to your phone.

## Phone-Side Steps
Because iCloud direct installs fail, perform these concrete steps on your iPhone:
1. **Download/Transfer the Zip:** Download the public `v0.1.0` zip directly on your iPhone using the Public Package URL above, or AirDrop the zip from the Mac.
2. **Save to Local Path:** Ensure the zip is placed in an iPhone-local folder (e.g., "On My iPhone / Downloads"). *Do not select it directly from iCloud Drive if that caused silent failures previously.*
3. **Install in Orion:** Open Orion iOS &rarr; Extensions menu &rarr; tap the **`+`** icon &rarr; **Install from File** &rarr; Select the local zip.
4. **Open Target:** Navigate to `chatgpt.com` in Orion iOS.
5. **Attach Debugger:** Attach Safari Web Inspector from your Mac to the Orion iOS tab.

## Safari Web Inspector Verification Commands
Run the following in the Web Inspector console:
```javascript
window.__ORION_TTD_BUILD__
window.__ORION_TTD_INFO__
window.__ORION_TTD_SMOKE__()
```

## Expected Results
- `window.__ORION_TTD_BUILD__` returns `"0.1.0"`.
- `window.__ORION_TTD_INFO__.flavor` returns `"chrome"`.
- `window.__ORION_TTD_SMOKE__()` returns the same info object.
- The console should display: `[ORION TTD MOBILE] version=0.1.0 flavor=chrome`.
- No composer injection or submission should occur.

## Pass/Fail Criteria
- **PASS:** The extension installs successfully, runs on ChatGPT, and the build stamp reads "0.1.0" in the Web Inspector.
- **FAIL:** Orion rejects the zip, the content script does not load on ChatGPT, or any unexpected data access / errors occur.

## Future Update Note
If `v0.1.0` installs and passes, **future changes will not require manual reinstallation**. Agents will simply bump the version, publish the new Chrome package and XML to GitHub, and you will tap Orion's built-in **Update** button to fetch the new code.
