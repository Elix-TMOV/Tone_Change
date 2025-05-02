"use client";
import { useState } from "react";
import axios from "axios";
import { useEffect } from "react";
import { ToneSliderControl } from './components/ToneSliderControl';
import { ErrorToast } from './components/ErrorToast';


export default function Home() {
  const [originalText, setOriginalText] = useState<string>("");
  const [modefiedText, setModifiedText] = useState<string | null>(null);
  const [sliderValue, setSliderValue] = useState<number>(0);
  const [fetchingText, setFetchingText] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleWrite = async () => {
    try {
      const inputText = originalText;

      if (inputText.trim() === "") {
        setTheErrors("Please enter some text to rewrite");
        return;
      }

      setFetchingText(true);
      const response = await axios.post("/api/rewrite", {
        originalText: inputText,
        toneValue: sliderValue
      });

      setFetchingText(false);
      if (response.status === 200) {
        setModifiedText(response.data.reWrittenText);
      }
      else if (response.status === 400) {
        setTheErrors(response.data.error);
      }
    } catch (error) {
      const err = error as any;
      const message: string = err.response?.data?.message;
      setTheErrors(message);
      setFetchingText(false);
    }
  };

  const handleReset = () => {
    setModifiedText(null); // go back to last accepted
  };

  const handleAccept = () => {
    if (modefiedText !== null) {
      // set the accepted modified text to the original text
      setOriginalText(modefiedText);
      setModifiedText(null); // clear out the modified text
    }
  };

  const setTheErrors = (error: string) => {
    setError(error);
    // set the error to null after 2.5 seconds in order to hide the error
    setTimeout(() => {
      setError(null);
    }, 2500);
  };

  // check if there is a stored value in local storage
  // and set the original text to it
  useEffect(() => {
    const stored = localStorage.getItem("textState");
    //  we check if the stored value is not null
    if (stored) {
      const { originalText } = JSON.parse(stored);
      setOriginalText(originalText);
    }
  }, []);

  // store the original text in local storage when ever it changes
  useEffect(() => {
    localStorage.setItem("textState", JSON.stringify({ originalText }));
  }, [originalText]);

  return (
    <div className="w-full flex flex-col items-center justify-center min-h-screen p-4">
      {/* If there is a error show it in the toast notification */}
      <h1 className="text-2xl font-bold text-green-500 mb-4">
        Tone Slider
      </h1>
      {error && <ErrorToast message={error} onClose={() => setError(null)}/>}
      <div className="h-screen w-full md:w-auto md:h-80 flex flex-col md:flex-row gap-4">

        {/* Text area section */}
        <div className='flex flex-col h-[70%] md:h-full w-full md:w-[400px] justify-between'>
          <textarea
            disabled={fetchingText}
            className="
              flex-1 text-black w-full p-4 border-3 border-green-400 rounded-lg
              focus:outline-none focus:border-green-200 focus:ring-2 focus:ring-green-500
              resize-none
            "
            placeholder="Type your text here..."
            value={modefiedText ?? originalText}
            onChange={(e) => {
              // when the modified text is displayed, we don't wnat the user to change the original text by tying
              // we only let the user change the original text when the modified text is null
              // when modified text is null is gaurnateed that the orignal text is displayed it could also be the change accepted by the user
              // so we will allow them to edit it
              if (modefiedText == null) {
                setOriginalText(e.target.value);
              }
            }}
          ></textarea>
          <div className='flex flex-row py-2 justify-between'>
            {modefiedText && 
              <button
                className='bg-green-400 text-white rounded-md py-1 px-2 hover:rounded-none'
                onClick={handleAccept}
                disabled={modefiedText === null}
              >
                Accept
              </button>
            }
          </div>
        </div>
        {/* Slider control section */}
        <ToneSliderControl
          value={sliderValue}
          onChange={setSliderValue}
          onRewrite={handleWrite}
          onReset={handleReset}
          isWriting={fetchingText}
        />
      </div>
    </div>
  );
}
