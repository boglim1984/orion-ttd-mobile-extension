#!/usr/bin/env node

import fs from 'fs';
import { execSync } from 'child_process';

const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbw_CmItX3pczFVL8VLIoFYUq_MSt3HMEhZqcv9aTOr1li-gxx2_Pewi66U72CukZZ9w/exec?action=chatgptPlainPayload&id=2060";
const SKILL_PATH_1 = "/Users/oflahertys/Desktop/Code Projects/ACTIVE/_worktrees/Billy-Project-Command-Center-main-for-skill-dump/library/skills/chatgpt/command-language-casework-designer-skill.md";
const SKILL_PATH_2 = "/Users/oflahertys/Desktop/Code Projects/ACTIVE/Billy-Project-Command-Center/library/skills/chatgpt/command-language-casework-designer-skill.md";

export function stripFrontmatter(content) {
  // Strip UTF-8 BOM if present
  if (content.charCodeAt(0) === 0xFEFF) {
    content = content.slice(1);
  }

  // Strip YAML frontmatter
  if (content.startsWith('---\n') || content.startsWith('---\r\n')) {
    const match = content.match(/^---\r?\n.*?\r?\n---\r?\n(.*)$/s);
    if (match) {
      content = match[1];
    }
  }

  // Trim leading whitespace
  content = content.trimStart();
  return content;
}

export function fixMojibake(content) {
  return content.replace(/‚Üí/g, '→').replace(/‚Äôs/g, '’s');
}

export async function getAppsScriptPayload() {
  try {
    const response = await fetch(APPS_SCRIPT_URL);
    if (!response.ok) return null;
    let text = await response.text();
    
    // reject responses that begin with Error, QR_SKILL_ROUTE_ERROR, Not Found, or HTML
    if (text.startsWith("Error") || text.startsWith("QR_SKILL_ROUTE_ERROR") || text.startsWith("Not Found") || text.startsWith("<html") || text.startsWith("<!DOCTYPE html>")) {
      return null;
    }
    
    // reject responses that still begin with YAML frontmatter ---
    if (text.startsWith("---")) return null;
    
    // verify payload contains: Command Language Casework Designer Skill and CASEWORK_STUDY_STATUS
    if (!text.includes("Command Language Casework Designer Skill") || !text.includes("CASEWORK_STUDY_STATUS")) {
      return null;
    }
    
    text = fixMojibake(text);
    return text;
  } catch (e) {
    return null;
  }
}

export function getLocalFallbackPayload() {
  let skillPath = SKILL_PATH_1;
  if (!fs.existsSync(skillPath)) {
    skillPath = SKILL_PATH_2;
  }

  if (!fs.existsSync(skillPath)) {
    return { content: null, path: null };
  }

  let content = fs.readFileSync(skillPath, 'utf8');
  content = stripFrontmatter(content);
  content = fixMojibake(content);
  return { content, path: skillPath };
}

if (process.argv[1] === new URL(import.meta.url).pathname) {
  (async () => {
    let source = "apps_script_chatgptPlainPayload";
    let payload = await getAppsScriptPayload();
    
    if (!payload) {
      source = "local_file";
      const localFallback = getLocalFallbackPayload();
      if (!localFallback.content) {
        console.error("Failed to fetch from Apps Script and local files are missing.");
        process.exit(1);
      }
      
      const header = `You are now acting as the Command Language Casework Designer Skill for Orion TTD.
Source: fresh local skill file
Skill path: ${localFallback.path}
Fetched at: ${new Date().toISOString()}

`;
      payload = header + localFallback.content;
    }

    try {
      execSync('pbcopy', { input: payload, env: { ...process.env, LANG: 'en_US.UTF-8', LC_ALL: 'en_US.UTF-8' } });
      console.log(`source=${source}\nbytes=${Buffer.byteLength(payload, 'utf8')}\nqr_id=2060`);
    } catch (e) {
      console.error("Failed to copy to clipboard:", e);
      process.exit(1);
    }
  })();
}
