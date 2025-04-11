import type { BracketData } from '@/lib/types/playoff-bracket';
import { PlayoffSeries } from './PlayoffSeries';

export function PlayoffBracket({
    bracketData,
    roundNames,
}: {
    bracketData: BracketData;
    roundNames: string[];
}) {
    return (
        <div className="flex">
            {/* Round 1 Column */}
            <div className="h-[1500px] shrink-0 flex flex-col justify-center">
                <h3 className="text-lg font-medium text-center mb-4 sticky top-0 bg-background z-10">
                    {roundNames[0]}
                </h3>
                {/* East R1 */}
                <div className="h-[700px] flex flex-col justify-around pr-4">
                    {(bracketData.East[1] || []).map((series) => (
                        <PlayoffSeries
                            key={`${series.seriesConference}-${series.roundNumber}-${series.displayOrderNumber}`}
                            series={series}
                        />
                    ))}
                </div>
                {/* Divider */}
                <div className="flex flex-col items-center">
                    <span className="text-sm text-center">EAST</span>
                    <div className="border-t border-2 w-full"></div>
                    <span className="text-sm text-center">WEST</span>
                </div>
                {/* West R1 */}
                <div className="h-[700px] flex flex-col justify-around pr-4">
                    {(bracketData.West[1] || []).map((series) => (
                        <PlayoffSeries
                            key={`${series.seriesConference}-${series.roundNumber}-${series.displayOrderNumber}`}
                            series={series}
                        />
                    ))}
                </div>
            </div>

            {/* Round 2 Column */}
            <div className="h-[1500px] shrink-0 flex flex-col justify-center">
                <h3 className="text-lg font-medium text-center mb-4 sticky top-0 bg-background z-10">
                    {roundNames[1]}
                </h3>
                {/* East R2 */}
                <div className="h-[500px] flex flex-col justify-around px-4">
                    {(bracketData.East[2] || []).map((series) => (
                        <PlayoffSeries
                            key={`${series.seriesConference}-${series.roundNumber}-${series.displayOrderNumber}`}
                            series={series}
                        />
                    ))}
                </div>
                {/* Divider */}
                <div className="flex flex-col items-center">
                    <span className="text-sm text-center">EAST</span>
                    <div className="border-t border-2 w-full"></div>
                    <span className="text-sm text-center">WEST</span>
                </div>
                {/* West R2 */}
                <div className="h-[500px] flex flex-col justify-around px-4">
                    {(bracketData.West[2] || []).map((series) => (
                        <PlayoffSeries
                            key={`${series.seriesConference}-${series.roundNumber}-${series.displayOrderNumber}`}
                            series={series}
                        />
                    ))}
                </div>
            </div>

            {/* Round 3 Column */}
            <div className="h-[1500px] shrink-0 flex flex-col justify-center">
                <h3 className="text-lg font-medium text-center mb-4 sticky top-0 bg-background z-10">
                    {roundNames[2]}
                </h3>
                {/* East R3 */}
                <div className="h-[300px] flex flex-col justify-around px-4">
                    {(bracketData.East[3] || []).map((series) => (
                        <PlayoffSeries
                            key={`${series.seriesConference}-${series.roundNumber}-${series.displayOrderNumber}`}
                            series={series}
                        />
                    ))}
                </div>
                {/* Divider */}
                <div className="flex flex-col items-center">
                    <span className="text-sm text-center">EAST</span>
                    <div className="border-t border-2 w-full"></div>
                    <span className="text-sm text-center">WEST</span>
                </div>
                {/* West R3 */}
                <div className="h-[300px] flex flex-col justify-around px-4">
                    {(bracketData.West[3] || []).map((series) => (
                        <PlayoffSeries
                            key={`${series.seriesConference}-${series.roundNumber}-${series.displayOrderNumber}`}
                            series={series}
                        />
                    ))}
                </div>
            </div>

            {/* Finals Column */}
            <div className="h-[1500px] shrink-0 flex flex-col justify-center">
                {/* Give height for centering */}
                <h3 className="text-lg font-medium text-center mb-4 sticky top-0 bg-background z-10">
                    {roundNames[3]}
                </h3>
                {bracketData.Finals && <PlayoffSeries key="finals" series={bracketData.Finals} />}
            </div>
        </div>
    );
}
