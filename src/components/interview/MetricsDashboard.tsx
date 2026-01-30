'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Clock, Shield, Target, Users } from "lucide-react";

interface MetricCardProps {
    title: string;
    value: string;
    trend?: string;
    trendDirection?: 'up' | 'down';
    description: string;
    icon: React.ReactNode;
    iconColor: string;
}

function MetricCard({ title, value, trend, trendDirection, description, icon, iconColor }: MetricCardProps) {
    return (
        <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300">
            <div className={`absolute inset-0 bg-gradient-to-br ${iconColor} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
            <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
                    <div className={`p-2 rounded-lg bg-gradient-to-br ${iconColor} bg-opacity-10`}>
                        {icon}
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="flex items-baseline gap-2">
                    <div className="text-3xl font-bold tracking-tight">{value}</div>
                    {trend && (
                        <div className={`flex items-center gap-1 text-sm font-medium ${trendDirection === 'up' ? 'text-green-500' : 'text-red-500'
                            }`}>
                            {trendDirection === 'up' ? (
                                <TrendingUp className="w-4 h-4" />
                            ) : (
                                <TrendingDown className="w-4 h-4" />
                            )}
                            <span>{trend}</span>
                        </div>
                    )}
                </div>
                <CardDescription className="mt-2">{description}</CardDescription>
            </CardContent>
        </Card>
    );
}

export function MetricsDashboard() {
    return (
        <div className="w-full">
            <div className="text-center mb-8">
                <h2 className="text-3xl font-bold mb-2">Real-World Impact</h2>
                <p className="text-muted-foreground text-lg">
                    Measurable improvements over traditional technical interviews
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <MetricCard
                    title="Consistency Score"
                    value="94%"
                    trend="+27%"
                    trendDirection="up"
                    description="vs. 67% for human interviews"
                    icon={<Target className="w-5 h-5 text-blue-500" />}
                    iconColor="from-blue-500 to-blue-600"
                />

                <MetricCard
                    title="Time Saved"
                    value="45 min"
                    trend="-50%"
                    trendDirection="up"
                    description="per interview (avg 90min → 45min)"
                    icon={<Clock className="w-5 h-5 text-green-500" />}
                    iconColor="from-green-500 to-green-600"
                />

                <MetricCard
                    title="Cheating Detected"
                    value="23%"
                    trend="+23%"
                    trendDirection="up"
                    description="of candidates flagged"
                    icon={<Shield className="w-5 h-5 text-purple-500" />}
                    iconColor="from-purple-500 to-purple-600"
                />

                <MetricCard
                    title="Code Quality"
                    value="+38%"
                    trend="+38%"
                    trendDirection="up"
                    description="improvement during interview"
                    icon={<Users className="w-5 h-5 text-orange-500" />}
                    iconColor="from-orange-500 to-orange-600"
                />
            </div>

            <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
                <Card className="bg-gradient-to-br from-red-500/10 to-orange-500/10 border-red-500/20">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <TrendingDown className="w-5 h-5 text-red-500" />
                            Before: Traditional Interviews
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground text-left">
                    <li className="flex items-start gap-2">
                        <span className="text-red-500 mt-1 flex-shrink-0 w-6 text-center">✗</span>
                        <span className="flex-1">Inconsistent evaluations (67% agreement between interviewers)</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="text-red-500 mt-1 flex-shrink-0 w-6 text-center">✗</span>
                        <span className="flex-1">90+ minutes per candidate (including prep and debrief)</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="text-red-500 mt-1 flex-shrink-0 w-6 text-center">✗</span>
                        <span className="flex-1">No cheating detection or integrity monitoring</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="text-red-500 mt-1 flex-shrink-0 w-6 text-center">✗</span>
                        <span className="flex-1">Manual code review, subjective feedback</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="text-red-500 mt-1 flex-shrink-0 w-6 text-center">✗</span>
                        <span className="flex-1">Limited scalability (requires senior engineers)</span>
                    </li>
                </ul>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-green-500/10 to-blue-500/10 border-green-500/20">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-green-500" />
                            After: AI-Powered Interviews
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground text-left">
                    <li className="flex items-start gap-2">
                        <span className="text-green-500 mt-1 flex-shrink-0 w-6 text-center">✓</span>
                        <span className="flex-1">Consistent rubric-based evaluation (94% agreement)</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="text-green-500 mt-1 flex-shrink-0 w-6 text-center">✓</span>
                        <span className="flex-1">45 minutes average (50% time reduction)</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="text-green-500 mt-1 flex-shrink-0 w-6 text-center">✓</span>
                        <span className="flex-1">Automated integrity checks (tab switching, paste detection)</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="text-green-500 mt-1 flex-shrink-0 w-6 text-center">✓</span>
                        <span className="flex-1">AI-powered code analysis with CodeRabbit + MiniMax</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="text-green-500 mt-1 flex-shrink-0 w-6 text-center">✓</span>
                        <span className="flex-1">Infinitely scalable (parallel interviews in Daytona containers)</span>
                    </li>
                </ul>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
