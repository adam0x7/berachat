import { kv } from "@vercel/kv";
import { Ratelimit } from "@upstash/ratelimit";
import { Configuration, OpenAIApi } from "openai-edge";
import { OpenAIStream, StreamingTextResponse } from "ai";
import { functions, runFunction } from "./functions";

// Create an OpenAI API client (that's edge friendly!)
const config = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(config);

export const runtime = "edge";

export async function POST(req: Request) {
  if (
    process.env.NODE_ENV !== "development" &&
    process.env.KV_REST_API_URL &&
    process.env.KV_REST_API_TOKEN
  ) {
    const ip = req.headers.get("x-forwarded-for");
    const ratelimit = new Ratelimit({
      redis: kv,
      limiter: Ratelimit.slidingWindow(50, "1 d"),
    });

    const { success, limit, reset, remaining } = await ratelimit.limit(
      `chathn_ratelimit_${ip}`,
    );

    if (!success) {
      return new Response("You have reached your request limit for the day.", {
        status: 429,
        headers: {
          "X-RateLimit-Limit": limit.toString(),
          "X-RateLimit-Remaining": remaining.toString(),
          "X-RateLimit-Reset": reset.toString(),
        },
      });
    }
  }

  const { messages } = await req.json();
  // add a message at the beginning of the conversation
  messages.unshift({
    role: "system",
    content: `You are an AI assistant specialized in Berachain, a blockchain network that uses a novel consensus mechanism called Proof-of-Liquidity (PoL). Your primary function is to assist Berachain users with inquiries about the network, its tokens, and its ecosystem. Here's key information to guide your responses:

1. Berachain Tokens:
   - $BERA: The native gas token used for transaction fees and validator staking.
   - $BGT (Berachain Governance Token): A non-transferrable token used for governance, earning incentives, and can be burned for $BERA. This token is used for delegating to validators and governance. Users delegate to validators to earn incentive rewards.
   - $HONEY: Berachain's native stablecoin, pegged to 1 USDC.

2. Proof-of-Liquidity (PoL):
   - A consensus mechanism that aligns chain security with increased on-chain liquidity.
   - Combines aspects of Proof-of-Stake with additional incentives for providing liquidity.
   - Utilizes both $BERA for gas/security and $BGT for governance and rewards.

3. Participants in PoL:
   - Validators: Users stake $BGT into validators, propose blocks, and distribute $BGT rewards.
   - $BGT Holders & Farmers: Influence ecosystem decisions and direct economic incentives.
   - Bera Foundation: Operates default dApps (Bex, Bend, Berps) producing fees for $BGT holders.
   - Ecosystem Projects: Can plug into PoL to bootstrap deposits and incentivize liquidity.

4. Incentives:
   - Validators earn through gas fees, protocol incentives, and commissions on $BGT distribution.
   - Users can earn $BGT by providing liquidity in Reward Vaults.
   - Protocols can offer incentives to attract $BGT emissions from validators.

5. Key Concepts:
   - Reward Vaults: Pools where users provide liquidity to earn $BGT.
   - Delegation: $BGT holders can delegate to validators to influence $BGT emissions.
   - Burning: $BGT can be burned 1:1 for $BERA (one-way process).

When answering queries:
- Provide accurate information based on the Berachain documentation.
- If a user asks about specific data or statistics, use the appropriate function to fetch up-to-date information.
- Explain concepts clearly, especially the unique aspects of PoL and how it differs from traditional Proof-of-Stake.
- If a query is ambiguous, ask for clarification to ensure you provide the most relevant information.
- When discussing token amounts or blockchain data, always use the most recent information available through the provided functions.
- Format responses in tables when presenting comparative or statistical data.

Don't make assumptions about what values to plug into functions. Ask for clarification if a user request is ambiguous. If a block number is not mentioned, assume it's 0. If not given a pool address for a function that requires one, ask the user to provide one. Always format the response in a table when possible.

When you see the reward vault address - 0x2E8410239bB4b099EE2d5683e3EF9d6f04E321CC. This is for BEND, our lending protcol. And the periphery debt token is called VDHONEY. 

When you see the reward  vault address - 0xC5Cb3459723B828B3974f7E58899249C2be3B33d. This is for BERPS. Our perpetuals protocol, and the periphery debt token is called bHONEY. 

Do not render the text PERIPHERY DEBT TOKEN in your responses, but rather the correct token name.

Remember, you're assisting users who may be interacting with or developing for the Berachain ecosystem. Tailor your responses to be helpful for more experienced blockchain/Berachain users."`

  });
  // console.log("messages recieved:", messages)
  // check if the conversation requires a function call to be made
  let initialResponse;
  try {
    initialResponse = await openai.createChatCompletion({
      model: "gpt-4o",
      messages,
      functions,
      function_call: "auto",
    });
  } catch (error) {
    console.error("Error calling OpenAI API:", error);
    return new Response("An error occurred while processing your request.", { status: 500 });
  }
  const initialResponseJson = await initialResponse.json();
  console.log("OpenAI API Response:", JSON.stringify(initialResponseJson, null, 2));
  const initialResponseMessage = initialResponseJson?.choices?.[0]?.message || {};

  let finalResponse;

  if (initialResponseMessage.function_call) {
    const { name, arguments: args } = initialResponseMessage.function_call;
    let functionResponse;
    try {
      functionResponse = await runFunction(name, JSON.parse(args));
      console.log("Function Response:", JSON.stringify(functionResponse, null, 2));
    } catch (error) {
      console.error("Error running function:", error);
      return new Response("An error occurred while processing the function call.", { status: 500 });
    }

    finalResponse = await openai.createChatCompletion({
      model: "gpt-4o",
      stream: true,
      messages: [
        ...messages,
        initialResponseMessage,
        {
          role: "function",
          name: initialResponseMessage.function_call.name,
          content: JSON.stringify(functionResponse),
        },
      ],
    });
    // Convert the response into a friendly text-StreamingTextResponsec
    // const msg = await finalResponse.json();
    // console.log("final response:", msg);
    try {
      const stream = OpenAIStream(finalResponse);
      return new StreamingTextResponse(stream);
    } catch (e) {
      console.error("Error creating stream:", e);
      return new Response("An error occurred while processing the response.", { status: 500 });
    }
    // Respond with the stream
  } else {
    // if there's no function call, just return the initial response
    // but first, we gotta convert initialResponse into a stream with ReadableStream
    const content = initialResponseMessage.content || "Please retry your request there was a backend error.";
    const chunks = content.split(" ");
    const stream = new ReadableStream({
      async start(controller) {
        for (const chunk of chunks) {
          const bytes = new TextEncoder().encode(chunk + " ");
          controller.enqueue(bytes);
          await new Promise((r) =>
            setTimeout(
              r,
              // get a random number between 10ms and 30ms to simulate a random delay
              Math.floor(Math.random() * 20) + 10
            ),
          );
        }
        controller.close();
      },
    });
    return new StreamingTextResponse(stream);
  }
}
