import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";

type SpinOutcome = "WIN" | "LOSE" | "TRY_AGAIN";

interface SpinWheelProps {
  isSpinning: boolean;
  result: SpinOutcome | null;
}

export const SpinWheel = ({ isSpinning, result }: SpinWheelProps) => {
  const [rotation, setRotation] = useState(0);

  // Wheel segments: 12 slices
  const segments = [
    { outcome: "WIN", color: "hsl(142 76% 36%)" },     // Green -WIN
    { outcome: "LOSE", color: "hsl(0 84.2% 60.2%)" },  // Red - LOSE
    { outcome: "TRY_AGAIN", color: "hsl(45 95% 55%)" }, // Yellow - TRY AGAIN
    { outcome: "LOSE", color: "hsl(0 84.2% 60.2%)" },
    { outcome: "WIN", color: "hsl(142 76% 36%)" },
    { outcome: "LOSE", color: "hsl(0 84.2% 60.2%)" },
    { outcome: "TRY_AGAIN", color: "hsl(45 95% 55%)" },
    { outcome: "LOSE", color: "hsl(0 84.2% 60.2%)" },
    { outcome: "LOSE", color: "hsl(0 84.2% 60.2%)" },
    { outcome: "TRY_AGAIN", color: "hsl(45 95% 55%)" },
    { outcome: "LOSE", color: "hsl(0 84.2% 60.2%)" },
    { outcome: "LOSE", color: "hsl(0 84.2% 60.2%)" },
  ];

  useEffect(() => {
    if (isSpinning && result) {
      // Find target segment index based on result
      const targetIndex = segments.findIndex(seg => seg.outcome === result);
      
      // Calculate rotation: 10-12 full spins + target segment
      const fullSpins = 10 + Math.random() * 2; // 10 to 12 full rotations for realistic casino feel
      const baseRotation = 360 * fullSpins;
      const segmentAngle = 360 / segments.length;
      // Rotate to target segment (accounting for pointer at top)
      const targetAngle = 360 - (targetIndex * segmentAngle) + segmentAngle / 2;
      
      // Add to previous rotation to ensure continuous forward motion
      const newRotation = rotation + baseRotation + targetAngle;
      
      setRotation(newRotation);
    }
  }, [isSpinning, result]);

  return (
    <Card className="bg-card/80 backdrop-blur-lg border-border/50 p-6">
      <div className="flex items-center justify-center">
        <div className="relative w-72 h-72">
          {/* Pointer */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
            <div className="w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-t-[24px] border-t-foreground" />
          </div>

          {/* Wheel */}
          <svg
            viewBox="0 0 200 200"
            className="w-full h-full transition-transform duration-[7000ms]"
            style={{ 
              transform: `rotate(${rotation}deg)`,
              transitionTimingFunction: 'cubic-bezier(0.33, 1, 0.68, 1)'
            }}
          >
            {segments.map((segment, index) => {
              const angle = (360 / segments.length) * index;
              const nextAngle = angle + 360 / segments.length;
              
              const x1 = 100 + 95 * Math.cos((angle * Math.PI) / 180);
              const y1 = 100 + 95 * Math.sin((angle * Math.PI) / 180);
              const x2 = 100 + 95 * Math.cos((nextAngle * Math.PI) / 180);
              const y2 = 100 + 95 * Math.sin((nextAngle * Math.PI) / 180);

              return (
                <g key={index}>
                  <path
                    d={`M 100 100 L ${x1} ${y1} A 95 95 0 0 1 ${x2} ${y2} Z`}
                    fill={segment.color}
                    stroke="hsl(220 25% 8%)"
                    strokeWidth="2"
                  />
                  <text
                    x={100 + 60 * Math.cos(((angle + nextAngle) / 2 * Math.PI) / 180)}
                    y={100 + 60 * Math.sin(((angle + nextAngle) / 2 * Math.PI) / 180)}
                    fill="white"
                    fontSize="10"
                    fontWeight="bold"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    transform={`rotate(${(angle + nextAngle) / 2 + 90}, ${100 + 60 * Math.cos(((angle + nextAngle) / 2 * Math.PI) / 180)}, ${100 + 60 * Math.sin(((angle + nextAngle) / 2 * Math.PI) / 180)})`}
                  >
                    {segment.outcome === "WIN" ? "WIN" : segment.outcome === "LOSE" ? "LOSE" : "TRY"}
                  </text>
                </g>
              );
            })}
            
            {/* Center circle */}
            <circle cx="100" cy="100" r="15" fill="hsl(220 25% 8%)" stroke="hsl(195 92% 58%)" strokeWidth="3" />
          </svg>
        </div>
      </div>
    </Card>
  );
};
