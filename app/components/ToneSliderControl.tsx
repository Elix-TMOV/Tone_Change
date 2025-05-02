
import { styled } from '@mui/material/styles';
import Slider from '@mui/material/Slider';

const ToneSlider = styled(Slider)({
    color: '#05df72',
    height: 8,
    '& .MuiSlider-thumb': {
      height: 20,
      width: 20,
      backgroundColor: '#fff',
      border: '2px solid currentColor',
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

interface ToneSliderControlProps {
  value: number;
  onChange: (value: number) => void;
  onRewrite: () => void;
  onReset: () => void;
  isWriting: boolean;
}

interface Mark {
  value: number;
  label: string;
}

const marks: Mark[] = [
    {
      value: 0,
      label: "💼"
    },
    {
      value: 10,
      label: "✌️"
    }
];

export const ToneSliderControl = (
  {
    value,
    onChange,
    onRewrite,
    onReset,
    isWriting
  }: ToneSliderControlProps
) => {
  return (
    <div className="w-full h-[25%] md:h-auto md:w-60 flex flex-col justify-between bg-green-100 rounded-lg px-6 py-4">
      <ToneSlider
        size="medium"
        aria-label="Tone slider"
        min={0}
        max={10}
        value={value}
        valueLabelDisplay="auto"
        marks={marks}
        onChange={(_, value) => onChange(value as number)}
      />
      <div className='flex flex-row items-center justify-between w-full'>
        <button
          className='bg-green-400 text-white rounded-md py-1 px-2 hover:rounded-none flex items-center gap-2'
          onClick={onRewrite}
          disabled={isWriting}
        >
          {isWriting && (
            <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          )}
          <span>{isWriting ? "Writing…" : "Re-Write"}</span>
        </button>
        <button
          className='bg-green-400 text-white rounded-md py-1 px-2 hover:rounded-none'
          onClick={onReset}
          disabled={isWriting}
        >
          Reset
        </button>
      </div>
    </div>
  );
};