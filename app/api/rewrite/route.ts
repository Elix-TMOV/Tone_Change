import { NextResponse, NextRequest } from "next/server";
import { Mistral } from "@mistralai/mistralai";

const MISTRAL_API_KEY = process.env.MISTRAL_API_KEY || "";

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

export async function POST(request: NextRequest) {
    const { originalText, toneValue } = await request.json();
    //  we may have to check if hte orignal text is a string and not empty and the slider value is a number
    try{
        const result = await client.chat.complete({
            model: "mistral-small-latest",
            messages: [ 
                { role: "system", content: systemPrompt },
                { role: "user", content: `Rewrite the following text to be more professional or increasingly formal. The toneValue is ${toneValue}. The text is ${originalText}` },
            ],
        })
        // if there there are no choices or is the lenght of the choices array is 0, we will return an error
        if (!result.choices || result.choices.length === 0) {
            return NextResponse.json({ error: "No response from the model" }, { status: 500 });
        }
        const reWrittenText = result.choices[0].message.content;
        return NextResponse.json({ reWrittenText }, {status: 200 });
    }
    catch (error) {
        console.error("Error: ", error);
        return NextResponse.json({ error: "Something went wrong when calling the model" }, { status: 500 });
    }
}