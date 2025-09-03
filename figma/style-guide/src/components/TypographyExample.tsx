interface TypographyExampleProps {
  text: string;
  description: string;
  fontSize: string;
  fontWeight: string;
  fontFamily: string;
}

export function TypographyExample({ 
  text, 
  description, 
  fontSize, 
  fontWeight, 
  fontFamily 
}: TypographyExampleProps) {
  return (
    <div className="flex flex-col gap-2 py-4 border-b border-gray-100 last:border-b-0">
      <div 
        style={{ 
          fontFamily,
          fontSize,
          fontWeight,
          lineHeight: 1.2
        }}
      >
        {text}
      </div>
      <div className="text-sm text-gray-500 font-mono">
        {description}
      </div>
    </div>
  );
}



