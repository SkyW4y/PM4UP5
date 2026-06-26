import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import "../styles/progress-pie-chart.css";

interface ProgressPieChartProps {
    percentCompleted: number; // 0-100
    title: string;
}

export default function ProgressPieChart({ percentCompleted, title }: ProgressPieChartProps) {
    const validPercent = Math.min(Math.max(percentCompleted, 0), 100);
    const remainingPercent = 100 - validPercent;

    const data = [
        { name: "Completed", value: validPercent },
        { name: "Remaining", value: remainingPercent },
    ];

    const COLORS = [
        "rgb(170, 170, 170)",
        "rgba(220, 220, 220, 0.8)"
    ];

    return (
        <div className="chart-card">
            <h3 className="chart-title">{title}</h3>

            <div className="chart-container">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            innerRadius={0}
                            outerRadius="95%"
                            dataKey="value"
                            startAngle={90}
                            endAngle={-270}
                            isAnimationActive={false}
                        >
                            {data.map((_, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={COLORS[index]}
                                    stroke="none"
                                />
                            ))}
                        </Pie>
                    </PieChart>
                </ResponsiveContainer>

                <div className="chart-percentage-text">
                    {validPercent}%
                </div>
            </div>
        </div>
    );
}