interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  containerClassName?: string;
}

export function Input({
  containerClassName = '',
  className,
  ...props
}: InputProps) {
  return (
    <div
      className={`relative w-full ${containerClassName} [&:focus-within_>_hr]:left-0 [&:focus-within_>_hr]:w-full`}
    >
      <input
        className={`peer block w-full grow border-none py-[9px] pl-10 text-sm placeholder:text-gray-500 focus:[box-shadow:none] ${className}`}
        {...props}
      />
      <hr className="absolute bottom-1 left-[50%] h-0.5 w-0 bg-cyan-500 transition-[2s_linear]"></hr>
    </div>
  );
}
