"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts"
import { Target, TrendingUp, Clock, Activity } from "lucide-react"
import { motion } from "framer-motion"

type BallData = {
  over: number
  ball: number
  runs: number
  totalRuns: number
  wickets: number
  runRate: number
  requiredRate?: number
}

type TeamData = {
  name: string
  innings: BallData[]
  target?: number
  isChasing?: boolean
}

type MatchData = {
  team1: TeamData
  team2: TeamData
  currentTeam: "team1" | "team2"
  currentBall: number
}

export default function CricketScoreComparator() {
  const [matchData, setMatchData] = useState<MatchData>({
    team1: { name: "India", innings: [] },
    team2: { name: "New Zealand", innings: [] },
    currentTeam: "team1",
    currentBall: 0,
  })

  const [currentRuns, setCurrentRuns] = useState("")
  const [currentWickets, setCurrentWickets] = useState("0")
  const [isLive, setIsLive] = useState(false)

  // Sample data for demonstration
  useEffect(() => {
    const sampleData: MatchData = {
      team1: {
        name: "India",
        innings: [
          { over: 1, ball: 1, runs: 1, totalRuns: 1, wickets: 0, runRate: 6.0 },
          { over: 1, ball: 2, runs: 4, totalRuns: 5, wickets: 0, runRate: 15.0 },
          { over: 1, ball: 3, runs: 0, totalRuns: 5, wickets: 0, runRate: 10.0 },
          { over: 1, ball: 4, runs: 6, totalRuns: 11, wickets: 0, runRate: 16.5 },
          { over: 1, ball: 5, runs: 2, totalRuns: 13, wickets: 0, runRate: 15.6 },
          { over: 1, ball: 6, runs: 1, totalRuns: 14, wickets: 0, runRate: 14.0 },
          { over: 2, ball: 1, runs: 0, totalRuns: 14, wickets: 1, runRate: 12.0 },
          { over: 2, ball: 2, runs: 4, totalRuns: 18, wickets: 1, runRate: 13.5 },
          { over: 2, ball: 3, runs: 1, totalRuns: 19, wickets: 1, runRate: 12.7 },
          { over: 2, ball: 4, runs: 2, totalRuns: 21, wickets: 1, runRate: 12.6 },
          { over: 2, ball: 5, runs: 0, totalRuns: 21, wickets: 1, runRate: 11.5 },
          { over: 2, ball: 6, runs: 3, totalRuns: 24, wickets: 1, runRate: 12.0 },
        ],
      },
      team2: {
        name: "New Zealand",
        innings: [
          { over: 1, ball: 1, runs: 0, totalRuns: 0, wickets: 0, runRate: 0.0 },
          { over: 1, ball: 2, runs: 2, totalRuns: 2, wickets: 0, runRate: 6.0 },
          { over: 1, ball: 3, runs: 1, totalRuns: 3, wickets: 0, runRate: 6.0 },
          { over: 1, ball: 4, runs: 4, totalRuns: 7, wickets: 0, runRate: 10.5 },
          { over: 1, ball: 5, runs: 0, totalRuns: 7, wickets: 0, runRate: 8.4 },
          { over: 1, ball: 6, runs: 1, totalRuns: 8, wickets: 0, runRate: 8.0 },
          { over: 2, ball: 1, runs: 6, totalRuns: 14, wickets: 0, runRate: 12.0 },
          { over: 2, ball: 2, runs: 0, totalRuns: 14, wickets: 0, runRate: 10.5 },
          { over: 2, ball: 3, runs: 1, totalRuns: 15, wickets: 0, runRate: 10.0 },
          { over: 2, ball: 4, runs: 0, totalRuns: 15, wickets: 1, runRate: 9.0 },
          { over: 2, ball: 5, runs: 2, totalRuns: 17, wickets: 1, runRate: 9.1 },
          { over: 2, ball: 6, runs: 4, totalRuns: 21, wickets: 1, runRate: 10.5 },
        ],
        target: 250,
        isChasing: true,
      },
      currentTeam: "team2",
      currentBall: 12,
    }
    setMatchData(sampleData)
  }, [])

  const addBallData = () => {
    if (!currentRuns) return

    const runs = Number.parseInt(currentRuns)
    const wickets = Number.parseInt(currentWickets)
    const currentBallNumber = matchData.currentBall + 1
    const over = Math.floor((currentBallNumber - 1) / 6) + 1
    const ball = ((currentBallNumber - 1) % 6) + 1

    const currentTeamData = matchData[matchData.currentTeam]
    const lastBall = currentTeamData.innings[currentTeamData.innings.length - 1]
    const totalRuns = (lastBall?.totalRuns || 0) + runs
    const totalWickets = wickets
    const runRate = (totalRuns / currentBallNumber) * 6

    const newBallData: BallData = {
      over,
      ball,
      runs,
      totalRuns,
      wickets: totalWickets,
      runRate,
      requiredRate: currentTeamData.target
        ? ((currentTeamData.target - totalRuns) / (50 - currentBallNumber / 6)) * 6
        : undefined,
    }

    setMatchData((prev) => ({
      ...prev,
      [prev.currentTeam]: {
        ...prev[prev.currentTeam],
        innings: [...prev[prev.currentTeam].innings, newBallData],
      },
      currentBall: currentBallNumber,
    }))

    setCurrentRuns("")
  }

  const getComparisonData = () => {
    const maxBalls = Math.max(matchData.team1.innings.length, matchData.team2.innings.length)
    const comparisonData = []

    for (let i = 0; i < maxBalls; i++) {
      const team1Data = matchData.team1.innings[i]
      const team2Data = matchData.team2.innings[i]

      comparisonData.push({
        ball: i + 1,
        over: Math.floor(i / 6) + 1,
        ballInOver: (i % 6) + 1,
        [matchData.team1.name]: team1Data?.totalRuns || 0,
        [matchData.team2.name]: team2Data?.totalRuns || 0,
        [`${matchData.team1.name}_wickets`]: team1Data?.wickets || 0,
        [`${matchData.team2.name}_wickets`]: team2Data?.wickets || 0,
        [`${matchData.team1.name}_runRate`]: team1Data?.runRate || 0,
        [`${matchData.team2.name}_runRate`]: team2Data?.runRate || 0,
      })
    }

    return comparisonData
  }

  const getCurrentComparison = () => {
    const currentBallIndex = matchData.currentBall - 1
    const team1Data = matchData.team1.innings[currentBallIndex]
    const team2Data = matchData.team2.innings[currentBallIndex]

    return {
      team1: team1Data,
      team2: team2Data,
      advantage:
        team1Data && team2Data
          ? team1Data.totalRuns > team2Data.totalRuns
            ? matchData.team1.name
            : team2Data.totalRuns > team1Data.totalRuns
              ? matchData.team2.name
              : "Equal"
          : null,
    }
  }

  const getWinProbability = () => {
    const comparison = getCurrentComparison()
    if (!comparison.team1 || !comparison.team2) return { team1: 50, team2: 50 }

    const runDiff = comparison.team1.totalRuns - comparison.team2.totalRuns
    const wicketDiff = comparison.team2.wickets - comparison.team1.wickets

    // Simple probability calculation based on runs and wickets
    let probability = 50 + runDiff * 2 + wicketDiff * 5
    probability = Math.max(10, Math.min(90, probability))

    return {
      team1: Math.round(probability),
      team2: Math.round(100 - probability),
    }
  }

  const comparisonData = getComparisonData()
  const currentComparison = getCurrentComparison()
  const winProbability = getWinProbability()

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-6"
      >
        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-green-600 text-transparent bg-clip-text">
          Cricket Score Comparator
        </h1>
        <p className="text-muted-foreground">Compare ball-by-ball performance between teams at the same stage</p>
      </motion.div>

      {/* Live Score Input */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Live Score Input
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-end">
            <div>
              <Label htmlFor="runs">Runs Scored</Label>
              <Input
                id="runs"
                type="number"
                value={currentRuns}
                onChange={(e) => setCurrentRuns(e.target.value)}
                placeholder="0"
                className="w-20"
              />
            </div>
            <div>
              <Label htmlFor="wickets">Total Wickets</Label>
              <Input
                id="wickets"
                type="number"
                value={currentWickets}
                onChange={(e) => setCurrentWickets(e.target.value)}
                placeholder="0"
                className="w-20"
              />
            </div>
            <Button onClick={addBallData} disabled={!currentRuns}>
              Add Ball
            </Button>
            <Badge variant={isLive ? "default" : "secondary"}>{isLive ? "LIVE" : "DEMO"}</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Current Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Target className="h-5 w-5" />
              Current Ball: {matchData.currentBall}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {currentComparison.team1 && currentComparison.team2 && (
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>{matchData.team1.name}:</span>
                  <span className="font-bold">
                    {currentComparison.team1.totalRuns}/{currentComparison.team1.wickets}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>{matchData.team2.name}:</span>
                  <span className="font-bold">
                    {currentComparison.team2.totalRuns}/{currentComparison.team2.wickets}
                  </span>
                </div>
                <div className="pt-2 border-t">
                  <Badge
                    variant={
                      currentComparison.advantage === matchData.team1.name
                        ? "default"
                        : currentComparison.advantage === matchData.team2.name
                          ? "destructive"
                          : "secondary"
                    }
                  >
                    {currentComparison.advantage === "Equal" ? "Tied" : `${currentComparison.advantage} ahead`}
                  </Badge>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Win Probability
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between mb-1">
                  <span>{matchData.team1.name}</span>
                  <span className="font-bold">{winProbability.team1}%</span>
                </div>
                <Progress value={winProbability.team1} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span>{matchData.team2.name}</span>
                  <span className="font-bold">{winProbability.team2}%</span>
                </div>
                <Progress value={winProbability.team2} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Run Rate Comparison
            </CardTitle>
          </CardHeader>
          <CardContent>
            {currentComparison.team1 && currentComparison.team2 && (
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>{matchData.team1.name}:</span>
                  <span className="font-bold">{currentComparison.team1.runRate.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>{matchData.team2.name}:</span>
                  <span className="font-bold">{currentComparison.team2.runRate.toFixed(2)}</span>
                </div>
                {currentComparison.team2.requiredRate && (
                  <div className="flex justify-between pt-2 border-t">
                    <span>Required Rate:</span>
                    <span className="font-bold text-orange-600">{currentComparison.team2.requiredRate.toFixed(2)}</span>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="runs" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="runs">Runs Comparison</TabsTrigger>
          <TabsTrigger value="runrate">Run Rate</TabsTrigger>
          <TabsTrigger value="wickets">Wickets</TabsTrigger>
        </TabsList>

        <TabsContent value="runs">
          <Card>
            <CardHeader>
              <CardTitle>Ball-by-Ball Runs Comparison</CardTitle>
              <CardDescription>Compare total runs scored by both teams at each ball</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={comparisonData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="ball" label={{ value: "Ball Number", position: "insideBottom", offset: -5 }} />
                  <YAxis label={{ value: "Total Runs", angle: -90, position: "insideLeft" }} />
                  <Tooltip formatter={(value, name) => [value, name]} labelFormatter={(label) => `Ball ${label}`} />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey={matchData.team1.name}
                    stroke="#2563eb"
                    strokeWidth={3}
                    dot={{ fill: "#2563eb", strokeWidth: 2, r: 4 }}
                  />
                  <Line
                    type="monotone"
                    dataKey={matchData.team2.name}
                    stroke="#dc2626"
                    strokeWidth={3}
                    dot={{ fill: "#dc2626", strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="runrate">
          <Card>
            <CardHeader>
              <CardTitle>Run Rate Comparison</CardTitle>
              <CardDescription>Compare run rates of both teams throughout their innings</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={comparisonData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="ball" label={{ value: "Ball Number", position: "insideBottom", offset: -5 }} />
                  <YAxis label={{ value: "Run Rate", angle: -90, position: "insideLeft" }} />
                  <Tooltip
                    formatter={(value, name) => [Number(value).toFixed(2), name.replace("_runRate", "")]}
                    labelFormatter={(label) => `Ball ${label}`}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey={`${matchData.team1.name}_runRate`}
                    stroke="#16a34a"
                    strokeWidth={3}
                    name={matchData.team1.name}
                  />
                  <Line
                    type="monotone"
                    dataKey={`${matchData.team2.name}_runRate`}
                    stroke="#ea580c"
                    strokeWidth={3}
                    name={matchData.team2.name}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="wickets">
          <Card>
            <CardHeader>
              <CardTitle>Wickets Comparison</CardTitle>
              <CardDescription>Compare wickets lost by both teams at each stage</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={comparisonData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="ball" label={{ value: "Ball Number", position: "insideBottom", offset: -5 }} />
                  <YAxis label={{ value: "Wickets", angle: -90, position: "insideLeft" }} />
                  <Tooltip
                    formatter={(value, name) => [value, name.replace("_wickets", "")]}
                    labelFormatter={(label) => `Ball ${label}`}
                  />
                  <Legend />
                  <Bar dataKey={`${matchData.team1.name}_wickets`} fill="#3b82f6" name={matchData.team1.name} />
                  <Bar dataKey={`${matchData.team2.name}_wickets`} fill="#ef4444" name={matchData.team2.name} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Ball-by-Ball Details */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Ball-by-Ball Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold mb-2">{matchData.team1.name}</h4>
              <div className="space-y-1 max-h-60 overflow-y-auto">
                {matchData.team1.innings.map((ball, index) => (
                  <div key={index} className="flex justify-between text-sm p-2 bg-blue-50 rounded">
                    <span>
                      {ball.over}.{ball.ball}
                    </span>
                    <span>{ball.runs} runs</span>
                    <span>
                      {ball.totalRuns}/{ball.wickets}
                    </span>
                    <span>RR: {ball.runRate.toFixed(1)}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-2">{matchData.team2.name}</h4>
              <div className="space-y-1 max-h-60 overflow-y-auto">
                {matchData.team2.innings.map((ball, index) => (
                  <div key={index} className="flex justify-between text-sm p-2 bg-red-50 rounded">
                    <span>
                      {ball.over}.{ball.ball}
                    </span>
                    <span>{ball.runs} runs</span>
                    <span>
                      {ball.totalRuns}/{ball.wickets}
                    </span>
                    <span>RR: {ball.runRate.toFixed(1)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
