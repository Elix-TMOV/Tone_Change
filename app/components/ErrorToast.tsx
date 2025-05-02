interface ErrorToastProps {
    message: string;
    onClose: () => void;
}

export const ErrorToast = ({ message, onClose }: ErrorToastProps) => {
    return (
        <div
          className='fixed top-4 right-4 bg-red-500 hover:bg-red-300 hover:ring-2 hover:ring-red-500 text-white p-4 rounded-md'
          onClick={onClose}
        >
          {message}
        </div>
    );
};

