import fs from 'node:fs';
import { ApiError } from '@google/genai';
import dedent from 'dedent';
import parseDuration from 'parse-duration';
import { gemini } from '../../external-services/gemini/gemini.ts';
import { createWorkflowStep } from "../../lib/workflower/workflower.ts";
import type { IVodFrame } from '../types/IVodFrame.ts';

export const EXTRACT_GAME_TIMESTAMP_FROM_FRAME = createWorkflowStep({
  name: "EXTRACT_GAME_TIMESTAMP_FROM_FRAME",
  async *execute({ vodFrames }: { vodFrames: IVodFrame[] }) {
    yield {
      vodFrames: await Promise.all(vodFrames.map(async (vodFrame) => {
        const image = fs.readFileSync(vodFrame.path);

        const response = await (async function getResponse() {
          try {
            return await gemini.models.generateContent({
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
          } catch (error) {
            if (error instanceof ApiError) {
              if (error.status === 429) {
                const errorData = JSON.parse(error.message);
                const retryAfter = errorData.error.details.find((detail: any) => detail.type === 'type.googleapis.com/google.rpc.RetryInfo')?.retryDelay;
                console.warn('Gemini API rate limit exceeded. Gemini tells to retry after:', retryAfter);
                const waitTimeMs = parseDuration(retryAfter) ?? 60_000;
                console.warn(`Rate limited by Gemini API. Retrying after ${waitTimeMs} ms.`);
                await new Promise(resolve => setTimeout(resolve, waitTimeMs));
                return getResponse();
              } else if (error.status === 503 && error.message.includes("The model is overloaded")) {
                const waitTimeMs = 2_000;
                console.warn(`Gemini model is overloaded. Retrying after ${waitTimeMs} ms.`);
                await new Promise(resolve => setTimeout(resolve, waitTimeMs));
                return getResponse();
              }
            }
            throw error;
          }
        })();

        return {
          ...vodFrame,
          gameTimestampSeconds: parseGameTimer(response.text ?? ''),
        };
      }))
    };
  },
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
