import fs from 'node:fs';
import { gemini } from '../../external-services/gemini/gemini.ts';
import { createWorkflowStep } from "../../lib/workflower/workflower.ts";
import dedent from 'dedent';
import type { IVodFrame } from '../types/IVodFrame.ts';

export const EXTRACT_GAME_TIMESTAMP_FROM_FRAME = createWorkflowStep({
  name: "EXTRACT_GAME_TIMESTAMP_FROM_FRAME",
  async *execute({ vodFrame }: { vodFrame: IVodFrame }) {
    const image = fs.readFileSync(vodFrame.path);

    const response = await gemini.models.generateContent({
      model: 'gemini-flash-lite-latest',
      config: {
        thinkingConfig: { thinkingBudget: 0 },
        imageConfig: { imageSize: '1K' },
      },
      contents: [
        {
          role: 'user',
          parts: [
            {
              inlineData: {
                mimeType: 'image/png',
                data: image.toString('base64'),
              }
            },
            {
              text: dedent`
                  Extract ONLY the main in-game timer.

                  STRICT RULES:
                  - The real in-game timer is ALWAYS the large timer placed at the upper-center of the game screen.
                  - Ignore ANY smaller timer appearing:
                    - at the top-left,
                    - top-right,
                    - bottom-left,
                    - bottom-right,
                    - near player portraits,
                    - inside kill score UI.
                  - If multiple timers exist, ALWAYS choose the one that is centered horizontally.

                  Return ONLY the mm:ss timer from the top-center.
                  If it's impossible to read, return: N/A
                  `,
            },
          ],
        },
      ]
    });

    yield {
      vodFrame: {
        ...vodFrame,
        gameSeconds: parseGameTimer(response.text ?? ''),
      }
    };
  },
  config: { concurrency: 4 },
})

function parseGameTimer(timerText: string): number | null {
  const match = timerText.match(/(\d{1,2}):(\d{2})/);
  if (match) {
    const minutes = parseInt(match[1]!, 10);
    const seconds = parseInt(match[2]!, 10);
    return minutes * 60 + seconds;
  }
  return null;
}
