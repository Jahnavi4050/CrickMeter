"use client"

import { useState, useEffect, useCallback } from "react"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
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
  AreaChart,
  Area,
} from "recharts"
import { Target, TrendingUp, Clock, Activity, Wifi, WifiOff, RefreshCw } from "lucide-react"
import { motion } from "framer-motion"

type BallData = {
  over: number
  ball: number
  overBall: string // "5.2" format
  runs: number
  totalRuns: number
  wickets: number
  runRate: number
  requiredRate?: number
  ballNumber: number // absolute ball number
}

type TeamData = {
  name: string
  shortName: string
  innings: BallData[]
  target?: number
  isChasing?: boolean
  allOut?: boolean
}

type LiveMatch = {
  id: string
  title: string
  team1: string
  team2: string
  status: string
  format: "T20" | "ODI" | "Test"
  venue: string
}

type MatchData = {
  matchId: string
  title: string
  format: "T20" | "ODI" | "Test"
  team1: TeamData
  team2: TeamData
  currentTeam: "team1" | "team2"
  currentOver: number
  currentBall: number
  currentOverBall: string
  status: string
  tossWinner?: string
  tossDecision?: string
}

export default function LiveCricketComparator() {
  const [liveMatches, setLiveMatches] = useState<LiveMatch[]>([])
  const [selectedMatch, setSelectedMatch] = useState<string>("")
  const [matchData, setMatchData] = useState<MatchData | null>(null)
  const [isLive, setIsLive] = useState(false)
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())
  const [connectionStatus, setConnectionStatus] = useState<"connected" | "disconnected" | "connecting">("disconnected")

  // Simulate live matches data (In real implementation, this would come from Cricket API)
  useEffect(() => {
    const mockLiveMatches: LiveMatch[] = [
      {
        id: "match1",
        title: "India vs Australia - 1st T20I",
        team1: "India",
        team2: "Australia",
        status: "Live",
        format: "T20",
        venue: "Melbourne Cricket Ground",
      },
      {
        id: "match2",
        title: "England vs New Zealand - 2nd ODI",
        team1: "England",
        team2: "New Zealand",
        status: "Live",
        format: "ODI",
        venue: "Lord's Cricket Ground",
      },
      {
        id: "match3",
        title: "Pakistan vs South Africa - 1st Test",
        team1: "Pakistan",
        team2: "South Africa",
        status: "Live",
        format: "Test",
        venue: "National Stadium Karachi",
      },
      {
        id: "match4",
        title: "Sri Lanka vs Bangladesh - 3rd T20I",
        team1: "Sri Lanka",
        team2: "Bangladesh",
        status: "Live",
        format: "T20",
        venue: "R.Premadasa Stadium",
      },
    ]
    setLiveMatches(mockLiveMatches)
  }, [])

  // Simulate real-time data fetching
  const fetchMatchData = useCallback(
    async (matchId: string) => {
      setConnectionStatus("connecting")

      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Mock match data based on selected match
      const selectedMatchInfo = liveMatches.find((m) => m.id === matchId)
      if (!selectedMatchInfo) return

      const mockMatchData: MatchData = {
        matchId,
        title: selectedMatchInfo.title,
        format: selectedMatchInfo.format,
        team1: {
          name: selectedMatchInfo.team1,
          shortName: selectedMatchInfo.team1.substring(0, 3).toUpperCase(),
          innings: generateMockInnings(selectedMatchInfo.team1, false),
          target: undefined,
          isChasing: false,
        },
        team2: {
          name: selectedMatchInfo.team2,
          shortName: selectedMatchInfo.team2.substring(0, 3).toUpperCase(),
          innings: generateMockInnings(selectedMatchInfo.team2, true, 185), // Chasing 185
          target: 185,
          isChasing: true,
        },
        currentTeam: "team2",
        currentOver: 12,
        currentBall: 3,
        currentOverBall: "12.3",
        status: "Live - 2nd Innings",
        tossWinner: selectedMatchInfo.team2,
        tossDecision: "chose to bowl",
      }

      setMatchData(mockMatchData)
      setConnectionStatus("connected")
      setLastUpdated(new Date())
    },
    [liveMatches],
  )

  // Generate mock innings data
  const generateMockInnings = (teamName: string, isChasing: boolean, target?: number) => {
    const innings: BallData[] = []
    let totalRuns = 0
    let wickets = 0

    // Generate data for 12.3 overs (75 balls)
    for (let ballNum = 1; ballNum <= 75; ballNum++) {
      const over = Math.floor((ballNum - 1) / 6) + 1
      const ball = ((ballNum - 1) % 6) + 1
      const overBall = `${over}.${ball}`

      // Simulate runs (weighted random)
      const runsProb = Math.random()
      let runs = 0
      if (runsProb < 0.3) runs = 0
      else if (runsProb < 0.5) runs = 1
      else if (runsProb < 0.7) runs = 2
      else if (runsProb < 0.85) runs = 4
      else runs = 6

      // Simulate wickets (5% chance per ball)
      if (Math.random() < 0.05 && wickets < 10) {
        wickets++
        runs = 0 // No runs on wicket ball for simplicity
      }

      totalRuns += runs
      const runRate = (totalRuns / ballNum) * 6
      const requiredRate = isChasing && target ? (target - totalRuns) / ((120 - ballNum) / 6) : undefined

      innings.push({
        over,
        ball,
        overBall,
        runs,
        totalRuns,
        wickets,
        runRate,
        requiredRate,
        ballNumber: ballNum,
      })
    }

    return innings
  }

  // Auto-refresh functionality
  useEffect(() => {
    if (!autoRefresh || !selectedMatch || !isLive) return

    const interval = setInterval(() => {
      fetchMatchData(selectedMatch)
    }, 10000) // Update every 10 seconds

    return () => clearInterval(interval)
  }, [autoRefresh, selectedMatch, isLive, fetchMatchData])

  const handleMatchSelect = (matchId: string) => {
    setSelectedMatch(matchId)
    fetchMatchData(matchId)
  }

  const toggleLiveMode = () => {
    setIsLive(!isLive)
    if (!isLive && selectedMatch) {
      fetchMatchData(selectedMatch)
    }
  }

  const getComparisonData = () => {
    if (!matchData) return []

    const maxBalls = Math.max(matchData.team1.innings.length, matchData.team2.innings.length)
    const comparisonData = []

    for (let i = 0; i < maxBalls; i++) {
      const team1Data = matchData.team1.innings[i]
      const team2Data = matchData.team2.innings[i]

      comparisonData.push({
        ballNumber: i + 1,
        overBall: team1Data?.overBall || team2Data?.overBall || `${Math.floor(i / 6) + 1}.${(i % 6) + 1}`,
        [matchData.team1.shortName]: team1Data?.totalRuns || 0,
        [matchData.team2.shortName]: team2Data?.totalRuns || 0,
        [`${matchData.team1.shortName}_wickets`]: team1Data?.wickets || 0,
        [`${matchData.team2.shortName}_wickets`]: team2Data?.wickets || 0,
        [`${matchData.team1.shortName}_runRate`]: team1Data?.runRate || 0,
        [`${matchData.team2.shortName}_runRate`]: team2Data?.runRate || 0,
        [`${matchData.team2.shortName}_reqRate`]: team2Data?.requiredRate || 0,
      })
    }

    return comparisonData
  }

  const getCurrentComparison = () => {
    if (!matchData) return null

    const currentBallIndex = (matchData.currentOver - 1) * 6 + matchData.currentBall - 1
    const team1Data = matchData.team1.innings[currentBallIndex]
    const team2Data = matchData.team2.innings[currentBallIndex]

    return {
      team1: team1Data,
      team2: team2Data,
      currentOverBall: matchData.currentOverBall,
      advantage:
        team1Data && team2Data
          ? team1Data.totalRuns > team2Data.totalRuns
            ? matchData.team1.shortName
            : team2Data.totalRuns > team1Data.totalRuns
              ? matchData.team2.shortName
              : "Equal"
          : null,
    }
  }

  const getWinProbability = () => {
    const comparison = getCurrentComparison()
    if (!comparison?.team1 || !comparison?.team2) return { team1: 50, team2: 50 }

    const runDiff = comparison.team1.totalRuns - comparison.team2.totalRuns
    const wicketDiff = comparison.team2.wickets - comparison.team1.wickets
    const requiredRate = comparison.team2.requiredRate || 0
    const currentRate = comparison.team2.runRate

    // Advanced probability calculation
    let probability = 50
    probability += runDiff * 1.5 // Run difference impact
    probability += wicketDiff * 8 // Wicket difference impact
    probability += (requiredRate - currentRate) * 3 // Required vs current rate

    probability = Math.max(5, Math.min(95, probability))

    return {
      team1: Math.round(probability),
      team2: Math.round(100 - probability),
    }
  }

  const comparisonData = getComparisonData()
  const currentComparison = getCurrentComparison()
  const winProbability = getWinProbability()

  return (
    <div className="container mx-auto p-4 max-w-7xl">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-6"
      >
        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-green-600 text-transparent bg-clip-text">
          Live Cricket Score Comparator
        </h1>
        <p className="text-muted-foreground">Real-time ball-by-ball comparison for any live cricket match</p>
      </motion.div>

      {/* Match Selection and Controls */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Live Match Selection
            </span>
            <div className="flex items-center gap-2">
              {connectionStatus === "connected" && <Wifi className="h-4 w-4 text-green-500" />}
              {connectionStatus === "disconnected" && <WifiOff className="h-4 w-4 text-red-500" />}
              {connectionStatus === "connecting" && <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />}
              <Badge variant={isLive ? "default" : "secondary"}>{isLive ? "LIVE" : "OFFLINE"}</Badge>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div>
              <Label htmlFor="match-select">Select Live Match</Label>
              <Select value={selectedMatch} onValueChange={handleMatchSelect}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a live match" />
                </SelectTrigger>
                <SelectContent>
                  {liveMatches.map((match) => (
                    <SelectItem key={match.id} value={match.id}>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{match.format}</Badge>
                        {match.title}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <Switch id="live-mode" checked={isLive} onCheckedChange={toggleLiveMode} disabled={!selectedMatch} />
              <Label htmlFor="live-mode">Live Mode</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch id="auto-refresh" checked={autoRefresh} onCheckedChange={setAutoRefresh} disabled={!isLive} />
              <Label htmlFor="auto-refresh">Auto Refresh</Label>
            </div>
          </div>
          {matchData && (
            <div className="mt-4 p-3 bg-muted rounded-lg">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-semibold">{matchData.title}</h3>
                  <p className="text-sm text-muted-foreground">{matchData.status}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm">Last Updated: {lastUpdated.toLocaleTimeString()}</p>
                  <p className="text-sm text-muted-foreground">Current: Over {matchData.currentOverBall}</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {matchData && (
        <>
          {/* Current Match Status */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Current Over: {matchData.currentOverBall}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {currentComparison && (
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>{matchData.team1.shortName}:</span>
                      <span className="font-bold">
                        {currentComparison.team1?.totalRuns || 0}/{currentComparison.team1?.wickets || 0}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>{matchData.team2.shortName}:</span>
                      <span className="font-bold">
                        {currentComparison.team2?.totalRuns || 0}/{currentComparison.team2?.wickets || 0}
                      </span>
                    </div>
                    <div className="pt-2 border-t">
                      <Badge
                        variant={
                          currentComparison.advantage === matchData.team1.shortName
                            ? "default"
                            : currentComparison.advantage === matchData.team2.shortName
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
                      <span>{matchData.team1.shortName}</span>
                      <span className="font-bold">{winProbability.team1}%</span>
                    </div>
                    <Progress value={winProbability.team1} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span>{matchData.team2.shortName}</span>
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
                  Run Rate Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                {currentComparison && (
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>{matchData.team1.shortName}:</span>
                      <span className="font-bold">{currentComparison.team1?.runRate.toFixed(2) || "0.00"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>{matchData.team2.shortName}:</span>
                      <span className="font-bold">{currentComparison.team2?.runRate.toFixed(2) || "0.00"}</span>
                    </div>
                    {currentComparison.team2?.requiredRate && (
                      <div className="flex justify-between pt-2 border-t">
                        <span>Required:</span>
                        <span className="font-bold text-orange-600">
                          {currentComparison.team2.requiredRate.toFixed(2)}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Match Info</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Format:</span>
                    <Badge variant="outline">{matchData.format}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Target:</span>
                    <span className="font-bold">{matchData.team2.target || "N/A"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Toss:</span>
                    <span className="text-xs">
                      {matchData.tossWinner} {matchData.tossDecision}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <Tabs defaultValue="runs" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="runs">Runs Comparison</TabsTrigger>
              <TabsTrigger value="runrate">Run Rate</TabsTrigger>
              <TabsTrigger value="required">Required Rate</TabsTrigger>
              <TabsTrigger value="wickets">Wickets</TabsTrigger>
            </TabsList>

            <TabsContent value="runs">
              <Card>
                <CardHeader>
                  <CardTitle>Ball-by-Ball Runs Comparison</CardTitle>
                  <CardDescription>Compare total runs scored by both teams at each over.ball</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <AreaChart data={comparisonData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="overBall"
                        label={{ value: "Over.Ball", position: "insideBottom", offset: -5 }}
                        interval="preserveStartEnd"
                      />
                      <YAxis label={{ value: "Total Runs", angle: -90, position: "insideLeft" }} />
                      <Tooltip formatter={(value, name) => [value, name]} labelFormatter={(label) => `Over ${label}`} />
                      <Legend />
                      <Area
                        type="monotone"
                        dataKey={matchData.team1.shortName}
                        stackId="1"
                        stroke="#2563eb"
                        fill="#2563eb"
                        fillOpacity={0.3}
                      />
                      <Area
                        type="monotone"
                        dataKey={matchData.team2.shortName}
                        stackId="2"
                        stroke="#dc2626"
                        fill="#dc2626"
                        fillOpacity={0.3}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="runrate">
              <Card>
                <CardHeader>
                  <CardTitle>Run Rate Comparison</CardTitle>
                  <CardDescription>Compare run rates throughout the innings</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <LineChart data={comparisonData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="overBall" label={{ value: "Over.Ball", position: "insideBottom", offset: -5 }} />
                      <YAxis label={{ value: "Run Rate", angle: -90, position: "insideLeft" }} />
                      <Tooltip
                        formatter={(value, name) => [Number(value).toFixed(2), name.replace("_runRate", "")]}
                        labelFormatter={(label) => `Over ${label}`}
                      />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey={`${matchData.team1.shortName}_runRate`}
                        stroke="#16a34a"
                        strokeWidth={3}
                        name={matchData.team1.shortName}
                        dot={{ fill: "#16a34a", strokeWidth: 2, r: 3 }}
                      />
                      <Line
                        type="monotone"
                        dataKey={`${matchData.team2.shortName}_runRate`}
                        stroke="#ea580c"
                        strokeWidth={3}
                        name={matchData.team2.shortName}
                        dot={{ fill: "#ea580c", strokeWidth: 2, r: 3 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="required">
              <Card>
                <CardHeader>
                  <CardTitle>Required Run Rate vs Current Rate</CardTitle>
                  <CardDescription>Track how the required run rate changes with current performance</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <LineChart data={comparisonData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="overBall" label={{ value: "Over.Ball", position: "insideBottom", offset: -5 }} />
                      <YAxis label={{ value: "Run Rate", angle: -90, position: "insideLeft" }} />
                      <Tooltip
                        formatter={(value, name) => [
                          Number(value).toFixed(2),
                          name.includes("reqRate") ? "Required Rate" : "Current Rate",
                        ]}
                        labelFormatter={(label) => `Over ${label}`}
                      />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey={`${matchData.team2.shortName}_runRate`}
                        stroke="#2563eb"
                        strokeWidth={3}
                        name="Current Rate"
                        dot={{ fill: "#2563eb", strokeWidth: 2, r: 3 }}
                      />
                      <Line
                        type="monotone"
                        dataKey={`${matchData.team2.shortName}_reqRate`}
                        stroke="#dc2626"
                        strokeWidth={3}
                        strokeDasharray="5 5"
                        name="Required Rate"
                        dot={{ fill: "#dc2626", strokeWidth: 2, r: 3 }}
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
                      <XAxis dataKey="overBall" label={{ value: "Over.Ball", position: "insideBottom", offset: -5 }} />
                      <YAxis label={{ value: "Wickets", angle: -90, position: "insideLeft" }} />
                      <Tooltip
                        formatter={(value, name) => [value, name.replace("_wickets", "")]}
                        labelFormatter={(label) => `Over ${label}`}
                      />
                      <Legend />
                      <Bar
                        dataKey={`${matchData.team1.shortName}_wickets`}
                        fill="#3b82f6"
                        name={matchData.team1.shortName}
                      />
                      <Bar
                        dataKey={`${matchData.team2.shortName}_wickets`}
                        fill="#ef4444"
                        name={matchData.team2.shortName}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Over-by-Over Breakdown */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Over-by-Over Breakdown</CardTitle>
              <CardDescription>Detailed comparison at the current over: {matchData.currentOverBall}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    {matchData.team1.name}
                    <Badge variant="outline">{matchData.team1.shortName}</Badge>
                  </h4>
                  <div className="space-y-2 max-h-80 overflow-y-auto">
                    {matchData.team1.innings.slice(-12).map((ball, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={`flex justify-between items-center text-sm p-3 rounded-lg ${
                          ball.overBall === matchData.currentOverBall
                            ? "bg-blue-100 border-2 border-blue-300"
                            : "bg-blue-50"
                        }`}
                      >
                        <span className="font-mono font-bold">{ball.overBall}</span>
                        <span
                          className={`px-2 py-1 rounded ${
                            ball.runs === 6
                              ? "bg-green-200 text-green-800"
                              : ball.runs === 4
                                ? "bg-yellow-200 text-yellow-800"
                                : "bg-gray-200 text-gray-800"
                          }`}
                        >
                          {ball.runs} run{ball.runs !== 1 ? "s" : ""}
                        </span>
                        <span className="font-bold">
                          {ball.totalRuns}/{ball.wickets}
                        </span>
                        <span className="text-xs text-muted-foreground">RR: {ball.runRate.toFixed(1)}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    {matchData.team2.name}
                    <Badge variant="outline">{matchData.team2.shortName}</Badge>
                    {matchData.team2.isChasing && <Badge variant="secondary">Chasing</Badge>}
                  </h4>
                  <div className="space-y-2 max-h-80 overflow-y-auto">
                    {matchData.team2.innings.slice(-12).map((ball, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={`flex justify-between items-center text-sm p-3 rounded-lg ${
                          ball.overBall === matchData.currentOverBall
                            ? "bg-red-100 border-2 border-red-300"
                            : "bg-red-50"
                        }`}
                      >
                        <span className="font-mono font-bold">{ball.overBall}</span>
                        <span
                          className={`px-2 py-1 rounded ${
                            ball.runs === 6
                              ? "bg-green-200 text-green-800"
                              : ball.runs === 4
                                ? "bg-yellow-200 text-yellow-800"
                                : "bg-gray-200 text-gray-800"
                          }`}
                        >
                          {ball.runs} run{ball.runs !== 1 ? "s" : ""}
                        </span>
                        <span className="font-bold">
                          {ball.totalRuns}/{ball.wickets}
                        </span>
                        <div className="text-xs text-right">
                          <div>RR: {ball.runRate.toFixed(1)}</div>
                          {ball.requiredRate && (
                            <div className="text-orange-600">Req: {ball.requiredRate.toFixed(1)}</div>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {!matchData && (
        <Card className="text-center py-12">
          <CardContent>
            <Activity className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">Select a Live Match</h3>
            <p className="text-muted-foreground">
              Choose from the available live matches to start comparing ball-by-ball performance
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
