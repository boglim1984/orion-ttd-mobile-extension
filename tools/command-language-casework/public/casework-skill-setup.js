export const CASEWORK_SKILL_PROMPT = [
  "You are now acting as the Command Language Casework Designer Skill for Orion TTD.",
  "Before designing a new suite, check the current Casework Study Status. If it is unavailable, ask Billy to paste CASEWORK_STUDY_STATUS.md or use GitHub connector to read tools/command-language-casework/study/CASEWORK_STUDY_STATUS.md. Use that status to decide the next study needed. Do not guess the next batch from memory.",
  "Guide setup if needed, design compact command-language JSON suites for the local Casework tool, and review result JSON with a Mermaid diagram first.",
  "Do not claim to run the local GUI, server, or ChatGPT test runner yourself.",
  "When asked for the next batch, output one short purpose sentence and then a JSON suite block.",
  "Workflow: Load example -> Validate -> Copy Runner -> paste in ChatGPT console -> click Run -> paste result back here."
].join("\n");

export const CASEWORK_SKILL_WORKFLOW = [
  "Dev chat: checks study status and designs the test suite.",
  "Casework GUI: validates JSON and copies the self-contained runner.",
  "Disposable ChatGPT: executes the test runner.",
  "Result JSON: comes back to the dev chat for Mermaid review."
].join("\n");

export const CASEWORK_SKILL_USAGE = [
  "1. In your ChatGPT dev/design chat, click the Casework Start bookmarklet.",
  "2. This triggers the macOS Shortcut which fetches the fresh skill and copies it.",
  "3. Paste the fresh Casework Designer Skill prompt into the composer.",
  "4. Use the automatically opened Casework GUI and support tabs.",
  "5. Ask this chat to design the next casework suite."
].join("\n");

export function buildStartBookmarklet() {
  return `javascript:(()=>{location.href="shortcuts://run-shortcut?name=Casework%20Start"})();`;
}

export function buildSnapshotBookmarklet() {
  const source = `
(() => {
  const skillPrompt = ${JSON.stringify(CASEWORK_SKILL_PROMPT)};
  const workflowText = ${JSON.stringify(CASEWORK_SKILL_WORKFLOW)};
  const popupId = "orion-casework-skill-popup";

  function makeEvent(name, detail = {}) {
    const EventCtor = window.InputEvent || window.Event;
    return new EventCtor(name, { bubbles: true, cancelable: true, ...detail });
  }

  function findComposer() {
    const selectors = [
      "#prompt-textarea",
      "textarea[data-id='root']",
      "textarea[placeholder*='Message']",
      "div[contenteditable='true'][id='prompt-textarea']",
      "div[contenteditable='true'][data-testid='composer']",
      "div[contenteditable='true'][role='textbox']"
    ];

    for (const selector of selectors) {
      const node = document.querySelector(selector);
      if (node) {
        return node;
      }
    }

    return null;
  }

  function insertPrompt(node, text) {
    if (!node) {
      return false;
    }

    node.focus();

    if (typeof node.value === "string") {
      node.value = text;
      node.dispatchEvent(makeEvent("beforeinput", { inputType: "insertText", data: text }));
      node.dispatchEvent(makeEvent("input", { inputType: "insertText", data: text }));
      node.dispatchEvent(makeEvent("change"));
      return true;
    }

    if (node.isContentEditable || node.getAttribute("contenteditable") === "true") {
      node.textContent = text;
      node.dispatchEvent(makeEvent("beforeinput", { inputType: "insertText", data: text }));
      node.dispatchEvent(makeEvent("input", { inputType: "insertText", data: text }));
      node.dispatchEvent(makeEvent("change"));
      return true;
    }

    return false;
  }

  function showPopup(inserted) {
    document.getElementById(popupId)?.remove();

    const popup = document.createElement("div");
    popup.id = popupId;
    popup.style.cssText = [
      "position:fixed",
      "right:20px",
      "bottom:20px",
      "width:min(340px, calc(100vw - 32px))",
      "z-index:2147483647",
      "padding:16px",
      "border:1px solid rgba(18, 24, 18, 0.14)",
      "border-radius:16px",
      "background:#f8f7f2",
      "box-shadow:0 16px 40px rgba(14, 18, 16, 0.18)",
      "font:14px/1.45 -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      "color:#171717"
    ].join(";");

    const title = document.createElement("div");
    title.textContent = "Casework Skill Ready";
    title.style.cssText = "font-weight:700;font-size:15px;margin-bottom:8px;";
    popup.appendChild(title);

    const lines = [
      "You are set up to design a command-language test in this chat.",
      "Start by checking study status, then design the next suite.",
      "This chat will produce a JSON suite block.",
      "Use the Casework GUI tab to run it.",
      "After the run, paste the result JSON back here for Mermaid review.",
      "Support tabs: Casework GUI + disposable ChatGPT test chat.",
      "Ask this chat to design the next casework suite."
    ];

    for (const line of lines) {
      const paragraph = document.createElement("p");
      paragraph.textContent = line;
      paragraph.style.cssText = "margin:0 0 8px;";
      popup.appendChild(paragraph);
    }

    if (!inserted) {
      const note = document.createElement("p");
      note.textContent = "The prompt did not insert. Click into the composer and run the bookmarklet again.";
      note.style.cssText = "margin:4px 0 12px;color:#8b5b2b;";
      popup.appendChild(note);
    }

    const buttonRow = document.createElement("div");
    buttonRow.style.cssText = "display:flex;gap:8px;justify-content:flex-end;margin-top:12px;";

    const status = document.createElement("div");
    status.textContent = inserted ? "Prompt inserted without sending." : "Insert-only. No send was attempted.";
    status.style.cssText = "margin-top:10px;font-size:12px;color:#667065;";

    const copyButton = document.createElement("button");
    copyButton.type = "button";
    copyButton.textContent = "Copy workflow";
    copyButton.style.cssText = "border:1px solid #d9ddd4;background:#fff;color:#171717;border-radius:999px;padding:8px 12px;cursor:pointer;";
    copyButton.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(workflowText);
        status.textContent = "Workflow copied.";
      } catch (_error) {
        status.textContent = "Clipboard copy was blocked.";
      }
    });

    const closeButton = document.createElement("button");
    closeButton.type = "button";
    closeButton.textContent = "Close";
    closeButton.style.cssText = "border:1px solid transparent;background:#171717;color:#fff;border-radius:999px;padding:8px 12px;cursor:pointer;";
    closeButton.addEventListener("click", () => popup.remove());

    buttonRow.append(copyButton, closeButton);
    popup.append(buttonRow, status);
    document.body.appendChild(popup);
  }

  const composer = findComposer();
  const inserted = insertPrompt(composer, skillPrompt);
  showPopup(inserted);
})();
  `.trim();

  return `javascript:${source}`;
}
