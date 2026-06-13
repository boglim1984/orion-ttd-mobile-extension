import test from 'node:test';
import assert from 'node:assert';
import { stripFrontmatter, fixMojibake } from '../scripts/copy-fresh-casework-skill.mjs';

test('stripFrontmatter strips frontmatter and preserves body', () => {
  const rawSkill = `---
skill_id: command-language-casework-designer
title: Command Language Casework Designer
qr_id: 8821
domain_tags: [research, casework]
routing_keywords: [design, suite]
---
# Command Language Casework Designer

This is the body.
Load example -> Validate -> Copy Runner
diagram's nodes
Check CASEWORK_STUDY_STATUS.md
`;

  const cleanSkill = stripFrontmatter(rawSkill);

  // Verify frontmatter is stripped
  assert.ok(!cleanSkill.includes('skill_id:'));
  assert.ok(!cleanSkill.includes('qr_id:'));
  assert.ok(!cleanSkill.includes('domain_tags:'));
  assert.ok(!cleanSkill.includes('routing_keywords:'));
  assert.ok(!cleanSkill.includes('---'));

  // Verify body remains
  assert.ok(cleanSkill.includes('# Command Language Casework Designer'));
  assert.ok(cleanSkill.includes('This is the body.'));
});

test('fixMojibake corrects known bad characters', () => {
  const badSkill = `Load example ‚Üí Validate ‚Üí Copy Runner\ndiagram‚Äôs nodes`;
  const fixedSkill = fixMojibake(badSkill);
  assert.ok(fixedSkill.includes('Load example → Validate → Copy Runner'));
  assert.ok(fixedSkill.includes('diagram’s nodes'));
});
