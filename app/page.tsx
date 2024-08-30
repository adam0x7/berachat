"use client";

import { useRef } from "react";
import { useChat } from "ai/react";
import va from "@vercel/analytics";
import clsx from "clsx";
import { VercelIcon, GithubIcon, LoadingCircle, SendIcon } from "./icons";
import { Bot, User } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Textarea from "react-textarea-autosize";
import { toast } from "sonner";
import aperture from "../public/aperture.svg";
import Image from "next/image";
import MarkdownRenderer from "./LinkOku";
import OkuSVG from "./oku";
import Aperture from "./aperture";

const examples = [
  "What is the monthly BGT reward rate for the Infrared validator month over month from June to August of 2024?",
  "Which vaults is the wallet 0x98F43E30A80af84cbC55599392A16983f832CEB3 staked in?",
  "What pools are trading BERA with the most liquidity?",
  "Which validator built block 3544950? How much were their BGT rewards?",
];

export default function Chat() {
  const formRef = useRef<HTMLFormElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const { messages, input, setInput, handleSubmit, isLoading } = useChat({
    onResponse: (response) => {
      if (response.status === 429) {
        toast.error("You have reached your request limit for the day.");
        va.track("Rate limited");
        return;
      } else {
        va.track("Chat initiated");
      }
    },
    onError: (error) => {
      va.track("Chat errored", {
        input,
        error: error.message,
      });
    },
  });

  const disabled = isLoading || input.length === 0;

  return (
    <main className="flex flex-col items-center justify-between pb-40 bg-[url('/bg.png')] bg-cover bg-fixed min-h-screen h-screen overflow-y-auto text-white">
      <div className="absolute top-5 w-full flex justify-between px-5">
        <div className="rounded-lg p-2">
          <Image src="/bera_white_smol.svg" alt="BeraChain" width={100} height={44} />
        </div>
      </div>
      {messages.length > 0 ? (
        messages.map((message, i) => (
          <div
            key={i}
            className="flex w-full items-center justify-center border-b border-gray-200/10 py-8 bg-black/30 backdrop-blur-sm"
          >
            <div className="flex w-full max-w-screen-md items-start space-x-4 px-5 sm:px-0">
              <div className="flex-shrink-0">
                {message.role === "user" ? (
                  <User width={20} className="text-white" />
                ) : (
                  <Image src="/bera.svg" alt="AI" width={20} height={20} />
                )}
              </div>
              <div className="flex-grow prose mt-1 w-full overflow-auto break-words prose-p:leading-relaxed text-white">
                <MarkdownRenderer content={message.content} />
              </div>
            </div>
          </div>
        ))
      ) : (
        <div className="border-gray-700 mx-5 mt-20 max-w-screen-md rounded-md border sm:w-full bg-black/30 backdrop-blur-sm">
          <div className="flex flex-col space-y-4 p-7 sm:p-10">
            <h1 className="text-lg font-semibold text-white">
              Welcome to BeraChat 🐻⛓️
            </h1>
            <p className="text-white">
              This is an AI chatbot that uses OpenAI Functions to interact with BeraChain using natural language.
            </p>
            <p className="text-white">
              You can ask about validator rewards, latest block data, search BEX token pair pools, fetch pool liquidity, and BGT rewards of validators.
            </p>
          </div>
          <div className="flex flex-col space-y-4 break-all border-t border-gray-700 bg-black/20 p-7 sm:p-10">
            {examples.map((example, i) => (
              <button
                key={i}
                className="whitespace-pre-wrap break-words rounded-md border border-gray-700 bg-black/30 px-5 py-3 text-left text-sm text-white transition-all duration-75 hover:bg-black/50 active:bg-black/60"
                onClick={() => {
                  setInput(example);
                  inputRef.current?.focus();
                }}
              >
                {example}
              </button>
            ))}
          </div>
        </div>
      )}
      <div className="fixed bottom-0 flex w-full flex-col items-center space-y-3 bg-gradient-to-b from-transparent via-black/70 to-black/70 p-5 pb-3 sm:px-0">
        <form
          ref={formRef}
          onSubmit={handleSubmit}
          className="relative w-full max-w-screen-md rounded-xl border border-gray-700 bg-black/50 px-4 pb-2 pt-3 shadow-lg sm:pb-3 sm:pt-4"
        >
          <Textarea
            ref={inputRef}
            tabIndex={0}
            required
            rows={1}
            autoFocus
            placeholder="Send a message"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                formRef.current?.requestSubmit();
                e.preventDefault();
              }
            }}
            spellCheck={false}
            className="w-full pr-10 focus:outline-none bg-transparent text-white placeholder-gray-400"
          />
          <button
            className={clsx(
              "absolute inset-y-0 right-3 my-auto flex h-8 w-8 items-center justify-center rounded-md transition-all",
              disabled
                ? "cursor-not-allowed opacity-50"
                : "bg-white/10 hover:bg-white/20",
            )}
            disabled={disabled}
          >
            {isLoading ? (
              <LoadingCircle />
            ) : (
              <SendIcon
                className={clsx(
                  "h-4 w-4",
                  input.length === 0 ? "text-gray-300" : "text-white",
                )}
              />
            )}
          </button>
        </form>
        <p className="flex items-center justify-center gap-2 text-center text-xs text-gray-400">
          <span className="text-md">Powered by</span>
          <Image src="/bera_white_smol.svg" alt="BeraChain" width={80} height={35} />
        </p>
      </div>
    </main>
  );
}
