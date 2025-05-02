import { NextResponse, NextRequest } from "next/server";
import { Mistral } from "@mistralai/mistralai";
import { unstable_cache } from "next/cache";


const MISTRAL_API_KEY = process.env.MISTRAL_API_KEY;

// lets create an instance of the mistral client
const client = new Mistral({ apiKey: MISTRAL_API_KEY });

const systemPrompt = `You are a helpful assistant that rewrites text in different tones. 
You will be given a text and you will rewrite it to be more professional or increasingly formal. 
You will also be given a toneValue from 0 to 10. The higher the toneValue, the more casual the text will be. 
The lower the toneValue, the more professional the text will be. 
Please make sure to keep the meaning of the text intact.
If the toneValue is 0, you will make it completely professional.
if the toneValue is 10, you will make it completely casual.

Do not add any additional information or context to the text. Just give the rewriten text, don't include any other information.
Do not change the meaning of the text.
`;

async function doRewrite(originalText: string, toneValue: number) {
  const res = await client.chat.complete({
    model: "mistral-small-latest",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: `Rewrite the following text to be more professional or increasingly formal. The toneValue is ${toneValue}. The text is ${originalText}` },
    ],
  });
  // if there is no response from the model, throw an error
  if (!res.choices?.length) {
    throw new Error("No response from model");
  }
  return res.choices[0].message.content;
}

// here I will wrap the doRewrite function with the unstable_cache function to cache the results for specific inputs
// this will cache the results for 120 seconds, so if the same input is given within 120 seconds, it will return the cached result instead of calling the model again
const getCachedRewrite = unstable_cache(
  doRewrite,
  [],                 
  { revalidate: 120 } // delete the keys after 120 seconds 
);


export async function POST(req: NextRequest) {
  const { originalText, toneValue } = await req.json();

  // check if the originalText and toneValue are valid one ought to be strinng the other ought to be a number between 0 and 10
  if (typeof originalText !== "string" || !originalText.trim()) {
    return NextResponse.json({ message: "Invalid text" }, { status: 400 });
  }
  if (typeof toneValue !== "number" || toneValue < 0 || toneValue > 10) {
    return NextResponse.json({ message: "Invalid toneValue" }, { status: 400 });
  }

  try {
    const reWrittenText = await getCachedRewrite(originalText, toneValue);
    return NextResponse.json({ reWrittenText }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ message: "Something went wrong when calling the model" }, { status: 500 });
  }
}
