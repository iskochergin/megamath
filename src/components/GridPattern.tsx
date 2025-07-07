import {useId} from "react";
import {cn} from "../lib/utils";

interface GridPatternProps {
    width?: any;
    height?: any;
    x?: any;
    y?: any;
    squares?: Array<[x: number, y: number]>;
    strokeDasharray?: any;
    className?: string;

    [key: string]: any;
}

export function GridPattern({
                                width = 40,
                                height = 40,
                                x = -1,
                                y = -1,
                                strokeDasharray = 0,
                                squares,
                                className,
                                ...props
                            }: GridPatternProps) {
    const id = useId();

    return (
        <svg
            aria-hidden="true"
            className={cn(
/*
                "pointer-events-none absolute inset-0 h-full w-full " +
*/
                "pointer-events-none fixed inset-0 h-screen w-screen " +
                "text-[rgb(var(--grid-line))] dark:text-primary " +
                "transition-colors",
                className
            )}
            {...props}
        >
            <defs>
                <pattern
                    id={id}
                    width={width}
                    height={height}
                    patternUnits="userSpaceOnUse"
                    x={x}
                    y={y}
                >
                    <path
                        d={`M.5 ${height}V.5H${width}`}
                        fill="none"
                        stroke="currentColor"
                        strokeDasharray={strokeDasharray}
                    />
                </pattern>
            </defs>

            <rect width="100%" height="100%" strokeWidth={0} fill={`url(#${id})`}/>

            {squares && (
                <svg x={x} y={y} className="overflow-visible">
                    {squares.map(([sx, sy]) => (
                        <rect
                            key={`${sx}-${sy}`}
                            x={sx * width + 1}
                            y={sy * height + 1}
                            width={width - 1}
                            height={height - 1}
                            fill="currentColor"
                            strokeWidth={0}
                        />
                    ))}
                </svg>
            )}
        </svg>
    );
}
