import fs from 'fs';
import { Ollama } from 'ollama';
import { env } from '../external-services/env/env.ts';

const ai = new Ollama({
  host: env.ollamaApiUrl,
});

const image = fs.readFileSync('/Users/arthur-fontaine/Pictures/Screenshots/Screenshot 2025-11-11 at 17.16.04.png');

async function main() {
  const response = await ai.chat({
    messages: [
        {
            "role": "user",
            "content": 'Find and output only the in-game timer in the image (often at the top-center), formatted as mm:ss. Only output the exact visible mm:ss text. If no clear mm:ss timer is visible, output: N/A',
            'images': [image],
        }
    ],
    model: 'qwen2.5vl:latest',
    options: {
      temperature: 0.1,
      top_p: 0.95,
    },
  });

  console.dir(response, { depth: null });
}

main();
