"use client";

import { styled } from '@mui/material/styles';
import Slider from '@mui/material/Slider';
import { useState } from "react";
import axios from "axios";
import { useEffect } from "react";

interface Mark {
  value: number;
  label: string;
}

//  we will slider to make it look good and appealing to the user
const ToneSlider = styled(Slider)({
  color: '#05df72',
  height: 8,
  '& .MuiSlider-thumb': {
    height: 20,
    width: 20,
    backgroundColor: '#fff',
    border: '2px solid currentColor',
    // on hover and focus, make the glow thicker
    '&:hover, &.Mui-focusVisible': {
      boxShadow: 'none',
    },
  },
  '& .MuiSlider-markLabel': {
    fontSize: '1.5rem', 
    color: '#fff',   
  },
  '& .MuiSlider-valueLabel': {
    lineHeight: 1.2,
    fontSize: 12,
    background: 'unset',
    padding: 0,
    width: 32,
    height: 32,
    borderRadius: '50% 50% 50% 50%',
    backgroundColor: '#05df72',
    transformOrigin: 'bottom left',
  },
});


//  for the slider markers we will use the emoji to make it look good and appealing to the user
const marks: Mark[] = [
  {
    value: 0,
    label: "💼"
  },
  {
    value: 10,
    label: "✌️"
  }
]

export default function Home() {
  const [originalText, setOriginalText] = useState<string>("");
  const [textStackPointer, setTextStackPointer] = useState<number>(0);
  const [textStack, setTextStack] = useState<string[]>([]);
  const [fetchingText, setFetchingText] = useState<boolean>(false);
  const [modefiedText, setModifiedText] = useState<string|null>("");
  const [sliderValue, setSliderValue] = useState<number>(0);
  const [showHistory, setShowHistory] = useState<boolean>(false);
  const [error, setError] = useState<string|null>(null);

  const handleWrite = async () => {
    try {
      if (originalText.trim() === "") {
        setTheErrors("Please enter some text to rewrite");
        return;
      }
      setFetchingText(true);
      const response = await axios.post("/api/rewrite", {
        originalText: originalText,
        toneValue: sliderValue
      });
      setFetchingText(false);
      if (response.status === 200) {
        const newText = response.data.reWrittenText;
        setTextStack([newText, ...textStack]);
        setTextStackPointer(0);
        setModifiedText(newText);
      }
    } catch (error) {
      setTheErrors("Something went wrong when calling the model");
      setFetchingText(false);
      console.error("Error: ", error);
    }
  }

  const handleUndo = () => {
    if (textStackPointer < textStack.length - 1) {
      setTextStackPointer(textStackPointer + 1);
      setModifiedText(textStack[textStackPointer + 1]);
    }
  }

  const handleRedo = () => {
    if (textStackPointer > 0) {
      setTextStackPointer(textStackPointer - 1);
      setModifiedText(textStack[textStackPointer - 1]);
    }
  }

  const handleHistoryClick = (index: number) => {
    setTextStackPointer(index);
    setModifiedText(textStack[index]);
  }

  const handleReset = () => {
    setModifiedText(null);
    setTextStack((stack) => []);
  }

  //  if there is data in the loacal storage, we will load it into the state
  useEffect(() => {
    const storedState = localStorage.getItem("textStack");
    if (storedState) {
      const { textStack, originalText } = JSON.parse(storedState);
      setTextStack(textStack);
      setOriginalText(originalText);
    }
  }, []);

  // everySingle time when the textStack or the originalText changes, we will save it to the local storage
  useEffect(() => {
    localStorage.setItem("textStack", JSON.stringify({
      textStack,
      originalText
    }
    ));
  }, [textStack, originalText]);

  const setTheErrors = (error: string) => {
    setError(error)
    setTimeout(() => {
      setError(null)
    }, 2500)
  }

  return (
    <div className="w-full flex flex-row items-center justify-center min-h-screen p-4">
      {error && 
        <div 
        className='fixed top-4 right-4 bg-red-500 hover:bg-red-300 hover:ring-2 hover:ring-red-500 text-white p-4 rounded-md'
        onClick={() => setError(null)}
        >
          {error}
        </div>
      }
      {/* Main container with fixed height */}
      <div className="h-screen w-full md:w-auto md:h-80 flex flex-col md:flex-row gap-4">
        {/* History sidebar - ALWAYS rendered but position controlled by CSS */}
        {showHistory && 
          <div 
          // hidden on small screens and shown on medium and larger screens 
            className={`
              w-60 bg-green-200 p-4 rounded-md
              overflow-y-auto
              hidden md:block 
            `}
          >
            <h3 className='text-green-600 font-bold mb-2'>History</h3>
            {textStack.map((text, index) => (
              <div 
                key={index}
                className={`p-2 mb-2 cursor-pointer rounded ${
                  index === textStackPointer ? 'bg-green-600 text-white' : 'bg-green-400'
                } hover:bg-green-600 hover:text-white`}
                onClick={() => handleHistoryClick(index)}
              >
                {text.substring(0, 30)}...
              </div>
            ))}
          </div>
        }

        {/* The textarea section */}
        <div className='flex flex-col h-[70%] md:h-full w-full md:w-[400px] justify-between'>
          <textarea
            disabled={fetchingText}
            className="
              flex-1
              text-black
             
              w-full p-4
              border-3 border-green-400 rounded-lg
              transition-all duration-200 ease-in-out
              focus:outline-none
              focus:border-green-200
              focus:ring-2 focus:ring-green-500 focus:ring-opacity-50
              resize-none
            "
            placeholder="Type your text here..."
            value={modefiedText ? modefiedText : originalText}
            onChange={(e) => setOriginalText(e.target.value)}
          ></textarea>
          <div className='flex flex-row py-2 justify-between'>
            <button
              className='bg-green-400 text-white rounded-md py-1 px-2 hover:rounded-none'
              onClick={handleUndo}
              disabled={textStackPointer >= textStack.length - 1}
            >
              Undo
            </button>
            <button
              className='bg-green-400 hidden md:block text-white rounded-md py-1 px-2 hover:rounded-none'
              onClick={() => setShowHistory(!showHistory)}
            >
              {showHistory ? 'Hide History' : 'Show History'}
            </button>
            <button
              className='bg-green-400 text-white rounded-md py-1 px-2 hover:rounded-none'
              onClick={handleRedo}
              disabled={textStackPointer <= 0}
            >
              Redo
            </button>
          </div>
        </div>

        {/* Slider section */}
        <div className="w-full h-[25%] md:h-auto md:w-60 flex flex-col justify-between bg-green-100 rounded-lg px-6 py-4">
          <ToneSlider      
            size="medium"
            aria-label="Restricted values"
            defaultValue={0}
            getAriaValueText={(value) => `${value}`}
            min = {0}
            max = {10}
            valueLabelDisplay="auto"
            marks={marks}
            value={sliderValue}
            onChange={(e, value) => {
              setSliderValue(value as number);
            }}
          />
          <div className='flex flex-row items-center justify-between w-full'>
            <button
              className='bg-green-400 text-white rounded-md py-1 px-2 hover:rounded-none flex items-center gap-2'
              onClick={handleWrite}
              disabled={fetchingText}
            >
              {fetchingText && (
                <svg
                  className="animate-spin h-4 w-4"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12" cy="12" r="10"
                    stroke="currentColor" strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
              )}
              <span>{fetchingText ? "Writing…" : "Write"}</span>
            </button>
           
            <button
              className='bg-green-400 text-white rounded-md py-1 px-2 hover:rounded-none'
              onClick={handleReset}
              disabled={fetchingText}
            >
              Reset
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}